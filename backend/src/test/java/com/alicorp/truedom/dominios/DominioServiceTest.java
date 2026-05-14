package com.alicorp.truedom.dominios;

import com.alicorp.truedom.dominios.entity.PendienteValidacionDominio;
import com.alicorp.truedom.dominios.repository.*;
import com.alicorp.truedom.dominios.service.DominioService;
import com.alicorp.truedom.lotes.entity.DetalleLoteDlp;
import com.alicorp.truedom.lotes.entity.LoteCargaDlp;
import com.alicorp.truedom.lotes.repository.DetalleLoteDlpRepository;
import com.alicorp.truedom.lotes.repository.LoteCargaDlpRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class DominioServiceTest {

    @Autowired private DominioService service;
    @Autowired private PendienteValidacionDominioRepository pendienteRepo;
    @Autowired private CatalogoDominicoBlancoRepository blancoRepo;
    @Autowired private CatalogoDominioNegroRepository negroRepo;
    @Autowired private LoteCargaDlpRepository loteRepo;
    @Autowired private DetalleLoteDlpRepository detalleRepo;

    private Long loteId;

    @BeforeEach
    void setup() {
        var lote = new LoteCargaDlp();
        lote.setPeriodoAnio(2026);
        lote.setPeriodoMes(1);
        lote.setEstado("PROCESADO");
        lote.setUsuarioCarga("test");
        lote = loteRepo.save(lote);
        loteId = lote.getId();

        var det = new DetalleLoteDlp();
        det.setLoteId(loteId);
        det.setRegistroDlpId(1L);
        det.setDominioExt("test-domain.com");
        det.setDestinatarioExt("user@test-domain.com");
        det.setCorreoUsuarioAlicorp("admin@alicorp.com.pe");
        det.setEstado("DOMINIO_PENDIENTE");
        detalleRepo.save(det);

        var pend = new PendienteValidacionDominio();
        pend.setLoteId(loteId);
        pend.setDominio("test-domain.com");
        pend.setTotalRegistros(1);
        pend.setTotalUsuarios(1);
        pendienteRepo.save(pend);
    }

    @Test
    void listarPendientes_returnsPendingDomains() {
        var pendientes = service.listarPendientes();
        assertFalse(pendientes.isEmpty());
        assertEquals("test-domain.com", pendientes.get(0).getDominio());
    }

    @Test
    void validar_seguro_addsToWhitelistAndUpdatesDetalle() {
        var pendientes = service.listarPendientes();
        Long pendienteId = pendientes.get(0).getId();

        service.validar(pendienteId, "SEGURO", "Dominio confiable", "admin");

        assertTrue(blancoRepo.existsByDominioAndActivoTrue("test-domain.com"));
        var updated = pendienteRepo.findById(pendienteId).orElseThrow();
        assertEquals("VALIDADO", updated.getEstado());
    }

    @Test
    void validar_noSeguro_addsToBlacklist() {
        var pendientes = service.listarPendientes();
        Long pendienteId = pendientes.get(0).getId();

        service.validar(pendienteId, "NO_SEGURO", "Dominio riesgoso", "admin");

        assertTrue(negroRepo.existsByDominioAndActivoTrue("test-domain.com"));
    }

    @Test
    void agregarBlanco_createsEntry() {
        var entry = service.agregarBlanco("nuevo.com", "Justificacion", "admin");
        assertNotNull(entry.getId());
        assertTrue(blancoRepo.existsByDominioAndActivoTrue("nuevo.com"));
    }

    @Test
    void toggleActivo_switchesState() {
        var entry = service.agregarBlanco("toggle-test.com", "Test", "admin");
        assertTrue(entry.getActivo());

        service.toggleActivo(entry.getId(), true, "admin");
        var updated = blancoRepo.findById(entry.getId()).orElseThrow();
        assertFalse(updated.getActivo());
    }
}
