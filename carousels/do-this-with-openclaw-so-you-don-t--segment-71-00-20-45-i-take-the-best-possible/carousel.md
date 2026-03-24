---
slug: "do-this-with-openclaw-so-you-don-t--segment-71-00-20-45-i-take-the-best-possible"
title: "Prompt-injection defense should be layered, not hopeful."
description: "Matthew Berman on do-this-with-openclaw-so-you-don-t-fall-behind-14-use-cases: deterministic filtering plus model review."
sourceType: transcript
aspectRatio: portrait
updatedAt: 2026-03-24
theme:
  accent: "#1D9BF0"
  background: "#000000"
  foreground: "#E7E9EA"
  muted: "#71767B"
---

# Prompt-injection defense should be layered, not hopeful.

---

# Most people have one defense:

“please be careful.”

That is not a defense.
That is wishful thinking.

---

# The stronger pattern is two layers.

Layer 1:
deterministic sanitation for obvious attack patterns.

Layer 2:
a stronger model reviewing suspicious content that gets through.

---

# Use rules for the obvious.

Use judgment for the ambiguous.

If you rely only on rules,
clever attacks slip through.

If you rely only on models,
you waste tokens on easy cases.

---

# Also assume external text is dirty by default.

Web pages.
Emails.
Docs.
User input.

If outside content can reach your agent,
it can steer your agent.

---

# Good security posture starts with one mindset:

anything your agent ingests
can also attack it.

Architect around that.
