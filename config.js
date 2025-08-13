/**
 * Configuración del sistema
 * Hotfix: qa-fix-database-connection
 */

const config = {
    database: {
        host: 'localhost',
        port: 5432,
        name: 'app_db',
        user: 'app_user',
        password: 'secure_password',
        connectionTimeout: 5000,
        retryAttempts: 3
    },
    api: {
        port: 3000,
        cors: true,
        rateLimit: 100
    },
    security: {
        jwtSecret: 'super_secret_key',
        sessionTimeout: 3600
    }
};

module.exports = config;
