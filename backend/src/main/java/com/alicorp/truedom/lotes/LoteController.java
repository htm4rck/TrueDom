package com.alicorp.truedom.lotes;

import com.alicorp.truedom.lotes.entity.LoteCargaDlp;
import com.alicorp.truedom.lotes.entity.RegistroDlp;
import com.alicorp.truedom.lotes.service.*;
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
    private final LoteProcesamientoAsyncService procesamientoAsyncService;
    private final LoteConsultaService consultaService;

    public LoteController(LoteService service, LoteCargaAsyncService asyncService,
                          LoteProcesamientoAsyncService procesamientoAsyncService, LoteConsultaService consultaService) {
        this.service = service;
        this.asyncService = asyncService;
        this.procesamientoAsyncService = procesamientoAsyncService;
        this.consultaService = consultaService;
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
        var lote = service.crearCabecera(anio, mes, archivo.getOriginalFilename(), usuario);
        asyncService.cargarAsync(lote.getId(), archivo.getInputStream(), archivo.getOriginalFilename(), 164000);
        return ApiResponse.ok(lote, "Carga iniciada. Suscríbete a /topic/lotes/" + lote.getId() + "/progreso para ver avance.");
    }

    @PostMapping("/{id}/procesar")
    public ApiResponse<Map<String, Object>> process(@PathVariable Long id, @RequestParam(defaultValue = "system") String usuario) {
        service.obtener(id); // validate exists
        procesamientoAsyncService.procesarAsync(id, usuario);
        return ApiResponse.ok(Map.of("loteId", id, "estado", "PROCESANDO"),
                "Procesamiento iniciado. Suscríbete a /topic/lotes/" + id + "/progreso para ver avance.");
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
    public ApiResponse<List<RegistroDlp>> registros(
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
        return new ApiResponse<>(consultaService.dominiosResultado(id, page, size, estado));
    }

    @GetMapping("/{id}/destinatarios-resultado")
    public ApiResponse<Map<String, Object>> destinatariosResultado(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "30") int size,
            @RequestParam(defaultValue = "") String filtro) {
        return new ApiResponse<>(consultaService.destinatariosResultado(id, page, size, filtro));
    }
}
