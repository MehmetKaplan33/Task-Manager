package com.taskmanager.service;

import com.taskmanager.dto.DtoUser;
import com.taskmanager.dto.DtoUserIU;
import com.taskmanager.dto.DtoUserUpdate;
import com.taskmanager.model.User;

import java.util.List;
import java.util.Optional;

public interface IUserService {

    DtoUser saveUser(DtoUserIU dtoUserIU);

    List<DtoUser> getAllUsers();

    DtoUser getUserById(Long id);

    DtoUser updateUser(Long id, DtoUserIU dtoUserIU);

    void deleteUser(Long id);

    Optional<User> login(String email, String rawPassword);

    DtoUser updateProfile(Long id, DtoUserUpdate dtoUserUpdate);
}
