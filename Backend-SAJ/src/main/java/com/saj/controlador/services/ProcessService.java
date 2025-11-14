package com.saj.controlador.services;

import com.saj.controlador.dto.ProcessDTO;
import com.saj.controlador.entities.Process;
import com.saj.controlador.repositories.ProcessRepository;
import com.saj.controlador.mappers.ProcessMapper;
import com.saj.controlador.exceptions.ResourceNotFoundException;
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

    public List<ProcessDTO> getAllProcesses() {
        return processRepository.findAll().stream().map(processMapper::toDTO).collect(Collectors.toList());
    }

    public ProcessDTO getProcessById(UUID id) {
        Process process = processRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Process not found with id: " + id));
        return processMapper.toDTO(process);
    }

    public ProcessDTO createProcess(ProcessDTO processDTO) {
        Process process = processMapper.toEntity(processDTO);
        Process savedProcess = processRepository.save(process);
        return processMapper.toDTO(savedProcess);
    }

    public ProcessDTO updateProcess(UUID id, ProcessDTO processDTO) {
        processRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Process not found with id: " + id));
        
        Process processToUpdate = processMapper.toEntity(processDTO);
        processToUpdate.setId(id); // Ensure the ID is the same
        
        Process updatedProcess = processRepository.save(processToUpdate);
        return processMapper.toDTO(updatedProcess);
    }

    public void deleteProcess(UUID id) {
        if (!processRepository.existsById(id)) {
            throw new ResourceNotFoundException("Process not found with id: " + id);
        }
        processRepository.deleteById(id);
    }
}
