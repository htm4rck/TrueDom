package com.alicorp.truedom.dominios.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "catalogo_dominio_negro")
public class CatalogoDominioNegro {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String dominio;

    @Column(nullable = false)
    private Boolean activo = true;

    @Column(nullable = false)
    private String justificacion;

    @Column(name = "creado_por", nullable = false)
    private String creadoPor;

    @Column(name = "fecha_creacion", nullable = false)
    private OffsetDateTime fechaCreacion = OffsetDateTime.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getDominio() { return dominio; }
    public void setDominio(String dominio) { this.dominio = dominio; }
    public Boolean getActivo() { return activo; }
    public void setActivo(Boolean activo) { this.activo = activo; }
    public String getJustificacion() { return justificacion; }
    public void setJustificacion(String justificacion) { this.justificacion = justificacion; }
    public String getCreadoPor() { return creadoPor; }
    public void setCreadoPor(String creadoPor) { this.creadoPor = creadoPor; }
    public OffsetDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(OffsetDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }
}
