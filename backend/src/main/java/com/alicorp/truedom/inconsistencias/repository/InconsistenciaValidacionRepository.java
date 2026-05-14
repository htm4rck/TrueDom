package com.alicorp.truedom.inconsistencias.repository;

import com.alicorp.truedom.inconsistencias.entity.InconsistenciaValidacion;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface InconsistenciaValidacionRepository extends JpaRepository<InconsistenciaValidacion, Long> {
    List<InconsistenciaValidacion> findByEstadoOrderByFechaCreacionDesc(String estado);
    long countByEstado(String estado);
}
