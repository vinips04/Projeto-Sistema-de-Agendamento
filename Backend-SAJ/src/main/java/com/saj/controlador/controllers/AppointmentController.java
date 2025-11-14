package com.saj.controlador.controllers;

import com.saj.controlador.dto.AppointmentDTO;
import com.saj.controlador.services.AppointmentService;
import com.saj.controlador.util.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    @Autowired
    private AppointmentService appointmentService;

    @GetMapping("/lawyer/{lawyerId}")
    public ResponseEntity<ApiResponse<List<AppointmentDTO>>> getAppointmentsByLawyer(@PathVariable UUID lawyerId) {
        List<AppointmentDTO> appointments = appointmentService.getAppointmentsByLawyer(lawyerId);
        return ResponseEntity.ok(new ApiResponse<>("Appointments for lawyer retrieved successfully", appointments));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AppointmentDTO>> getAppointmentById(@PathVariable UUID id) {
        AppointmentDTO appointment = appointmentService.getAppointmentById(id);
        return ResponseEntity.ok(new ApiResponse<>("Appointment retrieved successfully", appointment));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AppointmentDTO>> createAppointment(@Valid @RequestBody AppointmentDTO appointmentDTO) {
        AppointmentDTO createdAppointment = appointmentService.createAppointment(appointmentDTO);
        return new ResponseEntity<>(new ApiResponse<>("Appointment created successfully", createdAppointment), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AppointmentDTO>> updateAppointment(@PathVariable UUID id, @Valid @RequestBody AppointmentDTO appointmentDTO) {
        AppointmentDTO updatedAppointment = appointmentService.updateAppointment(id, appointmentDTO);
        return ResponseEntity.ok(new ApiResponse<>("Appointment updated successfully", updatedAppointment));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAppointment(@PathVariable UUID id) {
        appointmentService.deleteAppointment(id);
        return ResponseEntity.ok(new ApiResponse<>("Appointment deleted successfully", null));
    }
}
