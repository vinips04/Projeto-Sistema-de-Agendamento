package com.saj.controlador;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class ControladorSajApplication {

    public static void main(String[] args) {
        SpringApplication.run(ControladorSajApplication.class, args);
    }

    @Bean
    public CommandLineRunner commandLineRunner(PasswordEncoder encoder) {
        return args -> {
            System.out.println("--- NOVO HASH GERADO ---");
            System.out.println("BCrypt hash para 'password123': " + encoder.encode("password123"));
            System.out.println("--------------------------");
        };
    }
}
