package com.alicorp.truedom.destinatarios.repository;

import com.alicorp.truedom.destinatarios.entity.ValidacionDestinatario;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ValidacionDestinatarioRepository extends JpaRepository<ValidacionDestinatario, Long> {
    List<ValidacionDestinatario> findByDestinatario(String destinatario);
}
