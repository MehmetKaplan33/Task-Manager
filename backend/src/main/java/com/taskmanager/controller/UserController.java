package com.taskmanager.controller;

import com.taskmanager.dto.DtoUser;
import com.taskmanager.dto.DtoUserIU;
import com.taskmanager.dto.DtoUserUpdate;
import com.taskmanager.model.User;
import com.taskmanager.service.IUserService;
import jakarta.validation.Valid;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private IUserService userService;

    @PostMapping("/save")
    public DtoUser saveUser(@RequestBody @Valid DtoUserIU dtoUserIU) {
        return userService.saveUser(dtoUserIU);
    }

    @GetMapping("/list")
    public List<DtoUser> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/list/{id}")
    public DtoUser getUserById(@PathVariable Long id) {
        return userService.getUserById(id);
    }

    @PutMapping("/update/{id}")
    public DtoUser updateUser(@PathVariable Long id, @RequestBody @Valid DtoUserIU dtoUserIU) {
        return userService.updateUser(id, dtoUserIU);
    }

    @DeleteMapping("/delete/{id}")
    public void deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginData) {
        String email = loginData.get("email");
        String password = loginData.get("password");

        Optional<User> userOpt = userService.login(email, password);

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Hatalı e-posta veya şifre");
        }

        User user = userOpt.get();
        DtoUser dto = new DtoUser();
        BeanUtils.copyProperties(user, dto);

        return ResponseEntity.ok(dto);
    }

    @PutMapping("/profile/{id}")
    public DtoUser updateProfile(@PathVariable Long id, @RequestBody @Valid DtoUserUpdate dtoUserUpdate) {
        return userService.updateProfile(id, dtoUserUpdate);
    }
}
