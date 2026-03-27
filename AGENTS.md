# pi-context-zone

Visual context health bar for pi coding agent — smart/warm/dumb zone indicator.

## Structure

- `index.ts` — single-file extension: progress bar + zone detection + setStatus()

## Quick start

```bash
pi -e ./index.ts
```

## Architecture

- **Status bar**: `ctx.ui.setStatus()` with ANSI true-color progress bar
- **Zone thresholds**: 40% (smart→warm), 70% (warm→dumb)
- **Events**: `turn_end`, `agent_end`, `session_compact`, `session_start`
- **Data source**: `ctx.getContextUsage()` → percent of context window
- **Colors**: green (smart) → yellow (warm) → red (dumb)
- **Dividers**: `│` at 40% and 70% positions in the bar
