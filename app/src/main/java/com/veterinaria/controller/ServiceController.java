package com.veterinaria.controller;

import com.veterinaria.model.VetService;
import com.veterinaria.repository.VetServiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/services")
public class ServiceController {

    @Autowired
    private VetServiceRepository serviceRepository;

    @GetMapping
    public List<VetService> getAllServices() {
        return serviceRepository.findAll();
    }

    @GetMapping("/{id}")
    public VetService getServiceById(@PathVariable Long id) {
        return serviceRepository.findById(id).orElse(null);
    }
    
    // Additional endpoints to populate via API if needed
    @PostMapping
    public VetService createService(@RequestBody VetService service) {
        return serviceRepository.save(service);
    }
}
