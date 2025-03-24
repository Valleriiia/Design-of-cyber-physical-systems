package com.example.service;

import com.example.entity.Meter;
import com.example.repository.MeterRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MeterService {

    private final MeterRepository meterRepository;

    public MeterService(MeterRepository meterRepository) {
        this.meterRepository = meterRepository;
    }

    public List<Meter> getAllMeters() {
        return meterRepository.findAll();
    }

    public Optional<Meter> getMeterByNumber(String meterNumber) {
        return meterRepository.findByMeterNumber(meterNumber);
    }

    public Meter addNewMeter(Meter meter) {
        return meterRepository.save(meter);
    }
}
