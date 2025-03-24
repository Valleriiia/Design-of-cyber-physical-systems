package com.example.service;

import com.example.entity.Tariff;
import com.example.repository.TariffRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class TariffService {

    private final TariffRepository tariffRepository;
    private static final Logger logger = LoggerFactory.getLogger(TariffService.class);

    public TariffService(TariffRepository tariffRepository) {
        this.tariffRepository = tariffRepository;
    }

    public Tariff getCurrentTariff() {
        // Отримуємо всі тарифи
        List<Tariff> tariffs = tariffRepository.findAll();

        if (tariffs.isEmpty()) {
            logger.info("Увага! В базі немає тарифів.");
            return null;
        }

        return tariffs.get(tariffs.size() - 1);
    }

    public List<Tariff> getAllTariffs() {
        return tariffRepository.findAll();
    }

    public Tariff addNewTariff(Tariff tariff) {
        return tariffRepository.save(tariff);
    }
}
