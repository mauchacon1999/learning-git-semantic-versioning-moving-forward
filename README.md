# Learning Git Semantic Versioning

Este proyecto demuestra el uso de `semantic-release` para automatizar el versionado semántico en proyectos Git.

## 🚀 Características

- **Automatización de versionado** con `semantic-release`
- **Flujo GitFlow** implementado
- **Generación automática de CHANGELOG**
- **Integración con Husky** para hooks de Git

## 📋 Scripts disponibles

```bash
# Release automático (detecta commits)
yarn release

# Release con versión específica
yarn release:1.1.0
yarn release:1.2.0

# Release MINOR
yarn release:minor

# Dry run (sin crear tags)
yarn release:dry-run
```

## 🔄 Flujo de trabajo

1. **Development**: Cada merge incrementa PATCH (1.0.0 → 1.0.1)
2. **Release**: Crear MINOR version (1.0.1 → 1.1.0)
3. **Hotfix**: Correcciones urgentes (1.1.0 → 1.1.1)

## 📦 Dependencias

- `semantic-release`: Automatización de releases
- `@semantic-release/changelog`: Generación de CHANGELOG
- `@semantic-release/git`: Commits y tags automáticos
- `husky`: Git hooks
