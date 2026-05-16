---
description: Scaffold a new IPC channel across all required files. Use when adding any new communication between the main process and renderer.
arguments: [channel-name]
allowed-tools: Read Write Edit
---

Add a new IPC channel named $ARGUMENTS.

First, read all three files to understand the current patterns before editing:
- `src/main/typed-ipc.ts`
- `src/preload/preload.ts`
- `src/preload/interface.d.ts`

Then add the channel to all three files following the existing patterns exactly. All three files must be updated — a channel that exists in only one or two is broken.

**Checklist:**
- [ ] `typed-ipc.ts` — handler registered
- [ ] `preload.ts` — channel exposed via contextBridge
- [ ] `interface.d.ts` — type declared on the `api` interface

After completing, print the checklist with all three items checked and show the exact additions made to each file.
