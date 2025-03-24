package com.example.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class Bill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "meter_id", nullable = false)
    private Meter meter;

    private Double totalCost;

    public void setDayUsage(Double dayUsage) {
        this.dayUsage = dayUsage;
    }

    public void setNightUsage(Double nightUsage) {
        this.nightUsage = nightUsage;
    }

    private Double dayUsage;

    private Double nightUsage;
    private LocalDateTime billingDate;

    // Геттери
    public Meter getMeter() { return meter; }
    public double getTotalCost() { return totalCost; }
    public LocalDateTime getBillingDate() { return billingDate; }

    // Сеттери
    public void setMeter(Meter meter) { this.meter = meter; }
    public void setTotalCost(double totalCost) { this.totalCost = totalCost; }
    public void setBillingDate(LocalDateTime billingDate) { this.billingDate = billingDate; }
}
