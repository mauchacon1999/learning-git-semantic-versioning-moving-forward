/**
 * Sistema de Pagos
 * Feature: add-payment-system
 * Hotfix: qa-fix-payment-validation
 * Hotfix: qa-fix-payment-validation ,,,,
 */

class PaymentSystem {
    constructor() {
        this.payments = new Map();
        this.paymentMethods = new Map();
        this.transactions = new Map();

        // Inicializar métodos de pago
        this.initializePaymentMethods();
    }

    /**
     * Inicializar métodos de pago disponibles
     */
    initializePaymentMethods() {
        this.paymentMethods.set('credit_card', {
            name: 'Tarjeta de Crédito',
            description: 'Pago con tarjeta de crédito',
            fee: 0.025, // 2.5% de comisión
            enabled: true
        });

        this.paymentMethods.set('debit_card', {
            name: 'Tarjeta de Débito',
            description: 'Pago con tarjeta de débito',
            fee: 0.015, // 1.5% de comisión
            enabled: true
        });

        this.paymentMethods.set('bank_transfer', {
            name: 'Transferencia Bancaria',
            description: 'Transferencia bancaria directa',
            fee: 0.005, // 0.5% de comisión
            enabled: true
        });

        this.paymentMethods.set('cash', {
            name: 'Efectivo',
            description: 'Pago en efectivo',
            fee: 0.0, // Sin comisión
            enabled: true
        });
    }

    /**
     * Crear un nuevo pago con validaciones mejoradas
     */
    createPayment(userId, amount, method, description = '') {
        // Validar userId
        if (!userId || typeof userId !== 'string') {
            throw new Error('ID de usuario es requerido y debe ser una cadena');
        }

        // Validar amount
        if (!amount || amount <= 0) {
            throw new Error('El monto debe ser mayor a 0');
        }

        if (amount > 1000000) {
            throw new Error('El monto no puede exceder 1,000,000');
        }

        // Validar método de pago
        if (!this.paymentMethods.has(method)) {
            throw new Error('Método de pago no válido');
        }

        const paymentMethod = this.paymentMethods.get(method);
        if (!paymentMethod.enabled) {
            throw new Error('Método de pago no disponible');
        }

        // Validar descripción
        if (description && description.length > 500) {
            throw new Error('La descripción no puede exceder 500 caracteres');
        }

        // Calcular comisión
        const fee = amount * paymentMethod.fee;
        const totalAmount = amount + fee;

        const payment = {
            id: this.generatePaymentId(),
            userId,
            amount,
            fee,
            totalAmount,
            method,
            description,
            status: 'pending',
            createdAt: new Date(),
            processedAt: null,
            transactionId: null
        };

        this.payments.set(payment.id, payment);
        return payment;
    }

    /**
     * Procesar un pago con validaciones mejoradas
     */
    processPayment(paymentId) {
        if (!paymentId || typeof paymentId !== 'string') {
            throw new Error('ID de pago es requerido y debe ser una cadena');
        }

        const payment = this.payments.get(paymentId);

        if (!payment) {
            throw new Error('Pago no encontrado');
        }

        if (payment.status !== 'pending') {
            throw new Error(`Pago ya procesado con estado: ${payment.status}`);
        }

        try {
            // Simular procesamiento del pago
            const transactionId = this.generateTransactionId();

            // Actualizar estado del pago
            payment.status = 'completed';
            payment.processedAt = new Date();
            payment.transactionId = transactionId;

            // Crear transacción
            const transaction = {
                id: transactionId,
                paymentId: payment.id,
                userId: payment.userId,
                amount: payment.totalAmount,
                method: payment.method,
                status: 'success',
                createdAt: new Date()
            };

            this.transactions.set(transactionId, transaction);

            return {
                success: true,
                payment,
                transaction
            };

        } catch (error) {
            payment.status = 'failed';
            payment.processedAt = new Date();

            throw new Error(`Error al procesar el pago: ${error.message}`);
        }
    }

    /**
     * Obtener historial de pagos de un usuario
     */
    getUserPayments(userId) {
        if (!userId) {
            throw new Error('ID de usuario es requerido');
        }

        const userPayments = Array.from(this.payments.values())
            .filter(payment => payment.userId === userId)
            .sort((a, b) => b.createdAt - a.createdAt);

        return userPayments;
    }

    /**
     * Obtener estadísticas de pagos
     */
    getPaymentStats() {
        const allPayments = Array.from(this.payments.values());

        const stats = {
            total: allPayments.length,
            completed: allPayments.filter(p => p.status === 'completed').length,
            pending: allPayments.filter(p => p.status === 'pending').length,
            failed: allPayments.filter(p => p.status === 'failed').length,
            totalAmount: allPayments
                .filter(p => p.status === 'completed')
                .reduce((sum, p) => sum + p.totalAmount, 0),
            totalFees: allPayments
                .filter(p => p.status === 'completed')
                .reduce((sum, p) => sum + p.fee, 0)
        };

        return stats;
    }

    /**
     * Obtener métodos de pago disponibles
     */
    getAvailablePaymentMethods() {
        return Array.from(this.paymentMethods.values())
            .filter(method => method.enabled)
            .map(method => ({
                id: method.name.toLowerCase().replace(/\s+/g, '_'),
                name: method.name,
                description: method.description,
                fee: method.fee
            }));
    }

    /**
     * Generar ID único para pago
     */
    generatePaymentId() {
        return 'PAY-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }

    /**
     * Generar ID único para transacción
     */
    generateTransactionId() {
        return 'TXN-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }
}

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PaymentSystem;
}
