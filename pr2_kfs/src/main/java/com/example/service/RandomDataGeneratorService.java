package com.example.service;

import com.example.entity.Meter;
import com.example.entity.MeterReading;
import com.example.repository.MeterReadingRepository;
import com.example.repository.MeterRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.Random;

@Service
public class RandomDataGeneratorService {

    private final InMemoryQueueService queueService;
    private final MeterReadingRepository meterReadingRepository;
    private final MeterRepository meterRepository;
    private final Random random = new Random();
    private static final Logger logger = LoggerFactory.getLogger(RandomDataGeneratorService.class);

    public RandomDataGeneratorService(
            InMemoryQueueService queueService,
            MeterReadingRepository meterReadingRepository,
            MeterRepository meterRepository) {
        this.queueService = queueService;
        this.meterReadingRepository = meterReadingRepository;
        this.meterRepository = meterRepository;
    }

    @Scheduled(fixedRate = 5000)
    public void generateRandomMeterReading() {
        int meterNumber = random.nextInt(100) + 1;

        Optional<Meter> optionalMeter = meterRepository.findByMeterNumber(String.valueOf(meterNumber));

        int newDayReading;
        int newNightReading;

        if (optionalMeter.isPresent()) {
            Meter meter = optionalMeter.get();
            List<MeterReading> readings = meterReadingRepository.findByMeterIdOrderByDateTimeAsc(meter.getId());

            if (!readings.isEmpty()) {
                MeterReading lastReading = readings.get(readings.size() - 1);
                newDayReading = (int) (lastReading.getDayReading() + random.nextInt(100) + 1);
                newNightReading = (int) (lastReading.getNightReading() + random.nextInt(100) + 1);
                logger.info("Лічильник {} знайдено. Попередні значення: день={}, ніч={}",
                        meterNumber, lastReading.getDayReading(), lastReading.getNightReading());
            } else {
                newDayReading = random.nextInt(100) + 1;
                newNightReading = random.nextInt(100) + 1;
                logger.info("Лічильник {} знайдено, але без показників. Стартові значення: день={}, ніч={}",
                        meterNumber, newDayReading, newNightReading);
            }
        } else {
            newDayReading = random.nextInt(100) + 1;
            newNightReading = random.nextInt(100) + 1;
            logger.info("Лічильник {} не знайдено. Надсилаємо стартові показники: день={}, ніч={}",
                    meterNumber, newDayReading, newNightReading);
        }

        String message = meterNumber + "," + newDayReading + "," + newNightReading;
        queueService.sendMessage(message);

        logger.info("Надіслано повідомлення: " + message);
    }
}
