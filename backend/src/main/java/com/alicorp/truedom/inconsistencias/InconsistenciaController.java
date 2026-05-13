package com.alicorp.truedom.inconsistencias;

import com.alicorp.truedom.shared.ApiResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inconsistencias")
public class InconsistenciaController {
    @GetMapping
    public ApiResponse<List<InconsistenciaDto>> list() {
        return new ApiResponse<>(List.of(
                new InconsistenciaDto(1L, "proveedor.qa@gmail.com", "gmail.com", 8, 3, "ABIERTA"),
                new InconsistenciaDto(2L, "contacto@partner.pe", "partner.pe", 4, 4, "EN_REVISION")
        ));
    }

    @PostMapping("/{id}/resolver")
    public ApiResponse<Map<String, Object>> resolve(@PathVariable Long id, @Valid @RequestBody ResolveRequest request) {
        return new ApiResponse<>(Map.of("inconsistenciaId", id, "decisionFinal", request.decisionFinal(), "estado", "CERRADA"));
    }

    public record ResolveRequest(@NotBlank String decisionFinal, @NotBlank String justificacion) {
    }

    public record InconsistenciaDto(Long id, String destinatario, String dominio, int usuariosSeguro, int usuariosNoSeguro, String estado) {
    }
}
