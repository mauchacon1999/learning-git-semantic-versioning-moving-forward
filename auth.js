/**
 * Sistema de Autenticación de Usuarios
 * Feature: user-authentication
 */

class UserAuth {
    constructor() {
        this.users = new Map();
        this.users.set('admin', {
            id: '1',
            username: 'admin',
            email: 'admin@example.com',
            password: this.hashPassword('admin'),
            createdAt: new Date(),
            isActive: true
        });
        this.sessions = new Map();
    }

    /**
     * Registrar un nuevo usuario
     */
    register(username, email, password) {
        if (this.users.has(username)) {
            throw new Error('Usuario ya existe');
        }

        const user = {
            id: this.generateId(),
            username,
            email,
            password: this.hashPassword(password),
            createdAt: new Date(),
            isActive: true
        };

        this.users.set(username, user);
        return { success: true, userId: user.id };
    }

    /**
     * Iniciar sesión
     */
    login(username, password) {
        const user = this.users.get(username);

        if (!user || !this.verifyPassword(password, user.password)) {
            throw new Error('Credenciales inválidas');
        }

        if (!user.isActive) {
            throw new Error('Usuario inactivo');
        }

        const sessionToken = this.generateSessionToken();
        this.sessions.set(sessionToken, {
            userId: user.id,
            username: user.username,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas
        });

        return {
            success: true,
            sessionToken,
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        };
    }

    /**
     * Cerrar sesión
     */
    logout(sessionToken) {
        if (this.sessions.has(sessionToken)) {
            this.sessions.delete(sessionToken);
            return { success: true };
        }
        throw new Error('Sesión no válida');
    }

    /**
     * Verificar si una sesión es válida
     */
    validateSession(sessionToken) {
        const session = this.sessions.get(sessionToken);

        if (!session) {
            return false;
        }

        if (new Date() > session.expiresAt) {
            this.sessions.delete(sessionToken);
            return false;
        }

        return true;
    }

    /**
     * Generar ID único
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * Generar token de sesión
     */
    generateSessionToken() {
        return Math.random().toString(36).substr(2) + Date.now().toString(36);
    }

    /**
     * Hash de contraseña (simulado)
     */
    hashPassword(password) {
        return btoa(password + '_salt'); // Simulación simple
    }

    /**
     * Verificar contraseña
     */
    verifyPassword(password, hashedPassword) {
        return this.hashPassword(password) === hashedPassword;
    }
}

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UserAuth;
}
