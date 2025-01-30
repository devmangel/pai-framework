import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from '../interface/http/tasks.controller';
import { TaskService } from '../domain/ports/task.service';
import { CreateTaskDto } from '../interface/http/dtos/create-task.dto';
import { UpdateTaskDto } from '../interface/http/dtos/update-task.dto';
import { TaskStatus } from '../domain/enums/task-status.enum';
import { TaskPriority } from '../domain/enums/task-priority.enum';
import { TaskResult } from '../domain/value-objects/task-result.vo';

describe('TasksController', () => {
  let controller: TasksController;
  let taskService: TaskService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        {
          provide: 'TaskService',
          useValue: {
            createTask: jest.fn(),
            assignTask: jest.fn(),
            startTask: jest.fn(),
            completeTask: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<TasksController>(TasksController);
    taskService = module.get<TaskService>('TaskService');
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a task', async () => {
    const createTaskDto: CreateTaskDto = {
      title: 'Task 1',
      description: 'Task description',
      priority: TaskPriority.MEDIUM,
      parentId: null,
      dependencies: [],
      metadata: {},
    };

    await controller.createTask(createTaskDto);

    expect(taskService.createTask).toHaveBeenCalledWith(createTaskDto);
  });

  it('should assign a task to an agent', async () => {
    const taskId = 'task-id';
    const agentId = 'agent-id';

    await controller.assignTask(taskId, agentId);

    expect(taskService.assignTask).toHaveBeenCalledWith(taskId, agentId);
  });

  it('should start a task', async () => {
    const taskId = 'task-id';
    const agentId = 'agent-id';

    await controller.startTask(taskId, agentId);

    expect(taskService.startTask).toHaveBeenCalledWith(taskId, agentId);
  });

  it('should complete a task', async () => {
    const taskId = 'task-id';
    const result = { content: 'Task completed', metadata: {} };

    await controller.completeTask(taskId, result);

    const taskResult = TaskResult.createSuccess(result.content, result.metadata);
    expect(taskService.completeTask).toHaveBeenCalledWith(taskId, taskResult);
  });
});
