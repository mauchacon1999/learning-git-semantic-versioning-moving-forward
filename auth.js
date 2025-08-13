/**
 * Sistema de Autenticación de Usuarios
 * 
 * Features:
 * - feature/user-authentication
 * - feature/enhance-auth-info
 * Hotfixes:
 * - qa-fix-auth-validation
 * - qa-fix-security-validation
 * - qa-fix-auth-stats
 *  ,mmsms
 * msmsmsmsms
 * Mauricio.
 */
class UserAuth {
    constructor() {
        this.users = new Map();
        this.sessions = new Map();
        this.roles = new Map();
        this.permissions = new Map();
        this.securityLog = new Map();
        this.failedAttempts = new Map();

        // Inicializar usuario admin por defecto
        this.initializeDefaultAdmin();

        // Inicializar roles y permisos
        this.initializeRolesAndPermissions();

        // Inicializar configuraciones de seguridad
        this.initializeSecurityConfig();
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
            lastLogin: null,
            securityLevel: 'high'
        };

        this.users.set(adminUser.id, adminUser);
        console.log('👤 Usuario admin inicializado');
    }

    initializeRolesAndPermissions() {
        // Roles
        this.roles.set('admin', {
            name: 'Administrador',
            description: 'Acceso completo al sistema',
            level: 100,
            securityLevel: 'high'
        });

        this.roles.set('user', {
            name: 'Usuario',
            description: 'Usuario estándar',
            level: 10,
            securityLevel: 'medium'
        });

        this.roles.set('guest', {
            name: 'Invitado',
            description: 'Acceso limitado',
            level: 1,
            securityLevel: 'low'
        });

        // Permisos
        this.permissions.set('read', { name: 'Lectura', description: 'Permiso de lectura' });
        this.permissions.set('write', { name: 'Escritura', description: 'Permiso de escritura' });
        this.permissions.set('delete', { name: 'Eliminación', description: 'Permiso de eliminación' });
        this.permissions.set('admin', { name: 'Administración', description: 'Permiso de administración' });
        this.permissions.set('security', { name: 'Seguridad', description: 'Permiso de seguridad' });
    }

    initializeSecurityConfig() {
        this.securityConfig = {
            maxFailedAttempts: 5,
            lockoutDuration: 15 * 60 * 1000, // 15 minutos
            sessionTimeout: 24 * 60 * 60 * 1000, // 24 horas
            requireMFA: false,
            passwordHistory: 3,
            minPasswordLength: 8,
            requireSpecialChars: true,
            requireNumbers: true,
            requireUppercase: true,
            requireLowercase: true,
            // Nuevas configuraciones de seguridad
            maxSessionsPerUser: 3,
            requireStrongPassword: true,
            passwordExpiryDays: 90,
            enableAuditLog: true,
            blockCommonPasswords: true,
            rateLimitAttempts: 10,
            rateLimitWindow: 5 * 60 * 1000 // 5 minutos
        };

        // Lista de contraseñas comunes bloqueadas
        this.blockedPasswords = new Set([
            'password', '123456', '123456789', 'qwerty', 'abc123',
            'password123', 'admin', 'letmein', 'welcome', 'monkey',
            'dragon', 'master', 'football', 'superman', 'trustno1'
        ]);
    }

    register(username, email, password, role = 'user') {
        // Validaciones de seguridad mejoradas
        if (!this.validateUsername(username)) {
            throw new Error('Nombre de usuario inválido. Debe tener entre 3 y 20 caracteres alfanuméricos.');
        }

        if (!this.validateEmail(email)) {
            throw new Error('Email inválido. Formato incorrecto.');
        }

        if (!this.validatePassword(password)) {
            throw new Error('Contraseña inválida. Debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas, números y caracteres especiales.');
        }

        if (this.users.has(username)) {
            throw new Error('El nombre de usuario ya existe');
        }

        if (this.getUserByEmail(email)) {
            throw new Error('El email ya está registrado');
        }

        // Verificar si la cuenta está bloqueada
        if (this.isAccountLocked(username)) {
            throw new Error('Cuenta temporalmente bloqueada por múltiples intentos fallidos');
        }

        const user = {
            id: this.generateUserId(),
            username,
            email,
            password, // En producción usar hash
            role,
            isActive: true,
            createdAt: new Date(),
            lastLogin: null,
            securityLevel: this.roles.get(role)?.securityLevel || 'medium',
            failedAttempts: 0,
            lastFailedAttempt: null,
            passwordHistory: []
        };

        this.users.set(user.id, user);
        this.logSecurityEvent('user_registered', { username, email, role });
        console.log(`✅ Usuario registrado: ${username}`);
        return user;
    }

    login(username, password) {
        // Limpiar sesiones expiradas antes del login
        this.cleanupExpiredSessions();

        // Verificar si la cuenta está bloqueada
        if (this.isAccountLocked(username)) {
            this.logSecurityEvent('login_blocked', { username, reason: 'account_locked' });
            throw new Error('Cuenta temporalmente bloqueada por múltiples intentos fallidos');
        }

        const user = this.getUserByUsername(username);

        if (!user) {
            this.recordFailedAttempt(username);
            this.logSecurityEvent('login_failed', { username, reason: 'user_not_found' });
            throw new Error('Usuario no encontrado');
        }

        if (!user.isActive) {
            this.logSecurityEvent('login_failed', { username, reason: 'account_inactive' });
            throw new Error('Usuario inactivo');
        }

        if (user.password !== password) {
            this.recordFailedAttempt(username);
            this.logSecurityEvent('login_failed', { username, reason: 'invalid_password' });
            throw new Error('Contraseña incorrecta');
        }

        // Verificar límite de sesiones
        if (this.checkSessionLimit(user.id)) {
            this.logSecurityEvent('login_blocked', { username, reason: 'session_limit_reached' });
            throw new Error('Límite de sesiones alcanzado. Cierre sesiones en otros dispositivos.');
        }

        // Resetear intentos fallidos
        user.failedAttempts = 0;
        user.lastFailedAttempt = null;
        this.users.set(user.id, user);

        const sessionId = this.generateSessionId();
        const session = {
            userId: user.id,
            username: user.username,
            role: user.role,
            securityLevel: user.securityLevel,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + this.securityConfig.sessionTimeout),
            ipAddress: this.getClientIP(), // Simulado
            userAgent: this.getUserAgent() // Simulado
        };

        this.sessions.set(sessionId, session);

        // Actualizar último login
        user.lastLogin = new Date();
        this.users.set(user.id, user);

        this.logSecurityEvent('login_success', { username, sessionId });
        console.log(`🔐 Usuario logueado: ${username}`);
        return { sessionId, user };
    }

    logout(sessionId) {
        const session = this.sessions.get(sessionId);
        if (session) {
            this.logSecurityEvent('logout', { username: session.username, sessionId });
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
            this.logSecurityEvent('session_expired', { username: session.username, sessionId });
            this.sessions.delete(sessionId);
            return null;
        }

        return session;
    }

    // Métodos de seguridad mejorados
    isAccountLocked(username) {
        const user = this.getUserByUsername(username);
        if (!user) return false;

        if (user.failedAttempts >= this.securityConfig.maxFailedAttempts) {
            if (user.lastFailedAttempt) {
                const lockoutEnd = new Date(user.lastFailedAttempt.getTime() + this.securityConfig.lockoutDuration);
                if (new Date() < lockoutEnd) {
                    return true;
                } else {
                    // Desbloquear automáticamente
                    user.failedAttempts = 0;
                    user.lastFailedAttempt = null;
                    this.users.set(user.id, user);
                }
            }
        }
        return false;
    }

    recordFailedAttempt(username) {
        const user = this.getUserByUsername(username);
        if (user) {
            user.failedAttempts = (user.failedAttempts || 0) + 1;
            user.lastFailedAttempt = new Date();
            this.users.set(user.id, user);

            if (user.failedAttempts >= this.securityConfig.maxFailedAttempts) {
                this.logSecurityEvent('account_locked', { username, failedAttempts: user.failedAttempts });
            }
        }
    }

    logSecurityEvent(eventType, details) {
        const event = {
            id: this.generateEventId(),
            type: eventType,
            timestamp: new Date(),
            details,
            ipAddress: this.getClientIP(),
            userAgent: this.getUserAgent()
        };

        this.securityLog.set(event.id, event);
        console.log(`🔒 Evento de seguridad: ${eventType}`, details);
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

    generateEventId() {
        return `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    // Simulación de datos del cliente
    getClientIP() {
        return '192.168.1.100'; // Simulado
    }

    getUserAgent() {
        return 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'; // Simulado
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

        // Verificar longitud mínima
        if (password.length < this.securityConfig.minPasswordLength) {
            return false;
        }

        // Verificar si es una contraseña común bloqueada
        if (this.securityConfig.blockCommonPasswords && this.blockedPasswords.has(password.toLowerCase())) {
            return false;
        }

        // Validación de contraseña mejorada con caracteres especiales
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return passwordRegex.test(password);
    }

    // Nuevo método para validar contraseñas comunes
    isCommonPassword(password) {
        return this.blockedPasswords.has(password.toLowerCase());
    }

    // Nuevo método para verificar límite de sesiones
    checkSessionLimit(userId) {
        const userSessions = Array.from(this.sessions.values()).filter(session =>
            session.userId === userId && new Date() <= session.expiresAt
        );

        return userSessions.length >= this.securityConfig.maxSessionsPerUser;
    }

    // Nuevo método para limpiar sesiones expiradas
    cleanupExpiredSessions() {
        const now = new Date();
        let cleanedCount = 0;

        for (const [sessionId, session] of this.sessions.entries()) {
            if (now > session.expiresAt) {
                this.sessions.delete(sessionId);
                this.logSecurityEvent('session_cleaned', {
                    username: session.username,
                    sessionId,
                    reason: 'expired'
                });
                cleanedCount++;
            }
        }

        if (cleanedCount > 0) {
            console.log(`🧹 Limpiadas ${cleanedCount} sesiones expiradas`);
        }

        return cleanedCount;
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
            lastLogin: user.lastLogin,
            securityLevel: user.securityLevel,
            failedAttempts: user.failedAttempts
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
        this.logSecurityEvent('user_updated', { userId, updates });
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
        this.logSecurityEvent('user_deactivated', { userId, username: user.username });
        console.log(`❌ Usuario desactivado: ${user.username}`);
        return user;
    }

    getActiveSessions() {
        return Array.from(this.sessions.values()).filter(session =>
            new Date() <= session.expiresAt
        );
    }

    getSecurityLog() {
        return Array.from(this.securityLog.values()).sort((a, b) => b.timestamp - a.timestamp);
    }

    getStats() {
        const allUsers = Array.from(this.users.values());
        const activeSessions = this.getActiveSessions();
        const securityEvents = this.getSecurityLog();

        return {
            totalUsers: allUsers.length,
            activeUsers: allUsers.filter(user => user.isActive).length,
            activeSessions: activeSessions.length,
            lockedAccounts: allUsers.filter(user => this.isAccountLocked(user.username)).length,
            securityEvents: securityEvents.length,
            roles: Array.from(this.roles.keys()),
            permissions: Array.from(this.permissions.keys())
        };
    }
}

// Exportar la clase
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UserAuth;
}
