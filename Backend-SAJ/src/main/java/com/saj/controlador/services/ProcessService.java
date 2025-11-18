package com.saj.controlador.services;

import com.saj.controlador.dto.ProcessDTO;
import com.saj.controlador.entities.Process;
import com.saj.controlador.repositories.ProcessRepository;
import com.saj.controlador.repositories.AppointmentRepository;
import com.saj.controlador.mappers.ProcessMapper;
import com.saj.controlador.exceptions.ResourceNotFoundException;
import com.saj.controlador.exceptions.DataIntegrityException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ProcessService {

    @Autowired
    private ProcessRepository processRepository;

    @Autowired
    private ProcessMapper processMapper;

    @Autowired
    private AppointmentRepository appointmentRepository; // Injetando AppointmentRepository

    public List<ProcessDTO> getAllProcesses() {
        return processRepository.findAll().stream().map(processMapper::toDTO).collect(Collectors.toList());
    }

    public ProcessDTO getProcessById(UUID id) {
        Process process = processRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Processo não encontrado com id: " + id));
        return processMapper.toDTO(process);
    }

    public ProcessDTO createProcess(ProcessDTO processDTO) {
        Process process = processMapper.toEntity(processDTO);
        Process savedProcess = processRepository.save(process);
        return processMapper.toDTO(savedProcess);
    }

    public ProcessDTO updateProcess(UUID id, ProcessDTO processDTO) {
        processRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Processo não encontrado com id: " + id));

        Process processToUpdate = processMapper.toEntity(processDTO);
        processToUpdate.setId(id); // Ensure the ID is the same

        Process updatedProcess = processRepository.save(processToUpdate);
        return processMapper.toDTO(updatedProcess);
    }

    public void deleteProcess(UUID id) {
        Process process = processRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Processo não encontrado com id: " + id));

        // Verificar se existem agendamentos vinculados ao processo
        Long appointmentCount = appointmentRepository.countByProcessId(id);
        if (appointmentCount > 0) {
            throw new DataIntegrityException(
                "Não é possível excluir este processo. Existem " + appointmentCount +
                " agendamento(s) vinculado(s) a ele. Por favor, exclua os AGENDAMENTOS primeiro."
            );
        }

        // Agora pode deletar o processo
        processRepository.delete(process);
    }
}
