package com.alicorp.truedom.destinatarios;

import com.alicorp.truedom.destinatarios.entity.CatalogoDestinatarioBlanco;
import com.alicorp.truedom.destinatarios.entity.CatalogoDestinatarioNegro;
import com.alicorp.truedom.destinatarios.entity.PendienteValidacionDestinatario;
import com.alicorp.truedom.destinatarios.service.DestinatarioService;
import com.alicorp.truedom.shared.ApiResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/destinatarios")
public class DestinatarioController {
    private final DestinatarioService service;

    public DestinatarioController(DestinatarioService service) {
        this.service = service;
    }

    @GetMapping("/mis-pendientes")
    public ApiResponse<List<PendienteValidacionDestinatario>> misPendientes(@RequestParam String correo) {
        return new ApiResponse<>(service.listarMisPendientes(correo));
    }

    @PostMapping("/pendientes/{id}/validar")
    public ApiResponse<Void> validar(@PathVariable Long id, @Valid @RequestBody ValidarDestinatarioRequest req) {
        service.validar(id, req.decision(), req.justificacion(), req.usuario());
        return new ApiResponse<>(null);
    }

    @GetMapping("/blancos")
    public ApiResponse<List<CatalogoDestinatarioBlanco>> blancos() {
        return new ApiResponse<>(service.listarBlancos());
    }

    @GetMapping("/negros")
    public ApiResponse<List<CatalogoDestinatarioNegro>> negros() {
        return new ApiResponse<>(service.listarNegros());
    }

    @DeleteMapping("/blancos/{id}")
    public ApiResponse<Void> eliminarBlanco(@PathVariable Long id, @RequestParam String usuario) {
        service.eliminarBlanco(id, usuario);
        return ApiResponse.ok(null, "Destinatario eliminado de lista blanca");
    }

    @DeleteMapping("/negros/{id}")
    public ApiResponse<Void> eliminarNegro(@PathVariable Long id, @RequestParam String usuario) {
        service.eliminarNegro(id, usuario);
        return ApiResponse.ok(null, "Destinatario eliminado de lista negra");
    }

    public record ValidarDestinatarioRequest(@NotBlank String decision, @NotBlank String justificacion, @NotBlank String usuario) {}
}
