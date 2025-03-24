package com.example.service;

import com.example.entity.MeterReading;
import com.example.repository.MeterReadingRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Random;

@Service
public class RandomDataGeneratorService {

    private final InMemoryQueueService queueService;
    private final MeterReadingRepository meterReadingRepository;
    private final Random random = new Random();
    private static final Logger logger = LoggerFactory.getLogger(RandomDataGeneratorService.class);

    public RandomDataGeneratorService(InMemoryQueueService queueService, MeterReadingRepository meterReadingRepository) {
        this.queueService = queueService;
        this.meterReadingRepository = meterReadingRepository;
    }

    @Scheduled(fixedRate = 5000) // Кожні 5 секунд
    public void generateRandomMeterReading() {
        Long meterId = (long) (random.nextInt(100) + 1);

        // Отримуємо останній запис лічильника
        List<MeterReading> readings = meterReadingRepository.findByMeterIdOrderByDateTimeAsc(meterId);

        int newDayReading;
        int newNightReading;

        if (readings.isEmpty()) {
            newDayReading = random.nextInt(100) + 1;
            newNightReading = random.nextInt(100) + 1;
        } else {
            MeterReading prevReading = readings.get(readings.size() - 1);
            newDayReading = (int) (prevReading.getDayReading() + random.nextInt(100) + 1);
            newNightReading = (int) (prevReading.getNightReading() + random.nextInt(100) + 1);
        }

        String message = meterId + "," + newDayReading + "," + newNightReading;
        queueService.sendMessage(message);

        logger.info("Згенеровано нові дані: " + message);
    }
}
