package com.saj.controlador.mappers;

import com.saj.controlador.dto.ClientDTO;
import com.saj.controlador.entities.Client;
import org.springframework.stereotype.Component;

@Component
public class ClientMapper {

    public ClientDTO toDTO(Client client) {
        if (client == null) {
            return null;
        }
        ClientDTO dto = new ClientDTO();
        dto.setId(client.getId());
        dto.setName(client.getName());
        dto.setCpfCnpj(client.getCpfCnpj());
        dto.setEmail(client.getEmail());
        dto.setPhone(client.getPhone());
        return dto;
    }

    public Client toEntity(ClientDTO dto) {
        if (dto == null) {
            return null;
        }
        Client client = new Client();
        client.setId(dto.getId());
        client.setName(dto.getName());
        client.setCpfCnpj(dto.getCpfCnpj());
        client.setEmail(dto.getEmail());
        client.setPhone(dto.getPhone());
        return client;
    }
}
