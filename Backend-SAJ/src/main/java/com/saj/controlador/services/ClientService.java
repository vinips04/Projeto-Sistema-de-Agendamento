package com.saj.controlador.services;

import com.saj.controlador.dto.ClientDTO;
import com.saj.controlador.entities.Client;
import com.saj.controlador.repositories.ClientRepository;
import com.saj.controlador.repositories.ProcessRepository;
import com.saj.controlador.repositories.AppointmentRepository;
import com.saj.controlador.mappers.ClientMapper;
import com.saj.controlador.exceptions.ResourceNotFoundException;
import com.saj.controlador.exceptions.DataIntegrityException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ClientService {

    @Autowired
    private ClientRepository clientRepository;

    @Autowired
    private ProcessRepository processRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private ClientMapper clientMapper;

    public List<ClientDTO> getAllClients() {
        return clientRepository.findAll().stream().map(clientMapper::toDTO).collect(Collectors.toList());
    }

    public ClientDTO getClientById(UUID id) {
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Client not found with id: " + id));
        return clientMapper.toDTO(client);
    }

    public ClientDTO createClient(ClientDTO clientDTO) {
        Client client = clientMapper.toEntity(clientDTO);
        Client savedClient = clientRepository.save(client);
        return clientMapper.toDTO(savedClient);
    }

    public ClientDTO updateClient(UUID id, ClientDTO clientDTO) {
        Client existingClient = clientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Client not found with id: " + id));

        existingClient.setName(clientDTO.getName());
        existingClient.setCpfCnpj(clientDTO.getCpfCnpj());
        existingClient.setEmail(clientDTO.getEmail());
        existingClient.setPhone(clientDTO.getPhone());

        Client updatedClient = clientRepository.save(existingClient);
        return clientMapper.toDTO(updatedClient);
    }

    public void deleteClient(UUID id) {
        if (!clientRepository.existsById(id)) {
            throw new ResourceNotFoundException("Cliente não encontrado com id: " + id);
        }

        // Verificar se existem processos vinculados ao cliente
        Long processCount = processRepository.countByClientId(id);
        if (processCount > 0) {
            throw new DataIntegrityException(
                "Não é possível excluir este cliente. Existem " + processCount +
                " processo(s) vinculado(s) a ele. Por favor, exclua os PROCESSOS primeiro."
            );
        }

        // Verificar se existem agendamentos vinculados ao cliente
        Long appointmentCount = appointmentRepository.countByClientId(id);
        if (appointmentCount > 0) {
            throw new DataIntegrityException(
                "Não é possível excluir este cliente. Existem " + appointmentCount +
                " agendamento(s) vinculado(s) a ele. Por favor, exclua os AGENDAMENTOS primeiro."
            );
        }

        clientRepository.deleteById(id);
    }
}
