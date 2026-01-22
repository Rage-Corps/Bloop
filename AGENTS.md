<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

# Docker Development

All development is done via Docker using the dev compose file.

## Compose Files

- **docker-compose.dev.yml**: Used for development
- **docker-compose.prod.yml**: Used for production

## Database

The database is shared between dev and prod environments.

## Making Changes

When making changes to the codebase, you must ensure that both compose files build correctly with no broken containers.

Before committing changes, verify both compose files:
```bash
docker-compose -f docker-compose.dev.yml build
docker-compose -f docker-compose.prod.yml build
```