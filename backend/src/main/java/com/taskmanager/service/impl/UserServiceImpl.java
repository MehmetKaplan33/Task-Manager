package com.taskmanager.service.impl;

import com.taskmanager.dto.DtoUser;
import com.taskmanager.dto.DtoUserIU;
import com.taskmanager.dto.DtoUserUpdate;
import com.taskmanager.exception.BaseException;
import com.taskmanager.exception.MessageType;
import com.taskmanager.model.User;
import com.taskmanager.repository.UserRepository;
import com.taskmanager.service.IUserService;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class UserServiceImpl implements IUserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public DtoUser saveUser(DtoUserIU dtoUserIU) {
        // Email kontrolü
        if (userRepository.findByEmail(dtoUserIU.getEmail()).isPresent()) {
            throw new BaseException(MessageType.EMAIL_IN_USE);
        }

        User user = new User();
        BeanUtils.copyProperties(dtoUserIU, user);
        user.setPassword(passwordEncoder.encode(dtoUserIU.getPassword()));

        User savedUser = userRepository.save(user);
        DtoUser dto = new DtoUser();
        BeanUtils.copyProperties(savedUser, dto);
        return dto;
    }

    @Override
    public List<DtoUser> getAllUsers() {
        List<User> userList = userRepository.findAll();
        List<DtoUser> dtoList = new ArrayList<>();

        for (User user : userList) {
            DtoUser dto = new DtoUser();
            BeanUtils.copyProperties(user, dto);
            dtoList.add(dto);
        }

        return dtoList;
    }

    @Override
    public DtoUser getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new BaseException(MessageType.NO_RECORD_EXIST, "Kullanıcı bulunamadı"));

        DtoUser dto = new DtoUser();
        BeanUtils.copyProperties(user, dto);
        return dto;
    }

    @Override
    public DtoUser updateUser(Long id, DtoUserIU dtoUserIU) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new BaseException(MessageType.NO_RECORD_EXIST, "Kullanıcı bulunamadı"));

        // Email değişikliği varsa kontrol et
        if (!user.getEmail().equals(dtoUserIU.getEmail()) &&
                userRepository.findByEmail(dtoUserIU.getEmail()).isPresent()) {
            throw new BaseException(MessageType.EMAIL_IN_USE);
        }

        BeanUtils.copyProperties(dtoUserIU, user);
        User updatedUser = userRepository.save(user);

        DtoUser dto = new DtoUser();
        BeanUtils.copyProperties(updatedUser, dto);
        return dto;
    }

    @Override
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new BaseException(MessageType.NO_RECORD_EXIST, "Kullanıcı bulunamadı");
        }
        userRepository.deleteById(id);
    }

    @Override
    public Optional<User> login(String email, String rawPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BaseException(MessageType.NO_RECORD_EXIST, "E-posta bulunamadı"));

        if (!passwordEncoder.matches(rawPassword, user.getPassword())) {
            throw new BaseException(MessageType.WRONG_PASSWORD);
        }

        return Optional.of(user);
    }

    @Override
    public DtoUser updateProfile(Long id, DtoUserUpdate dtoUserUpdate) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new BaseException(MessageType.NO_RECORD_EXIST, "Kullanıcı bulunamadı"));

        // Email değişikliği varsa ve yeni email başka bir kullanıcı tarafından kullanılıyorsa
        if (!user.getEmail().equals(dtoUserUpdate.getEmail()) &&
                userRepository.findByEmail(dtoUserUpdate.getEmail()).isPresent()) {
            throw new BaseException(MessageType.EMAIL_IN_USE);
        }

        // Şifre değişikliği varsa kontrol et
        if (dtoUserUpdate.getNewPassword() != null && !dtoUserUpdate.getNewPassword().isEmpty()) {
            if (dtoUserUpdate.getCurrentPassword() == null || dtoUserUpdate.getCurrentPassword().isEmpty()) {
                throw new BaseException(MessageType.REQUIRED_FIELD, "Mevcut şifre gerekli");
            }

            // Mevcut şifreyi kontrol et
            if (!passwordEncoder.matches(dtoUserUpdate.getCurrentPassword(), user.getPassword())) {
                throw new BaseException(MessageType.WRONG_PASSWORD);
            }

            // Yeni şifreyi hashle ve kaydet
            user.setPassword(passwordEncoder.encode(dtoUserUpdate.getNewPassword()));
        }

        // Diğer bilgileri güncelle
        user.setFullName(dtoUserUpdate.getFullName());
        user.setEmail(dtoUserUpdate.getEmail());

        User updatedUser = userRepository.save(user);
        DtoUser dtoUser = new DtoUser();
        BeanUtils.copyProperties(updatedUser, dtoUser);
        return dtoUser;
    }
}
