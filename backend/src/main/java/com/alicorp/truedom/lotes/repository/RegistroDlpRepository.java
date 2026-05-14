package com.alicorp.truedom.lotes.repository;

import com.alicorp.truedom.lotes.entity.RegistroDlp;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RegistroDlpRepository extends JpaRepository<RegistroDlp, Long> {
    List<RegistroDlp> findByLoteId(Long loteId);
    long countByLoteId(Long loteId);
}
