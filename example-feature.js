// Nueva funcionalidad de autenticación
class AuthService {
    constructor() {
        this.isAuthenticated = false;
    }

    login(username, password) {
        // Simular login
        // Validaciones rc
        // Validaciones beta
        // Validaciones alpha
        if (username && password) {
            this.isAuthenticated = true;
            return true;
        }
        return false;
    }

    logout() {
        this.isAuthenticated = false;
    }

    isLoggedIn() {
        return this.isAuthenticated;
    }
}

module.exports = AuthService;
