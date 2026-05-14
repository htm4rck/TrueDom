package com.alicorp.truedom.dominios.repository;

import com.alicorp.truedom.dominios.entity.PendienteValidacionDominio;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PendienteValidacionDominioRepository extends JpaRepository<PendienteValidacionDominio, Long> {
    List<PendienteValidacionDominio> findByEstadoOrderByTotalRegistrosDesc(String estado);
}
