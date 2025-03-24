package com.example.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class MeterReading {

    public MeterReading(Long id, Meter meter, double dayReading, double nightReading, LocalDateTime dateTime) {
        this.id = id;
        this.meter = meter;
        this.dayReading = dayReading;
        this.nightReading = nightReading;
        this.dateTime = dateTime;
    }

    public MeterReading() {
    }

    public void setId(Long id) {
        this.id = id;
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "meter_id", nullable = false)
    private Meter meter;

    @Column(name = "day_value")
    private double dayReading;

    @Column(name = "night_value")
    private double nightReading;
    @Column(name = "date_time")
    private LocalDateTime dateTime;

    // Геттери
    public Meter getMeter() { return meter; }
    public double getDayReading() { return dayReading; }
    public double getNightReading() { return nightReading; }
    public LocalDateTime getDateTime() { return dateTime; }

    // Сеттери
    public void setMeter(Meter meter) { this.meter = meter; }
    public void setDayReading(double dayReading) { this.dayReading = dayReading; }
    public void setNightReading(double nightReading) { this.nightReading = nightReading; }
    public void setDateTime(LocalDateTime dateTime) { this.dateTime = dateTime; }
}
