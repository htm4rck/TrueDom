package com.alicorp.truedom.lotes.service;

import com.alicorp.truedom.dominios.repository.CatalogoDominicoBlancoRepository;
import com.alicorp.truedom.dominios.repository.CatalogoDominioNegroRepository;
import com.alicorp.truedom.lotes.entity.DetalleLoteDlp;
import com.alicorp.truedom.lotes.repository.DetalleLoteDlpRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class LoteConsultaService {
    private final DetalleLoteDlpRepository detalleRepo;
    private final CatalogoDominicoBlancoRepository domBlancoRepo;
    private final CatalogoDominioNegroRepository domNegroRepo;

    public LoteConsultaService(DetalleLoteDlpRepository detalleRepo,
                               CatalogoDominicoBlancoRepository domBlancoRepo,
                               CatalogoDominioNegroRepository domNegroRepo) {
        this.detalleRepo = detalleRepo;
        this.domBlancoRepo = domBlancoRepo;
        this.domNegroRepo = domNegroRepo;
    }

    public Map<String, Object> dominiosResultado(Long loteId, int page, int size, String estadoFiltro) {
        var allDetalles = new ArrayList<DetalleLoteDlp>();
        allDetalles.addAll(detalleRepo.findByLoteIdAndEstado(loteId, "DOMINIO_PENDIENTE"));
        allDetalles.addAll(detalleRepo.findByLoteIdAndEstado(loteId, "DOMINIO_SEGURO"));
        allDetalles.addAll(detalleRepo.findByLoteIdAndEstado(loteId, "DOMINIO_NO_SEGURO"));

        var dominioMap = new LinkedHashMap<String, Map<String, Object>>();
        for (var d : allDetalles) {
            var dominio = d.getDominioExt();
            if (dominio == null) continue;
            var entry = dominioMap.computeIfAbsent(dominio, k -> {
                var m = new HashMap<String, Object>();
                m.put("dominio", k);
                m.put("envios", 0);
                m.put("usuarios", new HashSet<String>());
                if (domBlancoRepo.existsByDominioAndActivoTrue(k)) m.put("estado", "BLANCO");
                else if (domNegroRepo.existsByDominioAndActivoTrue(k)) m.put("estado", "NEGRO");
                else m.put("estado", "PENDIENTE");
                return m;
            });
            entry.put("envios", (int) entry.get("envios") + 1);
            if (d.getCorreoUsuarioAlicorp() != null) {
                ((Set<String>) entry.get("usuarios")).add(d.getCorreoUsuarioAlicorp());
            }
        }

        var items = dominioMap.values().stream()
                .peek(m -> m.put("totalUsuarios", ((Set<?>) m.get("usuarios")).size()))
                .peek(m -> m.remove("usuarios"))
                .filter(m -> estadoFiltro.isEmpty() || estadoFiltro.equals(m.get("estado")))
                .toList();

        int total = items.size();
        int from = Math.min(page * size, total);
        int to = Math.min(from + size, total);
        return Map.of("items", items.subList(from, to), "total", total, "page", page, "size", size);
    }

    public Map<String, Object> destinatariosResultado(Long loteId, int page, int size, String filtro) {
        var detalles = new ArrayList<DetalleLoteDlp>();
        detalles.addAll(detalleRepo.findByLoteIdAndEstado(loteId, "DESTINATARIO_PENDIENTE"));
        detalles.addAll(detalleRepo.findByLoteIdAndEstado(loteId, "DOMINIO_PENDIENTE"));

        var destMap = new LinkedHashMap<String, Map<String, Object>>();
        for (var d : detalles) {
            var dest = d.getDestinatarioExt();
            if (dest == null) continue;
            var key = dest.toLowerCase();
            var entry = destMap.computeIfAbsent(key, k -> {
                var m = new HashMap<String, Object>();
                m.put("destinatario", dest);
                m.put("dominio", d.getDominioExt() != null ? d.getDominioExt() : "");
                m.put("envios", 0);
                m.put("usuarioAlicorp", d.getCorreoUsuarioAlicorp() != null ? d.getCorreoUsuarioAlicorp() : "");
                return m;
            });
            entry.put("envios", (int) entry.get("envios") + 1);
        }

        var items = destMap.values().stream()
                .filter(m -> filtro.isEmpty() ||
                        ((String) m.get("destinatario")).toLowerCase().contains(filtro.toLowerCase()) ||
                        ((String) m.get("dominio")).toLowerCase().contains(filtro.toLowerCase()) ||
                        ((String) m.get("usuarioAlicorp")).toLowerCase().contains(filtro.toLowerCase()))
                .toList();

        int total = items.size();
        int from = Math.min(page * size, total);
        int to = Math.min(from + size, total);
        return Map.of("items", items.subList(from, to), "total", total, "page", page, "size", size);
    }
}
