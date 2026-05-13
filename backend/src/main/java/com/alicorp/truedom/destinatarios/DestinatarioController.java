package com.alicorp.truedom.destinatarios;

import com.alicorp.truedom.shared.ApiResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/destinatarios")
public class DestinatarioController {
    @GetMapping("/mis-pendientes")
    public ApiResponse<List<DestinatarioPendienteDto>> myPending() {
        return new ApiResponse<>(List.of(
                new DestinatarioPendienteDto(1L, "proveedor.qa@gmail.com", "gmail.com", "INC-90812", "PENDIENTE"),
                new DestinatarioPendienteDto(2L, "auditoria@partner.pe", "partner.pe", "INC-90901", "VENCIDO")
        ));
    }

    @PostMapping("/pendientes/{id}/validar")
    public ApiResponse<Map<String, Object>> validate(@PathVariable Long id, @Valid @RequestBody ValidateRecipientRequest request) {
        return new ApiResponse<>(Map.of("pendienteId", id, "decision", request.decision(), "estado", "RESPONDIDO"));
    }

    @GetMapping("/blancos")
    public ApiResponse<List<String>> whiteList() {
        return new ApiResponse<>(List.of("proveedor.qa@gmail.com", "auditoria@partner.pe"));
    }

    @GetMapping("/negros")
    public ApiResponse<List<String>> blackList() {
        return new ApiResponse<>(List.of("contacto@dropbox-transfer.com"));
    }

    public record ValidateRecipientRequest(@NotBlank String decision, @NotBlank String justificacion) {
    }

    public record DestinatarioPendienteDto(Long id, String destinatario, String dominio, String incidente, String estado) {
    }
}
