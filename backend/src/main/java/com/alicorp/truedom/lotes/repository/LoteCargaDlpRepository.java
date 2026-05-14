package com.alicorp.truedom.lotes.repository;

import com.alicorp.truedom.lotes.entity.LoteCargaDlp;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LoteCargaDlpRepository extends JpaRepository<LoteCargaDlp, Long> {
    List<LoteCargaDlp> findByPeriodoAnioAndPeriodoMesOrderByFechaCargaDesc(Integer anio, Integer mes);
    List<LoteCargaDlp> findAllByOrderByFechaCargaDesc();
}
