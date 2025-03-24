package com.example.controller;

import com.example.entity.Tariff;
import com.example.service.TariffService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tariff")
public class TariffController {

    private final TariffService tariffService;

    public TariffController(TariffService tariffService) {
        this.tariffService = tariffService;
    }

    @GetMapping
    public List<Tariff> getAllTariffs() {
        return tariffService.getAllTariffs();
    }

    @PostMapping
    public Tariff addNewTariff(@RequestBody Tariff tariff) {
        return tariffService.addNewTariff(tariff);
    }
}
