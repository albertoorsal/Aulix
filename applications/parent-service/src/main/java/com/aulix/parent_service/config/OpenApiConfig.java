package com.aulix.parent_service.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI parentServiceOpenApi() {
        return new OpenAPI().info(new Info()
                .title("Parent Service API")
                .description("Parents/guardians, their login accounts and their links to students")
                .version("v1"));
    }
}
