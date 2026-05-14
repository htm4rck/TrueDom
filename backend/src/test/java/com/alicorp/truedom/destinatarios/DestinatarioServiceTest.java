package com.alicorp.truedom.destinatarios;

import com.alicorp.truedom.destinatarios.entity.PendienteValidacionDestinatario;
import com.alicorp.truedom.destinatarios.repository.*;
import com.alicorp.truedom.destinatarios.service.DestinatarioService;
import com.alicorp.truedom.inconsistencias.repository.InconsistenciaValidacionRepository;
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
class DestinatarioServiceTest {

    @Autowired private DestinatarioService service;
    @Autowired private PendienteValidacionDestinatarioRepository pendienteRepo;
    @Autowired private ValidacionDestinatarioRepository validacionRepo;
    @Autowired private CatalogoDestinatarioBlancoRepository blancoRepo;
    @Autowired private CatalogoDestinatarioNegroRepository negroRepo;
    @Autowired private InconsistenciaValidacionRepository inconsistenciaRepo;
    @Autowired private LoteCargaDlpRepository loteRepo;
    @Autowired private DetalleLoteDlpRepository detalleRepo;

    private Long loteId;
    private Long pendienteId1;
    private Long pendienteId2;

    @BeforeEach
    void setup() {
        var lote = new LoteCargaDlp();
        lote.setPeriodoAnio(2026); lote.setPeriodoMes(5);
        lote.setEstado("PROCESADO"); lote.setUsuarioCarga("test");
        lote = loteRepo.save(lote);
        loteId = lote.getId();

        // Detalle for user1
        var det1 = new DetalleLoteDlp();
        det1.setLoteId(loteId); det1.setRegistroDlpId(1L);
        det1.setDominioExt("gmail.com"); det1.setDestinatarioExt("shared@gmail.com");
        det1.setCorreoUsuarioAlicorp("user1@alicorp.com.pe"); det1.setEstado("DESTINATARIO_PENDIENTE");
        detalleRepo.save(det1);

        // Detalle for user2
        var det2 = new DetalleLoteDlp();
        det2.setLoteId(loteId); det2.setRegistroDlpId(2L);
        det2.setDominioExt("gmail.com"); det2.setDestinatarioExt("shared@gmail.com");
        det2.setCorreoUsuarioAlicorp("user2@alicorp.com.pe"); det2.setEstado("DESTINATARIO_PENDIENTE");
        detalleRepo.save(det2);

        // Pendiente for user1
        var p1 = new PendienteValidacionDestinatario();
        p1.setLoteId(loteId); p1.setDestinatario("shared@gmail.com");
        p1.setDominio("gmail.com"); p1.setCorreoUsuarioAlicorp("user1@alicorp.com.pe");
        p1 = pendienteRepo.save(p1);
        pendienteId1 = p1.getId();

        // Pendiente for user2
        var p2 = new PendienteValidacionDestinatario();
        p2.setLoteId(loteId); p2.setDestinatario("shared@gmail.com");
        p2.setDominio("gmail.com"); p2.setCorreoUsuarioAlicorp("user2@alicorp.com.pe");
        p2 = pendienteRepo.save(p2);
        pendienteId2 = p2.getId();
    }

    @Test
    void listarMisPendientes_filtersbyUser() {
        var result = service.listarMisPendientes("user1@alicorp.com.pe");
        assertEquals(1, result.size());
        assertEquals("shared@gmail.com", result.get(0).getDestinatario());
    }

    @Test
    void validar_seguro_addsToWhitelist() {
        service.validar(pendienteId1, "SEGURO", "Contacto conocido", "user1@alicorp.com.pe");

        assertTrue(blancoRepo.existsByDestinatarioAndCorreoUsuarioAlicorpAndActivoTrue("shared@gmail.com", "user1@alicorp.com.pe"));
        var updated = pendienteRepo.findById(pendienteId1).orElseThrow();
        assertEquals("VALIDADO", updated.getEstado());
    }

    @Test
    void validar_noSeguro_addsToBlacklist() {
        service.validar(pendienteId1, "NO_SEGURO", "No conozco", "user1@alicorp.com.pe");

        assertTrue(negroRepo.existsByDestinatarioAndCorreoUsuarioAlicorpAndActivoTrue("shared@gmail.com", "user1@alicorp.com.pe"));
    }

    @Test
    void validar_detectsInconsistencyWhenConflictingDecisions() {
        // User1 says SEGURO
        service.validar(pendienteId1, "SEGURO", "Lo conozco", "user1@alicorp.com.pe");
        assertEquals(0, inconsistenciaRepo.countByEstado("ABIERTA"));

        // User2 says NO_SEGURO → inconsistency
        service.validar(pendienteId2, "NO_SEGURO", "No lo conozco", "user2@alicorp.com.pe");
        assertEquals(1, inconsistenciaRepo.countByEstado("ABIERTA"));

        var inc = inconsistenciaRepo.findByEstadoOrderByFechaCreacionDesc("ABIERTA");
        assertEquals("shared@gmail.com", inc.get(0).getDestinatario());
    }
}
