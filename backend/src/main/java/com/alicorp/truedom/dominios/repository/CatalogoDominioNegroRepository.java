package com.alicorp.truedom.dominios.repository;

import com.alicorp.truedom.dominios.entity.CatalogoDominioNegro;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CatalogoDominioNegroRepository extends JpaRepository<CatalogoDominioNegro, Long> {
    Optional<CatalogoDominioNegro> findByDominioAndActivoTrue(String dominio);
    boolean existsByDominioAndActivoTrue(String dominio);
}
