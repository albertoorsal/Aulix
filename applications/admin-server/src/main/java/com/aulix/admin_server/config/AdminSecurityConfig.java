package com.aulix.admin_server.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.savedrequest.HttpSessionRequestCache;

/**
 * Spring Boot Admin's UI is a stateful session-based application (unlike the platform's other
 * stateless resource servers), so it authenticates operators with HTTP Basic against a
 * dedicated in-memory account rather than platform JWTs. Change {@code admin.security.password}
 * via the ADMIN_DASHBOARD_PASSWORD env var in any non-local environment.
 */
@Configuration
@EnableWebSecurity
public class AdminSecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        HttpSessionRequestCache requestCache = new HttpSessionRequestCache();
        requestCache.setMatchingRequestParameterName(null);

        http
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/actuator/**").permitAll()
                        .requestMatchers("/assets/**", "/login").permitAll()
                        .anyRequest().authenticated())
                .formLogin(form -> form.loginPage("/login").successHandler(
                        (request, response, authentication) -> response.setStatus(200)))
                .logout(logout -> logout.logoutUrl("/logout"))
                .requestCache(cache -> cache.requestCache(requestCache))
                .csrf(csrf -> csrf
                        .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                        .ignoringRequestMatchers("/instances", "/actuator/**"));
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public UserDetailsService userDetailsService(
            PasswordEncoder encoder,
            @Value("${admin.security.username:admin}") String username,
            @Value("${admin.security.password:ChangeMe123!}") String password) {
        return new InMemoryUserDetailsManager(
                User.withUsername(username).password(encoder.encode(password)).roles("ADMIN").build());
    }
}
