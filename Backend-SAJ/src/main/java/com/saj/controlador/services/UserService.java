package com.saj.controlador.services;

import com.saj.controlador.dto.UserDTO;
import com.saj.controlador.entities.User;
import com.saj.controlador.repositories.UserRepository;
import com.saj.controlador.repositories.AppointmentRepository;
import com.saj.controlador.mappers.UserMapper;
import com.saj.controlador.exceptions.ResourceNotFoundException;
import com.saj.controlador.exceptions.DataIntegrityException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream().map(userMapper::toDTO).collect(Collectors.toList());
    }

    public UserDTO getUserById(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return userMapper.toDTO(user);
    }

    public UserDTO createUser(UserDTO userDTO) {
        User user = userMapper.toEntity(userDTO);
        user.setPassword(passwordEncoder.encode(userDTO.getPassword()));
        User savedUser = userRepository.save(user);
        return userMapper.toDTO(savedUser);
    }

    public UserDTO updateUser(UUID id, UserDTO userDTO) {
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        existingUser.setUsername(userDTO.getUsername());
        existingUser.setFullName(userDTO.getFullName());

        if (userDTO.getPassword() != null && !userDTO.getPassword().isEmpty()) {
            existingUser.setPassword(passwordEncoder.encode(userDTO.getPassword()));
        }

        User updatedUser = userRepository.save(existingUser);
        return userMapper.toDTO(updatedUser);
    }

    public void deleteUser(UUID id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("Usuário não encontrado com id: " + id);
        }

        // Verificar se existem agendamentos vinculados ao usuário (advogado)
        Long appointmentCount = appointmentRepository.countByLawyerId(id);
        if (appointmentCount > 0) {
            throw new DataIntegrityException(
                "Não é possível excluir este usuário. Existem " + appointmentCount +
                " agendamento(s) vinculado(s) a ele. Por favor, exclua os AGENDAMENTOS primeiro."
            );
        }

        userRepository.deleteById(id);
    }
}
