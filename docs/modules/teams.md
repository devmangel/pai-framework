# Módulo de Equipos

## Descripción General
El módulo de Equipos es un componente fundamental del framework AgentsAI que gestiona la organización y colaboración entre agentes. Proporciona una estructura jerárquica para la formación de equipos, gestión de roles, y comunicación a través de canales, permitiendo una colaboración efectiva entre agentes.

## Estructura del Módulo
```
src/modules/teams/
├── domain/
│   ├── entities/
│   │   └── team.entity.ts
│   ├── enums/
│   │   └── team-role.enum.ts
│   ├── ports/
│   │   └── team.repository.ts
│   └── value-objects/
│       ├── team-channel.vo.ts
│       └── team-member.vo.ts
├── application/
│   ├── dtos/
│   │   ├── channel-response.dto.ts
│   │   ├── channel.dto.ts
│   │   ├── create-team.dto.ts
│   │   └── team-response.dto.ts
│   ├── mappers/
│   │   └── team.mapper.ts
│   └── services/
│       └── team.service.ts
├── infrastructure/
│   └── repositories/
│       └── dynamodb-team.repository.ts
└── interface/
    └── http/
        └── teams.controller.ts
```

## Componentes Principales

### 1. Entidad Equipo (Team)

La entidad principal que representa un equipo:

#### Propiedades
```typescript
class Team extends AggregateRoot {
  constructor(
    id: string,
    name: string,
    description: string,
    members: TeamMember[],
    channels: TeamChannel[],
    createdAt: Date,
    updatedAt: Date
  )
}
```

#### Roles de Equipo
```typescript
enum TeamRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
  GUEST = 'GUEST'
}
```

#### Métodos Principales
```typescript
// Gestión de Miembros
addMember(member: TeamMember): void
removeMember(agentId: string): void
updateMemberRole(agentId: string, role: TeamRole): void
hasMember(agentId: string): boolean

// Gestión de Canales
createChannel(id: string, name: string, description: string, createdBy: string): void
removeChannel(channelId: string): void
updateChannelDescription(channelId: string, description: string): void
addMemberToChannel(channelId: string, member: TeamMember): void
removeMemberFromChannel(channelId: string, agentId: string): void
```

### 2. Miembro de Equipo (TeamMember)

Value Object que representa un miembro del equipo:

```typescript
class TeamMember {
  constructor(
    agentId: string,
    role: TeamRole,
    joinedAt: Date
  )

  // Permisos basados en roles
  canManageTeam(): boolean
  canInviteMembers(): boolean
  canRemoveMembers(): boolean
  canUpdateTeamInfo(): boolean

  // Factory method
  static create(agentId: string, role: TeamRole = TeamRole.MEMBER): TeamMember
}
```

### 3. Canal de Equipo (TeamChannel)

Value Object que representa un canal de comunicación:

```typescript
class TeamChannel {
  constructor(
    id: string,
    name: string,
    description: string,
    createdBy: string,
    createdAt: Date,
    updatedAt: Date,
    members: TeamMember[],
    messages: TeamChannelMessage[]
  )

  // Gestión de mensajes y miembros
  addMessage(message: TeamChannelMessage): void
  addMember(member: TeamMember): void
  removeMember(agentId: string): void
  hasMember(agentId: string): boolean
}

class TeamChannelMessage {
  constructor(
    id: string,
    content: string,
    senderId: string,
    createdAt: Date,
    metadata: Record<string, any>
  )
}
```

## API REST

### Endpoints Principales

#### 1. Crear Equipo
```http
POST /teams
Content-Type: application/json

{
  "name": "Equipo de Análisis",
  "description": "Equipo especializado en análisis de datos",
  "members": [
    {
      "agentId": "agent-1",
      "role": "OWNER"
    }
  ]
}
```

#### 2. Gestión de Miembros
```http
POST /teams/:id/members
DELETE /teams/:id/members/:agentId
PUT /teams/:id/members/:agentId/role
```

#### 3. Gestión de Canales
```http
POST /teams/:id/channels
Content-Type: application/json

{
  "name": "análisis-mercado",
  "description": "Canal para análisis de mercado",
  "members": ["agent-1", "agent-2"]
}
```

#### 4. Comunicación en Canales
```http
POST /teams/:id/channels/:channelId/messages
GET /teams/:id/channels/:channelId/messages
```

## Mejores Prácticas

### 1. Creación de Equipos
```typescript
// Crear equipo con estructura básica
const team = Team.create(
  'team-1',
  'Equipo de Análisis',
  'Equipo especializado en análisis de datos',
  [TeamMember.create('agent-1', TeamRole.OWNER)]
);

// Añadir canales iniciales
team.createChannel(
  'channel-1',
  'general',
  'Canal general del equipo',
  'agent-1'
);
```

### 2. Gestión de Roles
```typescript
// Verificar permisos antes de acciones
if (member.canManageTeam()) {
  team.addMember(newMember);
}

// Actualizar roles con validación
try {
  team.updateMemberRole(agentId, TeamRole.ADMIN);
} catch (error) {
  // Manejar error de permisos
}
```

### 3. Comunicación en Canales
```typescript
// Enviar mensaje en canal
const message = TeamChannelMessage.create(
  'msg-1',
  'Iniciando análisis de datos',
  'agent-1',
  { type: 'TASK_UPDATE' }
);
channel.addMessage(message);

// Verificar membresía antes de enviar
if (channel.hasMember(agentId)) {
  channel.addMessage(message);
}
```

### 4. Sincronización de Estado
```typescript
// Mantener estado consistente
team.addMember(member);
team.channels.forEach(channel => {
  channel.addMember(member);
});
```

## Conclusiones

El módulo de Equipos proporciona una base robusta para la colaboración entre agentes:

### Características Clave
- Gestión jerárquica de equipos
- Sistema de roles y permisos
- Canales de comunicación
- Mensajería estructurada

### Puntos Fuertes
1. **Organización**
   - Estructura clara de equipos
   - Roles bien definidos
   - Canales temáticos

2. **Colaboración**
   - Comunicación en tiempo real
   - Gestión de permisos
   - Trazabilidad de mensajes

3. **Flexibilidad**
   - Equipos multi-agente
   - Canales personalizables
   - Metadatos extensibles

### Integración
- Conexión con módulo de Agentes
- Sincronización con Tareas
- Eventos y notificaciones
