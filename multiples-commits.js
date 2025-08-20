// Primer commit - Nueva funcionalidad de dashboard
class DashboardService {
    constructor() {
        this.widgets = [];
        this.layout = 'grid';
        this.theme = 'light'; // Segundo commit - agregar tema
        this.maxWidgets = 10; // Tercer commit - FIX: agregar límite de widgets
    }

    addWidget(widget) {
        // Tercer commit - FIX: validar límite de widgets
        if (this.widgets.length >= this.maxWidgets) {
            throw new Error('Se ha alcanzado el límite máximo de widgets');
        }

        // Tercer commit - FIX: validar que widget no esté vacío
        if (!widget || typeof widget !== 'object') {
            throw new Error('Widget debe ser un objeto válido');
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
}

module.exports = DashboardService;
