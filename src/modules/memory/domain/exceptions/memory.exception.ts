export class MemoryException extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: Record<string, any>
  ) {
    super(message);
    this.name = 'MemoryException';
  }

  static storageError(message: string, details?: Record<string, any>): MemoryException {
    return new MemoryException(message, 'STORAGE_ERROR', details);
  }

  static embeddingError(message: string, details?: Record<string, any>): MemoryException {
    return new MemoryException(message, 'EMBEDDING_ERROR', details);
  }

  static validationError(message: string, details?: Record<string, any>): MemoryException {
    return new MemoryException(message, 'VALIDATION_ERROR', details);
  }

  static configurationError(message: string, details?: Record<string, any>): MemoryException {
    return new MemoryException(message, 'CONFIGURATION_ERROR', details);
  }

  static capacityError(message: string, details?: Record<string, any>): MemoryException {
    return new MemoryException(message, 'CAPACITY_ERROR', details);
  }

  static concurrencyError(message: string, details?: Record<string, any>): MemoryException {
    return new MemoryException(message, 'CONCURRENCY_ERROR', details);
  }

  static timeoutError(message: string, details?: Record<string, any>): MemoryException {
    return new MemoryException(message, 'TIMEOUT_ERROR', details);
  }

  static notFoundError(message: string, details?: Record<string, any>): MemoryException {
    return new MemoryException(message, 'NOT_FOUND_ERROR', details);
  }

  static integrationError(message: string, details?: Record<string, any>): MemoryException {
    return new MemoryException(message, 'INTEGRATION_ERROR', details);
  }

  static backupError(message: string, details?: Record<string, any>): MemoryException {
    return new MemoryException(message, 'BACKUP_ERROR', details);
  }

  static compressionError(message: string, details?: Record<string, any>): MemoryException {
    return new MemoryException(message, 'COMPRESSION_ERROR', details);
  }

  static encryptionError(message: string, details?: Record<string, any>): MemoryException {
    return new MemoryException(message, 'ENCRYPTION_ERROR', details);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      details: this.details,
      stack: this.stack,
    };
  }

  static isMemoryException(error: any): error is MemoryException {
    return error instanceof MemoryException;
  }

  static fromError(error: Error, code: string = 'UNKNOWN_ERROR'): MemoryException {
    return new MemoryException(
      error.message,
      code,
      { originalError: error.name, stack: error.stack }
    );
  }
}
