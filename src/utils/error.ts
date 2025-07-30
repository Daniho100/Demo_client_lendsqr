export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AppError';
  }
}

// export const handleError = (error: unknown): { message: string; statusCode: number } => {
//   if (error instanceof AppError) {
//     return { message: error.message, statusCode: error.statusCode };
//   }
//   return { message: 'Internal server error', statusCode: 500 };
// };



export const handleError = (error: unknown): { message: string; statusCode: number } => {
  // 1. If it's an instance of your custom AppError
  if (error instanceof AppError) {
    return {
      message: error.message,
      statusCode: error.statusCode,
    };
  }

  // 2. If it's a normal JS error (e.g. TypeError, SyntaxError, etc.)
  if (error instanceof Error) {
    const isDev = process.env.NODE_ENV === 'production';

    return {
      message: isDev ? error.message : 'Something went wrong',
      statusCode: 500,
    };
  }

  // 3. If it's an unknown or non-standard error type
  return {
    message: 'Unexpected server error',
    statusCode: 500,
  };
};
