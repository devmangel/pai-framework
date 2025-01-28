export class TaskResult {
  constructor(
    private readonly content: string,
    private readonly success: boolean,
    private readonly error?: string,
    private readonly metadata: Record<string, any> = {},
    private readonly timestamp: Date = new Date(),
  ) {
    this.validate();
  }

  private validate(): void {
    if (typeof this.content !== 'string') {
      throw new Error('Task result content must be a string');
    }
    if (typeof this.success !== 'boolean') {
      throw new Error('Task result success must be a boolean');
    }
    if (this.error && typeof this.error !== 'string') {
      throw new Error('Task result error must be a string if provided');
    }
  }

  public getContent(): string {
    return this.content;
  }

  public isSuccess(): boolean {
    return this.success;
  }

  public getError(): string | undefined {
    return this.error;
  }

  public getMetadata(): Record<string, any> {
    return { ...this.metadata };
  }

  public getTimestamp(): Date {
    return this.timestamp;
  }

  public hasError(): boolean {
    return !this.success && !!this.error;
  }

  public toJSON() {
    return {
      content: this.content,
      success: this.success,
      error: this.error,
      metadata: this.metadata,
      timestamp: this.timestamp,
    };
  }

  public static createSuccess(
    content: string,
    metadata?: Record<string, any>,
  ): TaskResult {
    return new TaskResult(content, true, undefined, metadata);
  }

  public static createError(
    error: string,
    metadata?: Record<string, any>,
  ): TaskResult {
    return new TaskResult('', false, error, metadata);
  }
}
