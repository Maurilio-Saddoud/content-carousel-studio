# Raw Transcript

- Title: Anthropic Just Gave You 3 Tools That Work While You're Gone.
- Creator: AI News & Strategy Daily | Nate B Jones
- URL: https://youtu.be/3e7gmNPr5Vo?si=KikfrZMBjH0OitRB

---

[00:00:00] Anthropic finished up shipping OpenClaw
[00:00:02] for Claude. What they shipped is
[00:00:04] dispatch and then a day later computer
[00:00:07] use. And what they give you together is
[00:00:09] exactly what people do with OpenClaw but
[00:00:12] without all the security risks. So you
[00:00:14] can text claude from your phone. It
[00:00:15] takes over your desktop. It can open up
[00:00:17] apps. It can click its way through
[00:00:19] screens. It can navigate tools that have
[00:00:21] no API. And it delivers finished work
[00:00:24] while you are away at your phone
[00:00:26] wherever you want to be. Not a summary
[00:00:28] for you to review, not a draft to edit.
[00:00:29] the thing itself just gets sorted. And
[00:00:32] that distinction between work that lands
[00:00:34] on your desk and work that gets off of
[00:00:36] it is the whole game now. And I don't
[00:00:38] think we're talking about it enough. So
[00:00:41] much of the time I see AI agent demos
[00:00:45] that are optimized to look good, not
[00:00:48] optimized to actually get work off your
[00:00:51] desk. Like, let's be honest. How many AI
[00:00:54] agents want to come to you now and say,
[00:00:56] "I have a briefing for you, a proactive
[00:00:59] briefing. It's a really important
[00:01:00] briefing. It's going to be before your
[00:01:02] meeting. It's another docy." And maybe
[00:01:04] for an important meeting, it's worth it.
[00:01:06] But I've tried a lot of agents and if
[00:01:08] that's the thing they want to be
[00:01:09] proactive about, I got to be honest,
[00:01:11] some days it feels like just another
[00:01:13] dock to read. And so, I wanted to
[00:01:15] actually think about now that we have
[00:01:17] these tools, what do we do with them
[00:01:19] that's useful? How can we start to think
[00:01:22] logically through the gaps that we're
[00:01:24] closing in agentic workflows that allow
[00:01:26] us to get real work done and then start
[00:01:29] to say, okay, what are the use cases
[00:01:31] they unlock that get stuff off our
[00:01:33] desks? And so this video is about what's
[00:01:35] actually worth building once you have
[00:01:37] the power of Claude in your pocket with
[00:01:39] dispatch and computer use and all the
[00:01:41] rest of it. It's about how you clear out
[00:01:43] the technical debt. It's about how you
[00:01:45] clear out that hum or that buzz in your
[00:01:47] head when you have an idea and you can't
[00:01:48] write it down. It's about how you make
[00:01:50] sure that you make good decisions with
[00:01:52] highquality information when you're out
[00:01:54] and about. Look, I've been automating
[00:01:56] systems for a long time. And one of the
[00:01:58] things you learn about automating
[00:02:00] systems is that if they don't do work
[00:02:02] while you sleep, they're probably not
[00:02:05] worth it. And that's something that I
[00:02:07] notice a lot is that the people who tend
[00:02:09] to know how to use their agents figure
[00:02:11] out how to kick off work that actually
[00:02:14] builds and compounds over time. That's a
[00:02:16] lot of what I talked about when I talk
[00:02:17] about the open brain concept, right? The
[00:02:19] idea that you want to have a database
[00:02:21] that you control that's cheap, almost
[00:02:23] nothing, almost free that you can then
[00:02:26] build on by just naturally putting in
[00:02:29] what works for you and the channel that
[00:02:30] works for you. It just starts to acrue
[00:02:32] more knowledge. It allows your agent to
[00:02:34] be more proactive. Basically, I'm in a
[00:02:36] quest to make the leverage you get from
[00:02:39] professional engineering available to
[00:02:41] all of us. And I think agents are the
[00:02:43] key. And I think tools like Dispatch
[00:02:45] give us a way to do that. And if you're
[00:02:48] wondering if Dispatch will plug into
[00:02:50] OpenBrain, of course, yes it will. I'll
[00:02:52] show you how. It's not that hard. The
[00:02:54] reason I'm spending this video covering
[00:02:56] these use cases, these launches for
[00:02:58] Claude, is that I think this is the
[00:03:00] closest we've had to a widely available,
[00:03:04] secure, remote, always on agent that can
[00:03:08] do real work. I want it to do work for
[00:03:10] us that matters now. And I want to make
[00:03:12] sure you understand why this all stacks
[00:03:14] up and works. So the first building
[00:03:16] block, the first Lego brick here is
[00:03:19] scheduled tasks. It's not the same as
[00:03:21] scheduled tasks in chat. This is
[00:03:23] something that open clause users really
[00:03:25] loved because it let you do stuff while
[00:03:28] you were away and the Mac menu was on.
[00:03:30] Well, cloud scheduled tasks with Claude
[00:03:33] essentially closes the same gap. You get
[00:03:36] a repository, you get a schedule, and
[00:03:38] you get a prompt. And Anthropics
[00:03:40] infrastructure runs it. whether your
[00:03:41] laptop is on or not. Not a closet
[00:03:44] server, a controlled cloud environment
[00:03:47] with configurable network access,
[00:03:48] environment variables, and setup
[00:03:50] scripts. Basically, scheduled tasks from
[00:03:52] Claude gives you a computer in the cloud
[00:03:55] that you can message and tell it to do
[00:03:58] stuff on a schedule. Now, I will say
[00:03:59] there's some limitations, right? They're
[00:04:01] not going to let you check every minute
[00:04:03] for scheduled tasks. If you want
[00:04:04] something that's done constantly, this
[00:04:06] is not the environment for you. But if
[00:04:08] you want something checked every hour,
[00:04:09] every two hours, every 3 hours, and it's
[00:04:12] just a recurring task, this is perfect.
[00:04:14] And this is something that I think
[00:04:15] really speaks to developers. In fact,
[00:04:17] that's where Enthropic went in their
[00:04:19] launch video. They talked about using
[00:04:22] this exact scheduled approach
[00:04:23] internally. By the way, Enthropic dog
[00:04:25] foods their stuff internally
[00:04:26] obsessively. That's part of sort of how
[00:04:28] they build and how they know what to
[00:04:29] build. They said that they use this sync
[00:04:31] to maintain a Go/Python
[00:04:34] library internally. In other words, a
[00:04:36] codebase in one language that
[00:04:38] automatically stays in sync with a
[00:04:41] codebase in another language because of
[00:04:43] this scheduled task function. So that's
[00:04:45] a production workflow normally would
[00:04:47] require an engineer spending a few hours
[00:04:49] a week on a task that is important but
[00:04:51] never urgent. Exactly the kind of work
[00:04:53] that tends to fall through the cracks in
[00:04:55] most engineering organizations. And yes,
[00:04:57] you can connect it to any MCP server
[00:04:59] you've already wired into Claude, right?
[00:05:01] You can connect it to Linear, you can
[00:05:03] connect it to GitHub, you can connect it
[00:05:04] to Slack, you can connect it to
[00:05:06] OpenBrain, you can connect it to Google
[00:05:08] Drive, whatever you've already set up,
[00:05:10] and the connectors just carry. You don't
[00:05:12] have to configure them twice. And so
[00:05:14] anytime you have scheduled tasks, you
[00:05:17] can just say, "Run this script at 2 a.m.
[00:05:20] every night," and it will just do it. So
[00:05:22] what does this look like if you're not a
[00:05:24] developer? Let me give you some ideas
[00:05:26] that actually get work off your desk.
[00:05:28] Number one, I find that I constantly
[00:05:31] need to keep up with AI news. Big
[00:05:34] surprise. It's a lot of what I have to
[00:05:36] do. It is awfully nice to wake up in the
[00:05:39] morning and have a lot of that work done
[00:05:42] because of a scheduled job. And that is
[00:05:44] something that I have had to hack around
[00:05:46] on for a while. And it is a whole lot
[00:05:48] simpler when Anthropic just launches a
[00:05:50] basic primitive that says just schedule
[00:05:52] it out. and it's a full job that can run
[00:05:54] and it can stick it into your MCP server
[00:05:56] and put it in your open brain and it's
[00:05:59] just done. And then I can get a parsed
[00:06:01] version, I can get a research version, I
[00:06:03] can get a condensed version, I can get
[00:06:04] whatever I want, right? I can I can edit
[00:06:06] the schedule if I want it, etc. And so
[00:06:08] if you're trying to keep up on AI,
[00:06:10] that's an example of something that like
[00:06:12] you just don't have to put as much work
[00:06:14] into reading the news because the news
[00:06:15] gets fed to you. Another great example
[00:06:17] of what you can do with this, let's say,
[00:06:20] look, aviation prices are up. You're
[00:06:23] looking for good deals. You don't want
[00:06:25] to have to scan the airline prices all
[00:06:26] the time. You get the idea, right? You
[00:06:28] can run that schedule every hour. You
[00:06:30] can come back and it will just pop in
[00:06:32] and alert you when it goes below a
[00:06:33] certain threshold for the route that
[00:06:34] you're looking at. Anything that happens
[00:06:37] in time, this can take care of for you.
[00:06:41] Here's another one. There are some
[00:06:43] places that don't let you put auto
[00:06:45] payments on a schedule. You have to
[00:06:47] remember to pay your bills on time. Why
[00:06:49] not just give yourself a reminder and it
[00:06:52] pops up for you so you never forget to
[00:06:54] pay the bill? I think that one of the
[00:06:56] biggest challenges in 2026 is
[00:06:58] recognizing how much of our lives is
[00:07:01] actually agent shaped. There's so many
[00:07:03] problems that we can start to solve if
[00:07:06] we have these primitives in place. And
[00:07:09] so what I call a primitive is basically
[00:07:11] just a building block that you can build
[00:07:13] a lot of the rest of the work you want
[00:07:15] to do on. In this case, the building
[00:07:16] block is just native scheduling with
[00:07:18] claude. But look how it comes together.
[00:07:20] Number two is persistence. So if we talk
[00:07:23] about scheduling as a primitive and what
[00:07:25] claude released there in the last few
[00:07:27] days, the second thing they released, I
[00:07:28] mentioned this at the top is dispatch.
[00:07:31] So openclaw also has persistence. Claude
[00:07:34] is very deliberately copying OpenClaw
[00:07:35] here. It's not a secret. OpenClaw
[00:07:37] remembered your context. It carried work
[00:07:39] across sessions. You didn't start over
[00:07:41] every time you open the app. That
[00:07:42] continuity was a feature that felt
[00:07:45] really obvious once you experienced it
[00:07:48] and that every traditional chatbot
[00:07:49] interface lacked and people responded to
[00:07:52] this, right? This is part of what people
[00:07:54] want is an always on agent. Dispatch
[00:07:56] closes that gap for Enthropic, but not
[00:07:59] in the way a lot of the coverage has
[00:08:00] talked about. So the surface level
[00:08:02] description has been look it's just
[00:08:05] persistent chat for your phone. It's not
[00:08:06] that hard. You just chat and it's one
[00:08:08] long context window. But that undersells
[00:08:10] what is really going on. When you pair
[00:08:12] your phone with claw desktop via QR
[00:08:14] code, you don't get a single thread that
[00:08:17] runs a task. You're actually getting an
[00:08:20] orchestration layer. So from one
[00:08:23] conversation on your phone, you can
[00:08:25] spawn and manage multiple claw work task
[00:08:30] sessions running simultaneously on your
[00:08:32] desktop. Each session runs
[00:08:34] independently, its own context, its own
[00:08:36] file access, its own connectors. Your
[00:08:39] phone is the command surface for all
[00:08:41] this and your desktop is the execution
[00:08:43] surface. The sessions can run in
[00:08:45] parallel. That's not remote control.
[00:08:48] That's actually a dispatch layer in the
[00:08:51] literal sense of the word. That's
[00:08:52] probably why they named it dispatch.
[00:08:54] You're dispatching work to parallel
[00:08:56] agents from a mobile interface wherever
[00:08:58] you happen to be. And what that means is
[00:09:01] you are able to get all the work you can
[00:09:03] envision for clawed co-work done without
[00:09:06] having to be at the computer anymore.
[00:09:08] And let me tell you, for some of us,
[00:09:10] especially if you're a parent, if you're
[00:09:11] out and about a lot, it is awfully nice
[00:09:14] to not be tethered to the desk. I
[00:09:16] actually love this example from Pavle
[00:09:18] Hurin. He's a product manager who ran
[00:09:20] dispatch for 48 consecutive hours on
[00:09:22] work and he documented sort of the
[00:09:24] behavioral shift and he's a parent too,
[00:09:25] right? He went to a kid's bounce house
[00:09:27] and the work ran without him from the
[00:09:29] sidelines. He had his phone in his hand
[00:09:31] and he could direct multiple rounds of
[00:09:33] iteration on something he was working on
[00:09:35] as he watched the kids bounce around. I
[00:09:37] relate to that, right? Like I've been to
[00:09:39] that bounce house. He could do
[00:09:40] competitor analysis. he could draft sort
[00:09:42] of messaging to stakeholders and he
[00:09:44] could do all of this running in parallel
[00:09:46] across multiple co-work instances and he
[00:09:48] actually tracked how much time he spent
[00:09:50] and it turns out that over a couple of
[00:09:52] days he spent roughly 25 minutes
[00:09:54] actually entering commands in and then
[00:09:56] claude just executed in parallel over
[00:09:58] multiple hours of work and he didn't
[00:10:00] have to fill in the dead time at the
[00:10:02] desk while Claude was tokenizing. Have
[00:10:04] you ever been the guy at the desk?
[00:10:05] You're like, "Oh, well, Claude's
[00:10:07] tokenizing. I don't know what am I going
[00:10:09] to do." And so, you don't have to do
[00:10:10] that anymore. You can do what you need
[00:10:12] to do and go about your day and just
[00:10:14] check in with Cloud when you need to.
[00:10:15] Really, what's going on is that this is
[00:10:17] parallel asynchronization
[00:10:20] from your pocket. Now, the constraint
[00:10:22] here is really obvious. Unlike the cloud
[00:10:24] example, if you want this to work, you
[00:10:27] got to have your desktop up and it's got
[00:10:29] to be on. There's no substitute for
[00:10:32] that. Now, I suspect very, very strongly
[00:10:34] all the indicators are written on the
[00:10:36] wall. Claude is going to fix that.
[00:10:37] Claude is going to make it so you don't
[00:10:39] have to have your laptop always on or it
[00:10:41] could wake itself up or whatever it
[00:10:43] needs to do. It's not here yet, but I
[00:10:45] bet you it's coming soon. And there's
[00:10:46] some other minor teething issues I
[00:10:48] expect to work through here. Every
[00:10:49] subtask that Dispatch spawns requests
[00:10:53] folder access on your desktop
[00:10:55] individually that you have to approve.
[00:10:56] There's no bulk approval right now. You
[00:10:58] can't attach files from the phone yet.
[00:11:01] You can't even receive output files back
[00:11:03] directly. The workaround is syncing your
[00:11:06] co-work instance to your Google Drive or
[00:11:09] your Dropbox so that it dumps the files
[00:11:11] in both directions automatically. And
[00:11:13] yes, you can do that and I can show you
[00:11:14] how. Complex multi-app tasks are going
[00:11:16] to succeed roughly half the time based
[00:11:19] on early testing. So, think about it as
[00:11:21] big multi-step tasks and you're getting
[00:11:23] about a 50% success rate. But if you're
[00:11:24] out and about all day, maybe you don't
[00:11:26] mind that because hey, you flip a coin,
[00:11:28] you get the success. If it doesn't work,
[00:11:29] you just try a fresh instance and maybe
[00:11:31] that one works. That's probably why
[00:11:33] Claude has labeled this research
[00:11:34] preview. But I think the unlock you get
[00:11:36] from being freed from the desk is really
[00:11:38] huge because fundamentally it moves you
[00:11:41] into the correct pattern for agents. You
[00:11:43] are in a management pattern. When a
[00:11:45] manager is truly managing a person, do
[00:11:47] they sit there and look over their
[00:11:48] shoulder? I mean, I've had managers that
[00:11:50] do that. I didn't like those managers.
[00:11:52] Most people don't. You want the manager
[00:11:54] to go about their day and let you do
[00:11:55] your thing. That's the mode we need to
[00:11:58] get into in 2026 with agents. And that
[00:12:00] is why I keep harping on the fact that
[00:12:02] we need to expect our agents to lift
[00:12:04] work off the desk and not just create
[00:12:07] more busy work for us in the name of AI
[00:12:09] agents. And so if you're thinking about
[00:12:11] using dispatch, don't think of using
[00:12:13] dispatch just to make up work for
[00:12:15] dispatch. Instead, look at the kind of
[00:12:19] work that you would love to do in
[00:12:22] background while you have other stuff
[00:12:24] going and like you got to cook dinner,
[00:12:26] you got to pick up the kids from school,
[00:12:28] whatever it is, and you want to spin up
[00:12:29] a clawed co-work task and just sort of
[00:12:31] keep an eye on it on the phone. That is
[00:12:33] the perfect example. Now, anything
[00:12:35] co-work can do, and that is a broad
[00:12:36] spectrum, dispatch can do as well. And
[00:12:39] so, if you tell Dispatch, hey, I'm
[00:12:42] trying to do some deep research. I'm
[00:12:43] preparing to write a complex research
[00:12:45] report at my desk. I want to think about
[00:12:47] the way our brains are changing as we
[00:12:50] relate to artificial intelligence, which
[00:12:51] is the topic I've been thinking about.
[00:12:53] You can just tell Dispatch to dig into
[00:12:55] the research and Claude Co-work will
[00:12:57] spin that up and do all of that and have
[00:12:59] that ready for you by the time you get
[00:13:00] to the desk. If you want, for example,
[00:13:03] to have Claude Co-work dig in and start
[00:13:06] to build something for you, start to
[00:13:08] code something for you. So, if you can
[00:13:10] get to the desk and review the code
[00:13:11] block and review the prototype and see
[00:13:13] how it's going, you can kick that off as
[00:13:16] well. This is the kind of work I want to
[00:13:18] encourage you to think about. And by the
[00:13:20] way, don't be afraid of the code. If you
[00:13:21] haven't coded before, trust me, I have
[00:13:23] lots of guides on this. It is not scary.
[00:13:25] You can actually build interesting tools
[00:13:27] now straight from co-work. In fact, I
[00:13:31] know someone who never coded before in
[00:13:34] her life who has built an entire
[00:13:37] complete calendar app that meets her
[00:13:39] needs and that nobody else has been able
[00:13:41] to code for her for 20 years. And she
[00:13:42] did it in like two weeks with no coding
[00:13:44] experience. And I don't say that as an
[00:13:46] exception. She's great, but like
[00:13:48] everybody can do that now. And so this
[00:13:49] is one of those things where I want to
[00:13:50] keep emphasizing these agents are
[00:13:52] really, really good. If you have clarity
[00:13:54] of intent and you want to get work off
[00:13:56] your desk and say, "I really need this.
[00:13:58] This is going to save me hours a week.
[00:14:00] Please make it right. That is the kind
[00:14:02] of urgency I want us to bring to agents.
[00:14:04] And then dispatch frees us to be the
[00:14:06] manager and say, "So, start to work on
[00:14:08] that calendar app. Start to work on
[00:14:10] whatever the thing is that is your pet
[00:14:11] project. Let me come back to it later."
[00:14:14] Right? I'll come back and check on you
[00:14:16] in an hour. And this is more and more
[00:14:17] the pattern we're going to see in 2026.
[00:14:19] Okay. And the last one, the thing that I
[00:14:21] think is the best is what Claude saved
[00:14:24] for last. What about the apps that don't
[00:14:26] have MCP servers? What about the apps
[00:14:28] that don't have connectors? I think this
[00:14:30] is the most consequential piece for
[00:14:31] builders and I think it's really really
[00:14:34] big that we understand what this means.
[00:14:36] So I love that Claude reaches for MCP
[00:14:38] connectors first. It's very very
[00:14:40] wellnown. They prefer it. They love it.
[00:14:42] They encourage you to use it. There's a
[00:14:43] reason I put open brain into MCP.
[00:14:45] There's a reason everybody puts things
[00:14:47] into MCP. There is a reason that when
[00:14:49] Google launches their products, they
[00:14:52] talk about MCPs that work with clot. MCP
[00:14:54] is the universal USB of the AI age. But
[00:14:58] despite that, not everybody puts their
[00:15:00] stuff into MCP. It's just a reality. The
[00:15:02] web is vast. There are many, many tools.
[00:15:05] There's just never going to be a world
[00:15:06] where we have close to 100% coverage.
[00:15:08] There's never going to be a world where
[00:15:09] we have 50% coverage with MCP servers,
[00:15:12] right? More than half the world is not
[00:15:15] accessible to agents easily. And we're
[00:15:17] talking just about the limited world of
[00:15:19] the screen. Still, more than half of
[00:15:20] that is not accessible to agents. And so
[00:15:23] what Claude did here is it took the
[00:15:25] blinders off and it basically said, "You
[00:15:27] know what? We're going to make sure that
[00:15:30] remotely through co-work
[00:15:34] tool on your computer and that includes
[00:15:36] the web browser and you can do any kind
[00:15:38] of remote work that involves keyboard
[00:15:40] and mouse clicking." That's right. You
[00:15:41] can be, you know, 10 miles away watching
[00:15:44] the kids at the bounce house and your
[00:15:46] computer is going to be typing away and
[00:15:48] your mouse is going to be moving and
[00:15:49] it's not going to be haunted and it's
[00:15:51] not going to be a horror movie. It's
[00:15:52] just going to be Claude doing his job
[00:15:53] because you asked it to via dispatch.
[00:15:56] And this is really a case where you
[00:15:57] start to solve business problems, where
[00:15:59] you start to get work off the desk.
[00:16:01] Think about the old instance of Jira.
[00:16:03] Maybe it's not up to date. Maybe it
[00:16:04] doesn't have a good MCP. Think about a
[00:16:06] bespoke ERP screen. Think about an old
[00:16:09] SAP instance. Think about something that
[00:16:11] is not ever ever ever going to be easy
[00:16:14] to get data out of. And maybe you don't
[00:16:17] have time to build the full connector
[00:16:19] with the engineering team because you
[00:16:20] can't get on their backlog, but you have
[00:16:23] a process that has to run and you have
[00:16:26] to get it into a spreadsheet and then
[00:16:28] you have to send it to the accountant.
[00:16:29] I've been there, right? I've been the
[00:16:31] person who had to go through the
[00:16:33] agonizing process of checking two or
[00:16:35] three different antique sites for data
[00:16:38] that I then manually put into a
[00:16:40] spreadsheet and it took me like half the
[00:16:42] day. There is so much office work that
[00:16:44] falls into that category. And
[00:16:46] essentially what Claude said is you're
[00:16:48] the manager now. Just send the task via
[00:16:51] dispatch. Walk away and let Claude
[00:16:54] manage it for you. Let Claude get that
[00:16:56] out for you. And that's why I keep
[00:16:58] harping on like think like a manager.
[00:17:00] Get work off your desk. Don't be
[00:17:02] satisfied with what I would call pseudo
[00:17:04] work. So much of the demos we see brag
[00:17:07] on pseudo work. I was looking at another
[00:17:09] one today. It's like so obsessed with
[00:17:12] proactive briefing. So obsessed with
[00:17:14] essentially making more text for me to
[00:17:16] read. Stop making more text for me to
[00:17:19] read. Agents should take work off my
[00:17:21] desk. If they're not taking work off my
[00:17:23] desk, I don't want it. And this is what
[00:17:24] makes this exciting is because this is
[00:17:26] actually a string of Lego bricks, a
[00:17:28] string of primitives you can put
[00:17:29] together that you can actually get real
[00:17:31] work done with. You can assign the task
[00:17:33] from your phone. You can use desktop
[00:17:35] apps to complete it and it can be
[00:17:37] totally done. If you're the engineer,
[00:17:39] you can schedule it in the cloud and it
[00:17:41] can just be done. And people are going
[00:17:42] to tell you at this point that the key
[00:17:44] difference between openclaw and
[00:17:45] anthropic is safety, that anthropic is
[00:17:48] the safe one, and openclaw is the
[00:17:49] dangerous one. I don't think that's
[00:17:51] correct. I think that the difference is
[00:17:53] the degree to which you want to
[00:17:55] self-host versus the degree to which you
[00:17:57] want a managed agent. So, open clause
[00:17:59] infrastructure that you have to roll and
[00:18:01] run yourself. You set the server up. You
[00:18:04] configure the network. You manage the
[00:18:06] credentials. You vet the skills. You
[00:18:08] troubleshoot the websocket connections.
[00:18:10] You decide what the agent can access and
[00:18:12] what it cannot. For developers who want
[00:18:14] that control, it is a super powerful
[00:18:16] thing. For everybody else, it kind of
[00:18:18] feels like a second job. The Mac Mini in
[00:18:21] the closet does need to be maintained.
[00:18:23] And for developers who know how to do
[00:18:24] it, it's not too bad. They can get it
[00:18:26] done. I've written the guide on how to
[00:18:27] do that. You can totally do it even if
[00:18:29] you're non-technical. But I don't want
[00:18:31] to pretend it's not work. Enthropic
[00:18:33] brings managed infrastructure. Cloud
[00:18:36] scheduled tasks run on their servers,
[00:18:38] not yours. Dispatch runs in a sandboxed
[00:18:41] environment where Claude accesses the
[00:18:42] files and the apps that you've
[00:18:44] explicitly stated that it can access
[00:18:46] with permission. Computer use is going
[00:18:49] to ask you before it touches new
[00:18:50] applications. You don't configure the
[00:18:52] network. You don't vet the skills
[00:18:54] marketplace. You don't configure the
[00:18:56] server. So much of that is abstracted
[00:18:58] away for you. And I want you to think
[00:19:00] back to the history of compute here.
[00:19:02] This is the exact same shift that
[00:19:04] happened with email where we went from
[00:19:06] self-hosted send mail to Gmail for those
[00:19:08] of you who have gray beards with compute
[00:19:10] where we went from rack servers to AWS
[00:19:13] with CI/CD where we went from Jenkins on
[00:19:16] your box to GitHub actions. Every time
[00:19:19] the self-hosted version comes first and
[00:19:23] proves that the category exists. The
[00:19:25] managed version comes second and that's
[00:19:28] the thing that gets mass adoption for
[00:19:30] you. It's not because the self-hosted
[00:19:32] version was wrong, quote unquote. It's
[00:19:33] just that that's the way you learn if
[00:19:36] something works and if people want it.
[00:19:38] And once you prove that, it's relatively
[00:19:40] easy to roll out the managed version to
[00:19:43] a wider audience, which is exactly what
[00:19:45] Peter Steinberger is working to do at
[00:19:46] OpenAI. I guarantee you, they are
[00:19:49] looking at what Claude is launching over
[00:19:50] at OpenAI and they're like, "We can't
[00:19:52] wait. We're going to launch soon." And
[00:19:54] look, I'll be honest, the ceiling is
[00:19:56] different here with agents, right? Open
[00:19:57] Claw is going to give you more raw
[00:19:59] freedom. It is the dangerously skip
[00:20:01] permissions version of agents and
[00:20:03] Enthropic is going to rain it in a
[00:20:05] little bit. Enthropic stack runs on
[00:20:07] cloud. You can't just swap any LLM in.
[00:20:09] It reaches what your connectors and
[00:20:11] computer use can touch. If you want to
[00:20:13] wire in your local O Lama on prem, I'm
[00:20:16] not going to pretend this is for you.
[00:20:18] But for most of us, for the vast
[00:20:20] majority of people who are passionately
[00:20:22] interested in agents, and I get asked
[00:20:23] about this all the time, when is there
[00:20:25] an agent? When is there an open clause?
[00:20:26] Is open clause safe for me? This is the
[00:20:28] safe open claw, right? This is safe
[00:20:30] enough. It's useful enough. It does
[00:20:32] enough that it works. And that's why I
[00:20:35] keep emphasizing tasks that get work off
[00:20:37] our desk. I want us to think about that.
[00:20:39] I want you to comment on this video and
[00:20:41] tell me the tasks that get work off the
[00:20:44] desk versus the fake work, the stuff
[00:20:46] that works in demos that doesn't
[00:20:48] actually get work off the desk. I'll
[00:20:50] give you another one from trips. I
[00:20:52] talked earlier about the fact that
[00:20:54] scanning for airline prices and saving
[00:20:55] real money, which can save you the cost
[00:20:57] of the closet subscription, hey, that
[00:20:59] gets worked off the desk. You know what
[00:21:01] doesn't get work off the desk? Every
[00:21:03] single time they demo the special
[00:21:06] travel, trip preparation, whatever.
[00:21:09] Look, I do spend a little bit of time
[00:21:11] planning a trip, but I do not understand
[00:21:13] why that has to be the showcase demo for
[00:21:16] every single app that is Aentic. We
[00:21:19] don't all plan trips quite that much. So
[00:21:21] before I close this video, I want to
[00:21:24] give you the framework to start to
[00:21:26] figure out how to get stuff off your
[00:21:28] desk and give it to agents in the way
[00:21:30] that we need to in 2026 with a
[00:21:33] management mindset. The first principle
[00:21:35] I want to teach you here is that you
[00:21:37] need to find something that is buzzing
[00:21:40] in the back of your brain that you need
[00:21:42] to close. Look for it as a commitment
[00:21:45] loop that you need to close. every
[00:21:47] promise you make and people the more
[00:21:49] responsible you are the more promises
[00:21:50] you have to write whether you're
[00:21:52] promising in email whether you're
[00:21:53] promising in Slack whether you're
[00:21:54] promising in WhatsApp it's an open loop
[00:21:57] you told the client you'd send the
[00:21:59] revised scope by Thursday you signed the
[00:22:01] memorandum of understanding by Wednesday
[00:22:03] you told your team that you get the
[00:22:05] minutes from the last meeting to them by
[00:22:07] tomorrow whatever it is you made a
[00:22:09] promise you need to keep it and it's
[00:22:12] sitting in your head that is the kind of
[00:22:15] thing that you need to be delegating to
[00:22:17] agents. And especially if you are
[00:22:20] someone who has lots and lots of these
[00:22:22] open promises at once, you got to close
[00:22:24] them. You got to give more of them to
[00:22:26] agents and let those agents do the work
[00:22:29] and carry the mental load forward and
[00:22:31] close it. And if you're going to tell
[00:22:32] me, Nate, I can't do it because the
[00:22:35] agents quality isn't good enough, I'm
[00:22:36] going to say, that's a skill issue.
[00:22:37] That's a prompting issue. And that is
[00:22:39] something we can fix. That is something
[00:22:40] we can fix because you can learn to give
[00:22:44] the agent what it needs either through
[00:22:47] the system instructions, through the
[00:22:48] context layer that you're giving it,
[00:22:50] through the prompt that you're giving it
[00:22:51] to get a quality result. It is not
[00:22:53] impossible in 2026. I do not want to
[00:22:56] hear I can't get a good report out of
[00:22:58] AI. I don't want to hear I can't get a
[00:23:00] good draft of the memorandum of
[00:23:01] understanding. I can't get good meeting
[00:23:03] minutes out. No, no, no, no, no. You
[00:23:04] can. It's a skill issue and you can
[00:23:06] learn and I have a guide for that. You
[00:23:08] can figure it out. I'll give you another
[00:23:10] category that I think is really
[00:23:11] important to get work off the desk. If
[00:23:13] you are trying to make a decision, so
[00:23:16] often we come against these decisions in
[00:23:19] business and we don't have time to
[00:23:22] consider the information involved and
[00:23:23] make a good choice. We're running into
[00:23:25] the meeting, we're late, we didn't read
[00:23:27] the docs in advance. How many of us read
[00:23:29] the docs in advance? Let's just be
[00:23:30] honest. And we're like, "Okay, what do I
[00:23:32] have? What do I figure out?" And do you
[00:23:33] know how many people sit there and
[00:23:35] they're stuffing the docs into Chad GPT
[00:23:37] and they're like, "Tell me what to
[00:23:38] think. Tell me what to do. Tell me what
[00:23:39] to decide. Please don't do that. You
[00:23:41] have time to figure this out. You can
[00:23:44] run a scheduled task for this. You can
[00:23:46] tell your dispatch in the morning on the
[00:23:48] way to work to help you develop an
[00:23:51] understanding of the subject area. You
[00:23:53] can figure out your opinion by bouncing
[00:23:57] it off of an AI, even if you're on the
[00:23:59] phone and getting data back. And by the
[00:24:01] way, there's a way to do this badly and
[00:24:03] well. The bad way to do it is to try and
[00:24:05] use the AI to confirm your own opinion.
[00:24:08] The good way to do it is to actually
[00:24:10] push and say, "I need more data and more
[00:24:13] information than I would normally use to
[00:24:15] make this decision." Typically, if I'm
[00:24:17] running into a meeting and I'm late, I'm
[00:24:18] making the decision with 30% of the
[00:24:20] available information or less. Why not
[00:24:22] make it with 70%. Why not go fishing for
[00:24:24] data that would help you make a better
[00:24:26] choice? Maybe it's using computer use
[00:24:29] and finding the dashboard that you
[00:24:30] normally wouldn't have time to check.
[00:24:32] Maybe it's digging up the Excel
[00:24:33] spreadsheet you normally wouldn't have
[00:24:35] time to grabbing and pulling it in. The
[00:24:37] more you start to use the agentic tools
[00:24:40] at your disposal to pull in that data,
[00:24:42] the better off you're going to be.
[00:24:44] Compound signal detection. I have I have
[00:24:46] emphasized this with open brain. I'm
[00:24:48] just going to come back to it again. If
[00:24:50] you have attached your open brain, you
[00:24:53] have so much value here because you are
[00:24:55] now on your phone with your dispatch and
[00:24:57] your claude knows OpenBrain and can talk
[00:24:59] to Openrain via the MCP server and you
[00:25:02] can start to benefit from compounding
[00:25:04] signal detection across weeks wherever
[00:25:07] you happen to be. And so your agent
[00:25:09] might come back and say, "Hey, you ran a
[00:25:11] scheduled task. I noticed that your
[00:25:13] competitor is hiring aggressively around
[00:25:14] payments. This is something we talked
[00:25:16] about when we talked about corporate
[00:25:18] strategy three weeks ago. I think you
[00:25:20] should do X or Y. Or your agent might be
[00:25:22] doing research and say, hey, a
[00:25:23] competitor filed two patents. The
[00:25:25] patents are around crossber settlement.
[00:25:27] I'm connecting this with their hiring
[00:25:28] patterns. Now we're seeing their
[00:25:30] crossber strategy emerge, etc., etc.
[00:25:32] Essentially, if you have dispatch and
[00:25:36] you have open brain, you have a
[00:25:39] proactive way to figure out patterns
[00:25:42] over time wherever you happen to be. on
[00:25:45] a schedule, not on a schedule, using
[00:25:47] computer use, not using computer use. It
[00:25:50] takes the agent from being reactive to
[00:25:53] what you stick into dispatch to being
[00:25:55] something where you can proactively pop
[00:25:58] up, see an email from your agent, and
[00:26:00] say, "Ah, that's something I want to pay
[00:26:01] attention to." And this one is for
[00:26:02] engineers. We loved doing overnight
[00:26:06] engineering work, jobs that would run
[00:26:07] all night when I was at Amazon, because
[00:26:09] it's work that you can do and it cleans
[00:26:11] stuff up while you sleep. It's perfect.
[00:26:14] Hopefully nobody gets woken up. I don't
[00:26:16] mean run the llinter, run an analysis of
[00:26:19] your code file. I mean migrate this
[00:26:21] dependency. I mean please improve test
[00:26:24] coverage, write test coverage to cover
[00:26:26] 80% of use cases. I mean refactor the
[00:26:29] authentication layer we can never get to
[00:26:31] stuff like that. And if you think this
[00:26:34] is too technical for you, I'm going to
[00:26:36] remind you there are people who are
[00:26:38] coding whole apps who have never coded
[00:26:39] before. If you have clarity of intent of
[00:26:42] what you want to get done, the technical
[00:26:45] piece is not an obstacle. In fact, you
[00:26:47] can delegate a lot of it in 2026 and you
[00:26:49] can get a surprisingly useful result.
[00:26:52] I'm not going to pretend that you can
[00:26:54] vibe code Amazon.com or you can vibe
[00:26:57] code Salesforce and it will be exactly
[00:26:59] the same. But I will say there are
[00:27:02] people who have vibecoded their own CRM
[00:27:06] and are perfectly happy at startups. So
[00:27:09] the distance is maybe not as much as you
[00:27:10] think. The pattern across all of these
[00:27:13] cases that I have called out to you in
[00:27:15] the last few minutes is consistent. It
[00:27:17] is work off the desk. It is the agent
[00:27:19] takes something off of your plate. That
[00:27:22] is the meta skill that I want you to
[00:27:23] learn. Look at these primitives as free
[00:27:26] leverage. This is leverage you can use
[00:27:29] in 2026 to get more of what you want
[00:27:33] done off your plate. That is what we
[00:27:36] should expect from our agents. I want to
[00:27:38] close with a reflection that I think is
[00:27:40] a big piece of this year that I don't
[00:27:42] see talked about anywhere. People talk
[00:27:43] about agents like the next best thing
[00:27:45] since sliced bread. They put all these
[00:27:46] demos out that are basically fake work,
[00:27:49] which we've talked about extensively in
[00:27:50] this video. But what we don't talk about
[00:27:53] is the fact that it is hard for us as
[00:27:56] humans to trust that the computer is
[00:27:59] doing work when we aren't looking at it.
[00:28:02] I have this problem, too. I walk away. I
[00:28:04] used my dispatch and I'm itchy. I'm
[00:28:06] like, I want to go back. I want to make
[00:28:08] sure it's working. Is it really working?
[00:28:10] We're going to need to learn to shift
[00:28:11] that. We're going to need to learn to
[00:28:14] untether. We're going to need to learn
[00:28:17] to trust that the agent is doing the
[00:28:20] work when we walk away. That is one of
[00:28:22] the big shifts I see in the next half of
[00:28:24] the year. And it's going to be the
[00:28:25] people who are able to walk away, who
[00:28:28] are able to touch grass, who are able to
[00:28:29] see the kids at the bouncy castle, who
[00:28:31] are able to reset, who can make good
[00:28:33] decisions about what they want to give
[00:28:35] their agents, and who ultimately get the
[00:28:37] leverage back that this whole AI thing
[00:28:40] is all about. Because AI is really not
[00:28:42] about the fake work. And people tell me
[00:28:44] it's a bubble. It's a bubble. I'm like,
[00:28:45] no, it's not a bubble. The demand for
[00:28:47] tokens is outstripping supply and we're
[00:28:49] building it as fast as we can. This is
[00:28:51] not a bubble problem. It is a how do we
[00:28:53] use it intelligently problem and that is
[00:28:55] on us and we have got to figure out how
[00:28:58] to change our skill set so we are more
[00:29:00] and more and more managers as we move
[00:29:02] into the second half of this year and
[00:29:04] that is the story on dispatch that no
[00:29:07] one is telling you. Cheers.
