package com.taskmanager.service;

import com.taskmanager.dto.DtoTask;
import com.taskmanager.dto.DtoTaskIU;

import java.util.List;

public interface ITaskService {

    DtoTask saveTask(DtoTaskIU dtoTaskIU);

    List<DtoTask> getAllTasks();

    DtoTask getTaskById(Long id);

    DtoTask updateTask(Long id, DtoTaskIU dtoTaskIU);

    void deleteTask(Long id);

    List<DtoTask> getTasksByUserId(Long userId);
}
