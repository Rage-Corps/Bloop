import { ZodError } from 'zod';
// Custom error classes
export class AppError extends Error {
    message;
    statusCode;
    code;
    constructor(message, statusCode = 500, code) {
        super(message);
        this.message = message;
        this.statusCode = statusCode;
        this.code = code;
        this.name = 'AppError';
    }
}
export class ValidationError extends AppError {
    details;
    constructor(message, details) {
        super(message, 400, 'VALIDATION_ERROR');
        this.details = details;
        this.name = 'ValidationError';
    }
}
export class NotFoundError extends AppError {
    constructor(resource = 'Resource') {
        super(`${resource} not found`, 404, 'NOT_FOUND');
        this.name = 'NotFoundError';
    }
}
export class ConflictError extends AppError {
    constructor(message) {
        super(message, 409, 'CONFLICT');
        this.name = 'ConflictError';
    }
}
// Error handler function
export const errorHandler = (error, request, reply) => {
    // Log error
    request.log.error(error);
    // Handle Zod validation errors
    if (error instanceof ZodError) {
        return reply.status(400).send({
            error: 'Validation error',
            code: 'VALIDATION_ERROR',
            details: error,
        });
    }
    // Handle custom app errors
    if (error instanceof AppError) {
        return reply.status(error.statusCode).send({
            error: error.message,
            code: error.code,
        });
    }
    // Handle Fastify validation errors
    if (error.validation) {
        return reply.status(400).send({
            error: 'Request validation failed',
            code: 'VALIDATION_ERROR',
            details: error.validation,
        });
    }
    // Handle other known errors
    if (error.statusCode) {
        return reply.status(error.statusCode).send({
            error: error.message || 'An error occurred',
            code: error.code || 'UNKNOWN_ERROR',
        });
    }
    // Handle unknown errors
    return reply.status(500).send({
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
    });
};
