/**
 * Sistema de Cajero
 * Maneja transacciones bancarias básicas
 */

class CashierSystem {
    constructor() {
        this.balance = 10000; // Saldo inicial
        this.transactions = [];
        this.sessionActive = false;
        this.currentUser = null;
    }

    /**
     * Iniciar sesión de cajero
     */
    login(userId, pin) {
        // Simulación de autenticación
        if (pin === '1234') {
            this.currentUser = userId;
            this.sessionActive = true;
            console.log(`✅ Cajero iniciado por: ${userId}`);
            return true;
        }
        console.log('❌ PIN incorrecto');
        return false;
    }

    /**
     * Cerrar sesión
     */
    logout() {
        this.sessionActive = false;
        this.currentUser = null;
        console.log('👋 Sesión cerrada');
    }

    /**
     * Verificar saldo
     */
    checkBalance() {
        if (!this.sessionActive) {
            throw new Error('Sesión no activa');
        }
        return this.balance;
    }

    /**
     * Realizar depósito
     */
    deposit(amount) {
        if (!this.sessionActive) {
            throw new Error('Sesión no activa');
        }
        if (amount <= 0) {
            throw new Error('Monto debe ser positivo');
        }

        this.balance += amount;
        this.transactions.push({
            type: 'deposit',
            amount: amount,
            timestamp: new Date(),
            user: this.currentUser
        });

        console.log(`💰 Depósito: $${amount}`);
        return this.balance;
    }

    /**
     * Realizar retiro
     */
    withdraw(amount) {
        if (!this.sessionActive) {
            throw new Error('Sesión no activa');
        }
        if (amount <= 0) {
            throw new Error('Monto debe ser positivo');
        }
        if (amount > this.balance) {
            throw new Error('Saldo insuficiente');
        }

        this.balance -= amount;
        this.transactions.push({
            type: 'withdraw',
            amount: amount,
            timestamp: new Date(),
            user: this.currentUser
        });

        console.log(`💸 Retiro: $${amount}`);
        return this.balance;
    }

    /**
     * Obtener historial de transacciones
     */
    getTransactionHistory() {
        return this.transactions.slice(-10); // Últimas 10 transacciones
    }

    /**
     * Generar reporte diario
     */
    generateDailyReport() {
        const today = new Date().toDateString();
        const todayTransactions = this.transactions.filter(t => 
            t.timestamp.toDateString() === today
        );

        const totalDeposits = todayTransactions
            .filter(t => t.type === 'deposit')
            .reduce((sum, t) => sum + t.amount, 0);

        const totalWithdrawals = todayTransactions
            .filter(t => t.type === 'withdraw')
            .reduce((sum, t) => sum + t.amount, 0);

        return {
            date: today,
            totalTransactions: todayTransactions.length,
            totalDeposits,
            totalWithdrawals,
            netChange: totalDeposits - totalWithdrawals,
            finalBalance: this.balance
        };
    }
}

// Exportar para uso en otros módulos
module.exports = CashierSystem;
