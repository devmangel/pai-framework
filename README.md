# AgentsAI Platform

AgentsAI Platform is a modular and scalable system designed to manage and orchestrate intelligent agents, enabling advanced automation, task management, and collaborative workflows. The platform integrates large language models (LLM), long-term memory storage, and real-time orchestration to facilitate sophisticated multi-agent applications.

## Características Principales

- **Arquitectura Modular:** Organizada en módulos independientes para Agentes, LLM, Memoria, Orquestación, Tareas, Equipos y Herramientas.
- **Integración con LLM:** Utiliza modelos de OpenAI (y potencialmente otros) para procesamiento de lenguaje natural y generación de contenido.
- **Persistencia en DynamoDB:** Almacena datos de manera eficiente usando AWS DynamoDB.
- **Orquestación Avanzada:** Controla y coordina flujos de trabajo entre agentes y equipos, utilizando patrones CQRS y consumiendo mensajes de RabbitMQ.
- **Sistema de Memoria:** Permite la gestión de datos históricos y de contexto para un razonamiento prolongado.
- **Gestión de Tareas y Equipos:** Facilita la asignación, seguimiento y colaboración en tareas, así como la organización de equipos colaborativos.
- **Herramientas Extendidas:** Proporciona funcionalidades adicionales a través de herramientas especializadas.

## Módulos de la Plataforma

La plataforma se compone de varios módulos, cada uno con su propia documentación detallada:

- [Agentes](docs/modules/agents.md) - Gestión y administración de agentes inteligentes.
- [LLM](docs/modules/llm.md) - Integración con modelos de lenguaje y generación de contenido.
- [Memoria](docs/modules/memory.md) - Sistema de almacenamiento y recuperación de información a largo plazo.
- [Orquestación](docs/modules/orchestration.md) - Coordinación de flujos de trabajo y eventos entre módulos.
- [Tareas](docs/modules/tasks.md) - Gestión y automatización de tareas y procesos.
- [Equipos](docs/modules/teams.md) - Colaboración y gestión de equipos de agentes.
- [Herramientas](docs/modules/tools.md) - Funcionalidades extendidas y servicios auxiliares.

## Requisitos

- **Node.js**: Versión 18 o superior.
- **AWS DynamoDB**: Configurado para almacenamiento de datos.
- **Cuenta de OpenAI**: Para integración con modelos de lenguaje.
- **RabbitMQ**: Para manejo de eventos y orquestación (opcional, según despliegue).
- **Docker**: Recomendado para despliegue y testing de contenedores.

## Instalación y Configuración

1. **Clonar el repositorio:**
   ```bash
   git clone <https://github.com/devmangel/pai-framework.git>
   cd pai-framework
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno:**
   - Revisa el archivo `.env.example` y configura un archivo `.env` con las credenciales para AWS, OpenAI y otros servicios necesarios.

4. **Compilar el proyecto:**
   ```bash
   npm run build
   ```

5. **Iniciar la aplicación:**
   ```bash
   npm run start
   ```

## Uso Básico

Una vez iniciada la aplicación, puedes acceder a los endpoints HTTP para interactuar con los diferentes módulos, por ejemplo:

- **Agentes:** Utiliza los endpoints definidos en el módulo de Agentes para crear y gestionar agentes.
- **Tareas:** Crea y asigna tareas utilizando el módulo de Tareas.
- **Orquestación:** Monitorea y coordina flujos de trabajo entre agentes y equipos.
- **LLM:** Envía solicitudes de completación a la API de OpenAI u otros modelos.
- **Memoria:** Consulta y almacena información histórica relevante.
- **Equipos y Herramientas:** Gestiona equipos y utiliza herramientas extendidas disponibles.

Consulta la documentación de cada módulo (en el directorio `docs/modules/`) para obtener detalles específicos y ejemplos de uso.

## Contribución

Si deseas contribuir a este proyecto, por favor sigue estos pasos:
1. Forkea el repositorio.
2. Crea tu rama de características (`git checkout -b feature/nueva-caracteristica`).
3. Realiza tus cambios y haz commit (`git commit -am 'Agrega nueva característica'`).
4. Push a la rama (`git push origin feature/nueva-caracteristica`).
5. Abre un Pull Request.

## Licencia

Este proyecto está licenciado bajo la [Licencia MIT](LICENSE).
