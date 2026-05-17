package com.alicorp.truedom.destinatarios;

import com.alicorp.truedom.destinatarios.entity.CatalogoDestinatarioBlanco;
import com.alicorp.truedom.destinatarios.entity.CatalogoDestinatarioNegro;
import com.alicorp.truedom.destinatarios.entity.PendienteValidacionDestinatario;
import com.alicorp.truedom.destinatarios.service.DestinatarioService;
import com.alicorp.truedom.lotes.entity.LoteCargaDlp;
import com.alicorp.truedom.lotes.repository.LoteCargaDlpRepository;
import com.alicorp.truedom.shared.ApiResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/destinatarios")
public class DestinatarioController {
    private final DestinatarioService service;
    private final LoteCargaDlpRepository loteRepo;

    public DestinatarioController(DestinatarioService service, LoteCargaDlpRepository loteRepo) {
        this.service = service;
        this.loteRepo = loteRepo;
    }

    @GetMapping("/mis-pendientes")
    public ApiResponse<List<PendienteValidacionDestinatario>> misPendientes(@RequestParam String correo) {
        return new ApiResponse<>(service.listarMisPendientes(correo));
    }

    @GetMapping("/pendientes")
    public ApiResponse<List<PendienteValidacionDestinatario>> pendientes(
            @RequestParam(required = false) List<Integer> anios,
            @RequestParam(required = false) List<Integer> meses) {
        List<Long> loteIds = null;
        if (anios != null && !anios.isEmpty()) {
            var lotes = loteRepo.findAll().stream()
                    .filter(l -> anios.contains(l.getPeriodoAnio()))
                    .filter(l -> meses == null || meses.isEmpty() || meses.contains(l.getPeriodoMes()))
                    .map(LoteCargaDlp::getId)
                    .toList();
            loteIds = lotes;
        }
        return new ApiResponse<>(service.listarPendientesPorLotes(loteIds));
    }

    @GetMapping("/periodos-disponibles")
    public ApiResponse<List<Map<String, Object>>> periodosDisponibles() {
        var lotes = loteRepo.findAll();
        var tree = lotes.stream()
                .collect(Collectors.groupingBy(LoteCargaDlp::getPeriodoAnio,
                        Collectors.mapping(LoteCargaDlp::getPeriodoMes, Collectors.toCollection(TreeSet::new))));
        var result = tree.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(e -> {
                    Map<String, Object> node = new LinkedHashMap<>();
                    node.put("anio", e.getKey());
                    node.put("meses", new ArrayList<>(e.getValue()));
                    return node;
                })
                .toList();
        return new ApiResponse<>(result);
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
