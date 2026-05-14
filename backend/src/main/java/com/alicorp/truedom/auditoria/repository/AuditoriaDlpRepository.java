package com.alicorp.truedom.auditoria.repository;

import com.alicorp.truedom.auditoria.entity.AuditoriaDlp;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AuditoriaDlpRepository extends JpaRepository<AuditoriaDlp, Long> {
    List<AuditoriaDlp> findByEntidadAndEntidadIdOrderByFechaEventoDesc(String entidad, Long entidadId);
    List<AuditoriaDlp> findTop50ByOrderByFechaEventoDesc();
}
