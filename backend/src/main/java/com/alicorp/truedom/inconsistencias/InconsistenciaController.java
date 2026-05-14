package com.alicorp.truedom.inconsistencias;

import com.alicorp.truedom.inconsistencias.entity.InconsistenciaValidacion;
import com.alicorp.truedom.inconsistencias.service.InconsistenciaService;
import com.alicorp.truedom.shared.ApiResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inconsistencias")
public class InconsistenciaController {
    private final InconsistenciaService service;

    public InconsistenciaController(InconsistenciaService service) {
        this.service = service;
    }

    @GetMapping
    public ApiResponse<List<InconsistenciaValidacion>> listar() {
        return new ApiResponse<>(service.listarAbiertas());
    }

    @GetMapping("/{id}")
    public ApiResponse<Map<String, Object>> detalle(@PathVariable Long id) {
        return new ApiResponse<>(service.detalle(id));
    }

    @PostMapping("/{id}/resolver")
    public ApiResponse<Void> resolver(@PathVariable Long id, @Valid @RequestBody ResolverRequest req) {
        service.resolver(id, req.decisionFinal(), req.justificacion(), req.usuario());
        return new ApiResponse<>(null);
    }

    public record ResolverRequest(@NotBlank String decisionFinal, @NotBlank String justificacion, @NotBlank String usuario) {}
}
