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

eyebrow: AI SECURITY
# Prompt-injection defense should be layered, not hopeful.

“Be careful” is not a security strategy.

---

eyebrow: LAYER ONE
# Use deterministic filtering for obvious attack patterns.

Catch the cheap stuff with rules.

Do not spend model judgment on cases code can reject instantly.

---

eyebrow: LAYER TWO
# Then use a stronger model for ambiguous cases.

Rules miss clever attacks.

Model review catches more of the weird edge cases that matter.

---

eyebrow: THE MENTAL MODEL
# Treat external text as hostile until proven otherwise.

Web pages.
Emails.
Docs.
User input.

If your agent can ingest it,
it can also be steered by it.

---

eyebrow: OPERATOR RULE
# Good security posture starts with one assumption:

anything entering the system can also attack the system.

Architect from that premise.
