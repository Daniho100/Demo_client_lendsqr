export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AppError';
  }
}

export const handleError = (error: unknown): { message: string; statusCode: number } => {
  if (error instanceof AppError) {
    return {
      message: error.message,
      statusCode: error.statusCode,
    };
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    // ⚠️ Custom pattern-based handling
    if (message.includes('not found')) {
      return { message: error.message, statusCode: 404 };
    }

    if (message.includes('unauthorized') || message.includes('unauthenticated')) {
      return { message: error.message, statusCode: 401 };
    }

    if (message.includes('forbidden')) {
      return { message: error.message, statusCode: 403 };
    }

    if (message.includes('bad request') || message.includes('invalid')) {
      return { message: error.message, statusCode: 400 };
    }

    // 🛑 Default fallback for unclassified Error
    return {
      message: error.message,
      statusCode: 500,
    };
  }

  return {
    message: 'Unexpected server error',
    statusCode: 500,
  };
};
