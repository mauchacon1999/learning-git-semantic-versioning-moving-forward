/**
 * Sistema de Autenticación de Usuarios
 * Feature: user-authentication + enhance-auth-info
 */

class UserAuth {
    constructor() {
        this.users = new Map();
        this.sessions = new Map();
        this.roles = new Map();
        this.permissions = new Map();

        // Inicializar roles
        this.initializeRoles();
        this.users = new Map();
        this.sessions = new Map();
        this.roles = new Map();
        this.permissions = new Map();

        // Inicializar usuario admin
        this.users.set('admin', {
            id: '1',
            username: 'admin',
            email: 'admin@example.com',
            password: this.hashPassword('admin'),
            createdAt: new Date(),
            isActive: true,
            role: 'admin',
            lastLogin: null,
            loginAttempts: 0,
            lockedUntil: null
        });

        // Inicializar roles
        this.initializeRoles();
    }

    /**
     * Inicializar roles y permisos
     */
    initializeRoles() {
        // Roles
        this.roles.set('admin', {
            name: 'Administrador',
            description: 'Acceso completo al sistema',
            permissions: ['read', 'write', 'delete', 'admin']
        });

        this.roles.set('user', {
            name: 'Usuario',
            description: 'Usuario estándar',
            permissions: ['read', 'write']
        });

        this.roles.set('guest', {
            name: 'Invitado',
            description: 'Solo lectura',
            permissions: ['read']
        });

        // Permisos
        this.permissions.set('read', 'Lectura de datos');
        this.permissions.set('write', 'Escritura de datos');
        this.permissions.set('delete', 'Eliminación de datos');
        this.permissions.set('admin', 'Administración del sistema');
    }

    /**
     * Registrar un nuevo usuario
     */
    register(username, email, password, role = 'user') {
        if (this.users.has(username)) {
            throw new Error('Usuario ya existe');
        }

        // Validar contraseña
        this.validatePassword(password);

        // Validar email
        this.validateEmail(email);

        const user = {
            id: this.generateId(),
            username,
            email,
            password: this.hashPassword(password),
            createdAt: new Date(),
            isActive: true,
            role,
            lastLogin: null,
            loginAttempts: 0,
            lockedUntil: null
        };

        this.users.set(username, user);
        return { success: true, userId: user.id };
    }

    /**
     * Iniciar sesión con validaciones mejoradas
     */
    login(username, password) {
        const user = this.users.get(username);

        if (!user) {
            throw new Error('Usuario no encontrado');
        }

        // Verificar si la cuenta está bloqueada
        if (user.lockedUntil && new Date() < user.lockedUntil) {
            const remainingTime = Math.ceil((user.lockedUntil - new Date()) / 1000 / 60);
            throw new Error(`Cuenta bloqueada. Intente nuevamente en ${remainingTime} minutos`);
        }

        if (!this.verifyPassword(password, user.password)) {
            // Incrementar intentos fallidos
            user.loginAttempts = (user.loginAttempts || 0) + 1;

            // Bloquear cuenta después de 3 intentos fallidos
            if (user.loginAttempts >= 3) {
                user.lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos
                throw new Error('Demasiados intentos fallidos. Cuenta bloqueada por 15 minutos');
            }

            throw new Error(`Credenciales inválidas. Intentos restantes: ${3 - user.loginAttempts}`);
        }

        if (!user.isActive) {
            throw new Error('Usuario inactivo');
        }

        // Resetear intentos fallidos
        user.loginAttempts = 0;
        user.lockedUntil = null;
        user.lastLogin = new Date();

        const sessionToken = this.generateSessionToken();
        this.sessions.set(sessionToken, {
            userId: user.id,
            username: user.username,
            role: user.role,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas
        });

        return {
            success: true,
            sessionToken,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                lastLogin: user.lastLogin
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
     * Verificar permisos del usuario
     */
    hasPermission(sessionToken, permission) {
        const session = this.sessions.get(sessionToken);

        if (!session || !this.validateSession(sessionToken)) {
            return false;
        }

        const role = this.roles.get(session.role);
        return role && role.permissions.includes(permission);
    }

    /**
     * Obtener información del usuario
     */
    getUserInfo(sessionToken) {
        const session = this.sessions.get(sessionToken);

        if (!session || !this.validateSession(sessionToken)) {
            throw new Error('Sesión no válida');
        }

        const user = this.users.get(session.username);
        if (!user) {
            throw new Error('Usuario no encontrado');
        }

        return {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
            lastLogin: user.lastLogin,
            isActive: user.isActive
        };
    }

    /**
     * Validar contraseña
     */
    validatePassword(password) {
        if (password.length < 8) {
            throw new Error('La contraseña debe tener al menos 8 caracteres');
        }

        if (!/[A-Z]/.test(password)) {
            throw new Error('La contraseña debe contener al menos una mayúscula');
        }

        if (!/[a-z]/.test(password)) {
            throw new Error('La contraseña debe contener al menos una minúscula');
        }

        if (!/\d/.test(password)) {
            throw new Error('La contraseña debe contener al menos un número');
        }
    }

    /**
     * Validar email
     */
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new Error('Email inválido');
        }
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
