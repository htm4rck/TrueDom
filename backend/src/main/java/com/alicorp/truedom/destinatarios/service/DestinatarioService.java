package com.alicorp.truedom.destinatarios.service;

import com.alicorp.truedom.auditoria.service.AuditoriaService;
import com.alicorp.truedom.destinatarios.entity.*;
import com.alicorp.truedom.destinatarios.repository.*;
import com.alicorp.truedom.inconsistencias.entity.InconsistenciaValidacion;
import com.alicorp.truedom.inconsistencias.repository.InconsistenciaValidacionRepository;
import com.alicorp.truedom.lotes.repository.DetalleLoteDlpRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class DestinatarioService {
    private final PendienteValidacionDestinatarioRepository pendienteRepo;
    private final ValidacionDestinatarioRepository validacionRepo;
    private final CatalogoDestinatarioBlancoRepository blancoRepo;
    private final CatalogoDestinatarioNegroRepository negroRepo;
    private final InconsistenciaValidacionRepository inconsistenciaRepo;
    private final DetalleLoteDlpRepository detalleRepo;
    private final AuditoriaService auditoria;

    public DestinatarioService(PendienteValidacionDestinatarioRepository pendienteRepo,
                               ValidacionDestinatarioRepository validacionRepo,
                               CatalogoDestinatarioBlancoRepository blancoRepo,
                               CatalogoDestinatarioNegroRepository negroRepo,
                               InconsistenciaValidacionRepository inconsistenciaRepo,
                               DetalleLoteDlpRepository detalleRepo,
                               AuditoriaService auditoria) {
        this.pendienteRepo = pendienteRepo;
        this.validacionRepo = validacionRepo;
        this.blancoRepo = blancoRepo;
        this.negroRepo = negroRepo;
        this.inconsistenciaRepo = inconsistenciaRepo;
        this.detalleRepo = detalleRepo;
        this.auditoria = auditoria;
    }

    public List<PendienteValidacionDestinatario> listarMisPendientes(String correoUsuario) {
        return pendienteRepo.findByCorreoUsuarioAlicorpAndEstado(correoUsuario, "PENDIENTE");
    }

    @Transactional
    public void validar(Long pendienteId, String decision, String justificacion, String usuario) {
        var pendiente = pendienteRepo.findById(pendienteId)
                .orElseThrow(() -> new IllegalArgumentException("Pendiente no encontrado: " + pendienteId));

        // Registrar validación
        var validacion = new ValidacionDestinatario();
        validacion.setPendienteId(pendienteId);
        validacion.setDestinatario(pendiente.getDestinatario());
        validacion.setCorreoUsuarioAlicorp(usuario);
        validacion.setDecision(decision);
        validacion.setJustificacion(justificacion);
        validacionRepo.save(validacion);

        // Actualizar catálogo
        if ("SEGURO".equals(decision)) {
            var blanco = new CatalogoDestinatarioBlanco();
            blanco.setDestinatario(pendiente.getDestinatario());
            blanco.setCorreoUsuarioAlicorp(usuario);
            blanco.setJustificacion(justificacion);
            blanco.setCreadoPor(usuario);
            blancoRepo.save(blanco);
            detalleRepo.updateEstadoByDestinatarioAndUsuario(
                    pendiente.getLoteId(), pendiente.getDestinatario(), usuario, "DESTINATARIO_SEGURO");
        } else {
            var negro = new CatalogoDestinatarioNegro();
            negro.setDestinatario(pendiente.getDestinatario());
            negro.setCorreoUsuarioAlicorp(usuario);
            negro.setJustificacion(justificacion);
            negro.setCreadoPor(usuario);
            negroRepo.save(negro);
            detalleRepo.updateEstadoByDestinatarioAndUsuario(
                    pendiente.getLoteId(), pendiente.getDestinatario(), usuario, "DESTINATARIO_NO_SEGURO");
        }

        pendiente.setEstado("VALIDADO");
        pendienteRepo.save(pendiente);

        // Detectar inconsistencia
        detectarInconsistencia(pendiente.getDestinatario(), pendiente.getDominio());

        auditoria.registrar("VALIDACION_DESTINATARIO", validacion.getId(),
                "VALIDACION_" + decision, usuario,
                "{\"destinatario\":\"" + pendiente.getDestinatario() + "\"}");
    }

    private void detectarInconsistencia(String destinatario, String dominio) {
        var validaciones = validacionRepo.findByDestinatario(destinatario);
        if (validaciones.size() < 2) return;

        boolean haySeguro = validaciones.stream().anyMatch(v -> "SEGURO".equals(v.getDecision()));
        boolean hayNoSeguro = validaciones.stream().anyMatch(v -> "NO_SEGURO".equals(v.getDecision()));

        if (haySeguro && hayNoSeguro) {
            // Verificar si ya existe inconsistencia abierta
            var existentes = inconsistenciaRepo.findByEstadoOrderByFechaCreacionDesc("ABIERTA");
            boolean yaExiste = existentes.stream()
                    .anyMatch(i -> destinatario.equals(i.getDestinatario()));
            if (!yaExiste) {
                var inc = new InconsistenciaValidacion();
                inc.setDestinatario(destinatario);
                inc.setDominio(dominio);
                inconsistenciaRepo.save(inc);
            }
        }
    }

    public List<CatalogoDestinatarioBlanco> listarBlancos() {
        return blancoRepo.findAll();
    }

    public List<CatalogoDestinatarioNegro> listarNegros() {
        return negroRepo.findAll();
    }

    @Transactional
    public void eliminarBlanco(Long id, String usuario) {
        var entry = blancoRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Destinatario blanco no encontrado: " + id));
        blancoRepo.delete(entry);
        auditoria.registrar("CATALOGO_DESTINATARIO_BLANCO", id, "ELIMINAR_DESTINATARIO_BLANCO", usuario,
                "{\"destinatario\":\"" + entry.getDestinatario() + "\"}");
    }

    @Transactional
    public void eliminarNegro(Long id, String usuario) {
        var entry = negroRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Destinatario negro no encontrado: " + id));
        negroRepo.delete(entry);
        auditoria.registrar("CATALOGO_DESTINATARIO_NEGRO", id, "ELIMINAR_DESTINATARIO_NEGRO", usuario,
                "{\"destinatario\":\"" + entry.getDestinatario() + "\"}");
    }
}
