package com.taskmanager.service.impl;

import com.taskmanager.dto.DtoTask;
import com.taskmanager.dto.DtoTaskIU;
import com.taskmanager.exception.BaseException;
import com.taskmanager.exception.MessageType;
import com.taskmanager.model.Task;
import com.taskmanager.model.User;
import com.taskmanager.repository.TaskRepository;
import com.taskmanager.repository.UserRepository;
import com.taskmanager.service.ITaskService;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class TaskServiceImpl implements ITaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    public TaskServiceImpl(TaskRepository taskRepository, UserRepository userRepository) {
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
    }


    @Override
    public DtoTask saveTask(DtoTaskIU dtoTaskIU) {
        Task task = new Task();
        BeanUtils.copyProperties(dtoTaskIU, task);

        User user = userRepository.findById(dtoTaskIU.getUserId())
                .orElseThrow(() -> new BaseException(MessageType.NO_RECORD_EXIST, "Kullanıcı bulunamadı"));
        task.setUser(user);

        Task savedTask = taskRepository.save(task);
        return convertToDto(savedTask);
    }

    @Override
    public List<DtoTask> getAllTasks() {
        List<Task> tasks = taskRepository.findAll();
        List<DtoTask> dtoList = new ArrayList<>();
        for (Task task : tasks) {
            dtoList.add(convertToDto(task));
        }
        return dtoList;
    }

    @Override
    public DtoTask getTaskById(Long id) {
        return convertToDto(taskRepository.findById(id)
                .orElseThrow(() -> new BaseException(MessageType.NO_RECORD_EXIST, "Görev bulunamadı")));
    }

    @Override
    public DtoTask updateTask(Long id, DtoTaskIU dtoTaskIU) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new BaseException(MessageType.NO_RECORD_EXIST, "Görev bulunamadı"));

        // Güncelle
        task.setTitle(dtoTaskIU.getTitle());
        task.setDescription(dtoTaskIU.getDescription());
        task.setStatus(dtoTaskIU.getStatus());
        task.setDueDate(dtoTaskIU.getDueDate());

        if (!task.getUser().getId().equals(dtoTaskIU.getUserId())) {
            User user = userRepository.findById(dtoTaskIU.getUserId())
                    .orElseThrow(() -> new BaseException(MessageType.NO_RECORD_EXIST, "Kullanıcı bulunamadı"));
            task.setUser(user);
        }

        Task updatedTask = taskRepository.save(task);
        return convertToDto(updatedTask);
    }

    @Override
    public void deleteTask(Long id) {
        if (!taskRepository.existsById(id)) {
            throw new BaseException(MessageType.NO_RECORD_EXIST, "Görev bulunamadı");
        }
        taskRepository.deleteById(id);
    }

    @Override
    public List<DtoTask> getTasksByUserId(Long userId) {
        // Önce kullanıcının varlığını kontrol et
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BaseException(MessageType.NO_RECORD_EXIST, "Kullanıcı bulunamadı"));

        // Kullanıcının görevlerini bul
        List<Task> tasks = taskRepository.findByUserId(userId);
        List<DtoTask> dtoList = new ArrayList<>();

        // Task'ları DTO'ya dönüştür
        for (Task task : tasks) {
            dtoList.add(convertToDto(task));
        }

        return dtoList;
    }

    private DtoTask convertToDto(Task task) {
        DtoTask dto = new DtoTask();
        BeanUtils.copyProperties(task, dto);
        dto.setUserId(task.getUser().getId());
        return dto;
    }
}
