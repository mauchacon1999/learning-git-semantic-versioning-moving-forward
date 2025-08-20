// Primer commit - Nueva funcionalidad de dashboard
class DashboardService {
    constructor() {
        this.widgets = [];
        this.layout = 'grid';
    }

    addWidget(widget) {
        this.widgets.push(widget);
        return widget;
    }

    getWidgets() {
        return this.widgets;
    }
}

module.exports = DashboardService;
