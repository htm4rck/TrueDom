package com.alicorp.truedom.lotes.service;

import com.alicorp.truedom.auditoria.service.AuditoriaService;
import com.alicorp.truedom.lotes.entity.*;
import com.alicorp.truedom.lotes.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@Service
public class LoteService {
    private final LoteCargaDlpRepository loteRepo;
    private final ArchivoCargaDlpRepository archivoRepo;
    private final RegistroDlpRepository registroRepo;
    private final DetalleLoteDlpRepository detalleRepo;
    private final AuditoriaService auditoria;

    public LoteService(LoteCargaDlpRepository loteRepo, ArchivoCargaDlpRepository archivoRepo,
                       RegistroDlpRepository registroRepo, DetalleLoteDlpRepository detalleRepo,
                       AuditoriaService auditoria) {
        this.loteRepo = loteRepo;
        this.archivoRepo = archivoRepo;
        this.registroRepo = registroRepo;
        this.detalleRepo = detalleRepo;
        this.auditoria = auditoria;
    }

    public List<LoteCargaDlp> listar() {
        return loteRepo.findAllByOrderByFechaCargaDesc();
    }

    public LoteCargaDlp obtener(Long id) {
        return loteRepo.findById(id).orElseThrow(() -> new IllegalArgumentException("Lote no encontrado: " + id));
    }

    public LoteCargaDlp crearCabecera(int anio, int mes, String nombreArchivo, String usuario) {
        var lote = new LoteCargaDlp();
        lote.setPeriodoAnio(anio);
        lote.setPeriodoMes(mes);
        lote.setEstado("CARGANDO");
        lote.setUsuarioCarga(usuario);
        lote = loteRepo.save(lote);

        var arch = new ArchivoCargaDlp();
        arch.setLoteId(lote.getId());
        arch.setNombreArchivo(nombreArchivo);
        arch.setBlobUri("local://" + nombreArchivo);
        archivoRepo.save(arch);

        return lote;
    }

    public List<RegistroDlp> registrosPorLote(Long loteId, int page, int size) {
        var todos = registroRepo.findByLoteId(loteId);
        int from = Math.min(page * size, todos.size());
        int to = Math.min(from + size, todos.size());
        return todos.subList(from, to);
    }

    @Transactional
    public LoteCargaDlp cargar(int anio, int mes, MultipartFile archivo, String usuario) {
        var lote = new LoteCargaDlp();
        lote.setPeriodoAnio(anio);
        lote.setPeriodoMes(mes);
        lote.setEstado("CARGADO");
        lote.setUsuarioCarga(usuario);
        lote = loteRepo.save(lote);

        var arch = new ArchivoCargaDlp();
        arch.setLoteId(lote.getId());
        arch.setNombreArchivo(archivo.getOriginalFilename());
        arch.setBlobUri("local://" + archivo.getOriginalFilename());
        archivoRepo.save(arch);

        List<RegistroDlp> registros = parsearCsv(archivo, lote.getId());
        int batchSize = 5000;
        for (int i = 0; i < registros.size(); i += batchSize) {
            int end = Math.min(i + batchSize, registros.size());
            registroRepo.saveAll(registros.subList(i, end));
            registroRepo.flush();
        }

        var detalles = new ArrayList<DetalleLoteDlp>();
        for (var reg : registros) {
            var det = new DetalleLoteDlp();
            det.setLoteId(lote.getId());
            det.setRegistroDlpId(reg.getId());
            det.setDominioExt(reg.getDominioExt());
            det.setDestinatarioExt(reg.getDestinatarioExt());
            det.setCorreoUsuarioAlicorp(reg.getCorreoUsuarioAlicorp());
            det.setEstado("PENDIENTE_PROCESO");
            detalles.add(det);
        }
        for (int i = 0; i < detalles.size(); i += batchSize) {
            int end = Math.min(i + batchSize, detalles.size());
            detalleRepo.saveAll(detalles.subList(i, end));
            detalleRepo.flush();
        }

        lote.setRegistrosCargados(registros.size());
        lote.setEstado("VALIDADO");
        loteRepo.save(lote);

        auditoria.registrar("LOTE_CARGA_DLP", lote.getId(), "CARGA_ARCHIVO", usuario,
                "{\"archivo\":\"" + archivo.getOriginalFilename() + "\",\"registros\":" + registros.size() + "}");
        return lote;
    }

    private List<RegistroDlp> parsearCsv(MultipartFile archivo, Long loteId) {
        var registros = new ArrayList<RegistroDlp>();
        try (var reader = new BufferedReader(new InputStreamReader(archivo.getInputStream(), StandardCharsets.UTF_8))) {
            reader.readLine(); // skip header
            String line;
            int lineNum = 1;
            while ((line = reader.readLine()) != null) {
                lineNum++;
                if (line.isBlank()) continue;
                var c = line.split(",", -1);
                if (c.length < 10) {
                    throw new IllegalArgumentException("Linea " + lineNum + ": se esperan al menos 10 columnas, se encontraron " + c.length);
                }
                var reg = new RegistroDlp();
                reg.setLoteId(loteId);
                reg.setNombrePolitica(col(c, 0));
                reg.setUserGroup(col(c, 1));
                reg.setFromUser(col(c, 2));
                reg.setGroupsSource(col(c, 3));
                reg.setDlpIncidentId(col(c, 5));
                reg.setUsuarioExt(col(c, 7));
                reg.setDominioExt(col(c, 8));
                reg.setDestinatarioExt(col(c, 9));
                reg.setCorreoUsuarioAlicorp(col(c, 10));
                reg.setVicepresidenciaUsuario(col(c, 11));
                reg.setDireccionGerenciaUsuario(col(c, 12));
                reg.setUnidadOrganizativaUsuario(col(c, 13));
                reg.setNombrePosicion(col(c, 14));
                registros.add(reg);
            }
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Error parseando CSV: " + e.getMessage(), e);
        }
        if (registros.isEmpty()) throw new IllegalArgumentException("El archivo no contiene registros");
        return registros;
    }

    private String col(String[] cols, int idx) {
        return idx < cols.length ? cols[idx].trim() : null;
    }
}
