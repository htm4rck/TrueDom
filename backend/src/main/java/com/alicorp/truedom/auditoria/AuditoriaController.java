package com.alicorp.truedom.auditoria;

import com.alicorp.truedom.shared.ApiResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/auditoria")
public class AuditoriaController {
    @GetMapping
    public ApiResponse<List<AuditDto>> list() {
        return new ApiResponse<>(List.of(
                new AuditDto("2026-05-12T18:48:00", "admin.dlp@alicorp.com.pe", "LOTE_CARGA_DLP", "Carga de archivo mensual"),
                new AuditDto("2026-05-12T19:03:00", "batch:true-dom", "DETALLE_LOTE_DLP", "Procesamiento inicial")
        ));
    }

    public record AuditDto(String fecha, String usuario, String entidad, String accion) {
    }
}
