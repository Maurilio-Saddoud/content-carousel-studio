---
slug: "do-this-with-openclaw-so-you-don-t--segment-71-00-20-45-i-take-the-best-possible"
title: "Prompt-injection defense should be layered, not hopeful."
description: "Post-ready carousel distilled from the source video segment at 00:20:45 → 00:21:04."
sourceType: transcript
aspectRatio: portrait
updatedAt: 2026-03-24
theme:
  accent: "#1D9BF0"
  background: "#000000"
  foreground: "#E7E9EA"
  muted: "#71767B"
---

eyebrow: SECURITY
# Prompt-injection defense
should be layered,
not hopeful.

---

eyebrow: FIRST LAYER
# Start with deterministic filtering.

Scan incoming text.
Catch the obvious garbage.
Block the cheap attacks early.

---

eyebrow: SECOND LAYER
# Then use a stronger model
as a review layer.

If something slips past the rules,
let your best model inspect it,
score risk,
and quarantine what looks dirty.

---

eyebrow: WHY THE BEST MODEL
# Your strongest model
is usually more resilient
to adversarial text.

Cheap model for broad work.
Best model for edge-case review.
That trade-off actually makes sense.

---

eyebrow: TAKEAWAY
# External text is guilty until proven clean.

If your agent reads from the web,
email,
or docs,
assume the input can fight back.
