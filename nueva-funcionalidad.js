// Nueva funcionalidad de notificaciones
class NotificationService {
    constructor() {
        this.notifications = [];
        this.maxNotifications = 100; // FIX: agregar límite para evitar memory leaks
    }

    addNotification(message, type = 'info') {
        // FIX: validar que el mensaje no esté vacío
        if (!message || message.trim().length === 0) {
            throw new Error('El mensaje de notificación no puede estar vacío');
        }

        // FIX: limpiar notificaciones antiguas si se excede el límite
        if (this.notifications.length >= this.maxNotifications) {
            this.notifications = this.notifications.slice(-50); // Mantener solo las últimas 50
        }

        const notification = {
            id: Date.now(),
            message: message.trim(), // FIX: trim del mensaje
            type,
            timestamp: new Date(),
            read: false
        };
        
        this.notifications.push(notification);
        return notification;
    }

    markAsRead(id) {
        const notification = this.notifications.find(n => n.id === id);
        if (notification) {
            notification.read = true;
        }
    }

    getUnreadCount() {
        return this.notifications.filter(n => !n.read).length;
    }

    clearAll() {
        this.notifications = [];
    }

    // FIX: agregar método para limpiar notificaciones antiguas
    clearOldNotifications(daysOld = 30) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);
        
        this.notifications = this.notifications.filter(
            notification => notification.timestamp > cutoffDate
        );
    }
}

module.exports = NotificationService;
