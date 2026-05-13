package com.alicorp.truedom.lotes;

import com.alicorp.truedom.shared.ApiResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/lotes")
public class LoteController {
    @GetMapping
    public ApiResponse<List<LoteDto>> list() {
        return new ApiResponse<>(List.of(
                new LoteDto(1L, 2026, 4, "DLP_ABR_2026.xlsx", "CON_OBSERVACIONES", 180426, 157694),
                new LoteDto(2L, 2026, 3, "DLP_MAR_2026.xlsx", "CERRADO", 176801, 176801)
        ));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<LoteDto> create(@Valid @RequestBody CreateLoteRequest request) {
        return new ApiResponse<>(new LoteDto(99L, request.anio(), request.mes(), request.nombreArchivo(), "CARGADO", 0, 0));
    }

    @PostMapping("/{id}/procesar")
    public ApiResponse<Map<String, Object>> process(@PathVariable Long id) {
        return new ApiResponse<>(Map.of("loteId", id, "estado", "PROCESANDO", "modo", "PROCESO_INICIAL"));
    }

    public record CreateLoteRequest(int anio, int mes, @NotBlank String nombreArchivo) {
    }

    public record LoteDto(Long id, int anio, int mes, String archivo, String estado, int registrosCargados, int registrosProcesados) {
    }
}
