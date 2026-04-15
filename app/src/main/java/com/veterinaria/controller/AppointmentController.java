package com.veterinaria.controller;

import com.veterinaria.model.Appointment;
import com.veterinaria.repository.AppointmentRepository;
import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    @Autowired
    private AppointmentRepository appointmentRepository;

    private final MeterRegistry meterRegistry;

    public AppointmentController(MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;
    }

    @GetMapping
    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    @PostMapping
    public Appointment createAppointment(@RequestBody Appointment appointment) {
        if(appointment.getStatus() == null) appointment.setStatus("pending");
        Appointment savedAppointment = appointmentRepository.save(appointment);
        meterRegistry.counter("veterinaria.appointments.created").increment();
        return savedAppointment;
    }

    @DeleteMapping("/{id}")
    public void deleteAppointment(@PathVariable Long id) {
        appointmentRepository.deleteById(id);
    }

    @PatchMapping("/{id}")
    public Appointment updateStatus(@PathVariable Long id, @RequestBody Appointment appointmentDetails) {
        Appointment appointment = appointmentRepository.findById(id).orElse(null);
        if (appointment != null && appointmentDetails.getStatus() != null) {
            appointment.setStatus(appointmentDetails.getStatus());
            return appointmentRepository.save(appointment);
        }
        return null;
    }

    @GetMapping("/date/{date}")
    public List<Appointment> getAppointmentsByDate(@PathVariable String date) {
        return appointmentRepository.findByDate(LocalDate.parse(date));
    }
}
