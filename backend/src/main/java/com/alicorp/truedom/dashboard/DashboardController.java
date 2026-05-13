package com.alicorp.truedom.dashboard;

import com.alicorp.truedom.shared.ApiResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {
    @GetMapping("/resumen")
    public ApiResponse<Map<String, Object>> summary() {
        return new ApiResponse<>(Map.of(
                "periodo", "2026-04",
                "estadoLote", "CON_OBSERVACIONES",
                "registrosCargados", 180426,
                "registrosProcesados", 157694,
                "porcentajeAvance", 87.4,
                "dominiosPendientes", 18,
                "destinatariosPendientes", 4218,
                "inconsistenciasAbiertas", 7
        ));
    }

    @GetMapping("/kpis")
    public ApiResponse<List<Map<String, Object>>> kpis() {
        return new ApiResponse<>(List.of(
                Map.of("codigo", "REGISTROS_CARGADOS", "valor", 180426),
                Map.of("codigo", "DOMINIOS_SEGUROS", "valor", 614),
                Map.of("codigo", "DOMINIOS_NO_SEGUROS", "valor", 44),
                Map.of("codigo", "DESTINATARIOS_PENDIENTES", "valor", 4218),
                Map.of("codigo", "INCONSISTENCIAS_ABIERTAS", "valor", 7)
        ));
    }
}
