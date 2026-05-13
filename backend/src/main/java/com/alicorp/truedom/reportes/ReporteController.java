package com.alicorp.truedom.reportes;

import com.alicorp.truedom.shared.ApiResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reportes")
public class ReporteController {
    @GetMapping("/mensual")
    public ApiResponse<Map<String, Object>> monthly() {
        return new ApiResponse<>(Map.of(
                "periodo", "2026-04",
                "registrosCargados", 180426,
                "dominiosSeguros", 614,
                "dominiosNoSeguros", 44,
                "destinatariosPendientes", 4218,
                "inconsistenciasAbiertas", 7
        ));
    }

    @GetMapping("/dominios")
    public ApiResponse<List<Map<String, Object>>> domains() {
        return new ApiResponse<>(List.of(
                Map.of("dominio", "dropbox-transfer.com", "estado", "PENDIENTE", "frecuencia", 1248),
                Map.of("dominio", "temporary-mail.org", "estado", "NO_SEGURO", "frecuencia", 421)
        ));
    }
}
