# Agent guide (Cursor)

## GSD (Get Shit Done) in Cursor

This project has **GSD** installed locally (`.claude/get-shit-done/`). You can run GSD workflows from Cursor chat.

### How to run GSD

In Cursor Composer or Chat, say what you want in natural language or use the slash-style commands:

| To do this | Say |
|------------|-----|
| See all commands | **/gsd:help** or "gsd help" |
| Start a new project (vision → requirements → roadmap) | **/gsd:new-project** or "gsd new project" |
| Map this codebase first (brownfield) | **/gsd:map-codebase** or "gsd map codebase" |
| Check status and next step | **/gsd:progress** or "gsd progress" |
| Clarify how phase N should work | **/gsd:discuss-phase N** or "gsd discuss phase 1" |
| Plan phase N | **/gsd:plan-phase N** or "gsd plan phase 1" |
| Execute phase N | **/gsd:execute-phase N** or "gsd execute phase 1" |
| Verify work (UAT) for a phase | **/gsd:verify-work N** or "gsd verify work" |
| Quick one-off task | **/gsd:quick** or "gsd quick" |

The Cursor agent will follow the GSD workflow (see `.cursor/rules/gsd-workflows.mdc`) and use `node ./.claude/get-shit-done/bin/gsd-tools.cjs` where needed.

### Typical flow

1. **New project:** `/gsd:new-project` → answer questions → get PROJECT.md, REQUIREMENTS.md, ROADMAP.md.
2. **Per phase:** `/gsd:discuss-phase 1` (optional) → `/gsd:plan-phase 1` → `/gsd:execute-phase 1` → `/gsd:verify-work 1`.
3. **Check where you are:** `/gsd:progress`.

Artifacts live under `.planning/`. Update GSD with: `npx get-shit-done-cc@latest --claude --local`.
