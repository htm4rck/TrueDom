package com.alicorp.truedom.dashboard;

import com.alicorp.truedom.dashboard.service.DashboardService;
import com.alicorp.truedom.shared.ApiResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {
    private final DashboardService service;

    public DashboardController(DashboardService service) {
        this.service = service;
    }

    @GetMapping("/resumen")
    public ApiResponse<Map<String, Object>> summary() {
        return new ApiResponse<>(service.resumen());
    }

    @GetMapping("/kpis")
    public ApiResponse<Map<String, Object>> kpis() {
        return new ApiResponse<>(service.resumen());
    }
}
