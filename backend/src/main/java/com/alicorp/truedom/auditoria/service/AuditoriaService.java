package com.alicorp.truedom.auditoria.service;

import com.alicorp.truedom.auditoria.entity.AuditoriaDlp;
import com.alicorp.truedom.auditoria.repository.AuditoriaDlpRepository;
import org.springframework.stereotype.Service;

@Service
public class AuditoriaService {
    private final AuditoriaDlpRepository repo;

    public AuditoriaService(AuditoriaDlpRepository repo) {
        this.repo = repo;
    }

    public void registrar(String entidad, Long entidadId, String accion, String usuario, String detalle) {
        var audit = new AuditoriaDlp();
        audit.setEntidad(entidad);
        audit.setEntidadId(entidadId);
        audit.setAccion(accion);
        audit.setUsuario(usuario);
        audit.setDetalle(detalle);
        repo.save(audit);
    }
}
