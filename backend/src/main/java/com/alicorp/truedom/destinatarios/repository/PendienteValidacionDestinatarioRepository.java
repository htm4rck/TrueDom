package com.alicorp.truedom.destinatarios.repository;

import com.alicorp.truedom.destinatarios.entity.PendienteValidacionDestinatario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface PendienteValidacionDestinatarioRepository extends JpaRepository<PendienteValidacionDestinatario, Long> {
    List<PendienteValidacionDestinatario> findByCorreoUsuarioAlicorpAndEstado(String correo, String estado);
    List<PendienteValidacionDestinatario> findByDestinatario(String destinatario);
    Optional<PendienteValidacionDestinatario> findByDestinatarioAndCorreoUsuarioAlicorpAndEstado(String destinatario, String correo, String estado);

    @Query("SELECT p FROM PendienteValidacionDestinatario p WHERE p.estado = :estado AND p.loteId IN :loteIds")
    List<PendienteValidacionDestinatario> findByEstadoAndLoteIdIn(String estado, List<Long> loteIds);

    List<PendienteValidacionDestinatario> findByEstado(String estado);
}
