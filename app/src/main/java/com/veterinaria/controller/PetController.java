package com.veterinaria.controller;

import com.veterinaria.model.Pet;
import com.veterinaria.repository.PetRepository;
import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pets")
public class PetController {

    @Autowired
    private PetRepository petRepository;

    private final MeterRegistry meterRegistry;

    public PetController(MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;
    }

    @GetMapping
    public List<Pet> getAllPets() {
        return petRepository.findAll();
    }

    @GetMapping("/{id}")
    public Pet getPetById(@PathVariable Long id) {
        return petRepository.findById(id).orElse(null);
    }

    @PostMapping
    public Pet createPet(@RequestBody Pet pet) {
        if (pet.getLastVisit() == null) {
            pet.setLastVisit(java.time.LocalDate.now());
        }
        Pet savedPet = petRepository.save(pet);
        meterRegistry.counter("veterinaria.pets.created").increment();
        return savedPet;
    }

    @RequestMapping(value = "/{id}", method = {RequestMethod.PUT, RequestMethod.PATCH})
    public Pet updatePet(@PathVariable Long id, @RequestBody Pet petDetails) {
        Pet pet = petRepository.findById(id).orElse(null);
        if (pet != null) {
            if (petDetails.getName() != null) pet.setName(petDetails.getName());
            if (petDetails.getSpecies() != null) pet.setSpecies(petDetails.getSpecies());
            if (petDetails.getBreed() != null) pet.setBreed(petDetails.getBreed());
            if (petDetails.getAge() != null) pet.setAge(petDetails.getAge());
            if (petDetails.getOwner() != null) pet.setOwner(petDetails.getOwner());
            if (petDetails.getPhone() != null) pet.setPhone(petDetails.getPhone());
            return petRepository.save(pet);
        }
        return null;
    }

    @DeleteMapping("/{id}")
    public void deletePet(@PathVariable Long id) {
        petRepository.deleteById(id);
    }

    @GetMapping("/species/{species}")
    public List<Pet> getPetsBySpecies(@PathVariable String species) {
        return petRepository.findBySpeciesIgnoreCase(species);
    }
}
