package com.aulix.auth_service.service.impl;

import com.aulix.auth_service.domain.Role;
import com.aulix.auth_service.domain.User;
import com.aulix.auth_service.dto.*;
import com.aulix.auth_service.exception.AccountDisabledException;
import com.aulix.auth_service.exception.InvalidCredentialsException;
import com.aulix.auth_service.mapper.UserMapper;
import com.aulix.auth_service.repository.RoleRepository;
import com.aulix.auth_service.repository.UserRepository;
import com.aulix.auth_service.security.JwtTokenService;
import com.aulix.auth_service.security.JwtValidationException;
import com.aulix.auth_service.service.AuthService;
import com.aulix.common_core.exception.ResourceAlreadyExistsException;
import com.aulix.common_core.exception.ResourceNotFoundException;
import com.nimbusds.jwt.JWTClaimsSet;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.ParseException;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenService jwtTokenService;
    private final UserMapper userMapper;

    public AuthServiceImpl(
            UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder,
            JwtTokenService jwtTokenService,
            UserMapper userMapper) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenService = jwtTokenService;
        this.userMapper = userMapper;
    }


    @Override
    public UserResponse register(RegisterUserRequest request) {
        if(userRepository.existsByEmailIgnoreCase(request.email())) {
            throw new ResourceAlreadyExistsException(
                    "A user with email '%s' already exists".formatted(request.email())
            );
        }

        User user = new User(
                request.email().toLowerCase(),
                passwordEncoder.encode(request.password()),
                request.firstName(),
                request.lastName());

        Set<Role> roles = resolveRoles(request.roles());
        roles.forEach(user::assignRole);

        User saved = userRepository.save(user);

        return userMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public TokenResponse login(LoginRequest request) {
        User user = userRepository.findByEmailIgnoreCase(request.email())
                .orElseThrow(InvalidCredentialsException::new);

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new InvalidCredentialsException();
        }
        if (!user.isEnabled() || user.isAccountLocked()) {
            throw new AccountDisabledException();
        }

        return issueTokens(user);
    }

    @Override
    @Transactional(readOnly = true)
    public TokenResponse refresh(RefreshTokenRequest request) {
        String userId = jwtTokenService.verifyRefreshTokenAndGetSubject(request.refreshToken());
        User user = userRepository.findById(UUID.fromString(userId))
                .orElseThrow(() -> ResourceNotFoundException.of("User", userId));

        if (!user.isEnabled() || user.isAccountLocked()) {
            throw new AccountDisabledException();
        }

        return issueTokens(user);
    }


    @Override
    public VerifyResponse verify(String accessToken) {
        JWTClaimsSet claims = jwtTokenService.verifyAccessToken(accessToken);
        try {
            return new VerifyResponse(
                    UUID.fromString(claims.getSubject()),
                    claims.getStringClaim("preferred_username"),
                    Set.copyOf(claims.getStringListClaim("roles")),
                    Set.copyOf(claims.getStringListClaim("permissions")),
                    claims.getExpirationTime().toInstant());
        } catch (ParseException e) {
            throw new JwtValidationException("Malformed access token claims");
        }
    }

    private TokenResponse issueTokens(User user) {
        String accessToken = jwtTokenService.generateAccessToken(user);
        String refreshToken = jwtTokenService.generateRefreshToken(user);
        return TokenResponse.bearer(accessToken, refreshToken, jwtTokenService.accessTokenTtlSeconds());
    }

    private Set<Role> resolveRoles(Set<String> roleNames) {
        return roleNames.stream()
                .map(name -> roleRepository.findByNameIgnoreCase(name)
                        .orElseThrow(() -> ResourceNotFoundException.of("Role", name)))
                .collect(java.util.stream.Collectors.toSet());
    }
}