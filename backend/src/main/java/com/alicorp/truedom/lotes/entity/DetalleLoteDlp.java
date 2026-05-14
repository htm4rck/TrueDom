package com.alicorp.truedom.lotes.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "detalle_lote_dlp")
public class DetalleLoteDlp {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "lote_id", nullable = false)
    private Long loteId;

    @Column(name = "registro_dlp_id", nullable = false)
    private Long registroDlpId;

    @Column(name = "dominio_ext")
    private String dominioExt;

    @Column(name = "destinatario_ext")
    private String destinatarioExt;

    @Column(name = "correo_usuario_alicorp")
    private String correoUsuarioAlicorp;

    @Column(nullable = false, length = 40)
    private String estado;

    @Column(name = "fecha_actualizacion", nullable = false)
    private OffsetDateTime fechaActualizacion = OffsetDateTime.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getLoteId() { return loteId; }
    public void setLoteId(Long loteId) { this.loteId = loteId; }
    public Long getRegistroDlpId() { return registroDlpId; }
    public void setRegistroDlpId(Long registroDlpId) { this.registroDlpId = registroDlpId; }
    public String getDominioExt() { return dominioExt; }
    public void setDominioExt(String dominioExt) { this.dominioExt = dominioExt; }
    public String getDestinatarioExt() { return destinatarioExt; }
    public void setDestinatarioExt(String destinatarioExt) { this.destinatarioExt = destinatarioExt; }
    public String getCorreoUsuarioAlicorp() { return correoUsuarioAlicorp; }
    public void setCorreoUsuarioAlicorp(String correoUsuarioAlicorp) { this.correoUsuarioAlicorp = correoUsuarioAlicorp; }
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
    public OffsetDateTime getFechaActualizacion() { return fechaActualizacion; }
    public void setFechaActualizacion(OffsetDateTime fechaActualizacion) { this.fechaActualizacion = fechaActualizacion; }
}
