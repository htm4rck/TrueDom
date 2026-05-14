package com.alicorp.truedom.reportes.repository;

import com.alicorp.truedom.reportes.entity.ReporteDlp;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ReporteDlpRepository extends JpaRepository<ReporteDlp, Long> {
    Optional<ReporteDlp> findByPeriodoAnioAndPeriodoMes(Integer anio, Integer mes);
}
