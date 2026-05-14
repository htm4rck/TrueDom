package com.alicorp.truedom.inconsistencias.service;

import com.alicorp.truedom.auditoria.service.AuditoriaService;
import com.alicorp.truedom.destinatarios.repository.ValidacionDestinatarioRepository;
import com.alicorp.truedom.inconsistencias.entity.InconsistenciaValidacion;
import com.alicorp.truedom.inconsistencias.repository.InconsistenciaValidacionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

@Service
public class InconsistenciaService {
    private final InconsistenciaValidacionRepository repo;
    private final ValidacionDestinatarioRepository validacionRepo;
    private final AuditoriaService auditoria;

    public InconsistenciaService(InconsistenciaValidacionRepository repo,
                                 ValidacionDestinatarioRepository validacionRepo,
                                 AuditoriaService auditoria) {
        this.repo = repo;
        this.validacionRepo = validacionRepo;
        this.auditoria = auditoria;
    }

    public List<InconsistenciaValidacion> listarAbiertas() {
        return repo.findByEstadoOrderByFechaCreacionDesc("ABIERTA");
    }

    public Map<String, Object> detalle(Long id) {
        var inc = repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Inconsistencia no encontrada: " + id));
        var validaciones = validacionRepo.findByDestinatario(inc.getDestinatario());
        return Map.of(
                "inconsistencia", inc,
                "validaciones", validaciones
        );
    }

    @Transactional
    public void resolver(Long id, String decisionFinal, String justificacion, String usuario) {
        var inc = repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Inconsistencia no encontrada: " + id));

        inc.setEstado("CERRADA");
        inc.setDecisionFinal(decisionFinal);
        inc.setJustificacionResolucion(justificacion);
        inc.setResueltoPor(usuario);
        inc.setFechaResolucion(OffsetDateTime.now());
        repo.save(inc);

        auditoria.registrar("INCONSISTENCIA_VALIDACION", id,
                "RESOLUCION_" + decisionFinal, usuario,
                "{\"destinatario\":\"" + inc.getDestinatario() + "\",\"decision\":\"" + decisionFinal + "\"}");
    }
}
