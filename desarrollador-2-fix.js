// Desarrollador 2 - Corrección de bug en autenticación
class AuthFix {
    constructor() {
        this.maxLoginAttempts = 5;
        this.lockoutDuration = 15 * 60 * 1000; // 15 minutos en ms
        this.failedAttempts = new Map();
    }

    validateLogin(username, password) {
        // FIX: agregar validación de caracteres especiales en username
        if (!username || username.length < 3 || username.length > 50) {
            throw new Error('Username debe tener entre 3 y 50 caracteres');
        }

        // FIX: validar que username no contenga caracteres peligrosos
        const dangerousChars = /[<>\"'&]/;
        if (dangerousChars.test(username)) {
            throw new Error('Username contiene caracteres no permitidos');
        }

        // FIX: verificar si la cuenta está bloqueada
        if (this.isAccountLocked(username)) {
            throw new Error('Cuenta temporalmente bloqueada por múltiples intentos fallidos');
        }

        // Simular validación de password
        if (password && password.length >= 8) {
            this.resetFailedAttempts(username);
            return true;
        } else {
            this.recordFailedAttempt(username);
            return false;
        }
    }

    isAccountLocked(username) {
        const attempts = this.failedAttempts.get(username);
        if (!attempts) return false;

        const timeSinceLastAttempt = Date.now() - attempts.lastAttempt;
        return attempts.count >= this.maxLoginAttempts && timeSinceLastAttempt < this.lockoutDuration;
    }

    recordFailedAttempt(username) {
        const attempts = this.failedAttempts.get(username) || { count: 0, lastAttempt: 0 };
        attempts.count++;
        attempts.lastAttempt = Date.now();
        this.failedAttempts.set(username, attempts);
    }

    resetFailedAttempts(username) {
        this.failedAttempts.delete(username);
    }
}

module.exports = AuthFix;
