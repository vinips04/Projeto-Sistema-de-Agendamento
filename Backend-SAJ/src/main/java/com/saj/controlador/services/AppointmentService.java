package com.saj.controlador.services;

import com.saj.controlador.dto.AppointmentDTO;
import com.saj.controlador.entities.Appointment;
import com.saj.controlador.repositories.AppointmentRepository;
import com.saj.controlador.repositories.UserRepository;
import com.saj.controlador.mappers.AppointmentMapper;
import com.saj.controlador.exceptions.ConflictException;
import com.saj.controlador.exceptions.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AppointmentService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AppointmentMapper appointmentMapper;

    public List<AppointmentDTO> getAppointmentsByLawyer(UUID lawyerId) {
        if (!userRepository.existsById(lawyerId)) {
            throw new ResourceNotFoundException("Lawyer not found with id: " + lawyerId);
        }
        return appointmentRepository.findByLawyerId(lawyerId).stream()
                .map(appointmentMapper::toDTO).collect(Collectors.toList());
    }

    public AppointmentDTO getAppointmentById(UUID id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + id));
        return appointmentMapper.toDTO(appointment);
    }

    public AppointmentDTO createAppointment(AppointmentDTO appointmentDTO) {
        validateAppointmentConflict(appointmentDTO.getLawyerId(), appointmentDTO.getDateTime(), appointmentDTO.getDurationMinutes(), null);
        Appointment appointment = appointmentMapper.toEntity(appointmentDTO);
        Appointment savedAppointment = appointmentRepository.save(appointment);
        return appointmentMapper.toDTO(savedAppointment);
    }

    public AppointmentDTO updateAppointment(UUID id, AppointmentDTO appointmentDTO) {
        Appointment existingAppointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + id));

        validateAppointmentConflict(appointmentDTO.getLawyerId(), appointmentDTO.getDateTime(), appointmentDTO.getDurationMinutes(), id);

        appointmentMapper.updateEntityFromDTO(existingAppointment, appointmentDTO);
        
        Appointment updatedAppointment = appointmentRepository.save(existingAppointment);
        return appointmentMapper.toDTO(updatedAppointment);
    }

    public void deleteAppointment(UUID id) {
        if (!appointmentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Appointment not found with id: " + id);
        }
        appointmentRepository.deleteById(id);
    }

    private void validateAppointmentConflict(UUID lawyerId, LocalDateTime start, int durationMinutes, UUID appointmentId) {
        LocalDateTime end = start.plusMinutes(durationMinutes);
        appointmentRepository.findConflictingAppointment(lawyerId, start, end)
                .ifPresent(existing -> {
                    if (appointmentId == null || !existing.getId().equals(appointmentId)) {
                        throw new ConflictException("Appointment conflict for lawyer. Existing appointment at: " + existing.getDateTime());
                    }
                });
    }
}
