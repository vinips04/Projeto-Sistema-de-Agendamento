package com.saj.controlador.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class AppointmentDTO {
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private UUID id;

    @NotNull(message = "Date and time are mandatory")
    @Future(message = "Appointment must be in the future")
    private LocalDateTime dateTime;

    @Min(value = 15, message = "Duration must be at least 15 minutes")
    private int durationMinutes;

    @NotNull(message = "Lawyer ID is mandatory")
    private UUID lawyerId;

    @NotNull(message = "Client ID is mandatory")
    private UUID clientId;
    
    private UUID processId;
    
    private String description;
}
