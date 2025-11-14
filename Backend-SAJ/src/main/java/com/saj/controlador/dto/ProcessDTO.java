package com.saj.controlador.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class ProcessDTO {
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private UUID id;

    @NotBlank(message = "Process number is mandatory")
    private String number;

    @NotNull(message = "Client ID is mandatory")
    private UUID clientId;
    
    private String description;

    @NotBlank(message = "Status is mandatory")
    private String status;
}
