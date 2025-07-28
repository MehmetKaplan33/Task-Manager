package com.taskmanager.controller;

import com.taskmanager.dto.DtoTask;
import com.taskmanager.dto.DtoTaskIU;
import com.taskmanager.service.ITaskService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    @Autowired
    private ITaskService taskService;

    @PostMapping("/save")
    public DtoTask saveTask(@RequestBody @Valid DtoTaskIU dtoTaskIU) {
        return taskService.saveTask(dtoTaskIU);
    }

    @GetMapping("/list")
    public List<DtoTask> getAllTasks() {
        return taskService.getAllTasks();
    }

    @GetMapping("/list/{id}")
    public DtoTask getTaskById(@PathVariable Long id) {
        return taskService.getTaskById(id);
    }

    @PutMapping("/update/{id}")
    public DtoTask updateTask(@PathVariable Long id, @RequestBody @Valid DtoTaskIU dtoTaskIU) {
        return taskService.updateTask(id, dtoTaskIU);
    }

    @DeleteMapping("/delete/{id}")
    public void deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
    }

    @GetMapping("/user/{userId}")
    public List<DtoTask> getTasksByUserId(@PathVariable Long userId) {
        return taskService.getTasksByUserId(userId);
    }
}
