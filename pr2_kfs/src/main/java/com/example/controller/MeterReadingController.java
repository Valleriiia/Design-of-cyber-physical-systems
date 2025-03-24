package com.example.controller;

import com.example.entity.MeterReading;
import com.example.service.MeterReadingService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/meter_reading")
public class MeterReadingController {

    private final MeterReadingService meterReadingService;

    public MeterReadingController(MeterReadingService meterReadingService) {
        this.meterReadingService = meterReadingService;
    }

    @GetMapping("/{meterId}")
    public List<MeterReading> getReadingsForMeter(@PathVariable Long meterId) {
        return meterReadingService.getReadingsForMeter(meterId);
    }

    @PostMapping
    public MeterReading addNewReading(@RequestBody MeterReading reading) {
        return meterReadingService.addNewReading(reading);
    }
}
