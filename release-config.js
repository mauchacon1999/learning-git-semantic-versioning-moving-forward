// Configuración para Release 1.1.0
const ReleaseConfig = {
    version: '1.1.0',
    releaseDate: new Date().toISOString(),
    features: [
        'Dashboard con gestión de widgets',
        'Sistema de notificaciones en tiempo real',
        'Servicio de reportes con exportación PDF',
        'Autenticación mejorada con validaciones de seguridad',
        'Auto-refresh en dashboard'
    ],
    bugFixes: [
        'Validación de límites en widgets',
        'Prevención de memory leaks',
        'Validación de entrada de datos',
        'Bloqueo de cuentas por intentos fallidos'
    ],
    breakingChanges: [],
    deprecations: [],
    migrationNotes: 'Ninguna migración requerida para esta versión.'
};

module.exports = ReleaseConfig;
