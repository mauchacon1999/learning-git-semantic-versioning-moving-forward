// Primer commit - Nueva funcionalidad de dashboard
class DashboardService {
    constructor() {
        this.widgets = [];
        this.layout = 'grid';
        this.theme = 'light'; // Segundo commit - agregar tema
        this.maxWidgets = 10; // Tercer commit - FIX: agregar límite de widgets
        this.refreshInterval = 30000; // Cuarto commit - agregar intervalo de refresh
        this.isInitialized = false; // FIX: agregar flag de inicialización
    }

    addWidget(widget) {
        // FIX: verificar que el dashboard esté inicializado
        if (!this.isInitialized) {
            throw new Error('Dashboard no ha sido inicializado. Llame a initialize() primero.');
        }

        // Tercer commit - FIX: validar límite de widgets
        if (this.widgets.length >= this.maxWidgets) {
            throw new Error('Se ha alcanzado el límite máximo de widgets');
        }
        
        // Tercer commit - FIX: validar que widget no esté vacío
        if (!widget || typeof widget !== 'object') {
            throw new Error('Widget debe ser un objeto válido');
        }

        // FIX: validar que el widget tenga un ID único
        if (this.widgets.some(w => w.id === widget.id)) {
            throw new Error('Widget con ID duplicado');
        }

        this.widgets.push(widget);
        return widget;
    }

    getWidgets() {
        return this.widgets;
    }

    // Segundo commit - agregar métodos de tema
    setTheme(theme) {
        this.theme = theme;
        return this.theme;
    }

    getTheme() {
        return this.theme;
    }

    // Segundo commit - agregar método de layout
    setLayout(layout) {
        this.layout = layout;
        return this.layout;
    }

    // Tercer commit - FIX: agregar método para limpiar widgets
    clearWidgets() {
        this.widgets = [];
    }

    // Cuarto commit - agregar métodos de refresh
    setRefreshInterval(interval) {
        this.refreshInterval = interval;
        return this.refreshInterval;
    }

    getRefreshInterval() {
        return this.refreshInterval;
    }

    // Cuarto commit - agregar método de auto-refresh
    startAutoRefresh() {
        setInterval(() => {
            this.refreshWidgets();
        }, this.refreshInterval);
    }

    refreshWidgets() {
        // Simular refresh de widgets
        console.log('Refrescando widgets...');
        return this.widgets;
    }

    // FIX: agregar método de inicialización
    initialize() {
        this.isInitialized = true;
        console.log('Dashboard inicializado correctamente');
        return true;
    }

    // FIX: agregar método para verificar estado
    isReady() {
        return this.isInitialized;
    }
}

module.exports = DashboardService;
