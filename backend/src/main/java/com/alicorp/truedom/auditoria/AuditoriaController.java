package com.alicorp.truedom.auditoria;

import com.alicorp.truedom.auditoria.entity.AuditoriaDlp;
import com.alicorp.truedom.auditoria.repository.AuditoriaDlpRepository;
import com.alicorp.truedom.shared.ApiResponse;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/auditoria")
public class AuditoriaController {
    private final AuditoriaDlpRepository repo;

    public AuditoriaController(AuditoriaDlpRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public ApiResponse<List<AuditoriaDlp>> listar(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        var all = repo.findTop50ByOrderByFechaEventoDesc();
        int from = Math.min(page * size, all.size());
        int to = Math.min(from + size, all.size());
        return new ApiResponse<>(all.subList(from, to));
    }

    @GetMapping("/lotes/{loteId}")
    public ApiResponse<List<AuditoriaDlp>> porLote(@PathVariable Long loteId) {
        return new ApiResponse<>(repo.findByEntidadAndEntidadIdOrderByFechaEventoDesc("LOTE_CARGA_DLP", loteId));
    }
}
