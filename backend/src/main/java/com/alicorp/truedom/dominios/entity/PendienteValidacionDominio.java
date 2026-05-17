package com.alicorp.truedom.dominios.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "pendiente_validacion_dominio")
public class PendienteValidacionDominio {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "lote_id", nullable = false)
    private Long loteId;

    @Column(nullable = false)
    private String dominio;

    @Column(name = "total_registros", nullable = false)
    private Integer totalRegistros;

    @Column(name = "total_usuarios", nullable = false)
    private Integer totalUsuarios;

    @Column(nullable = false, length = 40)
    private String estado = "PENDIENTE";

    @Column(name = "fecha_creacion", nullable = false)
    private OffsetDateTime fechaCreacion = OffsetDateTime.now();

    @Column(name = "total_vp")
    private Integer totalVp = 0;

    @Column(name = "vicepresidencias", columnDefinition = "TEXT")
    private String vicepresidencias;

    @Column(name = "ultima_actividad")
    private OffsetDateTime ultimaActividad;

    @Column(name = "politicas", columnDefinition = "TEXT")
    private String politicas;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getLoteId() { return loteId; }
    public void setLoteId(Long loteId) { this.loteId = loteId; }
    public String getDominio() { return dominio; }
    public void setDominio(String dominio) { this.dominio = dominio; }
    public Integer getTotalRegistros() { return totalRegistros; }
    public void setTotalRegistros(Integer totalRegistros) { this.totalRegistros = totalRegistros; }
    public Integer getTotalUsuarios() { return totalUsuarios; }
    public void setTotalUsuarios(Integer totalUsuarios) { this.totalUsuarios = totalUsuarios; }
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
    public OffsetDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(OffsetDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }
    public Integer getTotalVp() { return totalVp; }
    public void setTotalVp(Integer totalVp) { this.totalVp = totalVp; }
    public String getVicepresidencias() { return vicepresidencias; }
    public void setVicepresidencias(String vicepresidencias) { this.vicepresidencias = vicepresidencias; }
    public OffsetDateTime getUltimaActividad() { return ultimaActividad; }
    public void setUltimaActividad(OffsetDateTime ultimaActividad) { this.ultimaActividad = ultimaActividad; }
    public String getPoliticas() { return politicas; }
    public void setPoliticas(String politicas) { this.politicas = politicas; }
}
