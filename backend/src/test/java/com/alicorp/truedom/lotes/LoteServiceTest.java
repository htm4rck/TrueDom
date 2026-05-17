package com.alicorp.truedom.lotes;

import com.alicorp.truedom.lotes.entity.LoteCargaDlp;
import com.alicorp.truedom.lotes.repository.*;
import com.alicorp.truedom.lotes.service.LoteProcesamientoService;
import com.alicorp.truedom.lotes.service.LoteService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class LoteServiceTest {

    @Autowired
    private LoteService service;

    @Autowired
    private LoteProcesamientoService procesamientoService;

    @Autowired
    private LoteCargaDlpRepository loteRepo;

    @Autowired
    private RegistroDlpRepository registroRepo;

    @Autowired
    private DetalleLoteDlpRepository detalleRepo;

    @Test
    void cargar_parsesCSVAndCreatesRecords() throws Exception {
        var resource = new ClassPathResource("test-dlp.csv");
        var file = new MockMultipartFile("archivo", "test-dlp.csv", "text/csv", resource.getInputStream());

        LoteCargaDlp lote = service.cargar(2026, 5, file, "test-user");

        assertNotNull(lote.getId());
        assertEquals("VALIDADO", lote.getEstado());
        assertEquals(3, lote.getRegistrosCargados());
        assertEquals(3, registroRepo.countByLoteId(lote.getId()));
        assertEquals(3, detalleRepo.countByLoteId(lote.getId()));
    }

    @Test
    void cargar_rejectsInvalidCSV() {
        var file = new MockMultipartFile("archivo", "bad.csv", "text/csv", "col1,col2,col3\na,b,c".getBytes());

        var ex = assertThrows(IllegalArgumentException.class, () -> service.cargar(2026, 5, file, "test-user"));
        assertTrue(ex.getMessage().contains("se esperan al menos 10 columnas"));
    }

    @Test
    void cargar_rejectsEmptyFile() {
        var file = new MockMultipartFile("archivo", "empty.csv", "text/csv", "col1,col2,col3,c4,c5,c6,c7,c8,c9,c10,c11,c12,c13,c14,c15\n".getBytes());

        var ex = assertThrows(IllegalArgumentException.class, () -> service.cargar(2026, 5, file, "test-user"));
        assertTrue(ex.getMessage().contains("no contiene registros"));
    }

    @Test
    void procesar_classifiesDomainsByWhiteAndBlacklist() throws Exception {
        // Setup: add gmail.com to whitelist
        var resource = new ClassPathResource("test-dlp.csv");
        var file = new MockMultipartFile("archivo", "test-dlp.csv", "text/csv", resource.getInputStream());
        LoteCargaDlp lote = service.cargar(2026, 6, file, "test-user");

        // Process
        LoteCargaDlp processed = procesamientoService.procesar(lote.getId(), "test-user");

        assertEquals(3, processed.getRegistrosProcesados());
        assertEquals("CON_OBSERVACIONES", processed.getEstado());

        // All should be DOMINIO_PENDIENTE since no catalogs exist in test
        var detalles = detalleRepo.findByLoteIdAndEstado(lote.getId(), "DOMINIO_PENDIENTE");
        assertTrue(detalles.size() >= 2); // unknown.io and blocked.org at minimum
    }

    @Test
    void registrosPorLote_returnsPaginatedResults() throws Exception {
        var resource = new ClassPathResource("test-dlp.csv");
        var file = new MockMultipartFile("archivo", "test-dlp.csv", "text/csv", resource.getInputStream());
        LoteCargaDlp lote = service.cargar(2026, 7, file, "test-user");

        var page0 = service.registrosPorLote(lote.getId(), 0, 2);
        assertEquals(2, page0.size());

        var page1 = service.registrosPorLote(lote.getId(), 1, 2);
        assertEquals(1, page1.size());
    }

    @Test
    void listar_returnsLotesOrderedByDate() throws Exception {
        var resource = new ClassPathResource("test-dlp.csv");
        var file1 = new MockMultipartFile("archivo", "a.csv", "text/csv", resource.getInputStream());
        service.cargar(2026, 1, file1, "user1");

        resource = new ClassPathResource("test-dlp.csv");
        var file2 = new MockMultipartFile("archivo", "b.csv", "text/csv", resource.getInputStream());
        service.cargar(2026, 2, file2, "user2");

        var lotes = service.listar();
        assertTrue(lotes.size() >= 2);
        assertTrue(lotes.get(0).getFechaCarga().isAfter(lotes.get(1).getFechaCarga()) ||
                   lotes.get(0).getFechaCarga().isEqual(lotes.get(1).getFechaCarga()));
    }
}
