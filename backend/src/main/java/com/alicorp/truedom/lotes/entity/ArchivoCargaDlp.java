package com.alicorp.truedom.lotes.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "archivo_carga_dlp")
public class ArchivoCargaDlp {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "lote_id", nullable = false)
    private Long loteId;

    @Column(name = "nombre_archivo", nullable = false)
    private String nombreArchivo;

    @Column(name = "blob_uri", nullable = false)
    private String blobUri;

    @Column(name = "hash_archivo", length = 128)
    private String hashArchivo;

    @Column(name = "fecha_registro", nullable = false)
    private OffsetDateTime fechaRegistro = OffsetDateTime.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getLoteId() { return loteId; }
    public void setLoteId(Long loteId) { this.loteId = loteId; }
    public String getNombreArchivo() { return nombreArchivo; }
    public void setNombreArchivo(String nombreArchivo) { this.nombreArchivo = nombreArchivo; }
    public String getBlobUri() { return blobUri; }
    public void setBlobUri(String blobUri) { this.blobUri = blobUri; }
    public String getHashArchivo() { return hashArchivo; }
    public void setHashArchivo(String hashArchivo) { this.hashArchivo = hashArchivo; }
    public OffsetDateTime getFechaRegistro() { return fechaRegistro; }
    public void setFechaRegistro(OffsetDateTime fechaRegistro) { this.fechaRegistro = fechaRegistro; }
}
