CREATE TABLE lote_carga_dlp (
    id BIGSERIAL PRIMARY KEY,
    periodo_anio INTEGER NOT NULL,
    periodo_mes INTEGER NOT NULL,
    estado VARCHAR(40) NOT NULL,
    usuario_carga VARCHAR(255) NOT NULL,
    fecha_carga TIMESTAMPTZ NOT NULL DEFAULT now(),
    registros_cargados INTEGER NOT NULL DEFAULT 0,
    registros_procesados INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE archivo_carga_dlp (
    id BIGSERIAL PRIMARY KEY,
    lote_id BIGINT NOT NULL REFERENCES lote_carga_dlp(id),
    nombre_archivo VARCHAR(255) NOT NULL,
    blob_uri TEXT NOT NULL,
    hash_archivo VARCHAR(128),
    fecha_registro TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE registro_dlp (
    id BIGSERIAL PRIMARY KEY,
    lote_id BIGINT NOT NULL REFERENCES lote_carga_dlp(id),
    nombre_politica VARCHAR(255),
    user_group VARCHAR(255),
    from_user VARCHAR(255),
    groups_source VARCHAR(255),
    fecha_evento TIMESTAMPTZ,
    dlp_incident_id VARCHAR(120),
    usuario_ext VARCHAR(255),
    dominio_ext VARCHAR(255),
    destinatario_ext VARCHAR(255),
    correo_usuario_alicorp VARCHAR(255),
    vicepresidencia_usuario VARCHAR(255),
    direccion_gerencia_usuario VARCHAR(255),
    unidad_organizativa_usuario VARCHAR(255),
    nombre_posicion VARCHAR(255),
    raw_payload JSONB
);

CREATE TABLE detalle_lote_dlp (
    id BIGSERIAL PRIMARY KEY,
    lote_id BIGINT NOT NULL REFERENCES lote_carga_dlp(id),
    registro_dlp_id BIGINT NOT NULL REFERENCES registro_dlp(id),
    dominio_ext VARCHAR(255),
    destinatario_ext VARCHAR(255),
    correo_usuario_alicorp VARCHAR(255),
    estado VARCHAR(40) NOT NULL,
    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE catalogo_dominio_blanco (
    id BIGSERIAL PRIMARY KEY,
    dominio VARCHAR(255) NOT NULL UNIQUE,
    activo BOOLEAN NOT NULL DEFAULT true,
    justificacion TEXT NOT NULL,
    creado_por VARCHAR(255) NOT NULL,
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE catalogo_dominio_negro (
    id BIGSERIAL PRIMARY KEY,
    dominio VARCHAR(255) NOT NULL UNIQUE,
    activo BOOLEAN NOT NULL DEFAULT true,
    justificacion TEXT NOT NULL,
    creado_por VARCHAR(255) NOT NULL,
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE catalogo_destinatario_blanco (
    id BIGSERIAL PRIMARY KEY,
    destinatario VARCHAR(255) NOT NULL,
    correo_usuario_alicorp VARCHAR(255),
    activo BOOLEAN NOT NULL DEFAULT true,
    justificacion TEXT NOT NULL,
    creado_por VARCHAR(255) NOT NULL,
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE catalogo_destinatario_negro (
    id BIGSERIAL PRIMARY KEY,
    destinatario VARCHAR(255) NOT NULL,
    correo_usuario_alicorp VARCHAR(255),
    activo BOOLEAN NOT NULL DEFAULT true,
    justificacion TEXT NOT NULL,
    creado_por VARCHAR(255) NOT NULL,
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE pendiente_validacion_dominio (
    id BIGSERIAL PRIMARY KEY,
    lote_id BIGINT NOT NULL REFERENCES lote_carga_dlp(id),
    dominio VARCHAR(255) NOT NULL,
    total_registros INTEGER NOT NULL,
    total_usuarios INTEGER NOT NULL,
    estado VARCHAR(40) NOT NULL DEFAULT 'PENDIENTE',
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE pendiente_validacion_destinatario (
    id BIGSERIAL PRIMARY KEY,
    lote_id BIGINT NOT NULL REFERENCES lote_carga_dlp(id),
    destinatario VARCHAR(255) NOT NULL,
    dominio VARCHAR(255),
    correo_usuario_alicorp VARCHAR(255) NOT NULL,
    estado VARCHAR(40) NOT NULL DEFAULT 'PENDIENTE',
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT now(),
    fecha_limite TIMESTAMPTZ
);

CREATE TABLE validacion_destinatario (
    id BIGSERIAL PRIMARY KEY,
    pendiente_id BIGINT NOT NULL REFERENCES pendiente_validacion_destinatario(id),
    destinatario VARCHAR(255) NOT NULL,
    correo_usuario_alicorp VARCHAR(255) NOT NULL,
    decision VARCHAR(40) NOT NULL,
    justificacion TEXT NOT NULL,
    fecha_validacion TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE inconsistencia_validacion (
    id BIGSERIAL PRIMARY KEY,
    destinatario VARCHAR(255) NOT NULL,
    dominio VARCHAR(255),
    estado VARCHAR(40) NOT NULL DEFAULT 'ABIERTA',
    decision_final VARCHAR(40),
    justificacion_resolucion TEXT,
    resuelto_por VARCHAR(255),
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT now(),
    fecha_resolucion TIMESTAMPTZ
);

CREATE TABLE auditoria_dlp (
    id BIGSERIAL PRIMARY KEY,
    entidad VARCHAR(120) NOT NULL,
    entidad_id BIGINT,
    accion VARCHAR(120) NOT NULL,
    usuario VARCHAR(255) NOT NULL,
    detalle JSONB,
    fecha_evento TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE reporte_dlp (
    id BIGSERIAL PRIMARY KEY,
    lote_id BIGINT REFERENCES lote_carga_dlp(id),
    periodo_anio INTEGER NOT NULL,
    periodo_mes INTEGER NOT NULL,
    metricas JSONB NOT NULL,
    fecha_generacion TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_lote_periodo ON lote_carga_dlp(periodo_anio, periodo_mes);
CREATE INDEX idx_registro_lote ON registro_dlp(lote_id);
CREATE INDEX idx_registro_incidente ON registro_dlp(dlp_incident_id);
CREATE INDEX idx_registro_usuario ON registro_dlp(correo_usuario_alicorp);
CREATE INDEX idx_registro_dominio ON registro_dlp(dominio_ext);
CREATE INDEX idx_registro_destinatario ON registro_dlp(destinatario_ext);
CREATE INDEX idx_detalle_lote_estado ON detalle_lote_dlp(lote_id, estado);
CREATE INDEX idx_detalle_usuario ON detalle_lote_dlp(correo_usuario_alicorp);
CREATE INDEX idx_detalle_dominio ON detalle_lote_dlp(dominio_ext);
CREATE INDEX idx_detalle_destinatario ON detalle_lote_dlp(destinatario_ext);
CREATE INDEX idx_pend_dom_estado ON pendiente_validacion_dominio(estado);
CREATE INDEX idx_pend_dest_usuario_estado ON pendiente_validacion_destinatario(correo_usuario_alicorp, estado);
CREATE INDEX idx_val_destinatario ON validacion_destinatario(destinatario);
CREATE INDEX idx_inconsistencia_estado ON inconsistencia_validacion(estado);
