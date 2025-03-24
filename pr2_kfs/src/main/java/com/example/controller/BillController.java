package com.example.controller;

import com.example.entity.Bill;
import com.example.service.BillService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bill")
public class BillController {

    private final BillService billService;

    public BillController(BillService billService) {
        this.billService = billService;
    }

    @GetMapping("/{meterId}")
    public List<Bill> getBillsForMeter(@PathVariable Long meterId) {
        return billService.getBillsForMeter(meterId);
    }

    @PostMapping
    public Bill generateBill(@RequestParam Long meterId) {
        return billService.generateBillForMeter(meterId);
    }
}
