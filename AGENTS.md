# AGENTS.md --- Photofolio

## 1. Project Overview

-   **Project:** Photofolio --- Photographer Portfolio & Client Gallery Platform.
-   **Architecture:** Single-repository modular monolith.
-   **Repository:** Frontend and backend application code must remain in the same Next.js repository unless an explicit architecture decision changes this.
-   **Goal:** Help photographers showcase their work, deliver branded client galleries, collect client selections and generate new business inquiries.
-   **Product philosophy:** Simplicity-first, minimalistic, photography-focused and easy to understand.
-   **Primary principle:** The interface should frame the photography, never compete with it.

## 2. Instructions for AI Coding Agents

Before starting any task:

1.  Inspect the existing repository, relevant implementation and current Git changes.
2.  Read `AI_CONTEXT.md` if it exists.
3.  Read this file and follow the applicable project conventions.
4.  For any visual or interaction work, read `.agents/skills/photofolio-visual-system/SKILL.md`.
5.  Read the relevant phase prompt or feature specification if one exists.
6.  Identify dependencies, affected modules, security implications and tests before editing.

General rules:

-   Never assume a feature, endpoint, component or database policy exists or works without inspecting it.
-   Reuse existing components, services, hooks, utilities and design tokens where appropriate.
-   Avoid unnecessary dependencies, duplicated logic and overengineering.
-   Do not replace working functionality or introduce breaking changes without explaining the reason and impact.
-   Do not invent product requirements. If an important requirement or architectural decision is unclear, ask a focused question or document the assumption before proceeding.
-   Do not claim that a task is complete until implementation and relevant checks have been performed.
-   Do not silently discard unrelated user changes.

## 3. Code Readability and Beginner-Friendly Explanations

The project owner is learning the codebase. Write code that is
understandable to a developer who is still building experience.

-   Use clear, descriptive names for variables, functions, components, types and files.
-   Add meaningful comments for complex logic, business rules, security decisions and non-obvious implementation choices.
-   Explain **why** a decision is made, not merely what the next line does.
-   Add JSDoc to important reusable functions and public interfaces when it improves understanding.
-   Explain unfamiliar patterns or framework-specific behaviour in concise comments or the task summary.
-   Keep functions and components focused and reasonably small.
-   Avoid redundant comments that simply restate the code.
-   Prefer straightforward solutions over clever abstractions.
-   Do not add comments to every line; comment where the reasoning would otherwise be difficult to infer.

## 4. Architecture and Technology Rules

-   Use Next.js App Router with TypeScript, following the versions and conventions already established in the repository.
-   Maintain a modular monolith: UI, application/business logic and data-access concerns must be separated within the same repository.
-   Keep feature-specific code organised into clear modules. Avoid turning the application into a collection of unrelated global utilities.
-   Use server-side operations for sensitive business logic and privileged data access.
-   Use Supabase for authentication, PostgreSQL and object storage, unless the repository contains an explicitly approved change.
-   Use Zod for validating untrusted input at appropriate boundaries.
-   Keep shared TypeScript types and DTO/contracts in a clear, reusable location.
-   Avoid duplicating business rules between UI, route handlers, server actions and data-access code.
-   Choose Server Components by default; use Client Components only when browser interaction or client-side state requires them.
-   Keep secrets and service-role credentials on the server. Never expose them through client bundles or public environment variables.
-   Do not add a separate backend repository or microservice without an explicit architecture decision. Design module boundaries so extraction remains possible if future scale or team needs justify it.

## 5. Data Access, Authentication and Security

-   Treat the server as the security boundary. Client-side checks improve UX but do not replace server-side authorization.
-   Verify the authenticated user and their permissions for every protected operation.
-   Enforce user-level data isolation in application logic and Supabase Row Level Security (RLS) policies.
-   Enable and test RLS on tables exposed to application clients, using least-privilege policies.
-   Never trust user IDs, ownership fields, prices, roles, file paths or permissions supplied by the client without server-side verification.
-   Validate and normalize all untrusted input on the server.
-   Use parameterized database access and safe query patterns.
-   Protect original photographs from public access. Use private storage and appropriately scoped, expiring access mechanisms where required.
-   Treat preview images as a separate controlled asset when the product requirements call for them.
-   Check file type, size and upload permissions. Do not rely only on filename extensions or browser-side validation.
-   Avoid logging passwords, tokens, private image URLs, personal client information or other secrets.
-   Never commit credentials, private keys, production data or `.env` files.
-   Keep environment variable examples documented with placeholder values only.
-   Consider abuse prevention, rate limiting and safe error messages for public-facing endpoints and inquiry forms.

## 6. Project Documentation

Maintain these root-level documents:

### `AI_CONTEXT.md`

Use this as the concise, current knowledge base for transferring project
context between coding agents. Include, where relevant:

-   Project overview, goals and product scope.
-   Key files and important resources.
-   Tech stack and version-sensitive setup notes.
-   System topology and application architecture.
-   Module boundaries and responsibilities.
-   Database architecture, tables, relationships and important constraints.
-   Shared DTOs, TypeScript contracts and validation schemas.
-   Service communication and data-access patterns.
-   Quick start, prerequisites and setup instructions.
-   Environment variables and configuration.
-   Project and source structure.
-   Navigation and route structure.
-   Authentication, authorization and session flow.
-   State management conventions.
-   API integration and endpoint references.
-   Theme system and visual-design skill reference.
-   Key coding conventions and architectural decisions.
-   Implementation status: completed, in progress, blocked and planned.
-   Known limitations, technical debt and unresolved decisions.
-   Testing strategy and commands.
-   Deployment and operational architecture.
-   Current phase, next recommended task and roadmap for future phases.

Keep it useful for a new agent: concise summaries, links to source files and explicit status are preferable to copying large amounts of source code. Distinguish implemented behaviour from planned behaviour.

### `API.md`

Document every implemented API endpoint, including:

-   HTTP method and route.
-   Purpose and owning module.
-   Authentication and authorization requirements.
-   Path parameters, query parameters and required headers.
-   Request body schema and validation rules.
-   Success response shape and relevant status codes.
-   Error response shape and failure status codes.
-   Side effects and relevant database/storage operations.
-   Rate limits or other operational constraints, where implemented.

Do not list planned endpoints as implemented. Mark planned endpoints clearly if they are useful to the roadmap. Update the document when endpoint behaviour or contracts change.

### `README.md`

Maintain a root README with:

-   Product overview and current capabilities.
-   Prerequisites.
-   Installation and local setup.
-   Environment configuration.
-   Development, lint, type-check, test and build commands.
-   High-level repository structure.
-   Database migration and local development guidance.
-   Deployment instructions and relevant operational notes.

This is currently a single-repository application, not a microservice system. Do not create per-service README files unless independently deployable services are introduced by an explicit architecture decision.

## 7. Documentation Accuracy and Auditing

-   Source code, migrations, policies and tests are the source of truth for implemented behaviour.
-   Update documentation in the same task as the implementation whenever architecture, setup, routes, data contracts, security or feature status changes.
-   Audit `AI_CONTEXT.md`, `API.md` and `README.md` against the actual implementation after significant changes.
-   Search the repository for the relevant routes, schemas, migrations, policies and components before documenting them.
-   Remove stale, duplicated or unsupported statements.
-   Never describe a planned feature as completed or an untested policy as secure.
-   Record important assumptions, blockers, unresolved decisions and technical debt.
-   Use these status labels consistently: `PLANNED`, `IN_PROGRESS`, `BLOCKED`, `COMPLETED`, `DEPRECATED`.
-   Keep context-transfer documentation concise enough that another agent can quickly understand the project and continue work.

## 8. UI/UX and Visual Consistency

Before creating, reviewing or modifying any UI, UX, route, component,
form, dashboard, marketing page, onboarding flow or client gallery:

1.  Read `.agents/skills/photofolio-visual-system/SKILL.md`.
2.  Follow its palette, typography, spacing, layout, component, interaction, responsive and accessibility rules.
3.  Extend the existing design system instead of inventing a separate visual language.

Design principles:

-   Minimalism, generous whitespace and photography-first presentation.
-   Warm, restrained neutral colours with a sparing accent.
-   Clear hierarchy and concise interface copy.
-   Reusable components and consistent interaction patterns.
-   Responsive behaviour across mobile, tablet and desktop.
-   Accessible contrast, keyboard navigation, focus states, labels and meaningful alternative text.
-   Subtle transitions only when they improve feedback or comprehension.
-   Avoid unnecessary gradients, decorative illustrations, visual clutter, excessive shadows and gratuitous animation.
-   Use real product photography or purposeful image placeholders; do not use generic stock imagery as decoration where it weakens the product experience.

Keep the photographer workspace efficient and the client gallery editorial, calm and image-led. They may have different layouts, but must share the same underlying design system.

## 9. Product and Feature Implementation

-   Follow the approved phase scope and acceptance criteria.
-   Build incrementally; do not implement future-phase functionality unless requested or required by an agreed dependency.
-   Keep photographer-owned data and client-facing/public data boundaries explicit.
-   Design gallery visibility, access controls, publication state and client access deliberately.
-   Ensure actions such as upload, publish, favourite and inquiry submission provide clear loading, success and error feedback.
-   Provide useful empty, loading, error and permission-denied states.
-   Do not use fake data in production flows. Clearly label fixtures and mock data used for development or tests.
-   Preserve original image quality and metadata requirements as defined by the feature specification; do not silently transform or discard originals.
-   Consider performance for image-heavy pages, including responsive image delivery, lazy loading and pagination or progressive loading where appropriate.

## 10. Testing and Quality

-   Add or update tests for each meaningful feature.
-   Test business logic and validation independently where practical.
-   Test authentication and authorization boundaries, including cross-user access attempts.
-   Test RLS policies and storage access policies against both allowed and denied cases.
-   Test upload constraints, invalid inputs, failure handling and duplicate submissions where relevant.
-   Test public/client gallery access according to its configured visibility and protection rules.
-   Test responsive UI behaviour and important keyboard interactions.
-   Run relevant linting, type checking, unit/integration tests and production builds.
-   Report exactly which checks were run, which passed, which failed and which were not run.
-   Never claim tests passed if they were not executed.

## 11. Implementation Workflow

For each task:

1.  Inspect the repository, relevant code, documentation and current changes.
2.  Read applicable project and visual-system instructions.
3.  Confirm the task scope and acceptance criteria.
4.  Identify affected modules, data changes, security risks and dependencies.
5.  Briefly state the implementation approach and files expected to change.
6.  Implement the smallest complete solution consistent with the architecture.
7.  Add or update tests.
8.  Run relevant quality and security checks.
9.  Audit and update `AI_CONTEXT.md`, `API.md` and `README.md` where applicable.
10. Summarize changed files, behaviour, decisions, test results and remaining issues.

If blocked, explain the specific blocker and do not hide incomplete work
behind placeholder success states.

## 12. Context Transfer Between AI Agents

-   Keep `AI_CONTEXT.md` current after significant work.
-   Record decisions and the reasons behind them, especially decisions that are not obvious from code.
-   Link to key implementation files rather than duplicating their contents.
-   Record the current phase, completed acceptance criteria, in-progress work, blockers and next recommended task.
-   Ensure a new coding agent can continue from repository documentation without depending on previous chat history.
-   When asked to audit or transfer context, compare the documentation with the actual code before updating it.

## 13. Development Principles

1.  Simplicity over unnecessary complexity.
2.  Security and privacy over convenience.
3.  Readability over cleverness.
4.  Reuse over duplication.
5.  Consistent UX over isolated visual creativity.
6.  Incremental delivery over large unreviewed changes.
7.  Verified implementation over assumptions.
8.  Accurate documentation over optimistic status reporting.

Always preserve the existing architecture and follow the approved product roadmap unless explicitly instructed otherwise.
