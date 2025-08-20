// Primer commit - Nueva funcionalidad de dashboard
class DashboardService {
    constructor() {
        this.widgets = [];
        this.layout = 'grid';
        this.theme = 'light'; // Segundo commit - agregar tema
    }

    addWidget(widget) {
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
}

module.exports = DashboardService;
