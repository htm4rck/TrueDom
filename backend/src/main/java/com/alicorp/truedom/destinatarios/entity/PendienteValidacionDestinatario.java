package com.alicorp.truedom.destinatarios.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "pendiente_validacion_destinatario")
public class PendienteValidacionDestinatario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "lote_id", nullable = false)
    private Long loteId;

    @Column(nullable = false)
    private String destinatario;

    private String dominio;

    @Column(name = "correo_usuario_alicorp", nullable = false)
    private String correoUsuarioAlicorp;

    @Column(nullable = false, length = 40)
    private String estado = "PENDIENTE";

    @Column(name = "fecha_creacion", nullable = false)
    private OffsetDateTime fechaCreacion = OffsetDateTime.now();

    @Column(name = "fecha_limite")
    private OffsetDateTime fechaLimite;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getLoteId() { return loteId; }
    public void setLoteId(Long loteId) { this.loteId = loteId; }
    public String getDestinatario() { return destinatario; }
    public void setDestinatario(String destinatario) { this.destinatario = destinatario; }
    public String getDominio() { return dominio; }
    public void setDominio(String dominio) { this.dominio = dominio; }
    public String getCorreoUsuarioAlicorp() { return correoUsuarioAlicorp; }
    public void setCorreoUsuarioAlicorp(String correoUsuarioAlicorp) { this.correoUsuarioAlicorp = correoUsuarioAlicorp; }
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
    public OffsetDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(OffsetDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }
    public OffsetDateTime getFechaLimite() { return fechaLimite; }
    public void setFechaLimite(OffsetDateTime fechaLimite) { this.fechaLimite = fechaLimite; }
}
