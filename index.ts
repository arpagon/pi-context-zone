/**
 * pi-context-zone — Visual context health monitor
 *
 * A single status-bar indicator that shows where you are
 * in the smart → dumb zone spectrum (Dex Horthy / 12-factor agents).
 *
 * Usage:
 *   pi -e ./index.ts
 *   pi install npm:pi-context-zone
 */

import type { ExtensionAPI, ExtensionContext } from "@mariozechner/pi-coding-agent";

const STATUS_KEY = "context-zone";
const BAR_LEN = 20;

// Zone thresholds (% of context window)
const WARN = 40;
const DANGER = 70;

const rgb = (r: number, g: number, b: number) => `\x1b[38;2;${r};${g};${b}m`;
const bold = "\x1b[1m";
const dim = "\x1b[2m";
const reset = "\x1b[0m";

// Zone boundary positions in the bar
const WARN_POS = Math.round((WARN / 100) * BAR_LEN);
const DANGER_POS = Math.round((DANGER / 100) * BAR_LEN);

// Smooth green → yellow → red
function barColor(pct: number): string {
  if (pct < WARN) return rgb(0, 210, 80);       // green
  if (pct < DANGER) return rgb(255, 200, 0);     // yellow
  return rgb(255, 50, 30);                        // red
}

function zone(pct: number): { icon: string; label: string; ceiling: number } {
  if (pct < WARN) return { icon: "🧠", label: "smart", ceiling: WARN };
  if (pct < DANGER) return { icon: "⚠️", label: "warm", ceiling: DANGER };
  return { icon: "🧟", label: "dumb", ceiling: 100 };
}

function render(pct: number): string {
  const filled = Math.round((pct / 100) * BAR_LEN);
  const { icon, label, ceiling } = zone(pct);
  const left = Math.max(0, Math.round(ceiling - pct));

  const dividerColor = rgb(100, 100, 120);
  const emptyColor = rgb(60, 60, 70);
  const color = barColor(pct);

  let bar = "";
  for (let i = 0; i < BAR_LEN; i++) {
    // Zone dividers at boundaries
    if (i === WARN_POS || i === DANGER_POS) {
      bar += dividerColor + "│" + reset;
      continue;
    }
    if (i < filled) {
      bar += color + "█";
    } else {
      bar += emptyColor + "░";
    }
  }

  return `${icon} ${bar}${reset} ${dim}${label} ${bold}${left}%${reset}${dim} left${reset}`;
}

function update(ctx: ExtensionContext): void {
  if (!ctx.hasUI) return;
  const usage = ctx.getContextUsage();
  if (!usage || usage.percent === null) {
    ctx.ui.setStatus(STATUS_KEY, undefined);
    return;
  }
  ctx.ui.setStatus(STATUS_KEY, render(usage.percent));
}

export default function (pi: ExtensionAPI) {
  pi.on("turn_end", (_e, ctx) => update(ctx));
  pi.on("session_compact", (_e, ctx) => update(ctx));
  pi.on("session_start", (_e, ctx) => update(ctx));
  pi.on("agent_end", (_e, ctx) => update(ctx));
}
