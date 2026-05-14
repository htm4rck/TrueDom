package com.alicorp.truedom.reportes.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.OffsetDateTime;

@Entity
@Table(name = "reporte_dlp")
public class ReporteDlp {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "lote_id")
    private Long loteId;

    @Column(name = "periodo_anio", nullable = false)
    private Integer periodoAnio;

    @Column(name = "periodo_mes", nullable = false)
    private Integer periodoMes;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(nullable = false, columnDefinition = "jsonb")
    private String metricas;

    @Column(name = "fecha_generacion", nullable = false)
    private OffsetDateTime fechaGeneracion = OffsetDateTime.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getLoteId() { return loteId; }
    public void setLoteId(Long loteId) { this.loteId = loteId; }
    public Integer getPeriodoAnio() { return periodoAnio; }
    public void setPeriodoAnio(Integer periodoAnio) { this.periodoAnio = periodoAnio; }
    public Integer getPeriodoMes() { return periodoMes; }
    public void setPeriodoMes(Integer periodoMes) { this.periodoMes = periodoMes; }
    public String getMetricas() { return metricas; }
    public void setMetricas(String metricas) { this.metricas = metricas; }
    public OffsetDateTime getFechaGeneracion() { return fechaGeneracion; }
    public void setFechaGeneracion(OffsetDateTime fechaGeneracion) { this.fechaGeneracion = fechaGeneracion; }
}
