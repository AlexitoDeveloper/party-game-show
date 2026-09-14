# Subagents & Orchestration Reference

Antigravity subagents provide asynchronous, parallel task execution with isolated context windows.

## Subagent Lifecycle

```
[Parent Agent] --invoke_subagent--> [Subagent Spawned (Running)]
                                                |
                                      (Executes instructions)
                                                |
                                                v
[Parent Agent] <--Task Notification-- [Subagent Completed (Idle)]
```

### 1. Invocation (`invoke_subagent`)
* **Workspace Isolation**:
  * `inherit`: Inherits the active project directory.
  * `branch`: Spins up an isolated Git worktree for scratch experimentation.
  * `share`: Shares directory storage without conflicts.
* **Context Isolation**: Subagents begin with a fresh context window. The parent does not transmit its prior conversation history, keeping execution crisp and token-efficient.

### 2. Execution & Monitoring
* Subagents execute concurrently in the background.
* In Antigravity 2.0 GUI, progress is visible in the Auxiliary Subagents pane.
* In Antigravity CLI, switch between subagents using `Alt+J` or kill with `k`.

### 3. Completion & Coordination
* When finished, the subagent returns a concise report to the coordinator/parent agent.
* The parent resumes execution reactively upon receiving notification.
