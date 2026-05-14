package com.alicorp.truedom.lotes.service;

import com.alicorp.truedom.auditoria.service.AuditoriaService;
import com.alicorp.truedom.destinatarios.entity.PendienteValidacionDestinatario;
import com.alicorp.truedom.destinatarios.repository.CatalogoDestinatarioBlancoRepository;
import com.alicorp.truedom.destinatarios.repository.CatalogoDestinatarioNegroRepository;
import com.alicorp.truedom.destinatarios.repository.PendienteValidacionDestinatarioRepository;
import com.alicorp.truedom.dominios.entity.PendienteValidacionDominio;
import com.alicorp.truedom.dominios.repository.CatalogoDominicoBlancoRepository;
import com.alicorp.truedom.dominios.repository.CatalogoDominioNegroRepository;
import com.alicorp.truedom.dominios.repository.PendienteValidacionDominioRepository;
import com.alicorp.truedom.lotes.entity.*;
import com.alicorp.truedom.lotes.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.*;

@Service
public class LoteService {
    private final LoteCargaDlpRepository loteRepo;
    private final ArchivoCargaDlpRepository archivoRepo;
    private final RegistroDlpRepository registroRepo;
    private final DetalleLoteDlpRepository detalleRepo;
    private final CatalogoDominicoBlancoRepository domBlancoRepo;
    private final CatalogoDominioNegroRepository domNegroRepo;
    private final PendienteValidacionDominioRepository pendDomRepo;
    private final CatalogoDestinatarioBlancoRepository destBlancoRepo;
    private final CatalogoDestinatarioNegroRepository destNegroRepo;
    private final PendienteValidacionDestinatarioRepository pendDestRepo;
    private final AuditoriaService auditoria;

    public LoteService(LoteCargaDlpRepository loteRepo, ArchivoCargaDlpRepository archivoRepo,
                       RegistroDlpRepository registroRepo, DetalleLoteDlpRepository detalleRepo,
                       CatalogoDominicoBlancoRepository domBlancoRepo, CatalogoDominioNegroRepository domNegroRepo,
                       PendienteValidacionDominioRepository pendDomRepo,
                       CatalogoDestinatarioBlancoRepository destBlancoRepo, CatalogoDestinatarioNegroRepository destNegroRepo,
                       PendienteValidacionDestinatarioRepository pendDestRepo,
                       AuditoriaService auditoria) {
        this.loteRepo = loteRepo;
        this.archivoRepo = archivoRepo;
        this.registroRepo = registroRepo;
        this.detalleRepo = detalleRepo;
        this.domBlancoRepo = domBlancoRepo;
        this.domNegroRepo = domNegroRepo;
        this.pendDomRepo = pendDomRepo;
        this.destBlancoRepo = destBlancoRepo;
        this.destNegroRepo = destNegroRepo;
        this.pendDestRepo = pendDestRepo;
        this.auditoria = auditoria;
    }

    public List<LoteCargaDlp> listar() {
        return loteRepo.findAllByOrderByFechaCargaDesc();
    }

    public LoteCargaDlp obtener(Long id) {
        return loteRepo.findById(id).orElseThrow(() -> new IllegalArgumentException("Lote no encontrado: " + id));
    }

    public List<RegistroDlp> registrosPorLote(Long loteId, int page, int size) {
        var todos = registroRepo.findByLoteId(loteId);
        int from = Math.min(page * size, todos.size());
        int to = Math.min(from + size, todos.size());
        return todos.subList(from, to);
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

        var nombre = archivo.getOriginalFilename();
        if (nombre != null && (nombre.endsWith(".xlsx") || nombre.endsWith(".xls"))) {
            throw new IllegalArgumentException("Archivos Excel deben cargarse via la pantalla de carga (procesamiento async). Use CSV para carga directa.");
        }
        List<RegistroDlp> registros = parsearCsv(archivo, lote.getId());
        int totalFilas = registros.size();
        // Batch save in chunks to handle large files
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
        // Batch save detalles
        for (int i = 0; i < detalles.size(); i += batchSize) {
            int end = Math.min(i + batchSize, detalles.size());
            detalleRepo.saveAll(detalles.subList(i, end));
            detalleRepo.flush();
        }

        lote.setRegistrosCargados(registros.size());
        lote.setEstado("VALIDADO");
        loteRepo.save(lote);

        auditoria.registrar("LOTE_CARGA_DLP", lote.getId(), "CARGA_ARCHIVO", usuario,
                "{\"archivo\":\"" + archivo.getOriginalFilename() + "\",\"registros\":" + registros.size()
                + ",\"filasArchivo\":" + totalFilas + "}");
        return lote;
    }

    @Transactional
    public LoteCargaDlp procesar(Long loteId, String usuario) {
        var lote = obtener(loteId);
        lote.setEstado("PROCESANDO");
        loteRepo.save(lote);

        var pendientes = detalleRepo.findByLoteIdAndEstado(loteId, "PENDIENTE_PROCESO");
        int procesados = 0;

        // Track dominios no clasificados para crear pendientes agrupados
        var dominiosNuevos = new HashMap<String, List<DetalleLoteDlp>>();

        for (var det : pendientes) {
            String dominio = det.getDominioExt();
            String destinatario = det.getDestinatarioExt();
            String correoAlicorp = det.getCorreoUsuarioAlicorp();

            // 1. Validar dominio
            if (dominio != null && domBlancoRepo.existsByDominioAndActivoTrue(dominio)) {
                det.setEstado("DOMINIO_SEGURO");
            } else if (dominio != null && domNegroRepo.existsByDominioAndActivoTrue(dominio)) {
                det.setEstado("DOMINIO_NO_SEGURO");
            } else if (dominio != null) {
                // Dominio no clasificado
                dominiosNuevos.computeIfAbsent(dominio, k -> new ArrayList<>()).add(det);
                det.setEstado("DOMINIO_PENDIENTE");
            }

            // 2. Si dominio seguro, validar destinatario
            if ("DOMINIO_SEGURO".equals(det.getEstado()) && destinatario != null) {
                if (destBlancoRepo.existsByDestinatarioAndCorreoUsuarioAlicorpAndActivoTrue(destinatario, correoAlicorp)) {
                    det.setEstado("DESTINATARIO_SEGURO");
                } else if (destNegroRepo.existsByDestinatarioAndCorreoUsuarioAlicorpAndActivoTrue(destinatario, correoAlicorp)) {
                    det.setEstado("DESTINATARIO_NO_SEGURO");
                } else {
                    det.setEstado("DESTINATARIO_PENDIENTE");
                    // Crear pendiente de validación para el usuario
                    var pend = new PendienteValidacionDestinatario();
                    pend.setLoteId(loteId);
                    pend.setDestinatario(destinatario);
                    pend.setDominio(dominio);
                    pend.setCorreoUsuarioAlicorp(correoAlicorp);
                    pend.setFechaLimite(OffsetDateTime.now().plusDays(7));
                    pendDestRepo.save(pend);
                }
            }

            det.setFechaActualizacion(OffsetDateTime.now());
            procesados++;
        }
        detalleRepo.saveAll(pendientes);

        // 3. Crear pendientes de dominio agrupados
        for (var entry : dominiosNuevos.entrySet()) {
            var detallesDelDominio = entry.getValue();
            var usuarios = detallesDelDominio.stream().map(DetalleLoteDlp::getCorreoUsuarioAlicorp).distinct().count();
            var pend = new PendienteValidacionDominio();
            pend.setLoteId(loteId);
            pend.setDominio(entry.getKey());
            pend.setTotalRegistros(detallesDelDominio.size());
            pend.setTotalUsuarios((int) usuarios);
            pendDomRepo.save(pend);
        }

        // Determinar estado final del lote
        boolean hayPendientes = !dominiosNuevos.isEmpty() ||
                pendientes.stream().anyMatch(d -> d.getEstado().contains("PENDIENTE"));
        lote.setRegistrosProcesados(procesados);
        lote.setEstado(hayPendientes ? "CON_OBSERVACIONES" : "PROCESADO");
        loteRepo.save(lote);

        auditoria.registrar("LOTE_CARGA_DLP", loteId, "PROCESAMIENTO", usuario,
                "{\"procesados\":" + procesados + ",\"dominiosNuevos\":" + dominiosNuevos.size() + "}");
        return lote;
    }

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

    public Map<String, Object> dominiosResultado(Long loteId, int page, int size, String estadoFiltro) {
        var detalles = detalleRepo.findByLoteIdAndEstado(loteId, "DOMINIO_PENDIENTE");
        // Agrupar por dominio
        var dominioMap = new LinkedHashMap<String, Map<String, Object>>();
        for (var d : detalles) {
            var dominio = d.getDominioExt();
            if (dominio == null) continue;
            var entry = dominioMap.computeIfAbsent(dominio, k -> {
                var m = new HashMap<String, Object>();
                m.put("dominio", k);
                m.put("envios", 0);
                m.put("usuarios", new HashSet<String>());
                m.put("estado", "PENDIENTE");
                // Check if already in whitelist/blacklist
                if (domBlancoRepo.existsByDominioAndActivoTrue(k)) m.put("estado", "BLANCO");
                else if (domNegroRepo.existsByDominioAndActivoTrue(k)) m.put("estado", "NEGRO");
                return m;
            });
            entry.put("envios", (int) entry.get("envios") + 1);
            if (d.getCorreoUsuarioAlicorp() != null) {
                ((Set<String>) entry.get("usuarios")).add(d.getCorreoUsuarioAlicorp());
            }
        }
        // Also include DOMINIO_SEGURO and DOMINIO_NO_SEGURO for full picture
        for (var d : detalleRepo.findByLoteIdAndEstado(loteId, "DOMINIO_SEGURO")) {
            var dominio = d.getDominioExt();
            if (dominio == null || dominioMap.containsKey(dominio)) continue;
            var m = new HashMap<String, Object>();
            m.put("dominio", dominio);
            m.put("envios", 1);
            m.put("usuarios", new HashSet<>(Set.of(d.getCorreoUsuarioAlicorp() != null ? d.getCorreoUsuarioAlicorp() : "")));
            m.put("estado", "BLANCO");
            dominioMap.put(dominio, m);
        }
        for (var d : detalleRepo.findByLoteIdAndEstado(loteId, "DOMINIO_NO_SEGURO")) {
            var dominio = d.getDominioExt();
            if (dominio == null || dominioMap.containsKey(dominio)) continue;
            var m = new HashMap<String, Object>();
            m.put("dominio", dominio);
            m.put("envios", 1);
            m.put("usuarios", new HashSet<>(Set.of(d.getCorreoUsuarioAlicorp() != null ? d.getCorreoUsuarioAlicorp() : "")));
            m.put("estado", "NEGRO");
            dominioMap.put(dominio, m);
        }

        // Convert sets to counts and filter
        var items = dominioMap.values().stream()
                .peek(m -> m.put("totalUsuarios", ((Set<?>) m.get("usuarios")).size()))
                .peek(m -> m.remove("usuarios"))
                .filter(m -> estadoFiltro.isEmpty() || estadoFiltro.equals(m.get("estado")))
                .toList();

        int total = items.size();
        int from = Math.min(page * size, total);
        int to = Math.min(from + size, total);
        return Map.of("items", items.subList(from, to), "total", total, "page", page, "size", size);
    }

    public Map<String, Object> destinatariosResultado(Long loteId, int page, int size, String filtro) {
        var estados = List.of("DESTINATARIO_PENDIENTE", "DOMINIO_PENDIENTE");
        var detalles = new ArrayList<DetalleLoteDlp>();
        for (var estado : estados) {
            detalles.addAll(detalleRepo.findByLoteIdAndEstado(loteId, estado));
        }

        // Agrupar por destinatario unico
        var destMap = new LinkedHashMap<String, Map<String, Object>>();
        for (var d : detalles) {
            var dest = d.getDestinatarioExt();
            if (dest == null) continue;
            var key = dest.toLowerCase();
            var entry = destMap.computeIfAbsent(key, k -> {
                var m = new HashMap<String, Object>();
                m.put("destinatario", dest);
                m.put("dominio", d.getDominioExt() != null ? d.getDominioExt() : "");
                m.put("envios", 0);
                m.put("usuarioAlicorp", d.getCorreoUsuarioAlicorp() != null ? d.getCorreoUsuarioAlicorp() : "");
                return m;
            });
            entry.put("envios", (int) entry.get("envios") + 1);
        }

        var items = destMap.values().stream()
                .filter(m -> filtro.isEmpty() ||
                        ((String) m.get("destinatario")).toLowerCase().contains(filtro.toLowerCase()) ||
                        ((String) m.get("dominio")).toLowerCase().contains(filtro.toLowerCase()) ||
                        ((String) m.get("usuarioAlicorp")).toLowerCase().contains(filtro.toLowerCase()))
                .toList();

        int total = items.size();
        int from = Math.min(page * size, total);
        int to = Math.min(from + size, total);
        return Map.of("items", items.subList(from, to), "total", total, "page", page, "size", size);
    }
}
