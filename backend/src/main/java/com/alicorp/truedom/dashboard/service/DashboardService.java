package com.alicorp.truedom.dashboard.service;

import com.alicorp.truedom.dominios.repository.PendienteValidacionDominioRepository;
import com.alicorp.truedom.destinatarios.repository.PendienteValidacionDestinatarioRepository;
import com.alicorp.truedom.inconsistencias.repository.InconsistenciaValidacionRepository;
import com.alicorp.truedom.lotes.repository.DetalleLoteDlpRepository;
import com.alicorp.truedom.lotes.repository.LoteCargaDlpRepository;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class DashboardService {
    private final LoteCargaDlpRepository loteRepo;
    private final DetalleLoteDlpRepository detalleRepo;
    private final PendienteValidacionDominioRepository pendDomRepo;
    private final PendienteValidacionDestinatarioRepository pendDestRepo;
    private final InconsistenciaValidacionRepository inconsistenciaRepo;

    public DashboardService(LoteCargaDlpRepository loteRepo, DetalleLoteDlpRepository detalleRepo,
                            PendienteValidacionDominioRepository pendDomRepo,
                            PendienteValidacionDestinatarioRepository pendDestRepo,
                            InconsistenciaValidacionRepository inconsistenciaRepo) {
        this.loteRepo = loteRepo;
        this.detalleRepo = detalleRepo;
        this.pendDomRepo = pendDomRepo;
        this.pendDestRepo = pendDestRepo;
        this.inconsistenciaRepo = inconsistenciaRepo;
    }

    public Map<String, Object> resumen() {
        var lotes = loteRepo.findAllByOrderByFechaCargaDesc();
        var ultimoLote = lotes.isEmpty() ? null : lotes.get(0);

        if (ultimoLote == null) {
            return Map.of(
                    "periodo", "N/A", "estadoLote", "SIN_LOTES",
                    "registrosCargados", 0, "registrosProcesados", 0,
                    "porcentajeAvance", 0.0,
                    "dominiosPendientes", 0L, "dominiosSeguros", 0L,
                    "dominiosNoSeguros", 0L, "destinatariosPendientes", 0L,
                    "inconsistenciasAbiertas", 0L
            );
        }

        Long loteId = ultimoLote.getId();
        long totalDetalles = detalleRepo.countByLoteId(loteId);
        long domSeguros = detalleRepo.countByLoteIdAndEstado(loteId, "DOMINIO_SEGURO")
                + detalleRepo.countByLoteIdAndEstado(loteId, "DESTINATARIO_SEGURO");
        long domNoSeguros = detalleRepo.countByLoteIdAndEstado(loteId, "DOMINIO_NO_SEGURO")
                + detalleRepo.countByLoteIdAndEstado(loteId, "DESTINATARIO_NO_SEGURO");
        long domPendientes = detalleRepo.countByLoteIdAndEstado(loteId, "DOMINIO_PENDIENTE");
        long destPendientes = detalleRepo.countByLoteIdAndEstado(loteId, "DESTINATARIO_PENDIENTE");
        long sinProcesar = detalleRepo.countByLoteIdAndEstado(loteId, "PENDIENTE_PROCESO");
        long inconsistencias = inconsistenciaRepo.countByEstado("ABIERTA");

        long procesados = totalDetalles - sinProcesar;
        double avance = totalDetalles > 0 ? (procesados * 100.0 / totalDetalles) : 0;

        return Map.of(
                "periodo", ultimoLote.getPeriodoAnio() + "-" + String.format("%02d", ultimoLote.getPeriodoMes()),
                "estadoLote", ultimoLote.getEstado(),
                "registrosCargados", ultimoLote.getRegistrosCargados(),
                "registrosProcesados", ultimoLote.getRegistrosProcesados(),
                "porcentajeAvance", Math.round(avance * 10.0) / 10.0,
                "dominiosPendientes", domPendientes,
                "dominiosSeguros", domSeguros,
                "dominiosNoSeguros", domNoSeguros,
                "destinatariosPendientes", destPendientes,
                "inconsistenciasAbiertas", inconsistencias
        );
    }
}
