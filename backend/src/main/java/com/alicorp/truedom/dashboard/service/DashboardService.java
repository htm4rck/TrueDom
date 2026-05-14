package com.alicorp.truedom.dashboard.service;

import com.alicorp.truedom.dominios.repository.CatalogoDominicoBlancoRepository;
import com.alicorp.truedom.dominios.repository.CatalogoDominioNegroRepository;
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
    private final CatalogoDominicoBlancoRepository domBlancoRepo;
    private final CatalogoDominioNegroRepository domNegroRepo;
    private final InconsistenciaValidacionRepository inconsistenciaRepo;

    public DashboardService(LoteCargaDlpRepository loteRepo, DetalleLoteDlpRepository detalleRepo,
                            PendienteValidacionDominioRepository pendDomRepo,
                            PendienteValidacionDestinatarioRepository pendDestRepo,
                            CatalogoDominicoBlancoRepository domBlancoRepo,
                            CatalogoDominioNegroRepository domNegroRepo,
                            InconsistenciaValidacionRepository inconsistenciaRepo) {
        this.loteRepo = loteRepo;
        this.detalleRepo = detalleRepo;
        this.pendDomRepo = pendDomRepo;
        this.pendDestRepo = pendDestRepo;
        this.domBlancoRepo = domBlancoRepo;
        this.domNegroRepo = domNegroRepo;
        this.inconsistenciaRepo = inconsistenciaRepo;
    }

    public Map<String, Object> resumen() {
        var lotes = loteRepo.findAllByOrderByFechaCargaDesc();
        var ultimoLote = lotes.isEmpty() ? null : lotes.get(0);

        long totalCargados = lotes.stream().mapToInt(l -> l.getRegistrosCargados()).sum();
        long totalProcesados = lotes.stream().mapToInt(l -> l.getRegistrosProcesados()).sum();
        long dominiosPendientes = pendDomRepo.findByEstadoOrderByTotalRegistrosDesc("PENDIENTE").size();
        long destinatariosPendientes = pendDestRepo.count();
        long inconsistenciasAbiertas = inconsistenciaRepo.countByEstado("ABIERTA");
        long dominiosSeguros = domBlancoRepo.count();
        long dominiosNoSeguros = domNegroRepo.count();

        double avance = totalCargados > 0 ? (totalProcesados * 100.0 / totalCargados) : 0;

        return Map.of(
                "periodo", ultimoLote != null ? ultimoLote.getPeriodoAnio() + "-" + String.format("%02d", ultimoLote.getPeriodoMes()) : "N/A",
                "estadoLote", ultimoLote != null ? ultimoLote.getEstado() : "SIN_LOTES",
                "registrosCargados", totalCargados,
                "registrosProcesados", totalProcesados,
                "porcentajeAvance", Math.round(avance * 10.0) / 10.0,
                "dominiosPendientes", dominiosPendientes,
                "dominiosSeguros", dominiosSeguros,
                "dominiosNoSeguros", dominiosNoSeguros,
                "destinatariosPendientes", destinatariosPendientes,
                "inconsistenciasAbiertas", inconsistenciasAbiertas
        );
    }
}
