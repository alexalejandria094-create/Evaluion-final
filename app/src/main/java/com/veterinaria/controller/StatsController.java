package com.veterinaria.controller;

import com.veterinaria.repository.AppointmentRepository;
import com.veterinaria.repository.PetRepository;
import com.veterinaria.repository.VetServiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/stats")
public class StatsController {

    @Autowired
    private PetRepository petRepository;
    @Autowired
    private VetServiceRepository serviceRepository;
    @Autowired
    private AppointmentRepository appointmentRepository;

    @GetMapping
    public Map<String, Long> getStats() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("totalPets", petRepository.count());
        stats.put("totalServices", serviceRepository.count());
        stats.put("totalAppointments", appointmentRepository.count());
        // Count confirmed appointments in memory 
        long confirmed = appointmentRepository.findAll().stream()
            .filter(a -> "confirmed".equalsIgnoreCase(a.getStatus()))
            .count();
        stats.put("confirmedAppointments", confirmed);
        
        return stats;
    }
}
