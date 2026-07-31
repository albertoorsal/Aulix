package com.aulix.student_service.config;


import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI studentServiceOpenApi() {
        return new OpenAPI().info(new Info()
                .title("Student Service API")
                .description("Student enrollment and academic record management")
                .version("v1"));
    }
}
