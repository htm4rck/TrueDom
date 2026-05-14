package com.alicorp.truedom.lotes.repository;

import com.alicorp.truedom.lotes.entity.DetalleLoteDlp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface DetalleLoteDlpRepository extends JpaRepository<DetalleLoteDlp, Long> {
    List<DetalleLoteDlp> findByLoteIdAndEstado(Long loteId, String estado);
    long countByLoteId(Long loteId);
    long countByLoteIdAndEstado(Long loteId, String estado);

    @Modifying
    @Query("UPDATE DetalleLoteDlp d SET d.estado = :estado WHERE d.loteId = :loteId AND d.dominioExt = :dominio")
    int updateEstadoByLoteIdAndDominio(Long loteId, String dominio, String estado);

    @Modifying
    @Query("UPDATE DetalleLoteDlp d SET d.estado = :estado WHERE d.loteId = :loteId AND d.destinatarioExt = :destinatario AND d.correoUsuarioAlicorp = :usuario")
    int updateEstadoByDestinatarioAndUsuario(Long loteId, String destinatario, String usuario, String estado);
}
