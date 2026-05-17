package com.alicorp.truedom.lotes.service;

import com.alicorp.truedom.auditoria.service.AuditoriaService;
import com.alicorp.truedom.lotes.entity.*;
import com.alicorp.truedom.lotes.repository.*;
import com.alicorp.truedom.shared.websocket.ProgresoLote;
import com.github.pjfanning.xlsx.StreamingReader;
import org.apache.poi.ss.usermodel.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

@Service
public class LoteCargaAsyncService {
    private final LoteCargaDlpRepository loteRepo;
    private final RegistroDlpRepository registroRepo;
    private final DetalleLoteDlpRepository detalleRepo;
    private final AuditoriaService auditoria;
    private final SimpMessagingTemplate ws;

    public LoteCargaAsyncService(LoteCargaDlpRepository loteRepo, RegistroDlpRepository registroRepo,
                                  DetalleLoteDlpRepository detalleRepo, AuditoriaService auditoria,
                                  SimpMessagingTemplate ws) {
        this.loteRepo = loteRepo;
        this.registroRepo = registroRepo;
        this.detalleRepo = detalleRepo;
        this.auditoria = auditoria;
        this.ws = ws;
    }

    @Async
    public void cargarAsync(Long loteId, InputStream inputStream, String nombreArchivo, int totalEstimado) {
        var formatter = new DataFormatter();
        int registrosLeidos = 0;
        int batchSize = 500;
        var batch = new ArrayList<RegistroDlp>(batchSize);

        try (var workbook = StreamingReader.builder()
                .rowCacheSize(500)
                .bufferSize(8192)
                .open(inputStream)) {

            // Use last sheet (typically "Reporte" with most data)
            Sheet targetSheet = null;
            for (Sheet s : workbook) {
                targetSheet = s;
            }
            if (targetSheet == null) {
                enviarError(loteId, "Archivo vacío");
                return;
            }

            boolean headerSkipped = false;
            for (Row row : targetSheet) {
                if (!headerSkipped) {
                    headerSkipped = true;
                    continue;
                }

                var dominio = cellStr(row, 8, formatter);
                var destinatario = cellStr(row, 9, formatter);
                if (dominio == null && destinatario == null) continue;

                var reg = new RegistroDlp();
                reg.setLoteId(loteId);
                reg.setNombrePolitica(cellStr(row, 0, formatter));
                reg.setUserGroup(cellStr(row, 1, formatter));
                reg.setFromUser(cellStr(row, 2, formatter));
                reg.setGroupsSource(cellStr(row, 3, formatter));
                reg.setFechaEvento(parseFecha(row, 4, 6, formatter));
                reg.setDlpIncidentId(cellStr(row, 5, formatter));
                reg.setUsuarioExt(cellStr(row, 7, formatter));
                reg.setDominioExt(dominio);
                reg.setDestinatarioExt(destinatario);
                reg.setCorreoUsuarioAlicorp(cellStr(row, 10, formatter));
                reg.setVicepresidenciaUsuario(cellStr(row, 11, formatter));
                reg.setDireccionGerenciaUsuario(cellStr(row, 12, formatter));
                reg.setUnidadOrganizativaUsuario(cellStr(row, 13, formatter));
                reg.setNombrePosicion(cellStr(row, 14, formatter));
                batch.add(reg);
                registrosLeidos++;

                if (batch.size() >= batchSize) {
                    guardarBatch(batch, loteId);
                    batch.clear();
                    enviarProgreso(loteId, registrosLeidos, totalEstimado);
                }
            }

            // Save remaining
            if (!batch.isEmpty()) {
                guardarBatch(batch, loteId);
            }

            // Update lote
            actualizarLote(loteId, registrosLeidos);
            enviarCompletado(loteId, registrosLeidos);

            auditoria.registrar("LOTE_CARGA_DLP", loteId, "CARGA_COMPLETADA", "system",
                    "{\"archivo\":\"" + nombreArchivo + "\",\"registros\":" + registrosLeidos + "}");

        } catch (Exception e) {
            enviarError(loteId, "Error en fila ~" + registrosLeidos + ": " + e.getMessage());
            marcarError(loteId);
        }
    }

    @Transactional
    protected void guardarBatch(List<RegistroDlp> batch, Long loteId) {
        registroRepo.saveAll(batch);
        registroRepo.flush();

        var detalles = new ArrayList<DetalleLoteDlp>(batch.size());
        for (var reg : batch) {
            var det = new DetalleLoteDlp();
            det.setLoteId(loteId);
            det.setRegistroDlpId(reg.getId());
            det.setDominioExt(reg.getDominioExt());
            det.setDestinatarioExt(reg.getDestinatarioExt());
            det.setCorreoUsuarioAlicorp(reg.getCorreoUsuarioAlicorp());
            det.setEstado("PENDIENTE_PROCESO");
            detalles.add(det);
        }
        detalleRepo.saveAll(detalles);
        detalleRepo.flush();
    }

    @Transactional
    protected void actualizarLote(Long loteId, int registros) {
        var lote = loteRepo.findById(loteId).orElse(null);
        if (lote != null) {
            lote.setRegistrosCargados(registros);
            lote.setEstado("VALIDADO");
            loteRepo.save(lote);
        }
    }

    @Transactional
    protected void marcarError(Long loteId) {
        var lote = loteRepo.findById(loteId).orElse(null);
        if (lote != null) {
            lote.setEstado("ERROR");
            loteRepo.save(lote);
        }
    }

    private void enviarProgreso(Long loteId, int leidos, int total) {
        ws.convertAndSend("/topic/lotes/" + loteId + "/progreso",
                ProgresoLote.cargando(loteId, leidos, total));
    }

    private void enviarCompletado(Long loteId, int registros) {
        ws.convertAndSend("/topic/lotes/" + loteId + "/progreso",
                ProgresoLote.completado(loteId, registros, 0, 0));
    }

    private void enviarError(Long loteId, String mensaje) {
        ws.convertAndSend("/topic/lotes/" + loteId + "/progreso",
                ProgresoLote.error(loteId, mensaje));
    }

    private String cellStr(Row row, int idx, DataFormatter formatter) {
        var cell = row.getCell(idx);
        if (cell == null) return null;
        var val = formatter.formatCellValue(cell);
        return val != null && !val.isBlank() ? val.trim() : null;
    }

    private java.time.OffsetDateTime parseFecha(Row row, int colTimestamp, int colFecha, DataFormatter formatter) {
        // Try col 4 first (full timestamp: "01/31/2026 22:46:35")
        var ts = cellStr(row, colTimestamp, formatter);
        if (ts != null) {
            try {
                var dtf = java.time.format.DateTimeFormatter.ofPattern("MM/dd/yyyy HH:mm:ss");
                var local = java.time.LocalDateTime.parse(ts, dtf);
                return local.atOffset(java.time.ZoneOffset.ofHours(-5));
            } catch (Exception ignored) {}
        }
        // Fallback to col 6 (short date: "1/31/26")
        var fecha = cellStr(row, colFecha, formatter);
        if (fecha != null) {
            try {
                var dtf = java.time.format.DateTimeFormatter.ofPattern("M/d/yy");
                var local = java.time.LocalDate.parse(fecha, dtf);
                return local.atStartOfDay().atOffset(java.time.ZoneOffset.ofHours(-5));
            } catch (Exception ignored) {}
        }
        return null;
    }
}
