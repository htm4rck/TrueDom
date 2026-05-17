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
import com.alicorp.truedom.lotes.entity.LoteCargaDlp;
import com.alicorp.truedom.lotes.repository.DetalleLoteDlpRepository;
import com.alicorp.truedom.lotes.repository.LoteCargaDlpRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

@Service
public class LoteProcesamientoService {
    private final LoteCargaDlpRepository loteRepo;
    private final DetalleLoteDlpRepository detalleRepo;
    private final CatalogoDominicoBlancoRepository domBlancoRepo;
    private final CatalogoDominioNegroRepository domNegroRepo;
    private final PendienteValidacionDominioRepository pendDomRepo;
    private final CatalogoDestinatarioBlancoRepository destBlancoRepo;
    private final CatalogoDestinatarioNegroRepository destNegroRepo;
    private final PendienteValidacionDestinatarioRepository pendDestRepo;
    private final AuditoriaService auditoria;

    public LoteProcesamientoService(LoteCargaDlpRepository loteRepo, DetalleLoteDlpRepository detalleRepo,
                                     CatalogoDominicoBlancoRepository domBlancoRepo, CatalogoDominioNegroRepository domNegroRepo,
                                     PendienteValidacionDominioRepository pendDomRepo,
                                     CatalogoDestinatarioBlancoRepository destBlancoRepo, CatalogoDestinatarioNegroRepository destNegroRepo,
                                     PendienteValidacionDestinatarioRepository pendDestRepo,
                                     AuditoriaService auditoria) {
        this.loteRepo = loteRepo;
        this.detalleRepo = detalleRepo;
        this.domBlancoRepo = domBlancoRepo;
        this.domNegroRepo = domNegroRepo;
        this.pendDomRepo = pendDomRepo;
        this.destBlancoRepo = destBlancoRepo;
        this.destNegroRepo = destNegroRepo;
        this.pendDestRepo = pendDestRepo;
        this.auditoria = auditoria;
    }

    @Transactional
    public LoteCargaDlp procesar(Long loteId, String usuario) {
        var lote = loteRepo.findById(loteId)
                .orElseThrow(() -> new IllegalArgumentException("Lote no encontrado: " + loteId));
        lote.setEstado("PROCESANDO");
        loteRepo.save(lote);

        var pendientes = detalleRepo.findByLoteIdAndEstado(loteId, "PENDIENTE_PROCESO");
        int procesados = 0;
        var dominiosNuevos = new HashMap<String, List<DetalleLoteDlp>>();

        for (var det : pendientes) {
            String dominio = det.getDominioExt();
            String destinatario = det.getDestinatarioExt();
            String correoAlicorp = det.getCorreoUsuarioAlicorp();

            if (dominio != null && domBlancoRepo.existsByDominioAndActivoTrue(dominio)) {
                det.setEstado("DOMINIO_SEGURO");
            } else if (dominio != null && domNegroRepo.existsByDominioAndActivoTrue(dominio)) {
                det.setEstado("DOMINIO_NO_SEGURO");
            } else if (dominio != null) {
                if (pendDomRepo.findByDominioAndEstado(dominio, "PENDIENTE").isEmpty()) {
                    dominiosNuevos.computeIfAbsent(dominio, k -> new ArrayList<>()).add(det);
                }
                det.setEstado("DOMINIO_PENDIENTE");
            }

            if ("DOMINIO_SEGURO".equals(det.getEstado()) && destinatario != null) {
                if (destBlancoRepo.existsByDestinatarioAndCorreoUsuarioAlicorpAndActivoTrue(destinatario, correoAlicorp)) {
                    det.setEstado("DESTINATARIO_SEGURO");
                } else if (destNegroRepo.existsByDestinatarioAndCorreoUsuarioAlicorpAndActivoTrue(destinatario, correoAlicorp)) {
                    det.setEstado("DESTINATARIO_NO_SEGURO");
                } else {
                    det.setEstado("DESTINATARIO_PENDIENTE");
                    if (pendDestRepo.findByDestinatarioAndCorreoUsuarioAlicorpAndEstado(destinatario, correoAlicorp, "PENDIENTE").isEmpty()) {
                        var pend = new PendienteValidacionDestinatario();
                        pend.setLoteId(loteId);
                        pend.setDestinatario(destinatario);
                        pend.setDominio(dominio);
                        pend.setCorreoUsuarioAlicorp(correoAlicorp);
                        pend.setFechaLimite(OffsetDateTime.now().plusDays(7));
                        pendDestRepo.save(pend);
                    }
                }
            }

            det.setFechaActualizacion(OffsetDateTime.now());
            procesados++;
        }
        detalleRepo.saveAll(pendientes);

        for (var entry : dominiosNuevos.entrySet()) {
            if (pendDomRepo.findByDominioAndEstado(entry.getKey(), "PENDIENTE").isPresent()) continue;
            var detallesDelDominio = entry.getValue();
            var usuarios = detallesDelDominio.stream().map(DetalleLoteDlp::getCorreoUsuarioAlicorp).distinct().count();
            var pend = new PendienteValidacionDominio();
            pend.setLoteId(loteId);
            pend.setDominio(entry.getKey());
            pend.setTotalRegistros(detallesDelDominio.size());
            pend.setTotalUsuarios((int) usuarios);
            pendDomRepo.save(pend);
        }

        boolean hayPendientes = !dominiosNuevos.isEmpty() ||
                pendientes.stream().anyMatch(d -> d.getEstado().contains("PENDIENTE"));
        lote.setRegistrosProcesados(procesados);
        lote.setEstado(hayPendientes ? "CON_OBSERVACIONES" : "PROCESADO");
        loteRepo.save(lote);

        auditoria.registrar("LOTE_CARGA_DLP", loteId, "PROCESAMIENTO", usuario,
                "{\"procesados\":" + procesados + ",\"dominiosNuevos\":" + dominiosNuevos.size() + "}");
        return lote;
    }
}
