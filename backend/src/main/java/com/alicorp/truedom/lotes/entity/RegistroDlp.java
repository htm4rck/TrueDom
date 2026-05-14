package com.alicorp.truedom.lotes.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "registro_dlp")
public class RegistroDlp {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "lote_id", nullable = false)
    private Long loteId;

    @Column(name = "nombre_politica")
    private String nombrePolitica;

    @Column(name = "user_group")
    private String userGroup;

    @Column(name = "from_user")
    private String fromUser;

    @Column(name = "groups_source")
    private String groupsSource;

    @Column(name = "fecha_evento")
    private OffsetDateTime fechaEvento;

    @Column(name = "dlp_incident_id", length = 120)
    private String dlpIncidentId;

    @Column(name = "usuario_ext")
    private String usuarioExt;

    @Column(name = "dominio_ext")
    private String dominioExt;

    @Column(name = "destinatario_ext")
    private String destinatarioExt;

    @Column(name = "correo_usuario_alicorp")
    private String correoUsuarioAlicorp;

    @Column(name = "vicepresidencia_usuario")
    private String vicepresidenciaUsuario;

    @Column(name = "direccion_gerencia_usuario")
    private String direccionGerenciaUsuario;

    @Column(name = "unidad_organizativa_usuario")
    private String unidadOrganizativaUsuario;

    @Column(name = "nombre_posicion")
    private String nombrePosicion;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getLoteId() { return loteId; }
    public void setLoteId(Long loteId) { this.loteId = loteId; }
    public String getNombrePolitica() { return nombrePolitica; }
    public void setNombrePolitica(String nombrePolitica) { this.nombrePolitica = nombrePolitica; }
    public String getUserGroup() { return userGroup; }
    public void setUserGroup(String userGroup) { this.userGroup = userGroup; }
    public String getFromUser() { return fromUser; }
    public void setFromUser(String fromUser) { this.fromUser = fromUser; }
    public String getGroupsSource() { return groupsSource; }
    public void setGroupsSource(String groupsSource) { this.groupsSource = groupsSource; }
    public OffsetDateTime getFechaEvento() { return fechaEvento; }
    public void setFechaEvento(OffsetDateTime fechaEvento) { this.fechaEvento = fechaEvento; }
    public String getDlpIncidentId() { return dlpIncidentId; }
    public void setDlpIncidentId(String dlpIncidentId) { this.dlpIncidentId = dlpIncidentId; }
    public String getUsuarioExt() { return usuarioExt; }
    public void setUsuarioExt(String usuarioExt) { this.usuarioExt = usuarioExt; }
    public String getDominioExt() { return dominioExt; }
    public void setDominioExt(String dominioExt) { this.dominioExt = dominioExt; }
    public String getDestinatarioExt() { return destinatarioExt; }
    public void setDestinatarioExt(String destinatarioExt) { this.destinatarioExt = destinatarioExt; }
    public String getCorreoUsuarioAlicorp() { return correoUsuarioAlicorp; }
    public void setCorreoUsuarioAlicorp(String correoUsuarioAlicorp) { this.correoUsuarioAlicorp = correoUsuarioAlicorp; }
    public String getVicepresidenciaUsuario() { return vicepresidenciaUsuario; }
    public void setVicepresidenciaUsuario(String vicepresidenciaUsuario) { this.vicepresidenciaUsuario = vicepresidenciaUsuario; }
    public String getDireccionGerenciaUsuario() { return direccionGerenciaUsuario; }
    public void setDireccionGerenciaUsuario(String direccionGerenciaUsuario) { this.direccionGerenciaUsuario = direccionGerenciaUsuario; }
    public String getUnidadOrganizativaUsuario() { return unidadOrganizativaUsuario; }
    public void setUnidadOrganizativaUsuario(String unidadOrganizativaUsuario) { this.unidadOrganizativaUsuario = unidadOrganizativaUsuario; }
    public String getNombrePosicion() { return nombrePosicion; }
    public void setNombrePosicion(String nombrePosicion) { this.nombrePosicion = nombrePosicion; }
}
