package com.alicorp.truedom.lotes.service;

import com.alicorp.truedom.auditoria.service.AuditoriaService;
import com.alicorp.truedom.destinatarios.entity.PendienteValidacionDestinatario;
import com.alicorp.truedom.destinatarios.repository.CatalogoDestinatarioBlancoRepository;
import com.alicorp.truedom.destinatarios.repository.CatalogoDestinatarioNegroRepository;
import com.alicorp.truedom.destinatarios.repository.PendienteValidacionDestinatarioRepository;
import com.alicorp.truedom.dominios.entity.PendienteValidacionDominio;
import com.alicorp.truedom.dominios.repository.CatalogoDominicoBlancoRepository;
import com.alicorp.truedom.dominios.repository.CatalogoDominioNegroRepository;
import com.alicorp.truedom.dominios.repository.PendienteValidacionDominioRepository;
import com.alicorp.truedom.lotes.entity.DetalleLoteDlp;
import com.alicorp.truedom.lotes.repository.DetalleLoteDlpRepository;
import com.alicorp.truedom.lotes.repository.LoteCargaDlpRepository;
import com.alicorp.truedom.lotes.repository.RegistroDlpRepository;
import com.alicorp.truedom.shared.websocket.ProgresoLote;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

@Service
public class LoteProcesamientoAsyncService {
    private final LoteCargaDlpRepository loteRepo;
    private final DetalleLoteDlpRepository detalleRepo;
    private final RegistroDlpRepository registroRepo;
    private final CatalogoDominicoBlancoRepository domBlancoRepo;
    private final CatalogoDominioNegroRepository domNegroRepo;
    private final PendienteValidacionDominioRepository pendDomRepo;
    private final CatalogoDestinatarioBlancoRepository destBlancoRepo;
    private final CatalogoDestinatarioNegroRepository destNegroRepo;
    private final PendienteValidacionDestinatarioRepository pendDestRepo;
    private final AuditoriaService auditoria;
    private final SimpMessagingTemplate ws;

    public LoteProcesamientoAsyncService(LoteCargaDlpRepository loteRepo, DetalleLoteDlpRepository detalleRepo,
                                          RegistroDlpRepository registroRepo,
                                          CatalogoDominicoBlancoRepository domBlancoRepo, CatalogoDominioNegroRepository domNegroRepo,
                                          PendienteValidacionDominioRepository pendDomRepo,
                                          CatalogoDestinatarioBlancoRepository destBlancoRepo, CatalogoDestinatarioNegroRepository destNegroRepo,
                                          PendienteValidacionDestinatarioRepository pendDestRepo,
                                          AuditoriaService auditoria, SimpMessagingTemplate ws) {
        this.loteRepo = loteRepo;
        this.detalleRepo = detalleRepo;
        this.registroRepo = registroRepo;
        this.domBlancoRepo = domBlancoRepo;
        this.domNegroRepo = domNegroRepo;
        this.pendDomRepo = pendDomRepo;
        this.destBlancoRepo = destBlancoRepo;
        this.destNegroRepo = destNegroRepo;
        this.pendDestRepo = pendDestRepo;
        this.auditoria = auditoria;
        this.ws = ws;
    }

    @Async
    public void procesarAsync(Long loteId, String usuario) {
        try {
            // Small delay to let WebSocket subscribe
            Thread.sleep(500);

            var lote = loteRepo.findById(loteId)
                    .orElseThrow(() -> new IllegalArgumentException("Lote no encontrado: " + loteId));
            lote.setEstado("PROCESANDO");
            loteRepo.saveAndFlush(lote);

            var pendientes = detalleRepo.findByLoteIdAndEstado(loteId, "PENDIENTE_PROCESO");
            int total = pendientes.size();
            int procesados = 0;
            int destPendientesCount = 0;
            var dominiosNuevos = new HashMap<String, List<DetalleLoteDlp>>();
            int batchSize = 500;

            // Send initial progress
            ws.convertAndSend("/topic/lotes/" + loteId + "/progreso",
                    ProgresoLote.procesando(loteId, 0, total, 0, 0));

            for (int i = 0; i < pendientes.size(); i++) {
                var det = pendientes.get(i);
                String dominio = det.getDominioExt();
                String destinatario = det.getDestinatarioExt();
                String correoAlicorp = det.getCorreoUsuarioAlicorp();

                if (dominio != null && domBlancoRepo.existsByDominioAndActivoTrue(dominio)) {
                    det.setEstado("DOMINIO_SEGURO");
                } else if (dominio != null && domNegroRepo.existsByDominioAndActivoTrue(dominio)) {
                    det.setEstado("DOMINIO_NO_SEGURO");
                } else if (dominio != null) {
                    // Check if already pending (from previous load)
                    var existente = pendDomRepo.findByDominioAndEstado(dominio, "PENDIENTE");
                    if (existente.isPresent()) {
                        // Already pending, just mark detail
                        det.setEstado("DOMINIO_PENDIENTE");
                    } else {
                        dominiosNuevos.computeIfAbsent(dominio, k -> new ArrayList<>()).add(det);
                        det.setEstado("DOMINIO_PENDIENTE");
                    }
                }

                if ("DOMINIO_SEGURO".equals(det.getEstado()) && destinatario != null) {
                    if (destBlancoRepo.existsByDestinatarioAndCorreoUsuarioAlicorpAndActivoTrue(destinatario, correoAlicorp)) {
                        det.setEstado("DESTINATARIO_SEGURO");
                    } else if (destNegroRepo.existsByDestinatarioAndCorreoUsuarioAlicorpAndActivoTrue(destinatario, correoAlicorp)) {
                        det.setEstado("DESTINATARIO_NO_SEGURO");
                    } else {
                        det.setEstado("DESTINATARIO_PENDIENTE");
                        // Only create if not already pending
                        var existeDest = pendDestRepo.findByDestinatarioAndCorreoUsuarioAlicorpAndEstado(destinatario, correoAlicorp, "PENDIENTE");
                        if (existeDest.isEmpty()) {
                            var pend = new PendienteValidacionDestinatario();
                            pend.setLoteId(loteId);
                            pend.setDestinatario(destinatario);
                            pend.setDominio(dominio);
                            pend.setCorreoUsuarioAlicorp(correoAlicorp);
                            pend.setFechaLimite(OffsetDateTime.now().plusDays(7));
                            pendDestRepo.save(pend);
                            destPendientesCount++;
                        }
                    }
                }

                det.setFechaActualizacion(OffsetDateTime.now());
                procesados++;

                if (procesados % batchSize == 0 || procesados == total) {
                    int fromIdx = Math.max(0, i - batchSize + 1);
                    if (procesados == total) fromIdx = i - (procesados - 1) % batchSize;
                    detalleRepo.saveAll(pendientes.subList(Math.max(0, i - (batchSize - 1)), i + 1));
                    detalleRepo.flush();
                    ws.convertAndSend("/topic/lotes/" + loteId + "/progreso",
                            ProgresoLote.procesando(loteId, procesados, total, dominiosNuevos.size(), destPendientesCount));
                }
            }

            // Create pending domain records only for truly new ones
            for (var entry : dominiosNuevos.entrySet()) {
                // Double-check not already pending
                if (pendDomRepo.findByDominioAndEstado(entry.getKey(), "PENDIENTE").isPresent()) continue;
                var detallesDelDominio = entry.getValue();
                var usuarios = detallesDelDominio.stream().map(DetalleLoteDlp::getCorreoUsuarioAlicorp).distinct().count();

                // Collect VPs and policies from registros
                var registrosDelDominio = detallesDelDominio.stream()
                        .map(d -> registroRepo.findById(d.getRegistroDlpId()).orElse(null))
                        .filter(r -> r != null)
                        .toList();
                var vps = registrosDelDominio.stream()
                        .map(r -> r.getVicepresidenciaUsuario())
                        .filter(v -> v != null && !v.isBlank())
                        .distinct().toList();
                var pols = registrosDelDominio.stream()
                        .map(r -> r.getNombrePolitica())
                        .filter(p -> p != null && !p.isBlank())
                        .distinct().toList();
                var maxFecha = registrosDelDominio.stream()
                        .map(r -> r.getFechaEvento())
                        .filter(f -> f != null)
                        .max(java.time.OffsetDateTime::compareTo)
                        .orElse(null);

                var pend = new PendienteValidacionDominio();
                pend.setLoteId(loteId);
                pend.setDominio(entry.getKey());
                pend.setTotalRegistros(detallesDelDominio.size());
                pend.setTotalUsuarios((int) usuarios);
                pend.setTotalVp(vps.size());
                pend.setVicepresidencias(String.join(",", vps));
                pend.setPoliticas(String.join(",", pols));
                pend.setUltimaActividad(maxFecha);
                pendDomRepo.save(pend);
            }

            boolean hayPendientes = !dominiosNuevos.isEmpty() ||
                    pendientes.stream().anyMatch(d -> d.getEstado().contains("PENDIENTE"));
            lote.setRegistrosProcesados(procesados);
            lote.setEstado(hayPendientes ? "CON_OBSERVACIONES" : "PROCESADO");
            loteRepo.saveAndFlush(lote);

            ws.convertAndSend("/topic/lotes/" + loteId + "/progreso",
                    ProgresoLote.completado(loteId, procesados, dominiosNuevos.size(), destPendientesCount));

            auditoria.registrar("LOTE_CARGA_DLP", loteId, "PROCESAMIENTO", usuario,
                    "{\"procesados\":" + procesados + ",\"dominiosNuevos\":" + dominiosNuevos.size() + "}");

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        } catch (Exception e) {
            ws.convertAndSend("/topic/lotes/" + loteId + "/progreso",
                    ProgresoLote.error(loteId, "Error procesando: " + e.getMessage()));
            var lote = loteRepo.findById(loteId).orElse(null);
            if (lote != null) {
                lote.setEstado("ERROR");
                loteRepo.save(lote);
            }
        }
    }
}
