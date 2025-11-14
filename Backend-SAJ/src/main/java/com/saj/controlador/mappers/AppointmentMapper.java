package com.saj.controlador.mappers;

import com.saj.controlador.dto.AppointmentDTO;
import com.saj.controlador.entities.Appointment;
import com.saj.controlador.entities.Client;
import com.saj.controlador.entities.Process;
import com.saj.controlador.entities.User;
import com.saj.controlador.repositories.ClientRepository;
import com.saj.controlador.repositories.ProcessRepository;
import com.saj.controlador.repositories.UserRepository;
import com.saj.controlador.exceptions.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class AppointmentMapper {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ClientRepository clientRepository;

    @Autowired
    private ProcessRepository processRepository;

    public AppointmentDTO toDTO(Appointment appointment) {
        if (appointment == null) {
            return null;
        }
        AppointmentDTO dto = new AppointmentDTO();
        dto.setId(appointment.getId());
        dto.setDateTime(appointment.getDateTime());
        dto.setDurationMinutes(appointment.getDurationMinutes());
        dto.setLawyerId(appointment.getLawyer().getId());
        dto.setClientId(appointment.getClient().getId());
        if (appointment.getProcess() != null) {
            dto.setProcessId(appointment.getProcess().getId());
        }
        dto.setDescription(appointment.getDescription());
        return dto;
    }

    public Appointment toEntity(AppointmentDTO dto) {
        if (dto == null) {
            return null;
        }
        Appointment appointment = new Appointment();
        updateEntityFromDTO(appointment, dto);
        return appointment;
    }

    public void updateEntityFromDTO(Appointment appointment, AppointmentDTO dto) {
        User lawyer = userRepository.findById(dto.getLawyerId())
                .orElseThrow(() -> new ResourceNotFoundException("Lawyer not found with id: " + dto.getLawyerId()));
        Client client = clientRepository.findById(dto.getClientId())
                .orElseThrow(() -> new ResourceNotFoundException("Client not found with id: " + dto.getClientId()));
        
        Process process = null;
        if (dto.getProcessId() != null) {
            process = processRepository.findById(dto.getProcessId())
                    .orElseThrow(() -> new ResourceNotFoundException("Process not found with id: " + dto.getProcessId()));
        }

        appointment.setDateTime(dto.getDateTime());
        appointment.setDurationMinutes(dto.getDurationMinutes());
        appointment.setLawyer(lawyer);
        appointment.setClient(client);
        appointment.setProcess(process);
        appointment.setDescription(dto.getDescription());
    }
}
