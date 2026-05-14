package com.alicorp.truedom.lotes;

import com.alicorp.truedom.lotes.entity.LoteCargaDlp;
import com.alicorp.truedom.lotes.service.LoteCargaAsyncService;
import com.alicorp.truedom.lotes.service.LoteService;
import com.alicorp.truedom.shared.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/lotes")
public class LoteController {
    private final LoteService service;
    private final LoteCargaAsyncService asyncService;

    public LoteController(LoteService service, LoteCargaAsyncService asyncService) {
        this.service = service;
        this.asyncService = asyncService;
    }

    @GetMapping
    public ApiResponse<List<LoteCargaDlp>> list() {
        return new ApiResponse<>(service.listar());
    }

    @GetMapping("/{id}")
    public ApiResponse<LoteCargaDlp> get(@PathVariable Long id) {
        return new ApiResponse<>(service.obtener(id));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<LoteCargaDlp> upload(
            @RequestParam int anio,
            @RequestParam int mes,
            @RequestParam String usuario,
            @RequestPart MultipartFile archivo) throws Exception {
        // Create lote header immediately
        var lote = service.crearCabecera(anio, mes, archivo.getOriginalFilename(), usuario);
        // Start async processing
        asyncService.cargarAsync(lote.getId(), archivo.getInputStream(), archivo.getOriginalFilename(), 164000);
        return ApiResponse.ok(lote, "Carga iniciada. Suscríbete a /topic/lotes/" + lote.getId() + "/progreso para ver avance.");
    }

    @PostMapping("/{id}/procesar")
    public ApiResponse<LoteCargaDlp> process(@PathVariable Long id, @RequestParam(defaultValue = "system") String usuario) {
        return new ApiResponse<>(service.procesar(id, usuario));
    }

    @GetMapping("/{id}/resumen")
    public ApiResponse<Map<String, Object>> resumen(@PathVariable Long id) {
        var lote = service.obtener(id);
        return new ApiResponse<>(Map.of(
                "id", lote.getId(),
                "estado", lote.getEstado(),
                "registrosCargados", lote.getRegistrosCargados(),
                "registrosProcesados", lote.getRegistrosProcesados()
        ));
    }

    @GetMapping("/{id}/registros")
    public ApiResponse<List<com.alicorp.truedom.lotes.entity.RegistroDlp>> registros(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        return new ApiResponse<>(service.registrosPorLote(id, page, size));
    }

    @GetMapping("/{id}/dominios-resultado")
    public ApiResponse<Map<String, Object>> dominiosResultado(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "30") int size,
            @RequestParam(defaultValue = "") String estado) {
        return new ApiResponse<>(service.dominiosResultado(id, page, size, estado));
    }

    @GetMapping("/{id}/destinatarios-resultado")
    public ApiResponse<Map<String, Object>> destinatariosResultado(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "30") int size,
            @RequestParam(defaultValue = "") String filtro) {
        return new ApiResponse<>(service.destinatariosResultado(id, page, size, filtro));
    }
}
