---
name: custom-agents
description: Teaches how to design, create, configure, and orchestrate Antigravity Custom Agents and Subagents (.agents/agents/*.md) using YAML frontmatter, execution symmetry (mainAgent/subagent), scoped safety policies (commandExecutionPolicy), tool filtering, and curated skills. Use whenever creating or updating custom agents or configuring agent delegation in Antigravity.
---

# Antigravity Custom Agents Guide

Custom agents in Antigravity are specialized, file-based configurations that define a distinct role with its own scoped instructions, tools, model tiers, and execution policies. They solve two main bottlenecks of general-purpose assistants:
1. **Lack of Specialization**: Instead of explaining repository conventions in every conversation, custom agents bake in domain rules and runbooks.
2. **Context Window Bloat**: Rather than loading a monolithic prompt with every guideline into every session, custom agents isolate instructions and provide access only to the necessary tools and skills.

---

## Agent Locations and Discovery

Antigravity automatically discovers custom agents defined as Markdown (`.md`) files with YAML frontmatter in the following locations:

| Location | Path | Scope |
| :--- | :--- | :--- |
| **Workspace (Project)** | `.agents/agents/<name>.md` or `.agents/agents/<name>/agent.md` | Repository / Team (committed to git) |
| **Global (User)** | `~/.gemini/config/agents/<name>.md` | Machine-wide across all projects |
| **Plugins** | `plugins/<plugin_name>/agents/` | Bundled plugin packages |

---

## Frontmatter Configuration Reference (YAML)

Every custom agent starts with a YAML frontmatter header between `---` delimiters:

```yaml
---
name: agent-identifier
description: Detailed description used by the coordinator/planner agent to decide when to delegate tasks here.
mainAgent: true
subagent: true
model: flash # "inherit" | "flash" | "pro"
permissionMode: acceptEdits # "default" | "acceptEdits" | "bypassPermissions"
commandExecutionPolicy: auto # "sandbox" | "auto" | "eager" | "off"
tools:
  - view_file
  - replace_file_content
  - run_command
skills:
  - skills/target-skill-name
---
```

### Frontmatter Fields

* **`name`** *(string, required)*: Unique identifier for the agent (lowercase, hyphenated).
* **`description`** *(string, required)*: Clear explanation of what the agent does and when it should be chosen. Used by the main agent's planner for subagent delegation.
* **`mainAgent`** *(boolean, default: `true`)*: When `true`, this agent can be selected directly as the primary interactive agent in Antigravity 2.0 GUI or CLI (`agy --agent <name>`).
* **`subagent`** *(boolean, default: `true`)*: When `true`, this agent can be invoked asynchronously by a parent agent via `invoke_subagent`.
* **`model`** *(string, default: `"inherit"`)*: Model tier for execution:
  * `inherit`: Inherits the active model of the parent or session.
  * `flash`: Fast and cost-efficient for focused, iterative tasks (e.g. upgrades, linter fixes).
  * `pro`: Deep reasoning for architectural analysis, audits, and complex refactors.
* **`commandExecutionPolicy`** *(string, default: `"sandbox"`)*:
  * `auto`: Autonomous execution of safe/read commands, build steps, and tests without manual user prompts; destructive commands remain gated.
  * `sandbox`: Executes within isolated sandbox permissions.
  * `eager`: Runs commands eagerly where permitted.
  * `off`: Prompts for approval on all commands.
* **`permissionMode`** *(string)*: Optional general permission mode, such as `acceptEdits`.
* **`tools`** *(string[])*: Strict whitelist of tools accessible to this agent. Prevents tool confusion and reduces prompt bloat.
  * *Common tools*: `view_file`, `replace_file_content`, `multi_replace_file_content`, `write_to_file`, `grep_search`, `list_dir`, `run_command`, `manage_task`, `read_url_content`, `browser_subagent`.
  * *Warning*: Ensure tool names match exact built-in names to avoid hanging validation.
* **`skills`** *(string[])*: Curated list of workspace or global skills loaded for this agent (e.g., `skills/my-workflow`).
* **`mcpServers`** *(object[])*: Scoped MCP server integrations specific to this agent.

---

## System Prompt (Markdown Body)

The Markdown content beneath the YAML header compiles directly into the agent's system prompt. Organize with clean markdown headers:

```markdown
# Core Instructions
Define the agent's persona, primary objective, and core responsibilities.

# Workflow & Procedures
1. Step-by-step process the agent must follow.
2. Verification steps (build, test, lint checks).

# Constraints & Rules
- Specific dos and don'ts.
- Safety boundaries and expected deliverables.
```

---

## Architectural Highlights

### 1. True Symmetry (Main Agent vs. Subagent)
In Antigravity, an agent is not restricted to being just a behind-the-scenes worker. Setting:
```yaml
mainAgent: true
subagent: true
```
allows:
- **Direct Interactive Usage**: You can select the agent in the Antigravity 2.0 dropdown or launch `agy --agent <name>` in CLI.
- **Autonomous Delegation**: A coordinator agent can delegate subtasks to it concurrently.

### 2. Scoped Safety Policies
Using `commandExecutionPolicy: auto` avoids annoying approval prompts when running test suites or incremental builds, while keeping high-risk operations safe.

### 3. Curated Skills & Scoped Toolsets
By specifying only the relevant `tools` and `skills`, the agent stays laser-focused without context dilution from unrelated capabilities.

---

## Standard Blueprints

### Blueprint A: Dependency Modernizer
```markdown
---
name: dependency-modernizer
description: Upgrades dependencies, fixes breaking changes, and validates builds and tests.
model: flash
mainAgent: true
subagent: true
commandExecutionPolicy: auto
permissionMode: acceptEdits
tools:
  - view_file
  - replace_file_content
  - multi_replace_file_content
  - run_command
  - manage_task
---

# Core Instructions
You are a dependency modernizer. Your job is to check configuration files, update target dependencies, run test suites, and verify the build passes.
```

### Blueprint B: Code Quality & Security Auditor
```markdown
---
name: code-auditor
description: Performs security audits, static analysis, and code quality reviews.
model: pro
mainAgent: true
subagent: true
commandExecutionPolicy: sandbox
tools:
  - view_file
  - grep_search
  - list_dir
---

# Core Instructions
You are an expert security auditor. Perform thorough static analysis without altering files unless explicitly asked.
```
