# Raw Transcript

- Title: "Agents" Means 4 Different Things and Almost Nobody Knows Which One They Need.
- Creator: AI News & Strategy Daily | Nate B Jones
- URL: https://youtu.be/YpPcDHc3e9U?si=6WKDqLZ00-bxHLob

---

[00:00:00] We want agents, but we don't know what
[00:00:02] we really want. When we say agents, it
[00:00:05] is too simplistic to say agents are just
[00:00:07] like an AI plus tools in a loop. Like
[00:00:10] that's true, but we are missing the
[00:00:12] point. We are missing the fact that
[00:00:14] sophisticated agents diverge into at
[00:00:18] least four different types. And most of
[00:00:19] us don't understand what those types are
[00:00:21] and we confuse them. And so this video
[00:00:24] is about laying out how agents are
[00:00:27] really working in production use cases
[00:00:29] across these four subtypes, explaining
[00:00:32] why they're different, and then I want
[00:00:33] to get into how you use them and how you
[00:00:36] pick a given agent for a given use case.
[00:00:40] And no, we're not going to be talking
[00:00:41] about individual models. So if you think
[00:00:43] I'm going to talk about claude or I'm
[00:00:44] going to talk about chat GPT, that's not
[00:00:46] what this video is about. It's actually
[00:00:47] about the layer above that. You can plug
[00:00:52] any LLM model into an agentic system and
[00:00:57] get results. Maybe not the results you
[00:00:58] want, but you can get results. The point
[00:01:01] here is that you need to understand how
[00:01:03] these agent systems work. Because when
[00:01:05] we say agent, we really mean an LLM and
[00:01:08] tools and a loop where the agent comes
[00:01:10] back and gets feedback. And the way we
[00:01:12] construct that is really, really
[00:01:14] important. And the details of that
[00:01:16] construction effectively give us what
[00:01:19] I'm calling ancient species. So you're
[00:01:21] like, "What are species, Nate?" Right?
[00:01:23] Like, tell me. So, we've got coding
[00:01:25] harnesses. These are often starting out
[00:01:28] for individual contributors as a single
[00:01:31] LLM agent. It is working with your files
[00:01:35] and it is running with tools that you
[00:01:37] give it to accomplish coding work. When
[00:01:39] Andre Karpathy talks about the kinds of
[00:01:42] agents he works with to do his coding
[00:01:43] projects is often this sort of coding
[00:01:46] harness idea. When individual developers
[00:01:48] talk about their work, it's a coding
[00:01:50] harness idea. There is an extension of
[00:01:53] this for larger projects that involves
[00:01:55] multiple agents that we'll also discuss.
[00:01:57] It's like a a separate cousin species,
[00:02:00] right? Dark factories, that's another
[00:02:03] species of agent. These are fully
[00:02:05] autonomous systems. You put the spec in
[00:02:08] and the software comes out. And the
[00:02:10] trick is you have to be really really
[00:02:12] good at all the steps in between. You
[00:02:15] have to give the agent all of the
[00:02:17] support and all of the scaffolding and
[00:02:19] all of the evals or tests at the end to
[00:02:22] make sure that what comes out is
[00:02:24] actually effective. And and the way you
[00:02:26] develop this, right, often depends on
[00:02:29] your ability to specify really excellent
[00:02:32] nonfunctional requirements, which is a
[00:02:34] fancy way of saying really excellent
[00:02:36] rules of the road for these agents in
[00:02:38] ways that are enforceable, and we'll get
[00:02:40] into that. Another kind of agent is auto
[00:02:43] research. These are really frameworks
[00:02:45] that descend from classical machine
[00:02:47] learning. And really all you're doing is
[00:02:49] you're trying to automate the process of
[00:02:52] letting an AI agent optimize for
[00:02:55] something. Maybe it's optimizing for
[00:02:57] conversion rate on your landing page.
[00:02:59] Maybe it's optimizing or tuning a
[00:03:01] particular coding framework. But
[00:03:04] whatever it's doing, it has to have a
[00:03:05] metric to optimize against. That's why
[00:03:07] it's called auto research. The whole
[00:03:09] goal is to uh what machine learning
[00:03:11] scientists call hill climb. You want to
[00:03:14] climb the hill and get to a more
[00:03:16] effective optimized metric. That's the
[00:03:20] whole point. If you don't have a metric,
[00:03:23] you're not doing auto research. And then
[00:03:25] we have what we would call orchestration
[00:03:26] frameworks. This is something we often
[00:03:29] see in big companies where you have
[00:03:31] multiple LLMs lined up in a row and you
[00:03:34] have an orchestration framework over the
[00:03:36] top that hands work over. So writer to
[00:03:39] editor, drafter to researcher, or
[00:03:41] researcher to drafter as it were. All of
[00:03:44] these different types of agents, whether
[00:03:46] they're coding harnesses or whether
[00:03:47] they're orchestrators or whether they're
[00:03:48] dark factories or even whether they're
[00:03:50] auto researchers, the thing that they
[00:03:53] have in common is that they're using LLM
[00:03:55] with tools. And so you can call all of
[00:03:57] them agents. That's okay. But if you
[00:04:00] don't understand why they're different
[00:04:01] and why that matters, you're gonna use
[00:04:04] the wrong kind for the wrong kind of
[00:04:06] work and you're going to get into big
[00:04:08] trouble. And that's what I want to spare
[00:04:09] you because to be honest with you, I see
[00:04:12] this happen a lot. I have seen people
[00:04:14] take what I would describe as a single
[00:04:16] agent that's designed to do a single
[00:04:18] productive task and try and say, "Well,
[00:04:20] we're going to make a dark factory out
[00:04:21] of that. We're going to make that into
[00:04:23] something that is a full multi- aent
[00:04:26] coding harness for multiple big projects
[00:04:29] that we want to run through our system.
[00:04:32] It's not going to work. That's not how
[00:04:34] that works. Agents have different needs.
[00:04:36] Now, you might ask me, Nate, why why is
[00:04:39] this so complicated? Why can't we have
[00:04:41] one agent to rule them all? Well, the
[00:04:44] answer is that these are just tools that
[00:04:48] depend on the context around them to do
[00:04:51] effective work. And if you want to do
[00:04:53] bigger pieces of work, you have to get
[00:04:56] more interesting and sophisticated in
[00:04:58] the way you put these agents together to
[00:05:00] get that work done. Notice I didn't say
[00:05:03] more complicated. The art of building
[00:05:05] good agents is often the art of finding
[00:05:08] different simple configurations that
[00:05:11] enable the agent to do the particular
[00:05:13] work you have in front of you. And so
[00:05:15] when we talk for example about
[00:05:16] orchestration, you might envision the
[00:05:18] super complicated framework. It doesn't
[00:05:20] actually have to be complicated. The key
[00:05:22] to orchestrating is just recognizing you
[00:05:25] have multiple distinct jobs you need
[00:05:26] done that aren't well suited to having
[00:05:29] one longunning dark factory and you need
[00:05:31] to find a way to negotiate those
[00:05:33] handoffs. Whereas with dark factories,
[00:05:35] you're usually optimizing toward an eval
[00:05:38] really relentlessly and you want to make
[00:05:40] sure that you construct the pipeline so
[00:05:43] that the system gets you to that point.
[00:05:45] And so you have to look at the goal that
[00:05:48] you're trying to accomplish and then ask
[00:05:50] yourself, what kind of agent do I need
[00:05:54] to get that goal done? I want to get
[00:05:56] into the details on each of these four
[00:05:58] species because I think the more
[00:05:59] viscerally you understand them, the less
[00:06:01] you're going to be surprised when we
[00:06:03] talk about the differences and why they
[00:06:05] matter. The more you're going to be like
[00:06:06] fingertippy with those differences. So
[00:06:09] let's talk about coating harnesses
[00:06:11] first. Coding harnesses in many ways are
[00:06:13] the simplest kind of agentic harness.
[00:06:15] They are the kind that you get when you
[00:06:18] pull up a terminal and you use clawed
[00:06:20] code or you use codecs. All they are is
[00:06:24] essentially an agent taking the place of
[00:06:26] a developer in an engineering process.
[00:06:29] And so the agent has many of the tools a
[00:06:31] developer would have. The agent can
[00:06:33] write code. The agent can call files.
[00:06:35] The agent can put files together. The
[00:06:37] agent can read files. The agent can
[00:06:39] write to files. the agent can use tools
[00:06:41] like search. When you put all of that
[00:06:44] into the agent's context, so the agent
[00:06:47] understands what it can do, then the
[00:06:49] agent is able to do effective work. Now,
[00:06:51] there are some slight variance, right?
[00:06:53] I've talked about the fact that codeex
[00:06:54] tends to prefer to put these in a
[00:06:56] virtual machine, which is more secure.
[00:06:58] It's not touching your local laptop. And
[00:07:01] then there's Claude, and Claude tends to
[00:07:02] like to work on your local laptop. And
[00:07:04] there are pros and cons to each of
[00:07:05] these, right? But the point from your
[00:07:07] perspective and my perspective is that
[00:07:09] these are very similar overall
[00:07:11] approaches to the development problem
[00:07:14] and we should think of them as
[00:07:16] essentially you have a human the human
[00:07:18] is now doing a managerial function and
[00:07:20] the agent is doing the coding and if you
[00:07:23] do that well you can give these agents
[00:07:26] even if they're single threaded just one
[00:07:28] agent a fairly longunning task to
[00:07:30] accomplish and it will go and work.
[00:07:32] Andre Carpathy talks about his agents
[00:07:34] running 16 hours a day, right? That's
[00:07:36] not unusual anymore in 2026. A lot of
[00:07:39] developers have that experience. And I
[00:07:42] start with that because that is in many
[00:07:44] ways the simplest use case. It's really
[00:07:46] a singlethreaded approach to agents.
[00:07:48] Think of the agent as a standin for the
[00:07:50] person, an engineer, and you'll kind of
[00:07:52] get the idea. Now, you can of course run
[00:07:56] multiple agents at once, and some
[00:07:57] developers do. Peter Steinberger when he
[00:08:00] was building open claw famously
[00:08:02] described having multiple agents running
[00:08:04] at a time. In his case it was codeex and
[00:08:06] they would get a particular task done.
[00:08:08] It would take about 20 minutes and
[00:08:10] they'd check back in with him. And so a
[00:08:12] lot of his day as a manager of agents
[00:08:14] was at essentially managing these agents
[00:08:16] that were all doing their own
[00:08:17] singlethreaded tasks. And so just
[00:08:19] because I talk about it as a single
[00:08:21] agent doesn't mean that developers view
[00:08:24] their work streams that way. Developers
[00:08:26] may view their work streams and often do
[00:08:28] as I'm managing all of these
[00:08:30] singlethreaded agents all day. Now, if
[00:08:32] you're wondering what makes this work or
[00:08:34] doesn't work, I'm going to give you a
[00:08:36] hint. The hint is decomposition.
[00:08:39] If you can get the work decomposed,
[00:08:41] well, you can give that work to a bunch
[00:08:44] of singlethreaded agents and you're
[00:08:46] going to get real far. And a lot of
[00:08:48] developers like that. They like the
[00:08:50] challenge. They like the task. They like
[00:08:52] to decompose. They like to take a big
[00:08:54] problem that's kind of gnarly and rip it
[00:08:57] apart and say, "Okay, this chunk is
[00:08:58] really well defined. I'm going to give
[00:09:00] it to this agent. This chunk I'm going
[00:09:02] to give to this agent, etc." And that's
[00:09:04] how a lot of work gets done in 2026. You
[00:09:06] have the developer look at the overall
[00:09:08] shape of the project, maybe with an LLM
[00:09:10] as a planner assistant. It start you
[00:09:12] start to have the the developer confirm
[00:09:15] the breakout the LLM planner agent may
[00:09:17] propose. And then the the developer
[00:09:19] basically says, "Okay, let's go uh let's
[00:09:21] start to break out this work." And then
[00:09:22] you start to break it out into these
[00:09:24] individual agent tasks. So when you are
[00:09:27] doing that already, I want you to notice
[00:09:30] something. You are already past the sort
[00:09:33] of spin up an agent in the chat and just
[00:09:36] talk to the chat to make it happen. You
[00:09:37] may be working on different versions of
[00:09:40] your code or different sections of your
[00:09:42] code at once. You may be using a work
[00:09:45] tree approach. Now fundamentally this is
[00:09:47] about task scale projects, right?
[00:09:49] Everything we've been talking about the
[00:09:51] decomposition individual developers
[00:09:53] working on this it all suggests you're
[00:09:56] giving the agent a task the agent is
[00:09:57] acting for you etc. What happens when
[00:10:00] the work gets bigger? That's where we
[00:10:03] talk about a more complex variant of
[00:10:06] this coding harness that is really
[00:10:08] designed for projects. And it's
[00:10:11] important to understand what that looks
[00:10:12] like because so often when we want to do
[00:10:14] big work at companies, we tend to think
[00:10:17] of big work as linearly tied to the
[00:10:20] number of engineers that can hold bits
[00:10:21] of the project in their head. But
[00:10:23] increasingly that's actually incorrect.
[00:10:25] What you want to do is look first at the
[00:10:27] agent side of things and basically say
[00:10:29] you know the agent has to be able to
[00:10:33] understand gro this work figure out the
[00:10:35] right path forward and we have to
[00:10:37] support the agent in getting that done.
[00:10:39] Curser has done a lot of work in public,
[00:10:42] writing it up, helping us understand how
[00:10:44] to do that. Well, what you really need
[00:10:47] is a different way of handling a large
[00:10:50] set of agents and coordinating their
[00:10:53] work. Effectively, you're moving from a
[00:10:56] world where the human is the manager to
[00:10:58] a world where the agent is the manager.
[00:11:00] And in that scenario, you have, and this
[00:11:03] is real, right? Cursor has done this
[00:11:04] across multiple real projects from
[00:11:06] browsers to compilers. and actually
[00:11:08] coded millions of lines of code with
[00:11:10] this. What you have is an agent that
[00:11:13] plays the manager, an agent that acts as
[00:11:16] the planner for the work, and then you
[00:11:18] have a system of sub aents that come in
[00:11:21] to grind on particular tasks as ordered
[00:11:24] by the planner agent. And so instead of
[00:11:26] thinking of it as, you know, cursor got
[00:11:29] some individual agent to code for weeks
[00:11:31] and that's how you got a browser or
[00:11:33] whatever you may be imagining, that's
[00:11:34] not how it actually worked. What you
[00:11:37] actually have is short running grunt
[00:11:40] agents or execution coding agents that
[00:11:42] were spun up by a planner agent to hit
[00:11:45] exactly one problem, solve it and get
[00:11:48] that particular part of the job done.
[00:11:50] And how that works successfully is by
[00:11:53] making sure kind of effectively that the
[00:11:55] planner can make notes. The planner
[00:11:57] agent has to be able to track tasks, has
[00:12:00] to be able to keep things in memory and
[00:12:02] has to be able to understand whether a
[00:12:05] particular piece of work by an executor
[00:12:08] agent was done well or not. Now you
[00:12:11] think, wow, this is complicated. Cursor
[00:12:13] actually tried to make it more
[00:12:15] complicated. They tried to add three
[00:12:17] levels of management and it didn't work
[00:12:19] well. And one of the things that the
[00:12:20] cursor team explicitly noted is that
[00:12:23] simple scales well with agents. You want
[00:12:25] to keep your harness, this whole system
[00:12:27] we're talking about of making the agent
[00:12:29] work well, pretty simple so it can scale
[00:12:32] effectively. And so I'm describing it as
[00:12:34] simply as possible precisely for that
[00:12:36] reason. Because if you don't understand
[00:12:39] how it works and it's a mystery to you
[00:12:41] conceptually, you're not really going to
[00:12:43] understand where to apply it or where to
[00:12:45] go and dig in more if you think this is
[00:12:47] right for you.
[00:12:49] The key to understanding the difference
[00:12:51] between these individual coding
[00:12:53] harnesses like the ones that Andre
[00:12:54] Carpathy is talking about versus the big
[00:12:56] long running ones like the one cursor is
[00:12:58] doing. You need to recognize that the
[00:13:02] individual coding harnesses are built
[00:13:05] for the mind of an individual developer.
[00:13:07] If you have a team of eight or 16 or 20
[00:13:10] developers working on something, you
[00:13:12] have too much complexity in the room to
[00:13:15] not have a coding harness like cursor
[00:13:18] used. You should be looking at project
[00:13:20] level coding architectures rather than
[00:13:23] individual level. And that is one of the
[00:13:25] biggest unlocks and it's very
[00:13:26] counterintuitive because I see a lot of
[00:13:28] people who tell me we've had so much
[00:13:30] speed up with AI. We have AI assistants.
[00:13:33] We have individual engineers working
[00:13:35] with like four or five coding assistants
[00:13:38] at a time. It's incredible how much we
[00:13:40] get done. But if I surface this simple
[00:13:42] idea that maybe instead of framing
[00:13:44] everything around the human at the
[00:13:46] center, we should frame it around how
[00:13:48] can we make it easy for the agent to do
[00:13:50] the work since we're asking the agent to
[00:13:52] do all this work anyway. Sometimes
[00:13:54] people look at me like I'm going crazy.
[00:13:56] They're like, "What? What? Why would we
[00:13:57] do that? We see so much speed up with
[00:13:59] them as individual assistants. Isn't
[00:14:00] that great?" I'm like, "It is great.
[00:14:02] That's great. great progress, but from a
[00:14:04] project perspective, all you're doing is
[00:14:07] speeding up the human work and you still
[00:14:08] have all of the bottlenecks you had
[00:14:10] before. Only now it might be more
[00:14:12] complicated because you have a lot more
[00:14:13] code review to do than you than you did
[00:14:15] before. And the humans are much busier
[00:14:18] because they're trying to figure out how
[00:14:19] to manage four different things at once
[00:14:20] and they used to be individual
[00:14:21] contributors. And so maybe with this
[00:14:24] much complexity and the fact that it's
[00:14:26] really hard to parallelize all of this
[00:14:29] work across lots of developers in a big
[00:14:30] project, maybe we should actually try to
[00:14:32] build something at team scale. And
[00:14:34] that's really how you understand you
[00:14:36] need to be at a level like cursor is
[00:14:38] where they're architecting larger
[00:14:41] multi-agenta harnesses that are designed
[00:14:43] to do big work. Okay, this brings me to
[00:14:46] dark factories and I fully admit there's
[00:14:49] some blur in these definitions. There
[00:14:51] are some architectures for large
[00:14:53] projects that are effectively dark
[00:14:55] factories. But if you want to know the
[00:14:56] difference when you are doing a dark
[00:14:59] factory approach, you have almost no
[00:15:03] human involvement from the point you put
[00:15:05] a specification in to the point where
[00:15:08] the system says I've passed an eval and
[00:15:12] I'm done. And the reason why you do that
[00:15:15] is actually that people have found as
[00:15:17] they go farther on this agentic coding
[00:15:19] journey that it is often easier and
[00:15:22] simpler to get the human out of the
[00:15:24] middle of the process altogether. Like
[00:15:26] once you walk into this process, you
[00:15:28] want the human to be heavily involved at
[00:15:30] the top doing some of the design, making
[00:15:32] sure this is what the customer wants,
[00:15:34] making sure the spec is really good,
[00:15:36] making sure intent is communicated
[00:15:38] clearly, and you want the human at the
[00:15:40] end, making sure that what was built
[00:15:42] actually matters, making sure that it
[00:15:44] passes the evals, etc. But the less the
[00:15:48] human is involved in the middle, the
[00:15:50] less you have strain on the humans and
[00:15:52] on the whole process because agents tend
[00:15:55] to essentially push things through so
[00:15:58] fast that humans have trouble being
[00:16:00] bottlenecks in the middle. And so dark
[00:16:02] factories are designed to get around
[00:16:03] that. They basically are designed as
[00:16:06] entire complete systems that hit eval at
[00:16:10] the end and iterate back automatically
[00:16:13] until the software passes the
[00:16:15] evaluation. And that's really the heart
[00:16:17] of it. You put an evaluation or a test
[00:16:20] that the software has to pass before it
[00:16:23] can be launched. Now, if you're really
[00:16:26] bold and dark factories are often bold
[00:16:29] plays, people will launch to production
[00:16:32] from there without having a human look
[00:16:34] at the code. I will be honest with you,
[00:16:37] the companies I look at tend to have an
[00:16:40] awareness of risk that is calibrated to
[00:16:42] actual production realities and most of
[00:16:44] them are rightly uncomfortable with just
[00:16:46] trusting the agent and saying, "Yeah,
[00:16:48] yeah, we'll throw it into production. We
[00:16:50] hope it works well."
[00:16:51] If you're an enterprise, you're
[00:16:53] typically having a human look at the
[00:16:54] code just to make sure there's some
[00:16:56] accountability there. It's actually
[00:16:57] something Amazon learned the hard way
[00:16:59] recently when they called a bunch of
[00:17:00] their uh senior engineers and their
[00:17:02] principal engineers into Seattle to talk
[00:17:04] about recent AI generated incidents in
[00:17:07] production caused by junior engineers
[00:17:09] and what they were going to do about it.
[00:17:11] It makes sense to have a sophisticated
[00:17:15] engineering mind looking at the code at
[00:17:17] the end to make sure that you're
[00:17:19] confident that you got it right. But
[00:17:23] that being said, you should understand
[00:17:25] that dark factories are essentially all
[00:17:27] about pulling the human out of the
[00:17:29] middle so humans aren't stressed and
[00:17:31] bottlenecked in the middle of a fast
[00:17:33] flowing agentic process and you're just
[00:17:35] trying to get the evals done and get the
[00:17:37] software out the door and it's like a
[00:17:39] dark factory, right? The famous dark
[00:17:41] factories in China are the ones where
[00:17:43] the lights are off. It's literally dark
[00:17:45] and you're making stuff with automated
[00:17:46] robots all the way through. That's the
[00:17:49] vision. That's the metaphor that we're
[00:17:51] using when we talk about agents in the
[00:17:52] system. And you can see how that's so so
[00:17:54] different from individuals using agents,
[00:17:56] right? Like if you give your agent a
[00:17:58] task and go make coffee for 20 minutes,
[00:18:00] that's not a dark factory. Similarly, if
[00:18:03] you're investing heavily in a coding
[00:18:05] harness and you're putting a multi- aent
[00:18:07] project together and you're checking on
[00:18:09] it obsessively all the way through and
[00:18:10] giving it ongoing guidance if it doesn't
[00:18:12] go right, you're probably closer to a
[00:18:16] larger project scale harness, but you
[00:18:18] have a fair bit of human involvement.
[00:18:20] And I admit it's a little bit of a
[00:18:21] blurry line. If you get your project
[00:18:23] harnessed to the point where it's very
[00:18:24] stable and you can do large runs of the
[00:18:27] code and you don't have to look at the
[00:18:30] code in between until it passes the
[00:18:31] eval, you are getting very close to a
[00:18:33] dark factory layout. And so what I would
[00:18:36] say is think of these as steps along the
[00:18:39] path toward humans being more and more
[00:18:42] involved at the beginning at the end of
[00:18:44] the software process. If you're an
[00:18:46] individual, that can look like task
[00:18:48] level autonomy for the for the agent. If
[00:18:50] you're an organization and you're
[00:18:52] building project level agentic
[00:18:54] engineering, it can look like the human
[00:18:57] being involved mostly at the beginning
[00:18:59] mostly at the end with some guidance in
[00:19:01] the middle. And then if you're really
[00:19:04] sophisticated and you feel really good,
[00:19:05] you can have project level engineering
[00:19:07] focused on those evals or tests where
[00:19:10] you have human involvement from
[00:19:11] engineers and product at the top and
[00:19:13] then human involvement from engineers at
[00:19:15] the end. Now what about auto research?
[00:19:19] Auto research is kind of a different
[00:19:20] bug. So if you look at these three steps
[00:19:23] to coding, they're all about producing
[00:19:25] code and working software. Auto research
[00:19:28] is not auto research is about optimizing
[00:19:31] for a metric. It's actually a descendant
[00:19:34] of classical machine learning
[00:19:35] techniques. In machine learning, when
[00:19:37] you teach a machine something, all
[00:19:40] you're doing is you're trying to get it
[00:19:42] to be better and better and better at
[00:19:44] optimizing for a target. And so when I
[00:19:47] was teaching machine learning around how
[00:19:49] to move titles around at at video, we
[00:19:52] were optimizing for the ability to cut
[00:19:54] letters out and reliably shift them.
[00:19:56] Right? That that sounds silly, but it
[00:19:58] was actually necessary to resize title
[00:20:00] artwork, etc. Now, if you were
[00:20:02] optimizing for auto research in the age
[00:20:04] of LLMs, you might be optimizing for
[00:20:07] different metrics. And so Toby look
[00:20:09] optimized his liquid presentation
[00:20:12] framework that powers millions of
[00:20:14] Shopify shops. And that's something
[00:20:16] where there's a code base to optimize
[00:20:17] against and you're basically optimizing
[00:20:19] for a better runtime experience. You're
[00:20:21] optimizing for the code to run more
[00:20:23] smoothly in production. That's a metric
[00:20:25] that you're using. Or you could be
[00:20:27] optimizing for something like how you
[00:20:29] tune models in production, right? Are
[00:20:32] you tuning the weights of the models
[00:20:34] appropriately? And that's something that
[00:20:36] we actually got from Andre Carpathy.
[00:20:37] He's the one that came out with auto
[00:20:39] research just a couple of weeks ago and
[00:20:41] he used it on his own settings in his
[00:20:44] quest to autooptimize his way toward
[00:20:48] effectively a GP2 level scale. Now you
[00:20:50] might think GP2, who cares? It's GPT 5.4
[00:20:54] right now. Well, what he's trying to do
[00:20:56] is demonstrate as an independent thinker
[00:20:58] that it is possible to auto research
[00:21:01] your way through an LLM development
[00:21:03] chain, which is a really important piece
[00:21:05] of research. And you can use that same
[00:21:07] technology on any metric you want to
[00:21:09] optimize as long as you have sufficient
[00:21:11] data points. And so I've given you an
[00:21:13] example from from Toby and Shopify and
[00:21:15] running code. I've given you an example
[00:21:17] for the for the deep LLM science nerds
[00:21:20] around optimizing your tunings. But if
[00:21:22] you're not any of those things, you can
[00:21:24] also use it to optimize conversion
[00:21:26] rates, right? Like anything you can give
[00:21:28] it a metric for in principle, you can
[00:21:30] auto research against it. Now here's the
[00:21:33] difference. Yes, this is an agentic
[00:21:35] process. The LLM is essentially climbing
[00:21:38] a mountain by relentlessly
[00:21:40] experimenting, right? You can think of
[00:21:41] it as trying to reach the most optimal
[00:21:43] condition possible. Many experiments
[00:21:45] will be failures. Some will be
[00:21:47] successes. Humans will probably need to
[00:21:49] review the ones that are successes to
[00:21:50] ensure they're scalable. But
[00:21:54] this doesn't work in the same way that
[00:21:56] the software process does. So, I talked
[00:21:58] about dark factories. I talk about
[00:21:59] coding harnesses. This is not about
[00:22:02] producing working software. This is
[00:22:04] about using the power of LLMs to
[00:22:07] optimize for a particular metric. And so
[00:22:10] you have to be able to understand is my
[00:22:13] problem softwares shaped or is my
[00:22:15] problem metric shaped. Those are super
[00:22:18] different things. And if you can't
[00:22:20] figure out the difference between the
[00:22:21] two of them, you need to sit with your
[00:22:23] problem until you understand that either
[00:22:26] it's a rate that I can optimize in
[00:22:28] something some measure or it's a piece
[00:22:32] of software I need to build. And those
[00:22:33] are usually pretty intuitive. Once I put
[00:22:35] it that way, people usually say, "Aha, I
[00:22:37] know what it is. It's one or the other.
[00:22:38] It's not both." Okay, now we come to
[00:22:41] orchestration. I've saved orchestration
[00:22:43] for the end because it's probably the
[00:22:46] most complicated one to set up and
[00:22:48] manage. And that's one of the reasons
[00:22:49] there's lots of startups in the space
[00:22:51] cuz they're basically trying to optimize
[00:22:52] away that complexity for you. Langraph
[00:22:55] is an example of an orchestrator. If you
[00:22:58] have a bunch of different jobs you want
[00:23:00] an agent to do, like, okay, this agent
[00:23:02] needs to pick up the ticket, this agent
[00:23:04] needs to go research for the ticket,
[00:23:05] this agent over here needs to go do
[00:23:07] something else, and then we have to
[00:23:08] close the ticket, and we have to comment
[00:23:10] on it along the way. You're you're
[00:23:12] basically handing off a bunch of things
[00:23:14] to agents, right? That's a customer
[00:23:15] success one, but you can imagine other
[00:23:17] kinds. If you're researching and then
[00:23:18] you're writing, those are two different
[00:23:20] things. And so you're looking at
[00:23:22] orchestration.
[00:23:24] And orchestration is just a fancy way of
[00:23:26] saying handing off from A to B. Now, I
[00:23:28] want to be careful here because if
[00:23:30] you're listening along and you say,
[00:23:31] "Hey, the cursor example felt a lot like
[00:23:33] this. Aren't isn't the planner agent
[00:23:35] handing off work to the executor?" Yes,
[00:23:38] that's true. But keep in mind, this is
[00:23:40] toward one unified goal in cursor's
[00:23:42] case. they're trying to build a piece of
[00:23:44] code and the multi- aent approach is
[00:23:46] just the most effective way to do that
[00:23:48] over a long period of time. In this
[00:23:51] case, you're actually giving these
[00:23:53] agents really specialized roles. And so
[00:23:55] if you're the person who got excited
[00:23:57] about giving agents different roles,
[00:23:59] you're really excited about
[00:24:00] orchestration, which is a small subset
[00:24:02] of what agents can do. And so you're
[00:24:04] saying, "Okay, I want a really good
[00:24:06] marketing agent, and then I want a
[00:24:08] really good copywriting agent, and then
[00:24:10] a really good finance agent." you're
[00:24:12] doing orchestration and orchestration
[00:24:15] takes a lot of work from people. You
[00:24:18] have to be thoughtful about how you hand
[00:24:21] off. What do you hand off? What is the
[00:24:23] context? What are the procs? You're
[00:24:24] essentially optimizing all of these
[00:24:26] individual LLM bits in the chain so that
[00:24:29] you can effectively manage the handoffs
[00:24:32] along the way. And in my experience,
[00:24:33] when you start to talk about agentic
[00:24:35] systems, what you're really doing is
[00:24:37] you're talking about the bits of work
[00:24:39] where you can trust an agent to do
[00:24:42] something a human doesn't have to look
[00:24:43] at. And in the orchestration example,
[00:24:46] there's actually a lot of joints in the
[00:24:48] process that a human has to look at. And
[00:24:50] that is one of the things that makes a
[00:24:52] lot of the orchestration approaches
[00:24:54] right now feel somewhat heavy. You have
[00:24:57] to do a lot of human involvement. Now,
[00:24:59] that doesn't mean that they're not
[00:25:01] valuable. There are some tasks where you
[00:25:03] do need those specialized roles right
[00:25:05] now and so it makes sense to have
[00:25:07] orchestration platforms like Langraph
[00:25:09] for that task. The question is really
[00:25:12] whether the work you're doing on
[00:25:14] coordination matches the scale of the
[00:25:16] problem. So if you're tackling 10,000
[00:25:18] customer success tickets, it clearly is
[00:25:21] worth it to spend some time to get this
[00:25:22] right. Let alone if it's millions or
[00:25:24] tens of millions. Now, if you're only
[00:25:27] going to do this for a,000 tickets or
[00:25:29] 100 tickets, it might not be worth it.
[00:25:31] And so, when people talk about
[00:25:33] orchestration, I often ask about scale
[00:25:36] because I'm like, is this really worth
[00:25:37] going after, right? Like, are you going
[00:25:39] to put the work into all of the prompts
[00:25:41] and all of the context management and
[00:25:42] this and that and just not get the scale
[00:25:44] back or is it worth the value you're
[00:25:47] putting into it? Let me close by giving
[00:25:49] you a cheat sheet. I want to give you a
[00:25:51] cheat sheet so you know which of these
[00:25:53] different kinds of agents to go after.
[00:25:56] If you are optimizing for just what is
[00:25:58] in front of you, you should be using a
[00:26:01] coding harness, right? Your judgment is
[00:26:03] really the gold standard here. This is
[00:26:05] what Peter Steinberger did when he used
[00:26:06] multiple codeex agents to code open
[00:26:08] claw. His judgment was the gate. That's
[00:26:12] a coding harness, right? That's the
[00:26:14] classical approach. That's what Andre
[00:26:15] does too. And so in that sense, it's the
[00:26:18] simplest approach. which is the one we
[00:26:19] started with in this video. It should be
[00:26:21] the easiest one to understand. Now, at
[00:26:23] project scale, your judgment can still
[00:26:25] be the quality gate. It just looks a
[00:26:27] little bit more like cursor's approach.
[00:26:29] It looks like having planner agents and
[00:26:31] executor agents and they're working
[00:26:32] against an eval, but ultimately a human
[00:26:34] is still judging. Now, if you go even
[00:26:36] further and your judgment is no longer
[00:26:38] the key thing to keep in mind because
[00:26:40] you trust the agents and they have been
[00:26:43] they have been tuned so well and the
[00:26:45] evals are so good and you're so
[00:26:46] confident they can hit production or
[00:26:48] maybe your standards are lower.
[00:26:49] Sometimes it's both. Then you might be
[00:26:52] doing dark factory where all you're
[00:26:53] doing is making sure the intent and the
[00:26:55] specification is good and making sure
[00:26:57] the agents pass the test honestly and
[00:26:59] then go to production and you're putting
[00:27:01] a lot of work into monitoring and making
[00:27:03] sure that the work that's being done in
[00:27:04] production is legitimate that the
[00:27:06] quality is there. That is dark factory
[00:27:08] work and it's really the story of
[00:27:09] optimizing not against a task but
[00:27:11] against specifications
[00:27:14] and it is possible to hybridize those. I
[00:27:16] talked about that you can do mostly dark
[00:27:18] factory and have it human check the
[00:27:20] evals at the end. I often recommend that
[00:27:23] because I find that you can get a lot of
[00:27:24] the value out of the middle part that's
[00:27:26] a dark factory and still get a human
[00:27:28] judgment at the end in a place that's
[00:27:30] really important. Now, if you're
[00:27:31] optimizing against a rate or a metric,
[00:27:34] that's the auto research, right? Now,
[00:27:35] you're trying to figure out how to
[00:27:38] automatically use LLM to run little mini
[00:27:40] experiments on code or on LLM tunings or
[00:27:43] on maybe on conversion rates to figure
[00:27:46] out how to make that metric better. And
[00:27:48] really, the sky is the limit. If you
[00:27:49] have a lot of data and you have a rate
[00:27:51] of some sort, in theory, you can apply
[00:27:53] auto research. We're just at the
[00:27:54] beginning of using this. Andre released
[00:27:56] the package a couple of weeks ago, but
[00:27:58] that's the principle and you're going to
[00:28:00] see a lot more like it. I've already
[00:28:01] seen forks that make this very generally
[00:28:03] applicable and let you ask a question in
[00:28:05] plain English. So, it's it's coming.
[00:28:07] Last but not least, if you're optimizing
[00:28:09] for workflow routing, you're really
[00:28:11] talking about orchestration. You're
[00:28:13] talking about something like Crew AI,
[00:28:15] you're talking about something like
[00:28:16] Langraph. And really, what you want to
[00:28:18] do at that point is make sure that it is
[00:28:20] worth it to do all of those handoffs.
[00:28:23] So, there you go. Those that that's my
[00:28:26] safari tour, right? Those are the four
[00:28:28] species we've been able to see of
[00:28:30] different kinds of agents doing real
[00:28:32] work in the enterprise. Please do not
[00:28:34] confuse them. I see people who are
[00:28:37] proposing using auto research to build
[00:28:40] software. Don't do that. Right? I see
[00:28:42] people who are using longunning coding
[00:28:46] harnesses and they say this is the way
[00:28:47] that I want to build and write a novel.
[00:28:50] No, don't do that. like that would be an
[00:28:52] orchestration problem or really probably
[00:28:53] a human should do it. There are lots and
[00:28:56] lots and lots of ways to get agents
[00:28:59] right. But part of the challenge is we
[00:29:02] are now sophisticated enough that we
[00:29:04] have to be really specific with what
[00:29:06] agents do and do not do well and how you
[00:29:08] configure this supposedly simple idea of
[00:29:11] a tools and a loop and an LLM into
[00:29:15] actual work configurations. And so
[00:29:17] that's why I made this video. I want you
[00:29:19] to walk away and really really
[00:29:21] understand that there are at least four
[00:29:23] different types of agents in the wild in
[00:29:25] implementation today. Do not mix them
[00:29:28] up. Understand what you're building for.
[00:29:30] Cheers and good luck with your agents.
