/**
 * Production-Safe Logger
 * Logs are only shown in development mode
 */

const isDevelopment = __DEV__;

export const logger = {
    log: (...args: any[]) => {
        if (isDevelopment) {
            console.log(...args);
        }
    },

    info: (...args: any[]) => {
        if (isDevelopment) {
            console.info(...args);
        }
    },

    warn: (...args: any[]) => {
        console.warn(...args); // Always show warnings
    },

    error: (...args: any[]) => {
        console.error(...args); // Always show errors
    },

    debug: (...args: any[]) => {
        if (isDevelopment) {
            console.debug(...args);
        }
    },
};
