package com.saj.controlador.controllers;

import com.saj.controlador.dto.ProcessDTO;
import com.saj.controlador.services.ProcessService;
import com.saj.controlador.util.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/processes")
public class ProcessController {

    @Autowired
    private ProcessService processService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProcessDTO>>> getAllProcesses() {
        List<ProcessDTO> processes = processService.getAllProcesses();
        return ResponseEntity.ok(new ApiResponse<>("Processes retrieved successfully", processes));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProcessDTO>> getProcessById(@PathVariable UUID id) {
        ProcessDTO process = processService.getProcessById(id);
        return ResponseEntity.ok(new ApiResponse<>("Process retrieved successfully", process));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProcessDTO>> createProcess(@Valid @RequestBody ProcessDTO processDTO) {
        ProcessDTO createdProcess = processService.createProcess(processDTO);
        return new ResponseEntity<>(new ApiResponse<>("Process created successfully", createdProcess), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProcessDTO>> updateProcess(@PathVariable UUID id, @Valid @RequestBody ProcessDTO processDTO) {
        ProcessDTO updatedProcess = processService.updateProcess(id, processDTO);
        return ResponseEntity.ok(new ApiResponse<>("Process updated successfully", updatedProcess));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProcess(@PathVariable UUID id) {
        processService.deleteProcess(id);
        return ResponseEntity.ok(new ApiResponse<>("Process deleted successfully", null));
    }
}
