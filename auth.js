/**
 * Sistema de Autenticación de Usuarios
 * 
 * Features:
 * - feature/user-authentication
 * - feature/enhance-auth-info
 * Hotfix: qa-fix-auth-validation
 */
class UserAuth {
    constructor() {
        this.users = new Map();
        this.sessions = new Map();
        this.roles = new Map();
        this.permissions = new Map();

        // Inicializar usuario admin por defecto
        this.initializeDefaultAdmin();

        // Inicializar roles y permisos
        this.initializeRolesAndPermissions();
    }

    initializeDefaultAdmin() {
        const adminUser = {
            id: 'admin-001',
            username: 'admin',
            email: 'admin@example.com',
            password: 'admin123', // En producción usar hash
            role: 'admin',
            isActive: true,
            createdAt: new Date(),
            lastLogin: null
        };

        this.users.set(adminUser.id, adminUser);
        console.log('👤 Usuario admin inicializado');
    }

    initializeRolesAndPermissions() {
        // Roles
        this.roles.set('admin', {
            name: 'Administrador',
            description: 'Acceso completo al sistema',
            level: 100
        });

        this.roles.set('user', {
            name: 'Usuario',
            description: 'Usuario estándar',
            level: 10
        });

        this.roles.set('guest', {
            name: 'Invitado',
            description: 'Acceso limitado',
            level: 1
        });

        // Permisos
        this.permissions.set('read', { name: 'Lectura', description: 'Permiso de lectura' });
        this.permissions.set('write', { name: 'Escritura', description: 'Permiso de escritura' });
        this.permissions.set('delete', { name: 'Eliminación', description: 'Permiso de eliminación' });
        this.permissions.set('admin', { name: 'Administración', description: 'Permiso de administración' });
    }

    register(username, email, password, role = 'user') {
        // Validaciones mejoradas para QA
        if (!this.validateUsername(username)) {
            throw new Error('Nombre de usuario inválido. Debe tener entre 3 y 20 caracteres alfanuméricos.');
        }

        if (!this.validateEmail(email)) {
            throw new Error('Email inválido. Formato incorrecto.');
        }

        if (!this.validatePassword(password)) {
            throw new Error('Contraseña inválida. Debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas y números.');
        }

        if (this.users.has(username)) {
            throw new Error('El nombre de usuario ya existe');
        }

        if (this.getUserByEmail(email)) {
            throw new Error('El email ya está registrado');
        }

        const user = {
            id: this.generateUserId(),
            username,
            email,
            password, // En producción usar hash
            role,
            isActive: true,
            createdAt: new Date(),
            lastLogin: null
        };

        this.users.set(user.id, user);
        console.log(`✅ Usuario registrado: ${username}`);
        return user;
    }

    login(username, password) {
        const user = this.getUserByUsername(username);

        if (!user) {
            throw new Error('Usuario no encontrado');
        }

        if (!user.isActive) {
            throw new Error('Usuario inactivo');
        }

        if (user.password !== password) {
            throw new Error('Contraseña incorrecta');
        }

        const sessionId = this.generateSessionId();
        const session = {
            userId: user.id,
            username: user.username,
            role: user.role,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas
        };

        this.sessions.set(sessionId, session);

        // Actualizar último login
        user.lastLogin = new Date();
        this.users.set(user.id, user);

        console.log(`🔐 Usuario logueado: ${username}`);
        return { sessionId, user };
    }

    logout(sessionId) {
        if (this.sessions.has(sessionId)) {
            this.sessions.delete(sessionId);
            console.log('🚪 Usuario deslogueado');
            return true;
        }
        return false;
    }

    validateSession(sessionId) {
        const session = this.sessions.get(sessionId);

        if (!session) {
            return null;
        }

        if (new Date() > session.expiresAt) {
            this.sessions.delete(sessionId);
            return null;
        }

        return session;
    }

    getUserByUsername(username) {
        return Array.from(this.users.values()).find(user => user.username === username);
    }

    getUserByEmail(email) {
        return Array.from(this.users.values()).find(user => user.email === email);
    }

    generateUserId() {
        return `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    generateSessionId() {
        return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    // Validaciones mejoradas para QA
    validateUsername(username) {
        if (!username || typeof username !== 'string') {
            return false;
        }

        // Debe tener entre 3 y 20 caracteres alfanuméricos
        const usernameRegex = /^[a-zA-Z0-9]{3,20}$/;
        return usernameRegex.test(username);
    }

    validateEmail(email) {
        if (!email || typeof email !== 'string') {
            return false;
        }

        // Validación de email mejorada
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    validatePassword(password) {
        if (!password || typeof password !== 'string') {
            return false;
        }

        // Debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas y números
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
        return passwordRegex.test(password);
    }

    // Métodos adicionales para gestión de usuarios
    getAllUsers() {
        return Array.from(this.users.values()).map(user => ({
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
            createdAt: user.createdAt,
            lastLogin: user.lastLogin
        }));
    }

    updateUser(userId, updates) {
        const user = this.users.get(userId);
        if (!user) {
            throw new Error('Usuario no encontrado');
        }

        // Validar campos que se van a actualizar
        if (updates.username && !this.validateUsername(updates.username)) {
            throw new Error('Nombre de usuario inválido');
        }

        if (updates.email && !this.validateEmail(updates.email)) {
            throw new Error('Email inválido');
        }

        Object.assign(user, updates);
        this.users.set(userId, user);
        console.log(`✅ Usuario actualizado: ${user.username}`);
        return user;
    }

    deactivateUser(userId) {
        const user = this.users.get(userId);
        if (!user) {
            throw new Error('Usuario no encontrado');
        }

        user.isActive = false;
        this.users.set(userId, user);
        console.log(`❌ Usuario desactivado: ${user.username}`);
        return user;
    }

    getActiveSessions() {
        return Array.from(this.sessions.values()).filter(session =>
            new Date() <= session.expiresAt
        );
    }

    getStats() {
        const allUsers = Array.from(this.users.values());
        const activeSessions = this.getActiveSessions();

        return {
            totalUsers: allUsers.length,
            activeUsers: allUsers.filter(user => user.isActive).length,
            activeSessions: activeSessions.length,
            roles: Array.from(this.roles.keys()),
            permissions: Array.from(this.permissions.keys())
        };
    }
}

// Exportar la clase
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UserAuth;
}
