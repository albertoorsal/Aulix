package com.aulix.subject_service.config;

import org.springframework.cloud.client.loadbalancer.LoadBalancerInterceptor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class RestClientConfig {

    // Built directly (not exposed as a RestClient.Builder bean) so that Eureka's own
    // auto-configuration -- which looks up any RestClient.Builder bean in the context
    // by type to talk to the Eureka server -- doesn't pick up a load-balanced builder
    // and try to resolve "localhost" as a discoverable service during its own startup.
    @Bean
    public RestClient teacherServiceRestClient(
            LoadBalancerInterceptor loadBalancerInterceptor,
            AuthHeaderForwardingInterceptor authHeaderForwardingInterceptor
    ) {
        return RestClient.builder()
                .requestInterceptor(authHeaderForwardingInterceptor)
                .requestInterceptor(loadBalancerInterceptor)
                .baseUrl("http://teacher-service")
                .build();
    }

    @Bean
    public RestClient studentServiceRestClient(
            LoadBalancerInterceptor loadBalancerInterceptor,
            AuthHeaderForwardingInterceptor authHeaderForwardingInterceptor
    ) {
        return RestClient.builder()
                .requestInterceptor(authHeaderForwardingInterceptor)
                .requestInterceptor(loadBalancerInterceptor)
                .baseUrl("http://student-service")
                .build();
    }
}
