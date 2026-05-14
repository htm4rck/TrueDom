package com.alicorp.truedom.destinatarios.repository;

import com.alicorp.truedom.destinatarios.entity.CatalogoDestinatarioNegro;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CatalogoDestinatarioNegroRepository extends JpaRepository<CatalogoDestinatarioNegro, Long> {
    boolean existsByDestinatarioAndCorreoUsuarioAlicorpAndActivoTrue(String destinatario, String correo);
}
