---
slug: "do-this-with-openclaw-so-you-don-t--segment-67-00-19-30-i-want-to-show-some-tips"
title: "If your agent can loop forever, your security model is incomplete."
description: "Matthew Berman on do-this-with-openclaw-so-you-don-t-fall-behind-14-use-cases: runtime governance matters as much as prompt defense."
sourceType: transcript
aspectRatio: portrait
updatedAt: 2026-03-24
theme:
  accent: "#1D9BF0"
  background: "#000000"
  foreground: "#E7E9EA"
  muted: "#71767B"
---

# If your agent can loop forever, your security model is incomplete.

---

# People think security means “don’t get hacked.”

But agents can also hurt you by being expensive,
recursive,
and unstoppable.

That is a security problem too.

---

# Add runtime governance.

Spending caps.
Volume limits.
Loop detection.
Kill switches.

Not because your agent is evil.
Because software drifts.

---

# A bad outcome does not need data exfiltration.

It can just be:
10,000 useless model calls,
a wrecked quota window,
and a bill you did not intend to buy.

---

# Guardrails should exist at runtime,
not only in prompts.

Prompting says what the agent should do.
Runtime governance limits what it can keep doing when something goes wrong.

---

# Strong operators protect three things:

data
actions
spend

If you only protect the first two,
you are still exposed.
