---
name: large-scale-architecture
description: >-
  Best practices for architecting, structuring, and refactoring large-scale enterprise projects (NestJS, Angular, TypeScript).
  Enforces Clean Architecture, Domain-Driven Design (DDD), dependency isolation, and scalability patterns.
---

# Large-Scale Architecture & Modular Monolith Skill

This skill provides expert guidelines for navigating, refactoring, and scaling large fullstack codebases.

## Core Architectural Principles

1. **Separation of Concerns & Layered Isolation:**
   - **Domain Layer:** Pure entities, types, and business rules. Free of framework dependencies.
   - **Business/Service Layer:** Use cases, domain services, orchestration. Encapsulates business logic and transaction boundaries.
   - **Infrastructure/Data Layer:** Repositories, database entities (TypeORM), external API integrations.
   - **Interface/Controller Layer:** REST endpoints, DTO validation, HTTP guards, route mapping.

2. **Cross-Module Boundaries & Loose Coupling:**
   - Never import internal services directly across disparate domain boundaries without explicit module exports.
   - Use events or well-defined service contracts to avoid circular dependency deadlocks (`forwardRef` should be avoided when possible).

3. **Data Access Integrity:**
   - Always run multi-entity state changes within explicit transactions (`dataSource.transaction(async manager => ...)`).
   - Never execute destructive operations (`DELETE`, `TRUNCATE`, bulk updates) across historical data without strict validation.
   - Prevent N+1 queries by leveraging eager relations, query builder joins, or subqueries.

4. **Frontend Modular Organization (Angular):**
   - Separate feature modules, shared UI components, and singleton core services.
   - Enforce immutable state transitions and clean destruction of RxJS subscriptions via `takeUntil(this.destroy$)`.
   - Never tie visual rendering directly to external network calls without local caching or fallback placeholders.

