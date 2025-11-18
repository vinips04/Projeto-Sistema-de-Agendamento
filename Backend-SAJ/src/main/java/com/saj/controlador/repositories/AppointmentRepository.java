package com.saj.controlador.repositories;

import com.saj.controlador.entities.Appointment;
import com.saj.controlador.entities.Client; // Importar Client
import com.saj.controlador.entities.Process; // Importar Process
import com.saj.controlador.dto.AppointmentWithDetails; // Importar o DTO
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {

    List<Appointment> findByLawyerId(UUID lawyerId);

    // Adicionado para desvincular agendamentos de um processo
    List<Appointment> findByProcess(Process process);

    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.lawyer.id = :lawyerId")
    Long countByLawyerId(@Param("lawyerId") UUID lawyerId);

    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.client.id = :clientId")
    Long countByClientId(@Param("clientId") UUID clientId);

    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.process.id = :processId")
    Long countByProcessId(@Param("processId") UUID processId);

    @Query(value = "SELECT * FROM appointments a WHERE a.lawyer_id = :lawyerId AND " +
           "((a.date_time BETWEEN :start AND :end) OR " +
           "(a.date_time + (a.duration_minutes * interval '1 minute') BETWEEN :start AND :end) OR " +
           "(:start BETWEEN a.date_time AND (a.date_time + (a.duration_minutes * interval '1 minute'))))",
           nativeQuery = true)
    Optional<Appointment> findConflictingAppointment(
            @Param("lawyerId") UUID lawyerId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.lawyer.id = :lawyerId AND CAST(a.dateTime AS LocalDate) = :today")
    Long countTodayByLawyer(@Param("lawyerId") UUID lawyerId, @Param("today") LocalDate today);

    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.lawyer.id = :lawyerId AND a.dateTime >= :start AND a.dateTime < :end")
    Long countNextWeekByLawyer(@Param("lawyerId") UUID lawyerId, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("""
        SELECT new com.saj.controlador.dto.AppointmentWithDetails(
            a.id,
            a.dateTime,
            a.durationMinutes,
            a.lawyer.id,
            a.client.id,
            a.process.id,
            a.description,
            c.name,
            p.number
        )
        FROM Appointment a
        JOIN a.lawyer u
        INNER JOIN Client c ON a.client.id = c.id
        LEFT JOIN Process p ON a.process.id = p.id
        WHERE u.id = :lawyerId
          AND a.dateTime >= :oneDayAgo
        ORDER BY a.dateTime ASC
    """)
    List<AppointmentWithDetails> findUpcomingWithDetailsByLawyer(
        @Param("lawyerId") UUID lawyerId,
        @Param("oneDayAgo") LocalDateTime oneDayAgo,
        Pageable pageable
    );
}
