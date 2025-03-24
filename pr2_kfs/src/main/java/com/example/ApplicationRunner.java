package com.example;

import com.example.entity.Bill;
import com.example.entity.Meter;
import com.example.service.BillService;
import com.example.service.MeterService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.Scanner;

@Component
public class ApplicationRunner implements CommandLineRunner {

    private final MeterService meterService;
    private final BillService billService;

    public ApplicationRunner(MeterService meterService, BillService billService) {
        this.meterService = meterService;
        this.billService = billService;
    }

    @Override
    public void run(String... args) {
        Scanner scanner = new Scanner(System.in);

        while (true) {
            System.out.println("\nМеню:");
            System.out.println("1. Переглянути історію нарахувань по номеру лічильника");
            System.out.println("2. Вийти");

            System.out.print("Ваш вибір: ");
            int choice = scanner.nextInt();
            scanner.nextLine(); // очищення буфера

            switch (choice) {
                case 1:
                    System.out.print("Введіть номер лічильника: ");
                    int meterNumber = scanner.nextInt();
                    scanner.nextLine();

                    Optional<Meter> optionalMeter = meterService.getMeterByNumber(String.valueOf(meterNumber));
                    if (optionalMeter.isEmpty()) {
                        System.out.println("❌ Лічильник не знайдено.");
                        break;
                    }
                    Meter meter = optionalMeter.get();

                    List<Bill> bills = billService.getBillsForMeter(meter.getId());
                    if (bills.isEmpty()) {
                        System.out.println("ℹ️ Немає рахунків для цього лічильника.");
                    } else {
                        System.out.println("\n🧾 Історія рахунків для лічильника №" + meterNumber + ":");
                        for (Bill bill : bills) {
                            System.out.println("📅 Дата: " + bill.getBillingDate() +
                                    " | 💰 Сума: " + bill.getTotalCost() + " грн");
                        }
                    }
                    break;

                case 2:
                    System.out.println("👋 Завершення програми...");
                    System.exit(0);

                default:
                    System.out.println("Невірний вибір. Спробуйте ще раз.");
            }
        }
    }
}
