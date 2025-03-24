package com.example.entity;

import jakarta.persistence.*;

@Entity
public class Meter {

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String meterNumber;

    // Геттери
    public String getMeterNumber() { return meterNumber; }

    // Сеттери
    public void setMeterNumber(String meterNumber) { this.meterNumber = meterNumber; }
}
