// Módulo de autenticación
class LoginSystem {
  constructor() {
    this.users = new Map();
  }

  register(username, password) {
    if (this.users.has(username)) {
      throw new Error('Usuario ya existe');
    }
    this.users.set(username, password);
    return true;
  }

  login(username, password) {
    const storedPassword = this.users.get(username);
    if (!storedPassword || storedPassword !== password) {
      throw new Error('Credenciales inválidas');
    }
    return true;
  }

  logout() {
    // Lógica de logout
    return true;
  }
}

module.exports = LoginSystem;
