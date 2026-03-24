# Raw Transcript

- Title: Nvidia Just Open-Sourced What OpenAI Wants You to Pay Consultants For.
- Creator: AI News & Strategy Daily | Nate B Jones
- URL: https://www.youtube.com/watch?v=7AO4w4Y_L24&t=1102s&pp=ygUMbmF0ZSBiIGpvbmVz

---

[00:00:00] Right now there's a battle playing out
[00:00:01] at the heart of agent world and it's a
[00:00:03] battle between titans, right? Nvidia's
[00:00:05] on one side with Nemo Claw, OpenAI and
[00:00:07] Enthropic are on the other side. If
[00:00:09] you're telling me Nate, no, no, no,
[00:00:11] they're all building agents, I'm the
[00:00:12] first to agree with you. That's not the
[00:00:14] point. The point is that Anthropic and
[00:00:17] Open AAI spent a year in 2025 figuring
[00:00:21] out that the companies they work with
[00:00:24] did not have the expertise to actually
[00:00:26] apply the solutions they were giving
[00:00:28] them. So they would launch cool stuff
[00:00:30] like codec and claude code and see it
[00:00:32] suffer in production when they could not
[00:00:34] figure out how to get actual teams at
[00:00:36] actual businesses to adopt them in ways
[00:00:38] that they themselves were using
[00:00:40] internally right anthropic ships I swear
[00:00:42] every 8 hours right and open AAI ships
[00:00:44] very very fast as well but they weren't
[00:00:46] seeing those speed ups at other
[00:00:47] companies and they could not figure out
[00:00:48] why and so now because of that year of
[00:00:51] failures open AI and anthropic are very
[00:00:54] publicly tying up with big consulting
[00:00:57] firms and they're doing that because
[00:00:58] they know that they need to find ways to
[00:01:01] work with services firms to get their
[00:01:03] actual content, their actual code into
[00:01:07] the hands of people in a way that's
[00:01:10] accessible to them. It turns out that AI
[00:01:13] doesn't teach itself, at least not for
[00:01:15] most people. And I think that's a bitter
[00:01:17] lesson that Enthropic and OpenAI have
[00:01:19] learned. I don't know that Nvidia agrees
[00:01:21] because on the other side of this,
[00:01:23] Nvidia just launched Nemo Claw and the
[00:01:26] backstory there is very very different.
[00:01:28] Nemo claw came from the open claw
[00:01:31] moment, right? Jensen walked out onto
[00:01:34] the stage and he said this is the
[00:01:36] future, right? The future is open claw
[00:01:39] because the future is an agentic
[00:01:41] operating system. And that's what he
[00:01:42] saw. And so regardless of what you think
[00:01:44] about OpenClaw the piece of software
[00:01:47] that Peter Steinberger coded, OpenClaw
[00:01:50] the system, OpenClaw the paradigm,
[00:01:52] OpenClaw the idea, that's what Judson
[00:01:54] was talking about. And he wanted to take
[00:01:56] that idea and bring it securely to the
[00:01:59] enterprise. Because of course the big
[00:02:01] thing with OpenClaw if you're in
[00:02:02] business is it's not secure. It's not
[00:02:04] something you can lock down well.
[00:02:06] There's lots and lots of issues with
[00:02:08] giving your agent access to your stuff
[00:02:10] and the open internet. And so Nemo Claw
[00:02:12] is designed to be a lot more locked
[00:02:14] down. So what makes Nemo claw tick? Nemo
[00:02:17] claw is actually an add-on to OpenClaw.
[00:02:19] It's not that it replaces it entirely.
[00:02:21] It's that it's designed to run in
[00:02:23] OpenShell, which is Nvidia's proprietary
[00:02:25] runtime environment. And that ensures
[00:02:28] that Nvidia is able to wrap the open
[00:02:30] call instance in a way that's secure. So
[00:02:32] it has policybased guard rails which are
[00:02:34] YAML declarations which the agent has to
[00:02:37] follow. It has model constraints which
[00:02:38] do two jobs. Job one is ensuring that
[00:02:41] Nvidia can validate the safety, but
[00:02:43] really job two is ensuring that Nvidia
[00:02:45] gets to serve the model because one of
[00:02:47] Jensen's larger moves here is to go from
[00:02:49] just managing the chip layer to move
[00:02:51] into the Agentic world because in his
[00:02:53] business he needs to go from just
[00:02:56] selling chips to scaling up to sell more
[00:02:58] of the value chain. And he's convinced
[00:03:00] Agentic is a big piece of it and hence
[00:03:02] Nemoclaw. Nemoclaw also runs on local
[00:03:04] first compute. And yes, as you'd expect,
[00:03:07] there's an Nvidia play there because
[00:03:08] Nemoclaw is designed to run safely and
[00:03:10] efficiently on Nvidia chips that run
[00:03:13] locally. Nemo Claw is very much a
[00:03:15] strategic play for Jensen because what
[00:03:16] Jensen is trying to do is he's trying to
[00:03:19] figure out how to pivot into an
[00:03:22] ecosystem play where everybody who has
[00:03:25] all of this energy around OpenClaw will
[00:03:27] be indirectly contributing to value in
[00:03:30] Nemoclaw, which he can then sell to
[00:03:32] enterprise. Like that's the dance he's
[00:03:34] trying to walk here. And by the way, if
[00:03:35] you're a contributor to OpenClaw and
[00:03:37] that makes you annoyed, I get it. This
[00:03:38] is just part of how corporate works. And
[00:03:40] so the long and the short of it is that
[00:03:42] Jensen is bolting on enterprisegrade
[00:03:44] compliance and security solutions as a
[00:03:47] patch, as a layer over the top of
[00:03:49] OpenClaw to make it something with an
[00:03:52] open framework that runs on Linux that
[00:03:54] enterprises can pick up and use. Whether
[00:03:56] or not you find that believable, I want
[00:03:59] you to step back and look at how this
[00:04:01] assumes competence on the part of
[00:04:04] enterprises. Remember, we started this
[00:04:06] video and we talked about the story
[00:04:08] anthropic and open AI have been telling
[00:04:10] themselves where they recognized very
[00:04:12] publicly over the last year or so that
[00:04:15] their solutions were too complicated to
[00:04:18] successfully roll out to engineering
[00:04:20] teams at enterprises. Now, here comes
[00:04:23] Jensen onto the stage and he says, "You
[00:04:25] know what? You developers are smart. You
[00:04:27] developers can figure this out. People
[00:04:29] are already using OpenClaw by the
[00:04:31] hundreds of thousands. You guys got
[00:04:34] this. Let me just roll out this
[00:04:36] open-source framework and we're good to
[00:04:37] go. And you know what? I think one of
[00:04:39] the things I notice about Jensen's
[00:04:41] approach. It's not necessarily the
[00:04:43] corporate strategy here. It's actually
[00:04:45] the fact that a lot of what he focuses
[00:04:47] on are basics that we have known in data
[00:04:50] backend engineering for a long time. And
[00:04:52] this is something that I keep coming
[00:04:55] back to and thinking about as I go
[00:04:57] through change management processes with
[00:05:00] companies. I recognize that in many many
[00:05:02] ways what consultants are making
[00:05:05] complicated today is actually the
[00:05:07] age-old practice of good data
[00:05:10] engineering that turns out to be super
[00:05:12] useful in the age of AI. And I can't
[00:05:14] help but wonder if open AI and anthropic
[00:05:17] changed their tune a little bit and
[00:05:19] instead of saying AI AI AI isn't it
[00:05:22] amazing and complexifying it for people
[00:05:24] if they actually came in and said let's
[00:05:25] talk about what we've always known as
[00:05:28] developers. Let's talk about how data
[00:05:30] actually works in the principles of
[00:05:31] development and then and then let's talk
[00:05:34] about how AI ladders onto that data
[00:05:37] backend in ways that are really useful.
[00:05:39] Maybe the process of change would be
[00:05:41] easier. And I think in a way Jensen
[00:05:43] understands that. Just for fun, let's go
[00:05:45] all the way back to Rob Pike's five
[00:05:47] rules of programming. If you don't know
[00:05:48] who Rob Pike is, you should because he's
[00:05:51] one of the creators of Unix and Go. He's
[00:05:53] an absolutely legendary developer. Rob
[00:05:56] Pike's five rules are things that get
[00:05:58] taught computer science. They're things
[00:06:00] that senior engineers teach to juniors.
[00:06:02] They're sort of written in the stars if
[00:06:05] you're in the discipline. Rule number
[00:06:07] one, you can't tell where a program is
[00:06:09] going to spend its time. Bottlenecks
[00:06:11] occur in surprising places. So don't try
[00:06:14] to second guessess and put in a speed
[00:06:15] hack until you've proven that's where
[00:06:17] the bottleneck is. I cannot tell you how
[00:06:20] many times I've used that rule when
[00:06:21] debugging systems. It actually works. It
[00:06:23] is very hard to tell until you run a
[00:06:25] system where the bottlenecks are going
[00:06:27] to happen. That is true for agentic
[00:06:29] systems people. That rule didn't go out
[00:06:31] of style. And by the way, yes, I'm going
[00:06:33] through all five of these because I
[00:06:35] don't think we talk about them enough.
[00:06:36] And I don't think we realize amidst all
[00:06:38] the hype and all the change that some of
[00:06:40] these ancient engineering practices
[00:06:42] still hold true. Rule two, measure.
[00:06:45] Don't tune for speed until you've
[00:06:48] measured. And even then, don't do it
[00:06:51] unless one part of the code overwhelms
[00:06:53] the rest. In other words, if you aren't
[00:06:55] measuring and baselining your
[00:06:57] performance, it's really hard to
[00:06:58] optimize. Do we see that with aentic
[00:07:00] systems? We sure do. How many times do
[00:07:03] people tell me they don't like an
[00:07:05] individual LLM response and I have to
[00:07:07] tell them maybe you should baseline it?
[00:07:09] Maybe you should measure before you make
[00:07:12] big assumptions and changes. Rule number
[00:07:14] three is kind of just don't get fancy or
[00:07:16] more precisely it's fancy algorithms are
[00:07:19] slow when your number is small and your
[00:07:21] number is usually small in computer
[00:07:23] science terms. Fancy algorithms have big
[00:07:26] big constraints. Fancy algorithms
[00:07:28] usually only work at scale. Until you
[00:07:31] know that your number is frequently
[00:07:32] going to be large, don't get fancy. This
[00:07:36] is true for agentic engineering as well.
[00:07:38] If you're trying to build aic systems,
[00:07:41] simple scales well. And in fact, I would
[00:07:44] add there's probably a correlary here.
[00:07:46] Simple scales better than complex. And
[00:07:49] this is something that may have shifted
[00:07:52] with agentic engineering because we did
[00:07:54] find for a while if we were writing
[00:07:55] algorithms that there were times at
[00:07:58] large scales when you had to have a
[00:07:59] fancier algorithm. Now I think we're
[00:08:02] abstracting a lot of that edge case
[00:08:04] complexity to LLMs and that requires us
[00:08:06] to have very stable simple architectures
[00:08:08] that scale. So that's one that I have
[00:08:10] some interesting nuance around but
[00:08:12] fundamentally it's true right don't get
[00:08:14] over fancy especially when the system is
[00:08:16] small. Rule number four, fancier
[00:08:18] algorithms are buggier than simple
[00:08:21] algorithms. This was the era, by the
[00:08:22] way, when Rob had to write his
[00:08:24] algorithms by hand. I know that everyone
[00:08:26] here doesn't know that anymore because
[00:08:28] we all just prompt our LLMs. But this
[00:08:30] was handwritten stuff, right? Use simple
[00:08:32] algorithms for simple data structures.
[00:08:34] That's the heart of rule number four.
[00:08:36] And this is a correlary to rule three
[00:08:38] because if rule three talked about
[00:08:39] simplicity and scale, rule four talks
[00:08:42] about simplicity and bugs. It is very
[00:08:44] very hard to debug complex agentic
[00:08:48] systems. You're like, is it the prompt?
[00:08:50] Is it all of this context that I'm
[00:08:51] pulling in? What's the problem? As much
[00:08:54] as you can simplify because the more
[00:08:56] that you simplify, the better off you're
[00:08:59] going to be, the better off you're going
[00:09:01] to be debugging, the better off you're
[00:09:03] going to be maintaining the system, etc.
[00:09:05] Rule number five, data dominates. If
[00:09:08] you've chosen the right data structures
[00:09:10] and if you've organized things well, the
[00:09:12] algorithms will almost always be
[00:09:14] self-evident. In other words, write dumb
[00:09:16] code and have smart objects in your data
[00:09:18] system. Right? That's the short version.
[00:09:20] This cannot be more true in the age of
[00:09:22] AI. Data engineering is the key to
[00:09:26] having good smart agentic systems. And I
[00:09:29] think we miss that. This is not new at
[00:09:31] all. This is decades old. Every time we
[00:09:33] go through hype cycles, and I've been
[00:09:35] through a bunch of them, right? I've
[00:09:37] been through the cloud hype cycle. I've
[00:09:39] been through the mobile hype cycle. Now
[00:09:40] I'm in the AI hype cycle. And we forget.
[00:09:43] We think it's all new. And we forget
[00:09:46] little things like the fact that we
[00:09:47] should keep structure simple, that data
[00:09:49] dominates, that we should build data
[00:09:51] structures that enable us to do more
[00:09:53] complicated things in ways that are
[00:09:55] sustainable. This is what Jensen is
[00:09:58] arguing for when he wants a simple set
[00:10:00] of primitives to build an open-source
[00:10:03] ecosystem for agents. In a way, I think
[00:10:05] Nvidia's engineers understand this
[00:10:08] better than a lot of the other engineers
[00:10:10] in the AI ecosystem right now. And that
[00:10:12] may be because they have to be so close
[00:10:14] to the kernel and so close to the metal
[00:10:17] all the time. You have to have good
[00:10:19] principles when you're trying to
[00:10:20] optimize for GPUs. And when you optimize
[00:10:23] for GPUs over time, you build an
[00:10:25] engineering culture that demands
[00:10:27] excellence and adherence to good best
[00:10:29] practices. And I see that written all
[00:10:31] over Nemo Claw. And I think that if we
[00:10:35] look at the story of how much trouble
[00:10:38] organizations are having adapting to AI
[00:10:40] and if we ask ourselves is it the
[00:10:42] message itself that's the problem or is
[00:10:44] it the way it's presented I would kind
[00:10:46] of argue it's been the way it's
[00:10:48] presented because we have presented I
[00:10:50] have seen so many consultants pedalling
[00:10:52] complexity as if it was a good thing
[00:10:54] with AI like presenting some kind of
[00:10:57] complicated agentic mesh and saying this
[00:10:59] is the way or presenting a really
[00:11:02] complicated change management paradigm
[00:11:04] or presenting lots and lots and lots of
[00:11:06] very hardto- read docs and saying go dig
[00:11:09] into this. These are your prompting
[00:11:10] tools. Simpler scales. We need simpler
[00:11:13] approaches that enable people to
[00:11:16] understand what we're saying. And
[00:11:17] ironically, if we go back to the way we
[00:11:21] always engineered systems, we're going
[00:11:23] to find that a lot of those truisms like
[00:11:26] Rob Pike's rules still work. They're not
[00:11:30] out of style. And that brings me to one
[00:11:32] of my favorite examples in the age of AI
[00:11:34] because I want to make this more
[00:11:36] updated. Yes, there's new things, new
[00:11:37] changes, but we have to understand how
[00:11:40] these old structures are informing new
[00:11:42] ways we work. I think factory.ai has a
[00:11:45] wonderful example here. Their agent
[00:11:47] readiness framework evaluates code bases
[00:11:50] against eight different technical
[00:11:52] pillars. style and validation, build
[00:11:54] systems, testing, documentation, the dev
[00:11:56] environment, code quality,
[00:11:58] observability, security, and governance.
[00:12:00] And what they find is that consistently
[00:12:03] speaking, the agent isn't the broken
[00:12:05] thing. The environment is, which goes
[00:12:08] back to that data insight. If you can
[00:12:10] fix your data structures like llinter
[00:12:12] configs, like documented builds, like
[00:12:14] dev containers, like an agents.mmarkdown
[00:12:17] file, agent behavior then becomes
[00:12:19] self-evident. It's effectively a
[00:12:21] correlary to what Pike was talking about
[00:12:23] years and years and years ago. And so
[00:12:25] Facto's data shows that getting these
[00:12:28] fixes right compounds in exactly the way
[00:12:31] we would expect it to following good
[00:12:33] software engineering principles. If you
[00:12:35] have better environments, you make your
[00:12:37] agents more productive, which frees time
[00:12:40] to make your environments better, which
[00:12:42] in turn feeds the loop and your agents
[00:12:44] get more productive over time. And
[00:12:45] there's a convergence here around
[00:12:47] Agentic best practices that I want to
[00:12:49] call out and name explicitly. So I'm
[00:12:51] talking about factories best practices,
[00:12:53] Nvidia's best practices, but also some
[00:12:55] of the way Enthropic organizes things,
[00:12:57] some of the way Microsoft organizes
[00:12:59] things. There are essentially a whole
[00:13:02] set of agentic rules of the road that we
[00:13:05] are publishing that are Pikees rules
[00:13:08] rediscovered by people who know their
[00:13:10] fundamentals. And I want to name the
[00:13:13] primitives that are emerging because I
[00:13:15] think that we should understand these
[00:13:16] rules of the road that underly best
[00:13:18] practices across a bunch of different
[00:13:20] companies and recognize their old roots
[00:13:22] cuz I think it will help us to change
[00:13:24] more effectively. So with that, I want
[00:13:26] to walk you through the five hard
[00:13:29] problems that I've seen in production
[00:13:31] agent deployment. I'm going to go
[00:13:33] through each one in detail because the
[00:13:34] distribution of difficulty here tells
[00:13:36] you about where people are spending
[00:13:38] money, where people are expecting
[00:13:39] engineers to solve it internally and
[00:13:41] really what best practice looks like.
[00:13:43] The first one is context compression. So
[00:13:46] longunning agent sessions fill up
[00:13:48] context windows. They just do even
[00:13:50] million token context windows or 10
[00:13:52] million token context windows, they all
[00:13:53] fill up. And every compression strategy
[00:13:56] is lossy. It always loses something. So
[00:13:58] factory tested three different
[00:14:00] production approaches to see which was
[00:14:02] best. They had their own method which
[00:14:03] they call anchored iterative
[00:14:05] summarization. Big words. It maintains a
[00:14:08] structured and persistent summary with
[00:14:10] explicit sections for session intent for
[00:14:13] file modifications for decisions made
[00:14:15] and for next steps. When the compression
[00:14:17] triggers the newly truncated span gets
[00:14:20] summarized and then merged with the
[00:14:22] existing summary. So the structure
[00:14:24] essentially forces preservation. you
[00:14:26] can't break the previous summary. Right
[00:14:28] now, they compared this approach against
[00:14:30] OpenAI's compact endpoint, which
[00:14:32] produces a very opaque. You can't see
[00:14:34] what's on the black box, and it just
[00:14:36] gives you compressed representations
[00:14:38] that are optimized to be reconstructed
[00:14:40] faithfully. That's a fancy way of saying
[00:14:42] it's it's compressed very highly, and
[00:14:44] you can't read the output to verify what
[00:14:46] was preserved because OpenAI famously
[00:14:49] doesn't expose any of that. And then
[00:14:50] they tested it against Anthropic's
[00:14:52] built-in compression through the cloud
[00:14:54] software development kit, which
[00:14:55] generates very detailed structured
[00:14:57] summaries, but regenerates the full
[00:14:59] summary every time rather than doing it
[00:15:01] incremental. That difference starts to
[00:15:03] matter across repeated compression
[00:15:05] cycles because you're regenerating the
[00:15:07] whole summary. You're playing telephone
[00:15:09] again. The results were clear. Facto's
[00:15:12] approach of incremental summarization
[00:15:14] scored the highest, but all three
[00:15:17] struggle with tracking artifacts. So if
[00:15:19] you're naming and remembering particular
[00:15:21] files, all three struggle with that a
[00:15:23] bit. And the mitigation here is pretty
[00:15:25] simple. You have to think about your
[00:15:27] project in terms of milestones and make
[00:15:30] sure that the milestones can be
[00:15:31] compressed in ways that allow the agent
[00:15:33] to continue to work. And that if you
[00:15:35] cannot do that, you have multi- aent
[00:15:38] frameworks that allow the agent to pick
[00:15:41] off and address big pieces of work and
[00:15:44] then die and refresh the context window
[00:15:46] with a new agent without losing that
[00:15:48] context. so that you get these
[00:15:49] longunning tasks. That's how you get
[00:15:51] these multi-week agent runs and don't
[00:15:53] stuff out the context window. You see
[00:15:55] how it all comes back to data? Like
[00:15:56] these are real 2026 agentic problems,
[00:16:00] but they come back to underlying
[00:16:02] principles around how we handle data and
[00:16:04] complexity that aren't new. Codebased
[00:16:07] instrumentation, that's another one.
[00:16:08] Gene, does that come back to pike and
[00:16:10] measuring? It sure does. This isn't even
[00:16:12] an agent problem, right? This is a
[00:16:14] software hygiene problem. We have always
[00:16:16] had challenges when we've been doing
[00:16:18] engineering projects, especially where
[00:16:20] we've been in a rush. It's been hard to
[00:16:22] be disciplined and measure. Making the
[00:16:25] codebase agent ready is partly about
[00:16:27] being able to measure stuff and we
[00:16:29] should not forget it. I don't want to
[00:16:31] belabor this one too long. If you are an
[00:16:33] engineer and you're like, I need to be
[00:16:35] able to make a contribution to AI, one
[00:16:37] of the simplest things you can do is
[00:16:39] just do the measuring. It's decades old.
[00:16:41] it's not new, but figuring out how to
[00:16:43] say this is our current baseline
[00:16:44] performance maybe with our LLM chat
[00:16:46] window, maybe with our agent, whatever
[00:16:47] it is, and you can measure it
[00:16:49] effectively because you understand this
[00:16:51] is the baseline. This is what latency
[00:16:53] looks like. This is what a good set of
[00:16:56] responses looks like and I have a nice
[00:16:57] golden data test set and I can true that
[00:17:00] up against what's in production. You
[00:17:01] have done a tremendous service to your
[00:17:03] business and you don't get appreciated
[00:17:05] enough probably, but it's really
[00:17:07] important and it's not new. It's just
[00:17:09] that we have to take it seriously
[00:17:11] because we are giving these autonomous
[00:17:13] agents a lot of power and we're not
[00:17:16] really measuring them if we're not
[00:17:17] disciplined. Problem number three in
[00:17:19] agentic coding work is around linting.
[00:17:22] Now, if you don't know what linting is,
[00:17:23] I'm not talking about the stuff in your
[00:17:24] couch cushions. Linting is when you are
[00:17:27] doing static analysis of the code.
[00:17:29] You're not making changes. You're just
[00:17:31] checking it for small style issues, for
[00:17:33] inconsistencies, for potential bugs at
[00:17:35] runtime, and you're coming up with a
[00:17:37] report. Linting rules are how we make
[00:17:40] linting work. And one of the ways that
[00:17:43] you can detect issues with agentic code
[00:17:45] is by getting very very strict with your
[00:17:47] linting so that you are insistent on
[00:17:49] extremely clean code. This isn't new,
[00:17:52] right? This is about enforcing simple
[00:17:54] structures. The factory team has this
[00:17:57] lengthy series of blog posts about all
[00:17:59] of the obsessive linting rules they have
[00:18:02] that basically put the code in a
[00:18:03] straight jacket and say it must adhere
[00:18:06] to best practices all the time. Now
[00:18:07] individual developers if they're the
[00:18:09] ones in charge of linting may say ah I
[00:18:12] don't know I'm tired. I don't really
[00:18:13] want to write all my linting rules. But
[00:18:15] in a good healthy engineering
[00:18:16] organization you have some common core
[00:18:18] around linting where you say okay this
[00:18:20] is what good looks like for us. We're
[00:18:22] going to insist on it. And that's
[00:18:23] especially important when you have
[00:18:24] agents involved because the agents are
[00:18:26] by definition just trying to get the job
[00:18:28] done. They are lazy developers that are
[00:18:30] happy just to kind of throw it off their
[00:18:33] plates and not listen. And so if you
[00:18:34] don't have a strict linter that is going
[00:18:36] to go through and insist on simplicity,
[00:18:39] you are going to be in trouble. Again,
[00:18:40] not a new thing. It's just a common
[00:18:43] thing that we are now applying in the
[00:18:45] world of agents. An ancient engineering
[00:18:47] piece of wisdom, if you will. Problem
[00:18:49] number four, how you handle multi-agent
[00:18:51] coordination. I've talked about this in
[00:18:53] other videos. We're converging around a
[00:18:55] rule where we say planners and executors
[00:18:58] are the way to do longunning multi- aent
[00:19:00] coordination and that makes sense
[00:19:02] because we're not over complicating it.
[00:19:04] And one of the things that Pike has
[00:19:06] called us to remember is hey you don't
[00:19:09] need to optimize something prematurely.
[00:19:11] You don't need to optimize it if you
[00:19:12] can't measure it. And so when we've
[00:19:14] actually tried to overoptimize and over
[00:19:16] complicate and there are engineering
[00:19:18] teams at many orgs that try and do this
[00:19:20] I just I encourage folks to say you know
[00:19:22] what let's not over complicate it build
[00:19:24] the simplest possible version of this
[00:19:26] agentic development pipeline and then we
[00:19:28] can always add more value by
[00:19:31] complexifying it if we really have to
[00:19:33] but we don't need to optimize
[00:19:34] prematurely if we can't even measure
[00:19:36] whether it does the job yet again not
[00:19:38] new and if you're wondering why am I
[00:19:40] taking time to talk about what isn't new
[00:19:42] it's really simple I think consultants
[00:19:44] often like to sell this as all new
[00:19:46] because it drums up business. I would
[00:19:48] prefer to tell the truth and say these
[00:19:50] are ancient data engineering practices.
[00:19:53] These are old software engineering best
[00:19:55] practices that we can apply in ways that
[00:19:57] are new to build these systems, but the
[00:19:59] practices and principles aren't that
[00:20:01] new. And I think that helps us with our
[00:20:03] change management. The last challenge is
[00:20:05] the hardest one. It's around
[00:20:07] specifications and fatigue. What I find
[00:20:09] in practice is that teams really, really
[00:20:12] struggle with a skill of defining a spec
[00:20:15] clearly upfront. It's a lot of work.
[00:20:17] There are some people who claim it can't
[00:20:18] be done or if it's so much work, we
[00:20:20] should just code the thing. I've seen
[00:20:22] real speedups, but it does require you
[00:20:24] to be very precise and crystal clear in
[00:20:26] your thinking. And you also have to be
[00:20:28] very good at writing emails at the end.
[00:20:30] And you have to be disciplined about not
[00:20:32] taking shortcuts. And so if you are
[00:20:34] going to give an agent a context window,
[00:20:36] you have to be disciplined about making
[00:20:38] sure your context graph is really clean
[00:20:40] so the agent can go search and get the
[00:20:42] context it needs cleanly by navigating a
[00:20:45] hierarchy rather than just stuffing it
[00:20:47] all in the context window and hoping and
[00:20:48] praying because you're lazy. In other
[00:20:50] words, we humans have to be less lazy if
[00:20:53] we want the agents to do good work for
[00:20:55] us. And I know that is counterintuitive
[00:20:57] because you are often sold a world where
[00:20:59] humans should just sit back and we just
[00:21:01] go and get coffee and then we're done.
[00:21:03] That's not how it actually works. And
[00:21:05] that's never how good engineering
[00:21:06] worked. It shouldn't be new. It
[00:21:08] shouldn't be a surprise. And I think
[00:21:10] sometimes we're sold Asians as like
[00:21:12] labor savers. And that's just
[00:21:13] disingenuous. It's just not true. So why
[00:21:16] does all this hype exist? I went through
[00:21:18] five problems. I showed you how they're
[00:21:20] critical now in the world of Asians. I
[00:21:21] showed you how they rest on old
[00:21:23] engineering best practices. I think if
[00:21:25] we messaged them that way, it would be
[00:21:27] useful to us. I think it would be easier
[00:21:28] to understand. I think that anthropic
[00:21:30] and open AI would have less issues
[00:21:32] communicating to developers. I think
[00:21:34] it's something that Nemo Claw started to
[00:21:35] get right. Part of why as an industry we
[00:21:39] have not done this well is that the
[00:21:41] chaos is worth a lot of money.
[00:21:43] Consultants coming in and pedalling
[00:21:45] their wares and saying this study shows
[00:21:48] that it's really hard helps them earn
[00:21:49] business. And it is hard, right? But
[00:21:52] it's hard in a way consultants typically
[00:21:54] don't help you with. It's hard in a roll
[00:21:56] up your sleeves, get into the code,
[00:21:58] co-build with me, dig in, help me
[00:22:01] understand the principles. And so many
[00:22:03] times consultants don't want to get
[00:22:04] their shoes dirty, right? They they want
[00:22:06] to come in and just do a PowerPoint
[00:22:07] deck. Ah, they want to deliver a great
[00:22:09] deck and then move on. That's not how it
[00:22:11] works, right? If you're going to do real
[00:22:14] change management, if you're going to
[00:22:16] help engineers and product managers and
[00:22:18] designers figure out how their roles are
[00:22:20] changing because their whole jobs are
[00:22:22] changing, you can't do it with a
[00:22:24] PowerPoint deck. It's not going to work
[00:22:26] that way. You have to go back and anchor
[00:22:28] in things that we all understand and
[00:22:29] have built on. And that as I've showed,
[00:22:31] you can do that. And then you have to
[00:22:33] walk forward and say, here's how this
[00:22:35] applies today. That's why I've walked
[00:22:37] through these problems. That is much
[00:22:39] more specific than I have seen in any
[00:22:41] standard run-of-the-mill consultant
[00:22:43] deck, which so often like level up here
[00:22:46] and they talk fluffily about how great
[00:22:48] AI is. It doesn't help you get the work
[00:22:50] done. And this is what I think we're
[00:22:52] missing when we look at launches like
[00:22:54] Nemo Claw because Nemoclaw as a launch
[00:22:57] is interesting. Nemoclaw as a play for
[00:22:59] Nvidia definitely interesting. They're
[00:23:01] trying to move beyond chips. But
[00:23:03] Nemoclaw is a way of saying to the
[00:23:06] industry, you got this. you can figure
[00:23:08] this out. We've got good engineering
[00:23:10] best practices that we can rely on and
[00:23:13] use to do real agent work. Now, that's
[00:23:16] interesting. And that's something that I
[00:23:18] wish we did more of. And I think if we
[00:23:21] worked more on that piece as a
[00:23:25] discipline, we would have less need for
[00:23:28] these tie-ups that we see between
[00:23:30] consulting firms and big companies like
[00:23:32] OpenAI and Anthropic. Because I think at
[00:23:35] the end of the day, in a sense, when
[00:23:36] you're outsourcing the change
[00:23:38] management, you are losing control of
[00:23:40] the narrative. And one thing anthropic
[00:23:42] and open AI probably don't want to do is
[00:23:45] lose control of the AI change narrative
[00:23:47] in their target companies. It is already
[00:23:50] fraud enough. There are already enough
[00:23:51] people producing half-true rumors,
[00:23:54] sometimes completely false rumors about
[00:23:56] what AI can and cannot do, what AI will
[00:23:59] and will not do. And by the way, it is
[00:24:00] both. I see lots of false rumors about
[00:24:02] what AI can do. I see lots of false
[00:24:04] rumors about what it can't. I think it's
[00:24:06] helpful if we go back and we say this is
[00:24:09] just computing. We've known about
[00:24:11] computing for a long time. We understand
[00:24:14] how computing works. The fundamentals
[00:24:16] aren't changing, but we have a new level
[00:24:19] of abstraction to put over the top and
[00:24:21] we should talk about it concretely and
[00:24:23] explain in a detailed way how our old
[00:24:26] principles of engineering have actually
[00:24:29] evolved. And that's what I tried to do
[00:24:31] in this video. That's what I laid out
[00:24:32] for you so you could understand we're
[00:24:35] not doing new stuff here when we design
[00:24:37] Agentic Systems. We're relying on good
[00:24:39] engineering practices we've already had.
[00:24:41] And in a way, a lot of what I'm doing on
[00:24:43] this channel is actually teaching good
[00:24:46] data engineering practices to a lot of
[00:24:48] people who didn't come up and do data
[00:24:50] engineering in school. Because it turns
[00:24:52] out if you want to build these systems
[00:24:54] yourself, you have to know just enough
[00:24:57] about data engineering to build systems
[00:25:00] that work. And it turns out it's not
[00:25:01] scary. It turns out you can learn these
[00:25:03] principles. You don't have to go and get
[00:25:05] a CS degree. And that's really
[00:25:07] empowering and that's really cool and
[00:25:10] that's really fun for me because I'll be
[00:25:11] honest, I didn't get a CS degree either.
[00:25:13] I taught myself. I was building
[00:25:15] computers. I had fun. And I think what's
[00:25:17] interesting is LLMs are essentially a
[00:25:19] teachable moment. LLMs are giving so
[00:25:22] many more people access to compute.
[00:25:25] We're all coming to this with fresh eyes
[00:25:28] because when we look at change
[00:25:29] management in orgs, I've talked about
[00:25:31] engineers, but to be honest with you,
[00:25:32] it's not just engineers, right? It's
[00:25:34] product managers, it's sales, it's CS.
[00:25:36] Shopify was shocked when they first got
[00:25:38] cursor because there were so many CS
[00:25:40] people who wanted cursor, right? They
[00:25:41] were coding under the desk. Coding under
[00:25:43] the desk is a massive 2026 phenomenon
[00:25:46] that is by definition not engineering
[00:25:48] related. And if you want the coding
[00:25:50] under the desk to work, you got to make
[00:25:53] sure that we have a little bit of a
[00:25:55] sense of how best practices work. And if
[00:25:57] we understand that, we're going to be
[00:26:00] able to take tools like Nemo Claw and
[00:26:02] actually put them to work effectively.
[00:26:04] So hats off to Nvidia for believing in
[00:26:06] us a little bit, right? For saying we
[00:26:08] could roll our own. We can build stuff
[00:26:10] that works. We can understand how good
[00:26:13] data engineering best practices, old
[00:26:15] computer science best practices that age
[00:26:18] well are still applicable today, evolve
[00:26:20] them appropriately and tackle good
[00:26:22] agentic engineering challenges. I want
[00:26:24] more of that and I hope you do too.
[00:26:26] Chips.
