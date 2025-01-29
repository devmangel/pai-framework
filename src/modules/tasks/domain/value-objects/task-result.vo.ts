export class TaskResult {
  constructor(
    private readonly content: string,
    private readonly metadata: Record<string, any> = {},
    private readonly isSuccess: boolean = true,
    private readonly error?: string
  ) {}

  static createSuccess(content: string, metadata: Record<string, any> = {}): TaskResult {
    return new TaskResult(content, metadata, true);
  }

  static createError(error: string, metadata: Record<string, any> = {}): TaskResult {
    return new TaskResult('', metadata, false, error);
  }

  getContent(): string {
    return this.content;
  }

  getMetadata(): Record<string, any> {
    return { ...this.metadata };
  }

  getError(): string | undefined {
    return this.error;
  }

  wasSuccessful(): boolean {
    return this.isSuccess;
  }

  toJSON(): Record<string, any> {
    return {
      content: this.content,
      metadata: this.metadata,
      isSuccess: this.isSuccess,
      error: this.error,
    };
  }

  static fromJSON(json: Record<string, any>): TaskResult {
    return new TaskResult(
      json.content,
      json.metadata,
      json.isSuccess,
      json.error
    );
  }
}
