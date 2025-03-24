package com.example.controller;

import com.example.entity.Meter;
import com.example.service.MeterService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/meter")
public class MeterController {

    private final MeterService meterService;

    public MeterController(MeterService meterService) {
        this.meterService = meterService;
    }

    @GetMapping
    public List<Meter> getAllMeters() {
        return meterService.getAllMeters();
    }

    @GetMapping("/{meterNumber}")
    public Optional<Meter> getMeterByNumber(@PathVariable String meterNumber) {
        return meterService.getMeterByNumber(meterNumber);
    }

    @PostMapping
    public Meter addNewMeter(@RequestBody Meter meter) {
        return meterService.addNewMeter(meter);
    }
}
