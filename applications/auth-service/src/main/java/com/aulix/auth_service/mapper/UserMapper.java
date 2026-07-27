package com.aulix.auth_service.mapper;

import com.aulix.auth_service.domain.User;
import com.aulix.auth_service.dto.UserResponse;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapper {

    default UserResponse toResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.isEnabled(),
                user.roleNames()
        );
    }
}
