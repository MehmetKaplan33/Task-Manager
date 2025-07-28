package com.taskmanager.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DtoUserUpdate {
    @NotBlank(message = "İsim alanı boş bırakılamaz")
    private String fullName;

    @NotBlank(message = "Email boş olamaz")
    @Email(message = "Geçerli bir email adresi giriniz")
    private String email;

    private String currentPassword;

    @Size(min = 6, message = "Yeni şifre en az 6 karakter olmalıdır")
    private String newPassword;
}
