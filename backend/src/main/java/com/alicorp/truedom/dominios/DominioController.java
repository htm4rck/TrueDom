package com.alicorp.truedom.dominios;

import com.alicorp.truedom.dominios.entity.CatalogoDominioBlanco;
import com.alicorp.truedom.dominios.entity.CatalogoDominioNegro;
import com.alicorp.truedom.dominios.entity.PendienteValidacionDominio;
import com.alicorp.truedom.dominios.service.DominioService;
import com.alicorp.truedom.shared.ApiResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dominios")
public class DominioController {
    private final DominioService service;

    public DominioController(DominioService service) {
        this.service = service;
    }

    @GetMapping("/pendientes")
    public ApiResponse<List<PendienteValidacionDominio>> pendientes() {
        return new ApiResponse<>(service.listarPendientes());
    }

    @GetMapping("/pendientes/{id}/detalle")
    public ApiResponse<java.util.Map<String, Object>> detallePendiente(@PathVariable Long id) {
        return new ApiResponse<>(service.detallePendiente(id));
    }

    @PostMapping("/pendientes/{id}/validar")
    public ApiResponse<Void> validar(@PathVariable Long id, @Valid @RequestBody ValidarDominioRequest req) {
        service.validar(id, req.decision(), req.justificacion(), req.usuario());
        return new ApiResponse<>(null);
    }

    @GetMapping("/blancos")
    public ApiResponse<List<CatalogoDominioBlanco>> blancos() {
        return new ApiResponse<>(service.listarBlancos());
    }

    @GetMapping("/negros")
    public ApiResponse<List<CatalogoDominioNegro>> negros() {
        return new ApiResponse<>(service.listarNegros());
    }

    @PostMapping("/blancos")
    public ApiResponse<CatalogoDominioBlanco> agregarBlanco(@Valid @RequestBody AgregarDominioRequest req) {
        return new ApiResponse<>(service.agregarBlanco(req.dominio(), req.justificacion(), req.usuario()));
    }

    @PostMapping("/negros")
    public ApiResponse<CatalogoDominioNegro> agregarNegro(@Valid @RequestBody AgregarDominioRequest req) {
        return new ApiResponse<>(service.agregarNegro(req.dominio(), req.justificacion(), req.usuario()));
    }

    @PutMapping("/{id}/toggle")
    public ApiResponse<Void> toggle(@PathVariable Long id, @RequestParam boolean blanco, @RequestParam String usuario) {
        service.toggleActivo(id, blanco, usuario);
        return new ApiResponse<>(null);
    }

    @DeleteMapping("/blancos/{id}")
    public ApiResponse<Void> eliminarBlanco(@PathVariable Long id, @RequestParam String usuario) {
        service.eliminarBlanco(id, usuario);
        return ApiResponse.ok(null, "Dominio eliminado de lista blanca");
    }

    @DeleteMapping("/negros/{id}")
    public ApiResponse<Void> eliminarNegro(@PathVariable Long id, @RequestParam String usuario) {
        service.eliminarNegro(id, usuario);
        return ApiResponse.ok(null, "Dominio eliminado de lista negra");
    }

    public record ValidarDominioRequest(@NotBlank String decision, @NotBlank String justificacion, @NotBlank String usuario) {}
    public record AgregarDominioRequest(@NotBlank String dominio, @NotBlank String justificacion, @NotBlank String usuario) {}
}
