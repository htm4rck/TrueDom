package com.alicorp.truedom.dominios;

import com.alicorp.truedom.shared.ApiResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dominios")
public class DominioController {
    @GetMapping("/pendientes")
    public ApiResponse<List<DominioPendienteDto>> pending() {
        return new ApiResponse<>(List.of(
                new DominioPendienteDto(1L, "dropbox-transfer.com", 1248, 84, "PENDIENTE"),
                new DominioPendienteDto(2L, "vendor-docs.io", 753, 38, "PENDIENTE")
        ));
    }

    @PostMapping("/pendientes/{id}/validar")
    public ApiResponse<Map<String, Object>> validate(@PathVariable Long id, @Valid @RequestBody ValidateDomainRequest request) {
        return new ApiResponse<>(Map.of("pendienteId", id, "decision", request.decision(), "estado", "VALIDADO"));
    }

    @GetMapping("/blancos")
    public ApiResponse<List<String>> whiteList() {
        return new ApiResponse<>(List.of("alicorp.com.pe", "partner.pe", "microsoft.com"));
    }

    @GetMapping("/negros")
    public ApiResponse<List<String>> blackList() {
        return new ApiResponse<>(List.of("temporary-mail.org", "unknown-transfer.net"));
    }

    public record ValidateDomainRequest(@NotBlank String decision, @NotBlank String justificacion) {
    }

    public record DominioPendienteDto(Long id, String dominio, int registrosAsociados, int usuariosAfectados, String estado) {
    }
}
