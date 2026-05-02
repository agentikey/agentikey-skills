---
name: architecture-diagram
description: Generate Mermaid diagrams (C4 system context, sequence, ER, state, deployment) for a PRD. Use when the PRD needs a visual that prose can't carry — system context, data model, key flows. Embedded directly in the PRD or as a standalone .mmd file. Plan Mode.
---

# Architecture Diagram

Pick the right diagram type, write it in Mermaid (so it renders in GitHub issues and PRDs), embed it in section 9 or 10 of the PRD.

## Diagram Selection

| If you need to show… | Use this Mermaid type |
| --- | --- |
| What this system is and what it talks to | `flowchart` (C4 Context level) |
| How a request flows across components | `sequenceDiagram` |
| Data shape and relationships | `erDiagram` |
| State of an entity over time (orders, subscriptions) | `stateDiagram-v2` |
| Deployment topology | `flowchart` with subgraphs for envs |

## Operating Rules

1. **Default to one diagram per PRD.** A C4 Context flowchart. More than that is usually over-spec.
2. **Add a sequence diagram only if there's a non-obvious cross-service flow** (e.g., webhook reconciliation, async billing, OAuth dance).
3. **Add an ER diagram only if the schema is non-trivial** (>5 entities or non-obvious cardinality).
4. **Label everything.** Unlabeled arrows are noise.
5. **Mermaid renders in GitHub.** Always wrap in ` ```mermaid ` fences.

## Process

1. Read PRD sections 9–11 (Tech Stack, Data Model, Integrations).
2. Decide which diagrams are *actually* needed. Don't manufacture diagrams to look thorough.
3. Draft them. Show the user. Iterate.
4. Embed them in the PRD inline. Also save as `docs/prd/<slug>/diagrams/<name>.mmd` for re-use.

## Templates

### C4 Context (default — almost every PRD gets this one)

```mermaid
flowchart TB
    subgraph users[Users]
        u1[Primary User]
        u2[Admin]
    end

    subgraph product[Product Boundary]
        web[Web App]
        api[API]
        db[(Database)]
    end

    subgraph external[External Services]
        auth[Auth Provider]
        email[Email Service]
        payment[Payment Processor]
    end

    u1 -->|uses| web
    u2 -->|admins via| web
    web -->|HTTPS| api
    api -->|reads/writes| db
    api -->|verifies sessions| auth
    api -->|sends notifications| email
    api -->|charges| payment
```

### Sequence (for webhook reconciliation, OAuth, async flows)

```mermaid
sequenceDiagram
    actor User
    participant Web
    participant API
    participant Stripe
    participant DB

    User->>Web: Click "Subscribe"
    Web->>API: POST /checkout
    API->>Stripe: Create Checkout Session
    Stripe-->>API: session_url
    API-->>Web: redirect URL
    Web->>Stripe: Redirect to checkout
    User->>Stripe: Complete payment
    Stripe->>API: webhook: checkout.completed
    API->>DB: Mark subscription active
    API-->>Stripe: 200 OK
    Stripe->>User: Redirect to success
```

### ER (when the data model is non-trivial)

```mermaid
erDiagram
    USER ||--o{ ORGANIZATION_MEMBER : "belongs to"
    ORGANIZATION ||--o{ ORGANIZATION_MEMBER : "has"
    ORGANIZATION ||--o{ PROJECT : "owns"
    PROJECT ||--o{ TASK : "contains"
    USER ||--o{ TASK : "assigned"

    USER {
        uuid id PK
        string email
        string name
        timestamp created_at
    }
    ORGANIZATION {
        uuid id PK
        string name
        string plan
    }
```

### State (for entities with non-trivial lifecycle)

```mermaid
stateDiagram-v2
    [*] --> Draft
    Draft --> Submitted: user submits
    Submitted --> UnderReview: assigned reviewer
    UnderReview --> Approved: reviewer accepts
    UnderReview --> Rejected: reviewer denies
    Rejected --> Draft: user revises
    Approved --> [*]
    Rejected --> [*]: user abandons
```

## Anti-Patterns

- One giant diagram with everything ❌
- ER diagrams for 2 tables ❌
- Sequence diagrams for synchronous CRUD ❌
- Decorative diagrams that the prose already explains ❌
- Diagrams without arrow labels — readers can't tell direction or semantics ❌
