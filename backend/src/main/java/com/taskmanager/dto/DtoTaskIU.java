package com.taskmanager.dto;

import com.taskmanager.model.TaskStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DtoTaskIU {

    @NotBlank(message = "Başlık boş olamaz")
    private String title;

    private String description;

    @NotNull(message = "Durum boş olamaz")
    private TaskStatus status;

    private LocalDate dueDate;

    @NotNull(message = "Kullanıcı ID zorunludur")
    private Long userId;
}
