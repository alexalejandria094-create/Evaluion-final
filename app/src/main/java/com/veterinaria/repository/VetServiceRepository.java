package com.veterinaria.repository;

import com.veterinaria.model.VetService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VetServiceRepository extends JpaRepository<VetService, Long> {
}
