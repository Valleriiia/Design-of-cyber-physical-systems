package com.example.entity;

import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
public class Tariff {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private double dayRate;
    private double nightRate;

    @Column(nullable = false)
    private LocalDate activeFrom;

    // Геттери
    public double getDayRate() { return dayRate; }
    public double getNightRate() {return nightRate; }
}
