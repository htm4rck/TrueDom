-- Add strategic summary columns to pendiente_validacion_dominio
ALTER TABLE pendiente_validacion_dominio
    ADD COLUMN IF NOT EXISTS total_vp INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS vicepresidencias TEXT,
    ADD COLUMN IF NOT EXISTS ultima_actividad TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS politicas TEXT;
