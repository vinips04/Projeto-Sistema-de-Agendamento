package com.saj.controlador.repositories;

import com.saj.controlador.entities.Process;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ProcessRepository extends JpaRepository<Process, UUID> {
    @Query("SELECT COUNT(p) FROM Process p WHERE p.status = :status")
    Long countByStatus(@Param("status") String status);

    @Query("SELECT COUNT(p) FROM Process p WHERE p.client.id = :clientId")
    Long countByClientId(@Param("clientId") UUID clientId);
}
