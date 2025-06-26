package com.hongik.books.user.dto;

import com.hongik.books.user.domain.User;
import lombok.Data;

@Data
public class UserDto {
    private Long id;
    private String username;
    private String email;
    private boolean studentVerified;

    public static UserDto from(User user) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setStudentVerified(user.isStudentVerified()); // ✅ 핵심
        return dto;
    }
}
