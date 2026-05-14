package com.alicorp.truedom.destinatarios.repository;

import com.alicorp.truedom.destinatarios.entity.CatalogoDestinatarioBlanco;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CatalogoDestinatarioBlancoRepository extends JpaRepository<CatalogoDestinatarioBlanco, Long> {
    boolean existsByDestinatarioAndCorreoUsuarioAlicorpAndActivoTrue(String destinatario, String correo);
}
