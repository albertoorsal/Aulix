package com.aulix.subject_service.config;


import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI subjectServiceOpenApi() {
        return new OpenAPI().info(new Info()
                .title("Subject Service API")
                .description("School subject catalog and teacher/student assignation management")
                .version("v1"));
    }
}
