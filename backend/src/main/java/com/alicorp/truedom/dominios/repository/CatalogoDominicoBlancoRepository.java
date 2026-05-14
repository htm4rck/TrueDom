package com.alicorp.truedom.dominios.repository;

import com.alicorp.truedom.dominios.entity.CatalogoDominioBlanco;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CatalogoDominicoBlancoRepository extends JpaRepository<CatalogoDominioBlanco, Long> {
    Optional<CatalogoDominioBlanco> findByDominioAndActivoTrue(String dominio);
    boolean existsByDominioAndActivoTrue(String dominio);
}
