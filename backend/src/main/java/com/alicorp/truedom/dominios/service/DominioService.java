package com.alicorp.truedom.dominios.service;

import com.alicorp.truedom.auditoria.service.AuditoriaService;
import com.alicorp.truedom.destinatarios.entity.PendienteValidacionDestinatario;
import com.alicorp.truedom.destinatarios.repository.CatalogoDestinatarioBlancoRepository;
import com.alicorp.truedom.destinatarios.repository.CatalogoDestinatarioNegroRepository;
import com.alicorp.truedom.destinatarios.repository.PendienteValidacionDestinatarioRepository;
import com.alicorp.truedom.dominios.entity.CatalogoDominioBlanco;
import com.alicorp.truedom.dominios.entity.CatalogoDominioNegro;
import com.alicorp.truedom.dominios.entity.PendienteValidacionDominio;
import com.alicorp.truedom.dominios.repository.CatalogoDominicoBlancoRepository;
import com.alicorp.truedom.dominios.repository.CatalogoDominioNegroRepository;
import com.alicorp.truedom.dominios.repository.PendienteValidacionDominioRepository;
import com.alicorp.truedom.lotes.repository.DetalleLoteDlpRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Map;

@Service
public class DominioService {
    private final PendienteValidacionDominioRepository pendienteRepo;
    private final CatalogoDominicoBlancoRepository blancoRepo;
    private final CatalogoDominioNegroRepository negroRepo;
    private final DetalleLoteDlpRepository detalleRepo;
    private final PendienteValidacionDestinatarioRepository pendDestRepo;
    private final CatalogoDestinatarioBlancoRepository destBlancoRepo;
    private final CatalogoDestinatarioNegroRepository destNegroRepo;
    private final AuditoriaService auditoria;

    public DominioService(PendienteValidacionDominioRepository pendienteRepo,
                          CatalogoDominicoBlancoRepository blancoRepo,
                          CatalogoDominioNegroRepository negroRepo,
                          DetalleLoteDlpRepository detalleRepo,
                          PendienteValidacionDestinatarioRepository pendDestRepo,
                          CatalogoDestinatarioBlancoRepository destBlancoRepo,
                          CatalogoDestinatarioNegroRepository destNegroRepo,
                          AuditoriaService auditoria) {
        this.pendienteRepo = pendienteRepo;
        this.blancoRepo = blancoRepo;
        this.negroRepo = negroRepo;
        this.detalleRepo = detalleRepo;
        this.pendDestRepo = pendDestRepo;
        this.destBlancoRepo = destBlancoRepo;
        this.destNegroRepo = destNegroRepo;
        this.auditoria = auditoria;
    }

    public List<PendienteValidacionDominio> listarPendientes() {
        return pendienteRepo.findByEstadoOrderByTotalRegistrosDesc("PENDIENTE");
    }

    public Map<String, Object> detallePendiente(Long pendienteId) {
        var pendiente = pendienteRepo.findById(pendienteId)
                .orElseThrow(() -> new IllegalArgumentException("Pendiente no encontrado: " + pendienteId));
        var registros = detalleRepo.findByLoteIdAndEstado(pendiente.getLoteId(), "DOMINIO_PENDIENTE");
        var asociados = registros.stream()
                .filter(d -> pendiente.getDominio().equals(d.getDominioExt()))
                .map(d -> Map.<String, Object>of(
                        "destinatario", d.getDestinatarioExt() != null ? d.getDestinatarioExt() : "",
                        "usuarioAlicorp", d.getCorreoUsuarioAlicorp() != null ? d.getCorreoUsuarioAlicorp() : ""
                ))
                .distinct()
                .toList();
        return Map.of(
                "dominio", pendiente.getDominio(),
                "totalRegistros", pendiente.getTotalRegistros(),
                "totalUsuarios", pendiente.getTotalUsuarios(),
                "asociados", asociados
        );
    }

    @Transactional
    public void validar(Long pendienteId, String decision, String justificacion, String usuario) {
        var pendiente = pendienteRepo.findById(pendienteId)
                .orElseThrow(() -> new IllegalArgumentException("Pendiente no encontrado: " + pendienteId));

        if ("SEGURO".equals(decision)) {
            var blanco = new CatalogoDominioBlanco();
            blanco.setDominio(pendiente.getDominio());
            blanco.setJustificacion(justificacion);
            blanco.setCreadoPor(usuario);
            blancoRepo.save(blanco);
            detalleRepo.updateEstadoByLoteIdAndDominio(pendiente.getLoteId(), pendiente.getDominio(), "DOMINIO_SEGURO");

            // Create destinatario pendientes for users of this domain
            crearPendientesDestinatario(pendiente.getLoteId(), pendiente.getDominio());
        } else {
            var negro = new CatalogoDominioNegro();
            negro.setDominio(pendiente.getDominio());
            negro.setJustificacion(justificacion);
            negro.setCreadoPor(usuario);
            negroRepo.save(negro);
            detalleRepo.updateEstadoByLoteIdAndDominio(pendiente.getLoteId(), pendiente.getDominio(), "DOMINIO_NO_SEGURO");
        }

        pendiente.setEstado("VALIDADO");
        pendienteRepo.save(pendiente);

        auditoria.registrar("PENDIENTE_VALIDACION_DOMINIO", pendienteId,
                "VALIDACION_DOMINIO_" + decision, usuario,
                "{\"dominio\":\"" + pendiente.getDominio() + "\",\"decision\":\"" + decision + "\"}");
    }

    public List<CatalogoDominioBlanco> listarBlancos() {
        return blancoRepo.findAll();
    }

    public List<CatalogoDominioNegro> listarNegros() {
        return negroRepo.findAll();
    }

    @Transactional
    public CatalogoDominioBlanco agregarBlanco(String dominio, String justificacion, String usuario) {
        var entry = new CatalogoDominioBlanco();
        entry.setDominio(dominio);
        entry.setJustificacion(justificacion);
        entry.setCreadoPor(usuario);
        var saved = blancoRepo.save(entry);
        auditoria.registrar("CATALOGO_DOMINIO_BLANCO", saved.getId(), "AGREGAR_DOMINIO_BLANCO", usuario,
                "{\"dominio\":\"" + dominio + "\"}");
        return saved;
    }

    @Transactional
    public CatalogoDominioNegro agregarNegro(String dominio, String justificacion, String usuario) {
        var entry = new CatalogoDominioNegro();
        entry.setDominio(dominio);
        entry.setJustificacion(justificacion);
        entry.setCreadoPor(usuario);
        var saved = negroRepo.save(entry);
        auditoria.registrar("CATALOGO_DOMINIO_NEGRO", saved.getId(), "AGREGAR_DOMINIO_NEGRO", usuario,
                "{\"dominio\":\"" + dominio + "\"}");
        return saved;
    }

    @Transactional
    public void eliminarBlanco(Long id, String usuario) {
        var entry = blancoRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Dominio blanco no encontrado: " + id));
        blancoRepo.delete(entry);
        auditoria.registrar("CATALOGO_DOMINIO_BLANCO", id, "ELIMINAR_DOMINIO_BLANCO", usuario,
                "{\"dominio\":\"" + entry.getDominio() + "\"}");
    }

    @Transactional
    public void eliminarNegro(Long id, String usuario) {
        var entry = negroRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Dominio negro no encontrado: " + id));
        negroRepo.delete(entry);
        auditoria.registrar("CATALOGO_DOMINIO_NEGRO", id, "ELIMINAR_DOMINIO_NEGRO", usuario,
                "{\"dominio\":\"" + entry.getDominio() + "\"}");
    }

    @Transactional
    public void toggleActivo(Long id, boolean blanco, String usuario) {
        if (blanco) {
            blancoRepo.findById(id).ifPresent(d -> {
                d.setActivo(!d.getActivo());
                blancoRepo.save(d);
                auditoria.registrar("CATALOGO_DOMINIO_BLANCO", id, "TOGGLE_ACTIVO", usuario,
                        "{\"dominio\":\"" + d.getDominio() + "\",\"activo\":" + d.getActivo() + "}");
            });
        } else {
            negroRepo.findById(id).ifPresent(d -> {
                d.setActivo(!d.getActivo());
                negroRepo.save(d);
                auditoria.registrar("CATALOGO_DOMINIO_NEGRO", id, "TOGGLE_ACTIVO", usuario,
                        "{\"dominio\":\"" + d.getDominio() + "\",\"activo\":" + d.getActivo() + "}");
            });
        }
    }

    private void crearPendientesDestinatario(Long loteId, String dominio) {
        var detalles = detalleRepo.findByLoteIdAndEstado(loteId, "DOMINIO_SEGURO");
        var creados = new HashSet<String>();

        for (var det : detalles) {
            if (!dominio.equals(det.getDominioExt())) continue;
            var dest = det.getDestinatarioExt();
            var correo = det.getCorreoUsuarioAlicorp();
            if (dest == null || correo == null) continue;

            var key = dest.toLowerCase() + "|" + correo.toLowerCase();
            if (creados.contains(key)) continue;

            // Skip if already in whitelist or blacklist
            if (destBlancoRepo.existsByDestinatarioAndCorreoUsuarioAlicorpAndActivoTrue(dest, correo)) {
                detalleRepo.updateEstadoByDestinatarioAndUsuario(loteId, dest, correo, "DESTINATARIO_SEGURO");
                continue;
            }
            if (destNegroRepo.existsByDestinatarioAndCorreoUsuarioAlicorpAndActivoTrue(dest, correo)) {
                detalleRepo.updateEstadoByDestinatarioAndUsuario(loteId, dest, correo, "DESTINATARIO_NO_SEGURO");
                continue;
            }

            var pend = new PendienteValidacionDestinatario();
            pend.setLoteId(loteId);
            pend.setDestinatario(dest);
            pend.setDominio(dominio);
            pend.setCorreoUsuarioAlicorp(correo);
            pend.setFechaLimite(OffsetDateTime.now().plusDays(7));
            pendDestRepo.save(pend);

            detalleRepo.updateEstadoByDestinatarioAndUsuario(loteId, dest, correo, "DESTINATARIO_PENDIENTE");
            creados.add(key);
        }
    }
}
