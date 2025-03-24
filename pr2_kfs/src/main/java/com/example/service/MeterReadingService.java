package com.example.service;

import com.example.entity.Meter;
import com.example.entity.MeterReading;
import com.example.repository.MeterReadingRepository;
import com.example.repository.MeterRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class MeterReadingService {

    private final InMemoryQueueService queueService;
    private final MeterRepository meterRepository;
    private final MeterReadingRepository meterReadingRepository;
    private final BillService billService;
    private static final Logger logger = LoggerFactory.getLogger(MeterReadingService.class);

    public MeterReadingService(InMemoryQueueService queueService, MeterRepository meterRepository,
                               MeterReadingRepository meterReadingRepository, BillService billService) {
        this.queueService = queueService;
        this.meterRepository = meterRepository;
        this.meterReadingRepository = meterReadingRepository;
        this.billService = billService;
    }

    @Transactional
    @Scheduled(fixedRate = 10000) // Обробка черги кожні 10 секунд
    public void processMeterReadings() {
        while (queueService.hasMessages()) {
            String message = queueService.receiveMessage();
            if (message != null) {
                logger.info("Обробка показників: " + message);
                processReadingData(message);
            }
        }
    }

    private void processReadingData(String message) {
        String[] parts = message.split(",");
        int meterNumber = Integer.parseInt(parts[0]);
        int newDayReading = Integer.parseInt(parts[1]);
        int newNightReading = Integer.parseInt(parts[2]);

        // Отримуємо лічильник за номером (або створюємо новий)
        Meter meter = meterRepository.findByMeterNumber(String.valueOf(meterNumber))
                .orElseGet(() -> {
                    Meter newMeter = new Meter();
                    newMeter.setMeterNumber(String.valueOf(meterNumber));
                    meterRepository.save(newMeter);
                    return newMeter;
                });

        // Отримуємо всі показники для цього лічильника і знаходимо останній запис
        List<MeterReading> readings = meterReadingRepository.findByMeterIdOrderByDateTimeAsc(meter.getId());
        MeterReading lastReading = readings.isEmpty() ? null : readings.get(readings.size() - 1);

        int previousDayReading = 0;
        int previousNightReading = 0;

        if (lastReading != null) {
            previousDayReading = (int) lastReading.getDayReading();
            previousNightReading = (int) lastReading.getNightReading();

            if (newDayReading < previousDayReading) {
                newDayReading = previousDayReading + 100; // Накрутка
            }
            if (newNightReading < previousNightReading) {
                newNightReading = previousNightReading + 80; // Накрутка
            }
        }

        // Створюємо новий запис
        MeterReading newReading = new MeterReading();
        newReading.setMeter(meter);
        newReading.setDayReading(newDayReading);
        newReading.setNightReading(newNightReading);
        newReading.setDateTime(LocalDateTime.now());
        saveMeterReading(newReading);

        // Генеруємо рахунок
        billService.generateBillForMeter(meter.getId());
    }



    public List<MeterReading> getReadingsForMeter(Long meterId) {
        return meterReadingRepository.findByMeterIdOrderByDateTimeAsc(meterId);
    }

    public MeterReading addNewReading(MeterReading reading) {
        return meterReadingRepository.save(reading);
    }

    public boolean saveMeterReading(MeterReading reading) {
        Optional<Meter> existingMeterOpt = meterRepository.findByMeterNumber(reading.getMeter().getMeterNumber());

        Meter meter = existingMeterOpt.orElseGet(() -> {
            Meter newMeter = new Meter();
            newMeter.setMeterNumber(reading.getMeter().getMeterNumber());
            return meterRepository.save(newMeter);
        });

        reading.setMeter(meter);

        List<MeterReading> previousReadings = meterReadingRepository.findByMeterIdOrderByDateTimeAsc(meter.getId());

        if (!previousReadings.isEmpty()) {
            MeterReading lastReading = previousReadings.get(previousReadings.size() - 1);

            if (reading.getDayReading() <= lastReading.getDayReading()
                    || reading.getNightReading() <= lastReading.getNightReading()) {
                return false;
            }
        }

        meterReadingRepository.save(reading);
        logger.info("Збережено показники: " + reading.getDayReading() + "/" + reading.getNightReading());

        return true;
    }


}




