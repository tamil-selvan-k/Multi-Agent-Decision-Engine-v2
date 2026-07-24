export class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean;
    public readonly success: boolean;
    public readonly errors: unknown[];

    constructor(
        message: string,
        statusCode: number,
        errors: unknown[] = [],
        stack: string = ""
    ) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        this.success = false;
        this.errors = errors;

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}
