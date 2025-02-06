## Guía de Contribución

Gracias por interesarte en contribuir a la Plataforma AgentsAI. Las contribuciones son fundamentales para mejorar el proyecto y hacerlo aún más robusto y versátil. A continuación, se detallan los pasos y pautas para contribuir eficazmente.

### Requisitos Previos

Antes de comenzar a contribuir, asegúrate de cumplir con los siguientes requisitos:

1. **Node.js**: Asegúrate de tener instalada la versión 18 o superior.
2. **Cuenta de GitHub**: Necesitarás una cuenta en GitHub para realizar cambios y enviar Pull Requests.
3. **Clonar el Repositorio**:
   ```bash
   git clone https://github.com/devmangel/pai-framework.git
   cd pai-framework
   ```
4. **Instalar Dependencias**:
   ```bash
   npm install
   ```
5. **Configurar Variables de Entorno**:
   - Revisa el archivo `.env.example` y crea un archivo `.env` con las credenciales necesarias para AWS, OpenAI y otros servicios.

### Flujo de Trabajo

Sigue estos pasos para contribuir al proyecto:

1. **Fork del Repositorio**:
   - Haz un fork del repositorio original en GitHub para crear una copia personal del proyecto.

2. **Clonar el Fork**:
   ```bash
   git clone https://github.com/<tu-username>/pai-framework.git
   cd pai-framework
   ```

3. **Configurar Remote de Upstream**:
   - Configura un remote llamado `upstream` que apunte al repositorio original.
   ```bash
   git remote add upstream https://github.com/devmangel/pai-framework.git
   ```

4. **Crear una Rama de Características**:
   - Crea y cambia a una nueva rama para tus cambios.
   ```bash
   git checkout -b feature/nueva-caracteristica
   ```

5. **Realizar Cambios**:
   - Haz los cambios necesarios en el código según las pautas del proyecto.

6. **Guardar Cambios**:
   - Asegúrate de que tu código cumple con las guías de estilo y funciona correctamente.

7. **Realizar Commits**:
   - Haz commits describiendo tus cambios de manera clara y concisa.
   ```bash
   git add .
   git commit -am 'Agrega nueva característica'
   ```

8. **Actualizar Rama con Upstream**:
   - Antes de enviar un Pull Request, actualiza tu rama con los cambios más recientes del repositorio original.
   ```bash
   git fetch upstream
   git merge upstream/main
   ```

9. **Push a tu Rama**:
   - Envía tus cambios a tu repositorio fork.
   ```bash
   git push origin feature/nueva-caracteristica
   ```

10. **Enviar Pull Request (PR)**:
    - Ve a tu repositorio en GitHub y haz clic en el botón "Compare & pull request".
    - Llena el formulario de PR con una descripción clara de los cambios y por qué los estás haciendo.
    - Enviar el PR para que sea revisado.

### Convenciones de Código

Para mantener la coherencia en el código, sigue estas convenciones:

- **Estilo de Código**: Utiliza el formateador de código configurado en el proyecto (por ejemplo, Prettier) para garantizar un estilo consistente.
- **Nombre de Ramas**: Nombra tus ramas de características de manera descriptiva y utilizando guiones bajos en lugar de espacios.
- **Commits**: Escribe mensajes de commits claros y concisos que describan los cambios realizados.
  - Ejemplo: `Agrega nueva funcionalidad de memoria`

### Desarrollo y Pruebas

- **Desarrollo**: Desarrolla en la rama de características que hayas creado, manteniendo siempre la rama `main` actualizada con los cambios del `upstream`.
- **Pruebas**: Ejecuta las pruebas unitarias y de integración para asegurarte de que tus cambios no rompen la funcionalidad existente.
  ```bash
  npm run test
  ```

### Documentación

- **Documentación Interna**: Actualiza cualquier documentación interna relevante para reflejar los cambios realizados.
- **Documentación de Módulos**: Si realizas cambios en un módulo específico, asegúrate de actualizar la documentación correspondiente en el directorio `docs/modules/`.

### Códigos de Estado

- **Draft PR**: Marca tu PR como draft si no está listo para la revisión final.
- **Ready for Review**: Marca tu PR como lista para revisión una vez que hayas completado todos los cambios y pruebas necesarias.

### Contacto

Si tienes alguna pregunta o necesitas ayuda con la contribución, no dudes en contactar al equipo de desarrollo a través de los canales de comunicación del proyecto.
