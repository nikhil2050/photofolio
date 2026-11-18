# AGENTS.md — Photofolio

## 1. Project Overview

- Project: Photofolio.
- Architecture: Single-repository modular monolith.
- Frontend and backend must reside in the same Next.js repository.
- Goal: Enable photographers to create portfolios, deliver branded client galleries and generate new business inquiries.
- Follow a simplicity-first, minimalistic, photography-focused product philosophy.

## 2. Instructions for AI Coding Agents

- Always inspect the existing codebase before making changes.
- Read `AI_CONTEXT.md` before implementing any feature.
- Read `.agents/skills/photofolio-visual-system/SKILL.md` before making UI or UX changes.
- Never assume an existing feature, endpoint or component works without checking its implementation.
- Reuse existing components, services, hooks and utilities wherever possible.
- Avoid unnecessary dependencies and overengineering.
- Do not introduce breaking changes without explaining them.
- Never overwrite existing working functionality unnecessarily.
- Ask for clarification when an important architectural decision is unclear.

## 3. Code Readability and Comments

- Write clean, maintainable, beginner-friendly code.
- Add meaningful comments explaining complex logic, business rules and architectural decisions.
- Explain WHY something is implemented, not simply WHAT the code does.
- Use descriptive variable, function, class and file names.
- Avoid unnecessary comments and redundant documentation.
- Keep functions small and focused.
- Add JSDoc comments for important reusable functions and public interfaces.
- Explain unfamiliar design patterns or advanced concepts where appropriate.

## 4. Architecture and Technology Rules

- Use Next.js App Router with TypeScript.
- Maintain a modular monolith architecture.
- Keep UI, business logic and database access separated.
- Use server-side operations for sensitive business logic.
- Do not expose service-role credentials or private environment variables to the browser.
- Use Supabase for authentication, PostgreSQL and object storage.
- Use Zod for input validation.
- Follow secure authentication, authorization and data-access practices.
- Enforce Row Level Security (RLS) wherever applicable.
- Do not duplicate business logic between UI and API layers.

## 5. Project Documentation

Maintain the following documentation files:

### AI_CONTEXT.md

Maintain a comprehensive project context document containing:

- Project overview and objectives.
- Key files reference.
- Technology stack and resources.
- System topology and architecture.
- Application module boundaries.
- Database architecture and relationships.
- Shared DTOs and TypeScript contracts.
- Service communication patterns.
- Quick start and setup instructions.
- Environment variables.
- Project structure.
- Navigation structure.
- Authentication and authorization flow.
- State management.
- API integration.
- Theme and design system.
- Key conventions.
- Implementation status.
- Completed, in-progress and blocked tasks.
- Future phases and roadmap.
- Known limitations and technical debt.
- Testing strategy.
- Deployment architecture.

Only document features that exist or are explicitly planned. Clearly distinguish implementation status.

### API.md

- Document all implemented API routes and endpoints.
- Include HTTP method, endpoint, purpose and authentication requirements.
- Document request parameters, headers and body.
- Include response structures and status codes.
- Document validation and error responses.
- Include authorization and security requirements.
- Keep documentation synchronized with actual implementation.

### README.md

- Maintain a root README.md.
- Include project overview, prerequisites, installation, configuration and startup instructions.
- Explain the project structure.
- Include development, testing and build commands.
- Document deployment instructions.
- If the project is later split into independently deployable services, each service must have its own README.md.

## 6. Documentation Accuracy and Auditing

- Documentation must reflect actual source code.
- Never document an endpoint as implemented when it is only planned.
- Audit AI_CONTEXT.md and API.md after significant architectural or functional changes.
- Audit README.md whenever setup, dependencies or deployment instructions change.
- Update documentation in the same task as the implementation.
- Remove outdated or duplicated information.
- Record blocked items and unresolved architectural decisions.
- Use explicit status labels: PLANNED, IN_PROGRESS, BLOCKED, COMPLETED and DEPRECATED.

## 7. UI/UX and Design Consistency

- Before creating, reviewing, or modifying any UI, UX, route, component, form, dashboard, marketing page, onboarding flow, or client gallery, read and follow `.agents/skills/photofolio-visual-system/SKILL.md`.
- Treat the Photofolio visual-system skill as the authoritative visual and interaction system.
- Maintain consistent typography, spacing, colours, buttons, forms and navigation.
- Prioritize minimalism, whitespace and photography.
- Use reusable components instead of creating page-specific duplicates.
- Ensure responsive layouts for mobile, tablet and desktop.
- Follow accessibility best practices.
- Avoid unnecessary animations, gradients and decorative elements.

## 8. Security and Privacy

- Never commit secrets, API keys or credentials.
- Validate all user input on the server.
- Enforce user-level data isolation.
- Protect original photographs from public access.
- Use controlled previews and secure access policies.
- Implement proper authentication and authorization.
- Never trust client-side authorization alone.
- Follow privacy and copyright requirements.

## 9. Testing and Quality

- Test every new feature before marking it complete.
- Add unit and integration tests where appropriate.
- Test API validation and error handling.
- Test authentication and authorization boundaries.
- Test database RLS policies and cross-user data isolation.
- Verify responsive UI behaviour.
- Run linting, type checking and production builds when applicable.
- Report tests that were not executed.

## 10. Implementation Workflow

For every feature:

1. Inspect existing code and documentation.
2. Understand dependencies and architectural boundaries.
3. Identify files that need modification.
4. Explain the proposed implementation briefly.
5. Implement the feature.
6. Add appropriate tests.
7. Run relevant quality checks.
8. Update AI_CONTEXT.md, API.md and README.md where applicable.
9. Summarize modified files and implementation decisions.
10. Clearly report completed work, outstanding issues and blockers.

## 11. Context Transfer Between AI Agents

- Keep AI_CONTEXT.md concise, accurate and up to date.
- Treat source code as the ultimate source of truth.
- Update implementation status after every significant task.
- Record important decisions and their reasoning.
- Include the next recommended development task.
- Ensure another coding agent can understand the project without relying on previous chat conversations.

## 12. Important Development Principles

- Simplicity over unnecessary complexity.
- Security over convenience.
- Reusability over duplication.
- Maintainability over shortcuts.
- Consistent UX over isolated visual creativity.
- Incremental development over implementing everything at once.

Always preserve the existing architecture and follow the project roadmap unless explicitly instructed otherwise.
