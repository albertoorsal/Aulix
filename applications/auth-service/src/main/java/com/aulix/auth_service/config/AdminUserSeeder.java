package com.aulix.auth_service.config;

import com.aulix.auth_service.domain.Role;
import com.aulix.auth_service.domain.User;
import com.aulix.auth_service.repository.RoleRepository;
import com.aulix.auth_service.repository.UserRepository;
import com.aulix.security_starter.annotation.Roles;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.Base64;

/**
 * Ensures a single ADMIN user exists on startup so a fresh environment is never locked out.
 * Runs once and is a no-op on every later restart, since it only acts when no ADMIN exists.
 */
@Component
public class AdminUserSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminUserSeeder.class);

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final String seedEmail;
    private final String seedPassword;

    public AdminUserSeeder(
            UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder,
            @Value("${admin.seed.email:admin@aulix.com}") String seedEmail,
            @Value("${admin.seed.password:}") String seedPassword) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.seedEmail = seedEmail;
        this.seedPassword = seedPassword;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.findByEmailIgnoreCase(seedEmail).isPresent()) {
            return;
        }

        Role adminRole = roleRepository.findByNameIgnoreCase(Roles.ADMIN)
                .orElseThrow(() -> new IllegalStateException(
                        "ADMIN role not found -- run the V3__seed_roles migration before seeding the admin user"));

        String rawPassword = seedPassword.isBlank() ? generateRandomPassword() : seedPassword;

        User admin = new User(seedEmail.toLowerCase(), passwordEncoder.encode(rawPassword), "Admin", "User");
        admin.assignRole(adminRole);
        userRepository.save(admin);

        if (seedPassword.isBlank()) {
            log.warn("Seeded admin user '{}' with generated password: {} -- change it after first login",
                    seedEmail, rawPassword);
        } else {
            log.info("Seeded admin user '{}' from configured admin.seed.password", seedEmail);
        }
    }

    private static String generateRandomPassword() {
        byte[] bytes = new byte[18];
        new SecureRandom().nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}
