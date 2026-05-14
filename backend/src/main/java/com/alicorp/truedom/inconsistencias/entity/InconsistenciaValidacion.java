package com.alicorp.truedom.inconsistencias.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "inconsistencia_validacion")
public class InconsistenciaValidacion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String destinatario;

    private String dominio;

    @Column(nullable = false, length = 40)
    private String estado = "ABIERTA";

    @Column(name = "decision_final", length = 40)
    private String decisionFinal;

    @Column(name = "justificacion_resolucion")
    private String justificacionResolucion;

    @Column(name = "resuelto_por")
    private String resueltoPor;

    @Column(name = "fecha_creacion", nullable = false)
    private OffsetDateTime fechaCreacion = OffsetDateTime.now();

    @Column(name = "fecha_resolucion")
    private OffsetDateTime fechaResolucion;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getDestinatario() { return destinatario; }
    public void setDestinatario(String destinatario) { this.destinatario = destinatario; }
    public String getDominio() { return dominio; }
    public void setDominio(String dominio) { this.dominio = dominio; }
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
    public String getDecisionFinal() { return decisionFinal; }
    public void setDecisionFinal(String decisionFinal) { this.decisionFinal = decisionFinal; }
    public String getJustificacionResolucion() { return justificacionResolucion; }
    public void setJustificacionResolucion(String justificacionResolucion) { this.justificacionResolucion = justificacionResolucion; }
    public String getResueltoPor() { return resueltoPor; }
    public void setResueltoPor(String resueltoPor) { this.resueltoPor = resueltoPor; }
    public OffsetDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(OffsetDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }
    public OffsetDateTime getFechaResolucion() { return fechaResolucion; }
    public void setFechaResolucion(OffsetDateTime fechaResolucion) { this.fechaResolucion = fechaResolucion; }
}
