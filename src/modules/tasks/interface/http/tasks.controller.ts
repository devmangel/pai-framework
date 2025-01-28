import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Inject,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { TaskService } from '../../domain/ports/task.service';
import { CreateTaskDto } from './dtos/create-task.dto';
import { UpdateTaskDto } from './dtos/update-task.dto';
import { TaskStatus } from '../../domain/enums/task-status.enum';
import { TaskPriority } from '../../domain/enums/task-priority.enum';
import { TaskResult } from '../../domain/value-objects/task-result.vo';

@Controller('tasks')
export class TasksController {
  constructor(
    @Inject('TaskService')
    private readonly taskService: TaskService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createTask(@Body() dto: CreateTaskDto) {
    return this.taskService.createTask(dto);
  }

  @Get()
  async getTasks(
    @Query('status') status?: TaskStatus,
    @Query('priority') priority?: TaskPriority,
    @Query('agentId') agentId?: string,
    @Query('parentId') parentId?: string,
  ) {
    return this.taskService.getTasks({ status, priority, agentId, parentId });
  }

  @Get(':id')
  async getTaskById(@Param('id') id: string) {
    return this.taskService.getTaskById(id);
  }

  @Put(':id')
  async updateTask(
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.taskService.updateTask(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTask(@Param('id') id: string) {
    await this.taskService.deleteTask(id);
  }

  // Task Lifecycle Management
  @Post(':id/start')
  async startTask(
    @Param('id') id: string,
    @Body('agentId') agentId: string,
  ) {
    // TODO: Get agent from AgentService
    const agent = { getId: () => agentId }; // Temporary mock
    return this.taskService.startTask(id, agent as any);
  }

  @Post(':id/complete')
  async completeTask(
    @Param('id') id: string,
    @Body() result: { content: string; metadata?: Record<string, any> },
  ) {
    const taskResult = TaskResult.createSuccess(result.content, result.metadata);
    return this.taskService.completeTask(id, taskResult);
  }

  @Post(':id/fail')
  async failTask(
    @Param('id') id: string,
    @Body('error') error: string,
  ) {
    return this.taskService.failTask(id, error);
  }

  @Post(':id/cancel')
  async cancelTask(
    @Param('id') id: string,
    @Body('reason') reason: string,
  ) {
    return this.taskService.cancelTask(id, reason);
  }

  @Post(':id/block')
  async blockTask(
    @Param('id') id: string,
    @Body('reason') reason: string,
  ) {
    return this.taskService.blockTask(id, reason);
  }

  @Post(':id/unblock')
  async unblockTask(@Param('id') id: string) {
    return this.taskService.unblockTask(id);
  }

  // Assignment Operations
  @Post(':id/assign')
  async assignTask(
    @Param('id') id: string,
    @Body('agentId') agentId: string,
  ) {
    // TODO: Get agent from AgentService
    const agent = { getId: () => agentId }; // Temporary mock
    return this.taskService.assignTask(id, agent as any);
  }

  @Post(':id/unassign')
  async unassignTask(@Param('id') id: string) {
    return this.taskService.unassignTask(id);
  }

  @Post(':id/reassign')
  async reassignTask(
    @Param('id') id: string,
    @Body('agentId') agentId: string,
  ) {
    // TODO: Get agent from AgentService
    const agent = { getId: () => agentId }; // Temporary mock
    return this.taskService.reassignTask(id, agent as any);
  }

  // Dependency Management
  @Post(':id/dependencies/:dependencyId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async addDependency(
    @Param('id') id: string,
    @Param('dependencyId') dependencyId: string,
  ) {
    await this.taskService.addTaskDependency(id, dependencyId);
  }

  @Delete(':id/dependencies/:dependencyId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeDependency(
    @Param('id') id: string,
    @Param('dependencyId') dependencyId: string,
  ) {
    await this.taskService.removeTaskDependency(id, dependencyId);
  }

  @Get(':id/dependencies')
  async getDependencies(@Param('id') id: string) {
    return this.taskService.getTaskDependencies(id);
  }

  @Get(':id/dependents')
  async getDependents(@Param('id') id: string) {
    return this.taskService.getTaskDependents(id);
  }

  // Batch Operations
  @Post('batch/create')
  async createTasks(@Body() dtos: CreateTaskDto[]) {
    return this.taskService.createTasks(dtos);
  }

  @Put('batch/update')
  async updateTasks(
    @Body() updates: { id: string; dto: UpdateTaskDto }[],
  ) {
    return this.taskService.updateTasks(updates);
  }

  @Delete('batch')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTasks(@Body('ids') ids: string[]) {
    await this.taskService.deleteTasks(ids);
  }

  // Statistics and Analytics
  @Get('stats/overview')
  async getTaskStatistics() {
    return this.taskService.getTaskStatistics();
  }

  @Get('status/:status')
  async getTasksByStatus(@Param('status') status: TaskStatus) {
    return this.taskService.getTasksByStatus(status);
  }

  @Get('priority/:priority')
  async getTasksByPriority(@Param('priority') priority: TaskPriority) {
    return this.taskService.getTasksByPriority(priority);
  }

  @Get('agent/:agentId')
  async getTasksByAgent(@Param('agentId') agentId: string) {
    return this.taskService.getTasksByAgent(agentId);
  }

  @Get('blocked')
  async getBlockedTasks() {
    return this.taskService.getBlockedTasks();
  }

  @Get('overdue')
  async getOverdueTasks() {
    return this.taskService.getOverdueTasks();
  }
}
