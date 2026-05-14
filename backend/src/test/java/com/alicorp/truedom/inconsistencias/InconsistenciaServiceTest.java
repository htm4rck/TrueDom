package com.alicorp.truedom.inconsistencias;

import com.alicorp.truedom.inconsistencias.entity.InconsistenciaValidacion;
import com.alicorp.truedom.inconsistencias.repository.InconsistenciaValidacionRepository;
import com.alicorp.truedom.inconsistencias.service.InconsistenciaService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class InconsistenciaServiceTest {

    @Autowired private InconsistenciaService service;
    @Autowired private InconsistenciaValidacionRepository repo;

    private Long incId;

    @BeforeEach
    void setup() {
        var inc = new InconsistenciaValidacion();
        inc.setDestinatario("conflicto@gmail.com");
        inc.setDominio("gmail.com");
        inc = repo.save(inc);
        incId = inc.getId();
    }

    @Test
    void listarAbiertas_returnsOpenInconsistencies() {
        var result = service.listarAbiertas();
        assertEquals(1, result.size());
        assertEquals("conflicto@gmail.com", result.get(0).getDestinatario());
    }

    @Test
    void resolver_closesInconsistency() {
        service.resolver(incId, "SEGURO", "Verificado con el area", "admin");

        var updated = repo.findById(incId).orElseThrow();
        assertEquals("CERRADA", updated.getEstado());
        assertEquals("SEGURO", updated.getDecisionFinal());
        assertEquals("admin", updated.getResueltoPor());
        assertNotNull(updated.getFechaResolucion());
    }

    @Test
    void resolver_nonExistentThrows() {
        assertThrows(IllegalArgumentException.class, () ->
                service.resolver(9999L, "SEGURO", "test", "admin"));
    }
}
