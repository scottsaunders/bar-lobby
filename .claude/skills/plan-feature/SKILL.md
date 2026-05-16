---
description: Plan a new UI feature fully before any code is written. Must be invoked before starting implementation of any new feature or significant UI change.
disable-model-invocation: true
---

Before writing a single line of code, produce a complete feature plan for: $ARGUMENTS

Do not edit any files until this plan is reviewed and approved.

## Plan structure

**1. Feature summary**
One paragraph describing what this feature does and how the user interacts with it.

**2. Components**
List every Vue component that needs to be created or modified. For each:
- File path
- What it does
- Whether it uses existing controls/common components or needs new ones

**3. State**
- Which store(s) are involved (`src/renderer/store/`)
- New reactive state needed
- Any store methods to add

**4. IPC channels** (if any)
- Channel name and direction (main→renderer or renderer→main)
- Files to update: `typed-ipc.ts`, `preload.ts`, `interface.d.ts`

**5. Routing** (if any)
- New view files and their routes
- Route metadata needed

**6. Design system notes**
- Which shared components from `controls/` and `common/` will be used
- Any new patterns that don't have an existing component

**7. Known gotchas**
Call out any of these that apply:
- Iconify icons → use direct imports, not string API
- Route reactivity → `useRouter().currentRoute.value` if outside RouterView
- JSON in stores → dynamic import only
- Compact navbar widgets → don't snap font-size to design scale

**8. Open questions**
Anything that needs clarification before implementation can begin.

---

After presenting the plan, ask: "Does this plan look correct? Should anything change before we start?"

Do not proceed to implementation until explicitly told to.
