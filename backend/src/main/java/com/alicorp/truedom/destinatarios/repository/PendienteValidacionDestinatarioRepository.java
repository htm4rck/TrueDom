package com.alicorp.truedom.destinatarios.repository;

import com.alicorp.truedom.destinatarios.entity.PendienteValidacionDestinatario;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PendienteValidacionDestinatarioRepository extends JpaRepository<PendienteValidacionDestinatario, Long> {
    List<PendienteValidacionDestinatario> findByCorreoUsuarioAlicorpAndEstado(String correo, String estado);
    List<PendienteValidacionDestinatario> findByDestinatario(String destinatario);
}
