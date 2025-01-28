# AgentsAI Framework

A TypeScript/NestJS implementation of an AI agents framework, inspired by CrewAI, designed for building and managing autonomous AI agents that can collaborate, communicate, and accomplish complex tasks.

## Project Structure

```
src/
├── modules/
│   ├── agents/              # Agent management module
│   │   ├── domain/         # Domain entities, value objects, and ports
│   │   ├── application/    # Use cases and application services
│   │   ├── infrastructure/ # Repository implementations and external services
│   │   └── interface/      # Controllers, DTOs, and presenters
│   ├── llm/                # LLM integration module
│   ├── tasks/              # Task management module
│   ├── teams/              # Team coordination module
│   └── tools/              # Tools and capabilities module
├── common/                 # Shared utilities and pipes
├── config/                 # Configuration management
└── main.ts                # Application entry point
```

## Features

- 🤖 Agent Management
- 🤝 Team Coordination
- 📋 Task Management
- 🔧 Tool Integration
- 🧠 LLM Provider Support
- 🔄 Real-time Communication
- 📊 Performance Monitoring

## Prerequisites

- Node.js (v18 or later)
- npm or yarn
- DynamoDB Local (for development)
- Redis (optional, for caching)

## Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd agentsAI
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Start DynamoDB Local:
   ```bash
   docker run -p 8000:8000 amazon/dynamodb-local
   ```

5. Run the application:
   ```bash
   # Development
   npm run start:dev

   # Production
   npm run build
   npm run start:prod
   ```

## Development

### Code Style

- Follow NestJS best practices
- Use hexagonal architecture principles
- Write unit tests for domain logic
- Document public APIs

### Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

### API Documentation

The API documentation is available at `/api/docs` when running in development mode.

## Architecture

This project follows hexagonal architecture (ports and adapters) principles:

- **Domain Layer**: Core business logic and entities
- **Application Layer**: Use cases and application services
- **Infrastructure Layer**: External services and implementations
- **Interface Layer**: Controllers and DTOs

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Environment Variables

See `.env.example` for all available configuration options.

## License

[MIT License](LICENSE)
