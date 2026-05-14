package com.alicorp.truedom.destinatarios.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "validacion_destinatario")
public class ValidacionDestinatario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "pendiente_id", nullable = false)
    private Long pendienteId;

    @Column(nullable = false)
    private String destinatario;

    @Column(name = "correo_usuario_alicorp", nullable = false)
    private String correoUsuarioAlicorp;

    @Column(nullable = false, length = 40)
    private String decision;

    @Column(nullable = false)
    private String justificacion;

    @Column(name = "fecha_validacion", nullable = false)
    private OffsetDateTime fechaValidacion = OffsetDateTime.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getPendienteId() { return pendienteId; }
    public void setPendienteId(Long pendienteId) { this.pendienteId = pendienteId; }
    public String getDestinatario() { return destinatario; }
    public void setDestinatario(String destinatario) { this.destinatario = destinatario; }
    public String getCorreoUsuarioAlicorp() { return correoUsuarioAlicorp; }
    public void setCorreoUsuarioAlicorp(String correoUsuarioAlicorp) { this.correoUsuarioAlicorp = correoUsuarioAlicorp; }
    public String getDecision() { return decision; }
    public void setDecision(String decision) { this.decision = decision; }
    public String getJustificacion() { return justificacion; }
    public void setJustificacion(String justificacion) { this.justificacion = justificacion; }
    public OffsetDateTime getFechaValidacion() { return fechaValidacion; }
    public void setFechaValidacion(OffsetDateTime fechaValidacion) { this.fechaValidacion = fechaValidacion; }
}
