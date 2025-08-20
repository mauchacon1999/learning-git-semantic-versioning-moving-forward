// Nueva funcionalidad de notificaciones
class NotificationService {
    constructor() {
        this.notifications = [];
    }

    addNotification(message, type = 'info') {
        const notification = {
            id: Date.now(),
            message,
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
}

module.exports = NotificationService;
