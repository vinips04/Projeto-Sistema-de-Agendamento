package com.saj.controlador.config;

import com.saj.controlador.entities.User;
import com.saj.controlador.repositories.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initData(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            // Criar usuário admin se não existir
            if (userRepository.findByUsername("admin").isEmpty()) {
                User admin = new User();
                admin.setUsername("admin");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setFullName("Administrador");
                userRepository.save(admin);
                System.out.println("Usuário 'admin' criado com senha 'admin123'");
            }

            // Criar segundo advogado se não existir
            if (userRepository.findByUsername("advogado").isEmpty()) {
                User advogado = new User();
                advogado.setUsername("advogado");
                advogado.setPassword(passwordEncoder.encode("advogado123"));
                advogado.setFullName("Advogado Somenzari");
                userRepository.save(advogado);
                System.out.println("Usuário 'advogado' criado com senha 'advogado123'");
            }
        };
    }
}
