package com.alicorp.truedom.shared.websocket;

public record ProgresoLote(
        Long loteId,
        String fase,
        int registrosLeidos,
        int totalEstimado,
        int porcentaje,
        int dominiosEncontrados,
        int destinatariosEncontrados,
        String mensaje
) {
    public static ProgresoLote cargando(Long loteId, int leidos, int total) {
        int pct = total > 0 ? (leidos * 100 / total) : 0;
        return new ProgresoLote(loteId, "CARGANDO", leidos, total, pct, 0, 0,
                "Leyendo registros: " + leidos + " / " + total);
    }

    public static ProgresoLote procesando(Long loteId, int leidos, int total, int dominios, int destinatarios) {
        int pct = total > 0 ? (leidos * 100 / total) : 0;
        return new ProgresoLote(loteId, "PROCESANDO", leidos, total, pct, dominios, destinatarios,
                "Procesando: " + leidos + " / " + total);
    }

    public static ProgresoLote completado(Long loteId, int registros, int dominios, int destinatarios) {
        return new ProgresoLote(loteId, "COMPLETADO", registros, registros, 100, dominios, destinatarios,
                "Completado: " + registros + " registros, " + dominios + " dominios, " + destinatarios + " destinatarios pendientes");
    }

    public static ProgresoLote error(Long loteId, String mensaje) {
        return new ProgresoLote(loteId, "ERROR", 0, 0, 0, 0, 0, mensaje);
    }
}
