---
name: brainstorming
version: 1.0
description: "Socratic exploration of requirements before implementation. Ask one targeted question at a time to clarify spec, discover edge cases, and validate design before writing any code."
accepts_args: true
---

# /brainstorming — Socratic Requirements Refinement

**Activation**: Before implementing any medium/complex feature or unclear spec.

---

## Process

### Phase 1 — Clarify the problem (1-2 questions)

Ask ONE question at a time. Wait for answer before proceeding.

```
Q1: What specific problem does this solve? What is success?
Q2: Are there performance, cost, or time constraints?
```

### Phase 2 — Edge cases (2-3 questions)

```
Q3: What happens when [most likely error scenario]?
Q4: What if the user does [action] twice / concurrently?
Q5: What happens at scale? (< 100 / 1K-10K / > 100K entities)
```

### Phase 3 — Design alternatives (1 question)

Present exactly 2 options with pros/cons:

```
Option A: [approach] — ✅ [pro] ❌ [con]
Option B: [approach] — ✅ [pro] ❌ [con]
Which fits better?
```

### Phase 4 — Validate understanding

```
Let me confirm: [summary of all answers]
Flow: [step 1] → [step 2] → [step 3]
Correct? [Y/N]
```

---

## Rules

- ❌ Never ask more than 1 question at once
- ❌ Never start implementing until Phase 4 is confirmed
- ✅ Document all decisions in the design doc output
- ✅ Output: design doc with decisions + acceptance criteria + edge cases table

**Next step after completion**: `/writing-plans`


---
name: writing-plans
version: 1.0
description: "Decompose a feature/bug/refactor into executable tasks of 2-5 minutes each. Each task must have exact file paths, TDD steps, and a verification command. Saves plan to docs/plans/YYYY-MM-DD-<feature>.md"
accepts_args: true
---

# /writing-plans — Task Decomposition

**Input**: Feature description or brainstorming output
**Output**: `docs/plans/YYYY-MM-DD-<feature>.md` with 2-5 min tasks

---

## Process

### 1. Explore the codebase

Use Glob + Grep to find:
- Existing files that will be modified
- Patterns to follow (naming, structure)
- Tests that need updating

### 2. Write the plan

Save to `docs/plans/YYYY-MM-DD-<feature>.md`:

```markdown
# Plan: <Feature Name>

**Date**: YYYY-MM-DD
**Complexity**: simple|medium|complex
**Estimated time**: X min

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2

## Edge Cases
1. Edge case 1 → handling strategy
2. Edge case 2 → handling strategy

---

## Tasks

### Task 1 — <name>
**Agent**: platform-expert|backend-db-expert|frontend-ux-expert|security-expert
**Files**: exact/path/to/file.ts
**Time**: 3-5 min

Steps:
1. [exact step with code snippet]
2. [exact step]
3. Run: `<verification command>`

TDD:
- Write failing test first
- Implement until test passes
- Commit

Verification: `<command that proves this task is done>`
```

### 3. Validate the plan

Before handing off:
- Every task has a verification command
- Tasks are ordered: dependencies first
- No task > 5 min (split if needed)
- Total estimated time is realistic

---

## Rules

- ❌ No pseudocode — exact file paths and real code snippets only
- ❌ No task without a verification command
- ✅ Tasks are sequential (each builds on previous)
- ✅ TDD steps for every implementation task

**Next step after completion**: `/subagent-driven-development`


---
name: sp
version: 1.0
description: Genera un system prompt estructurado y dinámico desde una idea o ruta a historia de usuario. Lo adopta inmediatamente como instrucción activa para la sesión.
---

# /sp — Structured Prompt Generator

Invocation: `/sp "idea o descripción"` · `/sp "ruta/a/HU.md"`

---

## PURPOSE

Transform a raw idea or user story into a fully structured `<system_prompt>` with dynamically selected XML tags. The generated prompt is adopted immediately — Claude follows it from that point forward in the session.

---

## EXECUTION FLOW

### Step 1: Parse Input

Determine input type:

```
IF input matches a file path pattern (contains "/" or "\" or ends in .md/.txt/.json):
  → FILE MODE: Read the file at that path
  → Extract full content

ELSE:
  → IDEA MODE: Use the text directly as the seed
```

### Step 2: Analyze Content

Extract all available signals from the input:

```
task_type        → feature | bug | research | design | security | docs | refactor | consult
domain           → auth | payments | CRUD | UI | infra | notifications | integrations | etc.
stack            → detect from file content OR from active project context (CLAUDE.md known projects)
risk_level       → low | medium | high | critical
                   (high/critical if: auth, payment, encryption, migration, breaking-change)
output_expected  → code | plan | analysis | diagram | document | recommendation
has_criteria     → boolean (does input define acceptance criteria / done conditions?)
has_constraints  → boolean (does input mention restrictions, rules, limitations?)
needs_examples   → boolean (would few-shot examples help execution?)
is_security_task → boolean
requires_tools   → list of relevant MCP servers / skills
```

### Step 3: Clarifying Questions (IDEA MODE only)

If input is an idea (not a file) AND any of the following are unknown after analysis:
- task_type is ambiguous
- target project/app is unclear
- output_expected is undefined
- key technical context is missing

→ Ask clarifying questions **one at a time** until you have enough to generate a complete, precise prompt.

**Rules for questioning:**
- Maximum 4 questions total before generating (don't over-interrogate)
- Prefer multiple-choice when possible
- Each question must unlock a specific tag's content
- Once you have: task_type + domain + output_expected + basic context → proceed to generation

**Do NOT ask** about things you can infer from the active project context (CLAUDE.md known projects, STATE.md, detected stack).

### Step 4: Select Tags Dynamically

Choose only the tags the task actually needs. Do not include empty or boilerplate sections.

**Always include:**
```xml
<identity>        <!-- who Claude is for this specific task -->
<task_specific_instructions>  <!-- the core instruction -->
<constraints>     <!-- what NOT to do -->
```

**Include if applicable:**
```xml
<context>               <!-- when there is project/technical background to establish -->
<user_story>            <!-- when input is or contains a user story -->
<acceptance_criteria>   <!-- when done conditions are defined or inferable -->
<technical_context>     <!-- when specific files, modules, stack details matter -->
<domain_knowledge>      <!-- for specialized domains: payments, auth, multi-tenancy, etc. -->
<tools_available>       <!-- when specific MCP servers or skills should be used -->
<security_constraints>  <!-- for auth / payment / encryption tasks -->
<performance_requirements> <!-- for performance-sensitive tasks -->
<testing_requirements>  <!-- when TDD/SDD approach must be specified -->
<behavioral_guidelines> <!-- when non-obvious behavior must be enforced -->
<output_format>         <!-- when deliverable has a specific required structure -->
<examples>              <!-- when few-shot patterns accelerate execution -->
<meta_instructions>     <!-- for critical/high-risk tasks requiring self-protection rules -->
```

**You may create new tags** if the task requires context that doesn't fit existing ones.
Example: `<api_contract>`, `<tenant_isolation_rules>`, `<migration_strategy>`, `<error_handling_policy>`

### Step 5: Populate Tags

Fill each selected tag with **specific, actionable content** — not generic descriptions.

**Identity** must answer: who am I in this task? (not just "you are Claude")
**Task instructions** must answer: exactly what must be done, step by step if needed
**Constraints** must answer: what would cause failure or incorrect output
**Context** must include: project name, relevant modules, current state if known
**Acceptance criteria** must be: verifiable, concrete conditions

### Step 6: Generate and Adopt

Output the complete structured prompt enclosed in `<system_prompt>` tags.

After outputting it, state:
```
✅ System prompt activo. Ejecutando instrucción...
```

Then immediately begin executing the task described in the prompt — do not wait for additional confirmation.

---

## TAG REFERENCE (Non-Exhaustive)

```xml
<system_prompt>

  <identity>
    <!-- Who Claude is for this task: role, expertise level, perspective -->
    <!-- Example: "Eres un backend engineer especializado en NestJS + TypeORM
                  trabajando en liquilegal_api. Tu enfoque es la correctitud
                  sobre la velocidad y la seguridad sobre la conveniencia." -->
  </identity>

  <context>
    <!-- Project, app, relevant modules, current state, constraints from history -->
  </context>

  <user_story>
    <!-- Full HU content if available, or summary of the idea -->
  </user_story>

  <acceptance_criteria>
    <!-- Concrete, verifiable done conditions -->
    <!-- Format: "✓ [condition]" per line -->
  </acceptance_criteria>

  <technical_context>
    <!-- Stack, file paths, module names, patterns in use -->
    <!-- Include: key files to read/modify, existing patterns to follow -->
  </technical_context>

  <domain_knowledge>
    <!-- Business rules, domain concepts, glossary if needed -->
    <!-- Example: liquidaciones, epayco webhook flow, multi-tenant isolation -->
  </domain_knowledge>

  <capabilities>
    <!-- What Claude is allowed/expected to use: tools, agents, skills -->
  </capabilities>

  <tools_available>
    <!-- MCP servers, skills, agents relevant to this task -->
    <!-- Example: context7 for NestJS docs, web-proxy for API debugging -->
  </tools_available>

  <task_specific_instructions>
    <!-- THE CORE INSTRUCTION — precise, step-by-step if needed -->
    <!-- This is the most important tag. Be specific and unambiguous. -->
  </task_specific_instructions>

  <behavioral_guidelines>
    <!-- How to behave: ask before assuming, one step at a time, etc. -->
  </behavioral_guidelines>

  <constraints>
    <!-- Hard limits: what NOT to do, anti-patterns, banned approaches -->
  </constraints>

  <security_constraints>
    <!-- Auth/payment/encryption-specific rules -->
  </security_constraints>

  <performance_requirements>
    <!-- Latency, query count, index requirements -->
  </performance_requirements>

  <testing_requirements>
    <!-- TDD/SDD, coverage expectations, test file locations -->
  </testing_requirements>

  <output_format>
    <!-- Required format of the deliverable: code style, file structure, etc. -->
  </output_format>

  <examples>
    <!-- Few-shot patterns: existing code to follow, similar implementations -->
  </examples>

  <meta_instructions>
    <!-- Self-protection for critical tasks: verification gates, escalation rules -->
  </meta_instructions>

</system_prompt>
```

---

## EXAMPLES

### Example 1 — File Input (HU)

```
/sp src/context/projects/nella/plans/HU-api-flujo-conversacional.md
```

Flow:
1. Read file → extract HU content, acceptance criteria, stack references
2. Analyze: feature task, NestJS domain, medium risk, output = code + tests
3. Select tags: identity, context, user_story, acceptance_criteria, technical_context, task_specific_instructions, testing_requirements, constraints, output_format
4. Populate with specific content from the HU
5. Generate + adopt + execute

---

### Example 2 — Idea Input (with clarification)

```
/sp "quiero un endpoint para procesar pagos con epayco"
```

Analysis: domain=payments (high risk), stack=NestJS (inferred from active project), task=feature
Missing: which project?, webhook or direct charge?, success/failure handling?

Q1: `¿Para qué proyecto es esto? [liquilegal_api / nella / otro]`
→ User: "liquilegal"

Q2: `¿El endpoint recibe el webhook de epayco o inicia el cobro?`
→ User: "recibe el webhook"

Enough context → generate with: identity (payment security expert), context (liquilegal_api), task_specific_instructions (webhook handler), security_constraints (signature verification, idempotency), constraints (no storing raw payment data), testing_requirements (SDD scenario first)

---

### Example 3 — Simple Idea (no clarification needed)

```
/sp "refactoriza el módulo de auth de nella para separar la lógica de JWT en su propio service"
```

Analysis: refactor task, nella project, auth domain (high risk), output=code
All context inferrable → generate directly without questions.

---

## ANTI-PATTERNS

❌ Generating a generic/template prompt that could apply to any task
❌ Including all tags always (only include what adds value)
❌ Asking more than 4 clarifying questions
❌ Asking about things inferable from CLAUDE.md project context
❌ Generating without executing (always adopt + begin immediately)
❌ Writing vague task instructions ("implement the feature") instead of precise steps

✅ Every tag must earn its place with specific content
✅ The prompt must be narrower and more precise than a general instruction
✅ After generating, execute immediately
