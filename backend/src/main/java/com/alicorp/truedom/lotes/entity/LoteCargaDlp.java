package com.alicorp.truedom.lotes.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "lote_carga_dlp")
public class LoteCargaDlp {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "periodo_anio", nullable = false)
    private Integer periodoAnio;

    @Column(name = "periodo_mes", nullable = false)
    private Integer periodoMes;

    @Column(nullable = false, length = 40)
    private String estado;

    @Column(name = "usuario_carga", nullable = false)
    private String usuarioCarga;

    @Column(name = "fecha_carga", nullable = false)
    private OffsetDateTime fechaCarga = OffsetDateTime.now();

    @Column(name = "registros_cargados", nullable = false)
    private Integer registrosCargados = 0;

    @Column(name = "registros_procesados", nullable = false)
    private Integer registrosProcesados = 0;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Integer getPeriodoAnio() { return periodoAnio; }
    public void setPeriodoAnio(Integer periodoAnio) { this.periodoAnio = periodoAnio; }
    public Integer getPeriodoMes() { return periodoMes; }
    public void setPeriodoMes(Integer periodoMes) { this.periodoMes = periodoMes; }
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
    public String getUsuarioCarga() { return usuarioCarga; }
    public void setUsuarioCarga(String usuarioCarga) { this.usuarioCarga = usuarioCarga; }
    public OffsetDateTime getFechaCarga() { return fechaCarga; }
    public void setFechaCarga(OffsetDateTime fechaCarga) { this.fechaCarga = fechaCarga; }
    public Integer getRegistrosCargados() { return registrosCargados; }
    public void setRegistrosCargados(Integer registrosCargados) { this.registrosCargados = registrosCargados; }
    public Integer getRegistrosProcesados() { return registrosProcesados; }
    public void setRegistrosProcesados(Integer registrosProcesados) { this.registrosProcesados = registrosProcesados; }
}
