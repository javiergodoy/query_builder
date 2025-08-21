# Query Builder - Arquitectura de la Aplicación

## 🏗️ Diagrama de Arquitectura General

```mermaid
graph TB
    subgraph "Frontend - React + TypeScript"
        A[App.tsx] --> B[Navigation]
        A --> C[Main Content Area]
        
        B --> D[Builder Tab]
        B --> E[Editor Tab] 
        B --> F[Results Tab]
        B --> G[Management Tab]
        
        C --> H[AdvancedQueryBuilder]
        C --> I[SqlEditor]
        C --> J[QueryResults]
        C --> K[QueryManagement]
    end
    
    subgraph "Backend - Node.js + Express"
        L[Server.js] --> M[API Routes]
        M --> N[/api/schema]
        M --> O[/api/execute]
        M --> P[/api/tables]
    end
    
    subgraph "Database"
        Q[(PostgreSQL)]
        Q --> R[users]
        Q --> S[products]
        Q --> T[orders]
        Q --> U[categories]
    end
    
    A --> L
    L --> Q
    
    style A fill:#e1f5fe
    style L fill:#f3e5f5
    style Q fill:#e8f5e8
```

## 🧩 Estructura de Componentes

```mermaid
graph TD
    A[App.tsx] --> B[Header]
    A --> C[Navigation]
    A --> D[Main Content]
    A --> E[Query Actions]
    
    B --> B1[Title & Status]
    B --> B2[Database Connection Status]
    
    C --> C1[Builder Button]
    C --> C2[Editor Button]
    C --> C3[Results Button]
    C --> C4[Management Button]
    
    D --> D1[AdvancedQueryBuilder]
    D --> D2[SqlEditor]
    D --> D3[QueryResults]
    D --> D4[QueryManagement]
    
    D1 --> D1A[FieldsPanel]
    D1 --> D1B[QueryCanvas]
    D1 --> D1C[FieldSearch]
    
    D1A --> D1A1[DimensionsList]
    D1A --> D1A2[MetricsList]
    D1A --> D1A3[FiltersList]
    
    D1A1 --> D1A1A[SelectableField]
    D1A2 --> D1A2A[SelectableField]
    D1A3 --> D1A3A[SelectableField]
    
    D1B --> D1B1[DropZone - SELECT]
    D1B --> D1B2[DropZone - FROM]
    D1B --> D1B3[DropZone - WHERE]
    D1B --> D1B4[DropZone - GROUP BY]
    
    D1B1 --> D1B1A[SortableFieldItem]
    D1B2 --> D1B2A[SortableFieldItem]
    D1B3 --> D1B3A[SortableFieldItem]
    D1B4 --> D1B4A[SortableFieldItem]
    
    D2 --> D2A[Monaco Editor]
    D2 --> D2B[SQL Validation]
    D2 --> D2C[Editor Controls]
    
    D3 --> D3A[Results Table]
    D3 --> D3B[Export Options]
    D3 --> D3C[Create Table Modal]
    
    D4 --> D4A[Save Dialog]
    D4 --> D4B[Load Dialog]
    D4 --> D4C[Saved Queries List]
    
    E --> E1[Execute Button]
    E --> E2[Error Display]
    
    style A fill:#e3f2fd
    style D1 fill:#f3e5f5
    style D2 fill:#e8f5e8
    style D3 fill:#fff3e0
    style D4 fill:#fce4ec
```

## 🔄 Flujo de Datos

```mermaid
sequenceDiagram
    participant U as Usuario
    participant A as App.tsx
    participant QB as QueryBuilder
    participant SG as SqlGenerator
    participant API as Backend API
    participant DB as PostgreSQL
    
    Note over U,DB: 1. Inicialización
    U->>A: Carga aplicación
    A->>API: GET /api/schema
    API->>DB: Query schema tables
    DB-->>API: Schema data
    API-->>A: Schema response
    A->>A: Generate SemanticLayer
    
    Note over U,DB: 2. Construcción de Query
    U->>QB: Selecciona campos
    QB->>A: Update query state
    A->>SG: Generate SQL
    SG-->>A: SQL string
    
    Note over U,DB: 3. Ejecución
    U->>A: Click Execute
    A->>API: POST /api/execute {sql}
    API->>DB: Execute SQL
    DB-->>API: Query results
    API-->>A: Results data
    A->>A: Update results state
    
    Note over U,DB: 4. Guardar Query
    U->>A: Save query
    A->>A: Store in localStorage
```

## 📱 Estados de la Aplicación

```mermaid
stateDiagram-v2
    [*] --> Loading
    Loading --> Connected: Schema loaded successfully
    Loading --> Error: Connection failed
    
    Error --> Loading: Retry connection
    Error --> [*]: Close app
    
    Connected --> Builder: Default view
    Connected --> Editor: Switch tab
    Connected --> Results: Switch tab  
    Connected --> Management: Switch tab
    
    Builder --> QueryBuilding: User adds fields
    QueryBuilding --> QueryReady: Valid query
    QueryReady --> Executing: Execute query
    Executing --> Results: Query success
    Executing --> QueryReady: Query error
    
    Editor --> EditingSQL: User edits SQL
    EditingSQL --> QueryReady: Valid SQL
    EditingSQL --> Editor: Invalid SQL
    
    Results --> ExportingCSV: Export data
    Results --> CreatingTable: Create table
    ExportingCSV --> Results: Export complete
    CreatingTable --> Results: Table created
    
    Management --> SavingQuery: Save current query
    Management --> LoadingQuery: Load saved query
    SavingQuery --> Management: Save complete
    LoadingQuery --> Builder: Query loaded
```

## 🎨 Estructura de Estilos Actual

```mermaid
graph TB
    A[App.css - 1623 lines] --> B[Global Styles]
    A --> C[App Layout]
    A --> D[Navigation]
    A --> E[Query Builder]
    A --> F[Components]
    
    B --> B1[Reset & Base]
    B --> B2[Typography]
    B --> B3[Colors & Variables]
    
    C --> C1[Header Styles]
    C --> C2[Main Content]
    C --> C3[Workspace Layout]
    
    D --> D1[Navigation Buttons]
    D --> D2[Active States]
    D --> D3[Hover Effects]
    
    E --> E1[Fields Panel]
    E --> E2[Drop Zones]
    E --> E3[Drag & Drop]
    E --> E4[Field Items]
    
    F --> F1[Modals]
    F --> F2[Forms]
    F --> F3[Tables]
    F --> F4[Buttons]
    F --> F5[Loading States]
    F --> F6[Error States]
    
    style A fill:#ffcdd2
    style B fill:#f8bbd9
    style C fill:#e1bee7
    style D fill:#d1c4e9
    style E fill:#c5cae9
    style F fill:#bbdefb
```

## 🔧 Servicios y Utilidades

```mermaid
graph LR
    subgraph "Services"
        A[apiService.ts]
        B[realQueryExecutor.ts]
        C[semanticLayerService.ts]
    end
    
    subgraph "Utils"
        D[sqlGenerator.ts]
        E[queryExecutor.ts]
    end
    
    subgraph "Types"
        F[query.ts]
        G[semanticLayer.ts]
    end
    
    A --> H[HTTP Requests]
    B --> I[Query Execution]
    C --> J[Schema Processing]
    D --> K[SQL Generation]
    E --> L[Query Utils]
    F --> M[Type Definitions]
    G --> N[Schema Types]
    
    style A fill:#c8e6c9
    style B fill:#dcedc1
    style C fill:#f0f4c3
    style D fill:#fff9c4
    style E fill:#ffecb3
    style F fill:#ffe0b2
    style G fill:#ffccbc
```

## 🎯 Plan de Refactorización

```mermaid
timeline
    title Modernización de UI/UX
    
    section Fase 1: Fundamentos
        Semana 1 : Setup Tailwind CSS
                 : Design System Tokens
                 : Color Palette
                 : Typography Scale
                 
    section Fase 2: Componentes
        Semana 2 : Refactor App Layout
                 : Navigation Component
                 : Query Builder UI
                 : Dark/Light Theme
                 
    section Fase 3: Interacciones
        Semana 3 : Micro-animations
                 : Loading States
                 : Error Handling
                 : Responsive Design
                 
    section Fase 4: Pulimiento
        Semana 4 : Accessibility
                 : Performance
                 : Testing
                 : Documentation
```

## 📊 Métricas de Mejora Objetivo

```mermaid
gitgraph
    commit id: "v1.0 - Estado Actual"
    branch feature/modern-styling
    checkout feature/modern-styling
    commit id: "Setup Design System"
    commit id: "Implement Dark Theme"
    commit id: "Responsive Layout"
    commit id: "Accessibility Improvements"
    commit id: "Performance Optimization"
    checkout main
    merge feature/modern-styling
    commit id: "v2.0 - Modern UI"
```

---

### 📈 KPIs de Mejora

| Métrica | Actual | Objetivo | Mejora |
|---------|--------|----------|--------|
| CSS Lines | 1623 | 800 | -50% |
| Load Time | 2.5s | 1.5s | -40% |
| Mobile Score | 65/100 | 90/100 | +38% |
| Accessibility | 70/100 | 95/100 | +36% |
| Bundle Size | 2.1MB | 1.5MB | -29% |
