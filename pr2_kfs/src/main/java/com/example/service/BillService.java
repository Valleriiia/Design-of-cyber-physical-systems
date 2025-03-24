package com.example.service;


import com.example.entity.Bill;
import com.example.entity.Meter;
import com.example.entity.MeterReading;
import com.example.entity.Tariff;
import com.example.repository.BillRepository;
import com.example.repository.MeterReadingRepository;
import com.example.repository.MeterRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class BillService {

    private final BillRepository billRepository;
    private final MeterReadingRepository meterReadingRepository;
    private final TariffService tariffService;
    private final MeterRepository meterRepository;
    private static final Logger logger = LoggerFactory.getLogger(BillService.class);

    public BillService(BillRepository billRepository, MeterReadingRepository meterReadingRepository,
                       TariffService tariffService, MeterRepository meterRepository) {
        this.billRepository = billRepository;
        this.meterReadingRepository = meterReadingRepository;
        this.tariffService = tariffService;
        this.meterRepository = meterRepository;
    }

    @Transactional
    public Bill generateBillForMeter(Long meterId) {
        double prevDay;
        double prevNight;
        // Отримуємо всі показники для лічильника
        List<MeterReading> readings = meterReadingRepository.findByMeterIdOrderByDateTimeAsc(meterId);
        if (readings.size() < 2) {
            prevDay = 0;
            prevNight = 0;
            logger.info("Новий лічильник створено успішно");
        } else {
            MeterReading prevReading = readings.get(readings.size() - 2);
            prevDay = prevReading.getDayReading();
            prevNight = prevReading.getNightReading();
        }

        // Отримуємо два останні показники
        MeterReading lastReading = readings.get(readings.size() - 1);

        // Отримуємо тарифи
        Tariff tariff = tariffService.getCurrentTariff();
        if (tariff == null) {
            logger.info("Тарифи не знайдені! Неможливо розрахувати рахунок.");
            return null;
        }

        // Обраховуємо витрачену енергію
        double dayUsage = (lastReading.getDayReading() - prevDay);
        double nightUsage = (lastReading.getNightReading() - prevNight);

        // Розрахунок вартості
        double totalCost = (dayUsage * tariff.getDayRate()) + (nightUsage * tariff.getNightRate());

        // Отримуємо лічильник
        Optional<Meter> meterOpt = meterRepository.findById(meterId);
        if (meterOpt.isEmpty()) {
            logger.info("Лічильник не знайдено!");
            return null;
        }

        Meter meter = meterOpt.get();

        // Створюємо та зберігаємо рахунок
        Bill bill = new Bill();
        bill.setMeter(meter);
        bill.setTotalCost(totalCost);
        bill.setBillingDate(LocalDateTime.now());
        bill.setDayUsage(dayUsage);
        bill.setNightUsage(nightUsage);
        billRepository.save(bill);

        logger.info("Рахунок для лічильника " + meter.getMeterNumber() + " успішно створений: " + totalCost + " грн");
        return bill;
    }


    public List<Bill> getBillsForMeter(Long meterId) {
        return billRepository.findByMeterId(meterId);
    }

}
