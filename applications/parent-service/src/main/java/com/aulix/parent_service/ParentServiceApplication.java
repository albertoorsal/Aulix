package com.aulix.parent_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication(
		scanBasePackages = {
				"com.aulix.parent_service", "com.aulix.security_starter", "com.aulix.common_core"
		}
)
@EnableDiscoveryClient
@EnableJpaAuditing
public class ParentServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(ParentServiceApplication.class, args);
	}

}
