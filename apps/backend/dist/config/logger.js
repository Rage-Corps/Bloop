import { env, isDevelopment } from './env.js';
export const loggerConfig = {
    level: env.LOG_LEVEL,
    transport: isDevelopment
        ? {
            target: 'pino-pretty',
            options: {
                colorize: true,
                translateTime: 'HH:MM:ss',
                ignore: 'pid,hostname',
            },
        }
        : undefined,
};
