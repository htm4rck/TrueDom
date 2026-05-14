package com.alicorp.truedom.auditoria.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.OffsetDateTime;

@Entity
@Table(name = "auditoria_dlp")
public class AuditoriaDlp {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String entidad;

    @Column(name = "entidad_id")
    private Long entidadId;

    @Column(nullable = false, length = 120)
    private String accion;

    @Column(nullable = false)
    private String usuario;

    @Column(columnDefinition = "jsonb")
    private String detalle;

    @Column(name = "fecha_evento", nullable = false)
    private OffsetDateTime fechaEvento = OffsetDateTime.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getEntidad() { return entidad; }
    public void setEntidad(String entidad) { this.entidad = entidad; }
    public Long getEntidadId() { return entidadId; }
    public void setEntidadId(Long entidadId) { this.entidadId = entidadId; }
    public String getAccion() { return accion; }
    public void setAccion(String accion) { this.accion = accion; }
    public String getUsuario() { return usuario; }
    public void setUsuario(String usuario) { this.usuario = usuario; }
    public String getDetalle() { return detalle; }
    public void setDetalle(String detalle) { this.detalle = detalle; }
    public OffsetDateTime getFechaEvento() { return fechaEvento; }
    public void setFechaEvento(OffsetDateTime fechaEvento) { this.fechaEvento = fechaEvento; }
}
