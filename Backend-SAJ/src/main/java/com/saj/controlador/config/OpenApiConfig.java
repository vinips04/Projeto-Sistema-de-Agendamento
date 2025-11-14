package com.saj.controlador.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        // Temporarily simplified to debug the UI
        return new OpenAPI()
                .info(new Info().title("Controlador SAJ API").version("1.0").description("API para o Sistema de Agendamento Jurídico"));
    }
}
