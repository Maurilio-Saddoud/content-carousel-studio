# Raw Transcript

- Title: Claude Code Wiped 2.5 Years of Data. The Engineer Who Built It Couldn't Stop It.
- Creator: AI News & Strategy Daily | Nate B Jones
- URL: https://youtu.be/8lwnJZy4cO0?si=G4dGFJSCbKYJJjnn

---

[00:00:00] Vibe coders everywhere are hitting a
[00:00:02] wall. They know how to vibe code. They
[00:00:04] know how to build stuff. We can use
[00:00:05] Lovable. We can use really any textbased
[00:00:08] tool to build stuff now. And so folks
[00:00:09] are getting into Claw. They're getting
[00:00:11] into Claude Code. They're getting into
[00:00:12] codecs. They're getting into shipping
[00:00:14] artifacts through chat GPT. They're
[00:00:16] getting into Replet. I could keep naming
[00:00:18] tools for half an hour. The point is
[00:00:21] that you are shipping software based on
[00:00:24] your text. And that was the story of
[00:00:25] 2025. But so many vibe coders are coming
[00:00:29] to me now and saying I feel like I'm
[00:00:31] missing a set of skills. I feel like I
[00:00:34] don't have the skills for the agentic
[00:00:35] world. Like agents caught up and now I
[00:00:37] don't know how to build software again
[00:00:39] in 2026 because vibe coding isn't how
[00:00:41] you do it. It's like vibe agenting but
[00:00:43] that's not a word. How do you build
[00:00:45] software with agents? How do I take my
[00:00:48] VIP coding skills and transfer them? I'm
[00:00:50] not a software engineer. This video is
[00:00:52] for you. If you're someone who described
[00:00:54] what you wanted and AI built it and you
[00:00:56] shipped it, maybe you have real
[00:00:57] customers now and maybe things are
[00:00:59] starting to break in ways that better
[00:01:01] prompting alone can't fix. Maybe you
[00:01:03] have agents ignoring your instructions.
[00:01:04] Maybe you have hours of work lost to a
[00:01:06] single bad change. Maybe you've hit the
[00:01:09] wall between building a product with AI
[00:01:11] and running one. And almost nobody is
[00:01:13] talking about the specific skills that
[00:01:14] get you over that hump. This is all
[00:01:16] about that. This is not about learning
[00:01:19] to code. That is not a skill we're
[00:01:21] really teaching in 2026 in the same way
[00:01:23] anymore. This is a video about the skill
[00:01:25] of learning to manage the agent that
[00:01:29] codes for you. That is the skill of
[00:01:31] 2026. And yes, you really can do
[00:01:34] anything non-technical if you can get an
[00:01:36] agent to code for you. That is why
[00:01:38] people are calling cloud code AGI. That
[00:01:40] is why OpenAI is seeing rapid adoption
[00:01:43] with codecs. That is why even Google
[00:01:45] went out and shipped their Google Docs
[00:01:48] to the command line interface recently.
[00:01:49] And before you wonder, is this a real
[00:01:51] concern? Like, do I have to worry about
[00:01:53] managing my agents? I will point out to
[00:01:55] you that SummerU, a meta security
[00:01:57] researcher, ended up in trouble because
[00:02:00] OpenClaw accidentally deleted a large
[00:02:03] portion of her email inbox in February
[00:02:05] 2026. Despite explicit instructions to
[00:02:08] confirm before acting, the agent decided
[00:02:11] to speedrun deleting emails. and that
[00:02:13] continued after she sent commands to
[00:02:15] stop and she described having to run to
[00:02:17] the Mac Mini and unplug it to save even
[00:02:19] a part of her email archive. Agents are
[00:02:22] not as easy as vibe coding and you need
[00:02:24] to think differently when you manage
[00:02:26] agents. So, let's get into it. The first
[00:02:27] thing to realize is that your vibe
[00:02:29] coding tool may have become agentic when
[00:02:32] you weren't looking. So, Claude Code,
[00:02:34] Cursor, OpenAI's Codeex, GitHub Copilot,
[00:02:38] they don't just suggest code, they go
[00:02:40] ahead and execute it. They read your
[00:02:41] files. They make changes directly. They
[00:02:43] run commands. They install things. They
[00:02:45] iterate against their own mistakes. If
[00:02:47] you give a task and the agent works
[00:02:49] autonomously for a long time for 10, 20,
[00:02:52] 30, 40 or 56 minutes as Chad GPT 5.4 did
[00:02:56] during a recent eval I ran, then you are
[00:02:59] working with an agent and you have to
[00:03:00] act like that. You have to think like
[00:03:02] that. You have to work differently than
[00:03:03] when you vibe coded. And so when you ask
[00:03:05] an agent to add a feature that lets
[00:03:06] customers leave reviews, that agent is
[00:03:09] not just going to look at one block of
[00:03:11] code and hand you a block of code. You
[00:03:13] might wonder, "What's the concrete
[00:03:15] difference? I get the feature either
[00:03:16] way." Here's the difference. In 2025,
[00:03:18] when you ask an agent to add a feature
[00:03:20] that lets customers leave reviews, so
[00:03:22] often you would get a single block of
[00:03:24] code from these different tools. Now,
[00:03:25] the agent is going to read your
[00:03:27] database. It's going to create new
[00:03:28] tables. It's going to build the
[00:03:29] interface. It's going to add form
[00:03:30] validation. And it's going to save the
[00:03:32] results. At least eight steps, maybe
[00:03:34] more, depending on how the agent designs
[00:03:37] the system. And if step four goes wrong,
[00:03:39] steps five through eight make it worse.
[00:03:41] I want to be really clear here. Vibe
[00:03:43] coding was a lot about prompting. Agent
[00:03:45] management is not first a prompting
[00:03:47] problem. It's a supervision problem. And
[00:03:49] the difference between vibe coders who
[00:03:51] keep shipping and the ones who hit a
[00:03:53] wall is exactly this shift from
[00:03:55] describing what you want to managing the
[00:03:58] thing that builds it. And you don't have
[00:04:00] to become an engineer. You just need to
[00:04:02] become a competent manager of an
[00:04:04] engineer with a short-term memory that
[00:04:06] happens to be AI. Let me give you an
[00:04:07] analogy. If you're a general contractor
[00:04:09] working on a house, you may not be
[00:04:11] laying the brick for that house, but you
[00:04:13] know what a straight wall looks like.
[00:04:15] you know which walls are loadbearing and
[00:04:17] you know that you shouldn't tear out the
[00:04:19] plumbing without turning off the water.
[00:04:21] I want to give you those kinds of
[00:04:22] skills. Think of the work you're doing
[00:04:25] with agents in 2026 as now you're a
[00:04:27] general contractor and you're managing a
[00:04:28] team of agents building software. What
[00:04:31] are the skills you need to be an
[00:04:32] effective manager? I'm going to give you
[00:04:34] specific ones, five of them, and none of
[00:04:36] them require writing code. Skill number
[00:04:38] one is as old as 1990s video games. You
[00:04:41] have to find your save point in the
[00:04:43] game. Say your agent broke something
[00:04:44] last week and you couldn't get back to
[00:04:46] the version that worked. Maybe it was
[00:04:48] the login page. Maybe it was the
[00:04:50] checkout flow. You described the
[00:04:52] problem. It was a big problem because
[00:04:53] agents can tackle big problems now, not
[00:04:55] like 2025. And the agent did try to fix
[00:04:57] it, but it made it worse this time. And
[00:04:59] now you're 3 hours deep in a
[00:05:01] conversation that's going in circles.
[00:05:02] The version from before the agent
[00:05:04] touched anything, you don't know where
[00:05:06] it went. It looks like the agent
[00:05:07] overwrote it. This is one of the most
[00:05:09] common disasters in VI coding in 2026.
[00:05:11] And it has a solution that every single
[00:05:14] developer uses. Version control. Think
[00:05:16] of it as save points in a video game.
[00:05:18] Every time your project is in a working
[00:05:21] state, save a snapshot. That snapshot is
[00:05:24] permanent. No matter what your agent
[00:05:26] does next, no matter one command and
[00:05:28] you're back to the version that worked.
[00:05:29] This is why a tool called Git matters
[00:05:33] for Vibe Coders in 2026. It's not a new
[00:05:36] tool. It's just how developers do this.
[00:05:38] And yes, if you're wondering, oh my
[00:05:40] gosh, I'm taking notes. How do I
[00:05:41] remember all this? There's a whole guide
[00:05:42] on the Substack. I'll get you all set
[00:05:44] up. Don't worry. Even if you've never
[00:05:45] coded now, learning the five or six
[00:05:47] things you actually need to do and get.
[00:05:49] You can head over to the Substack to do
[00:05:50] this or honestly, you can read this
[00:05:52] transcript to Chad GPT or Claude and
[00:05:55] tell them to explain it to you. It's not
[00:05:56] that difficult and I won't take all
[00:05:58] afternoon on it. What I am going to tell
[00:05:59] you is that the habit of saving a
[00:06:02] snapshot is critical and it is
[00:06:05] absolutely worth a couple of hours or an
[00:06:07] hour or 20 minutes depending on your
[00:06:09] technical competency to learn what git
[00:06:11] is and figure out how to use it so you
[00:06:12] can save a snapshot. You have got to use
[00:06:14] a tool that gives you a save point and
[00:06:16] yes it exists and I am asking you if you
[00:06:19] are working on something make this a
[00:06:22] priority ahead of the next feature
[00:06:23] request you want to build before your
[00:06:25] next change please. I am trying to save
[00:06:28] working software here. I do not want you
[00:06:30] to go through the pain of losing a
[00:06:32] production database, which is what I
[00:06:33] heard a senior developer tell me that
[00:06:35] happened when they ordered their agent
[00:06:37] to make a seemingly minor change and
[00:06:40] there was no versioning and it's gone.
[00:06:42] Now, they were able to recover. That's
[00:06:43] fine. But the point is you don't want to
[00:06:45] be in those shoes. Skill two, learn when
[00:06:48] to start fresh. This is especially
[00:06:51] important with agents. Let's say your
[00:06:53] agent is brilliant for the first 20
[00:06:54] minutes or 40 minutes or hour of the
[00:06:56] project. It seems to understand things.
[00:06:58] It follows your instructions. It makes
[00:06:59] the right changes and then somewhere
[00:07:01] around message 30, it just starts
[00:07:03] ignoring things you've told it three
[00:07:04] times. It rewrites code it already
[00:07:06] wrote. It introduces bugs into features
[00:07:08] that were working. It feels like it
[00:07:10] forgot everything. Well, it did.
[00:07:11] Literally, agents have a fixed amount of
[00:07:13] text. They have a context window.
[00:07:16] Everything you've said, everything it's
[00:07:18] said, every file it's read, every error
[00:07:19] message takes up space. And when that
[00:07:22] space fills up, older information gets
[00:07:24] compressed or dropped. And your
[00:07:26] instructions from the beginning of the
[00:07:27] conversation, well, they're gone now.
[00:07:29] The architecture understood an hour ago,
[00:07:31] it's also fuzzy. There are two fixes.
[00:07:34] There is an advanced mode and there's a
[00:07:35] simple mode. And I'm going to describe
[00:07:36] both very, very clearly. We'll give you
[00:07:38] a guide for both that's very simple. It
[00:07:40] will depend on you what you want to do.
[00:07:42] The simplest fix is to start fresh. But
[00:07:45] here's the thing. Starting fresh,
[00:07:47] everyone understands how to do that. You
[00:07:48] just start it over again. Sometimes the
[00:07:50] job is so big you're going to run into
[00:07:51] this issue again. And then you need the
[00:07:53] advanced fix. And the advanced fix is to
[00:07:56] set up proper infrastructure for your AI
[00:07:59] agent, which means you have to have a
[00:08:01] workflow file where the agent knows what
[00:08:04] it's doing and has logged that as a
[00:08:06] workflow. A planning file potentially, a
[00:08:09] context file where the agent can read
[00:08:11] the context of what it's trying to do
[00:08:14] when it reinstantiates when it wakes
[00:08:16] back up if you start a fresh run, and a
[00:08:18] task list that the agent has to burn
[00:08:20] down. Are you getting the idea?
[00:08:21] Basically, you need to build a scaffold
[00:08:24] of documents around the agent so that if
[00:08:28] the agent is killed, if the agent has
[00:08:30] too much context, it can't work anymore
[00:08:32] and you have to restart it. You can look
[00:08:34] at the documents that reflect the
[00:08:36] process that happened and start again at
[00:08:39] that point. It's sort of like having a
[00:08:42] save point not for software, but for the
[00:08:44] agent run, the agent build. If your
[00:08:46] agent is 65% built, you'll want to pick
[00:08:49] up at the 65% build part if you can. And
[00:08:52] that takes some preparation and I'll
[00:08:53] cover in the substack, but it's totally
[00:08:55] worth it because it means you can build
[00:08:57] much much bigger things. This is a
[00:08:59] simplified version of the really fancy
[00:09:00] stuff that lets teams like Cursor and
[00:09:02] Enthropic code for weeks. And now we're
[00:09:04] getting to skill number three, and it
[00:09:06] ties right into skill number two. Your
[00:09:08] agent needs standing orders. Remember
[00:09:11] how I told you that you needed kind of a
[00:09:13] dock or something in the advanced fix
[00:09:15] for the agent? just running out of
[00:09:16] context and the docs would help the
[00:09:18] agent keep track of things. One of those
[00:09:20] docs that you absolutely have to have is
[00:09:22] what I call standing orders. Let's say
[00:09:24] you've told your agent always use dark
[00:09:26] mode for the interface as many times as
[00:09:28] you can think of and it keeps defaulting
[00:09:30] to light mode. You've explained your
[00:09:32] naming conventions. It ignores them.
[00:09:34] Every session seems to start from zero.
[00:09:36] Well, every major AI coding tool now
[00:09:39] supports something called a rules file.
[00:09:40] It's a simple text document in your
[00:09:42] project folder that the agent reads at
[00:09:44] the start of every single session. Think
[00:09:46] of it as your employee handbook. It
[00:09:48] tells the agent, "Here's what this
[00:09:50] product is. Here's how we do things
[00:09:52] around here, and here are the three
[00:09:53] things you keep getting wrong that I
[00:09:55] need you to stop doing." And yes, I I
[00:09:57] also use that tone when I write my
[00:09:58] version. So, Claude Code calls this
[00:10:00] claw.markdown. Cursor has its own
[00:10:02] format. There's also a universal
[00:10:04] standard called agents.mmarkdown that
[00:10:06] works across most tools. And the name
[00:10:08] doesn't really matter. the concept does.
[00:10:11] You need to have persistent instructions
[00:10:13] that survive across conversations. You
[00:10:16] know, the counterintuitive part about
[00:10:17] this is how you actually build it. You
[00:10:20] might think you sit down and there's a
[00:10:21] ray of light and you write a perfect
[00:10:23] rules file, but it doesn't work that
[00:10:24] way. You don't do that. You start with
[00:10:26] almost nothing. You just start with,
[00:10:28] hey, this is what the product is. This
[00:10:29] is what it's built with and maybe a few
[00:10:32] lines about things you've noticed. It's
[00:10:34] sort of messy. Then every time your
[00:10:35] agent does something wrong, you add a
[00:10:37] line to prevent it. Over a few weeks,
[00:10:40] the file becomes a very precise
[00:10:42] reflection of exactly what your
[00:10:44] particular project needs. And over a
[00:10:47] period of time, as it gets to be a
[00:10:48] longer file, you're going to figure out
[00:10:50] which lines are loadbearing, which lines
[00:10:53] matter if you drop them versus which
[00:10:55] lines don't. And so you can start to
[00:10:57] keep the file clean, too. Make sure that
[00:10:59] every line earns its keep. Ideally, you
[00:11:02] want to be under 200 lines, maybe even
[00:11:04] under a 100 lines, because the rules
[00:11:06] file does compete for the same memory
[00:11:09] all that conversation and work uses. So,
[00:11:11] if you get to a massive rules file that
[00:11:14] eats your agents ability to focus, it's
[00:11:16] kind of counterproductive. I will give
[00:11:17] you some specific examples over on the
[00:11:19] Substack, or frankly, you can Google
[00:11:21] around and find them. Skill number four
[00:11:23] is small bets. Let's say you want a big
[00:11:27] project done. Let's say you're asking
[00:11:28] your agent to redesign the order system
[00:11:30] for your product and you're a vibe coder
[00:11:32] and so you're saying do it all at once
[00:11:34] and they touched every file in the
[00:11:35] project and half of the features that
[00:11:37] went along with it broke because you
[00:11:38] know what it used to work and now it
[00:11:40] doesn't. You have no idea which changes
[00:11:43] caused which problems because the agent
[00:11:46] changed so many things at once. When one
[00:11:48] sweeping operation can affect
[00:11:49] everything, there's no way to isolate
[00:11:51] what's wrong. The concept we're talking
[00:11:53] about here is blast radius, which is
[00:11:56] what it sounds like. It's how much of
[00:11:58] your project a single change could
[00:12:00] affect. And here's the principle that
[00:12:02] makes AI assisted building for vibe
[00:12:04] coders in 2026 who are using agents
[00:12:06] actually feel safe. Give your AI agent a
[00:12:10] really, really well-defined, focused
[00:12:12] task. Do not try to give it a large
[00:12:15] sweeping change unless you are committed
[00:12:17] to a really, really good set of eval
[00:12:19] really good agent harness. And if you
[00:12:21] don't know what those words mean, then
[00:12:23] that is not for you. This is not because
[00:12:24] the AI is not smart enough to do big
[00:12:26] things, it is. It's because complex
[00:12:28] changes compound errors and you need
[00:12:31] better and better systems thinking to
[00:12:33] prevent those errors before they happen.
[00:12:35] And that compounds nonlinearly or
[00:12:37] exponentially, the bigger the change is.
[00:12:40] So step four of a 12stage change goes
[00:12:42] wrong. Steps 5 to 12 make it worse. But
[00:12:45] now imagine it's a 100 stage change. And
[00:12:47] look at how bad it's going to get. So
[00:12:49] before giving your agent a task, ask a
[00:12:52] question. How big is this? If it's
[00:12:53] small, if it's changing a color, if it's
[00:12:56] fixing a form, just get it done. It
[00:12:58] probably won't even take an agentic
[00:13:00] coding harness or memory or docs or
[00:13:01] anything. They're just going to do it.
[00:13:03] If it's medium, like adding a whole new
[00:13:05] feature, you may want to tell the agent
[00:13:07] to plan it into multiple features and
[00:13:10] ask the agent to execute it in pieces
[00:13:12] and validate completeness and hit a save
[00:13:15] point before going to the next feature.
[00:13:17] Because if you're verifying and saving
[00:13:19] along the way, you're less likely to
[00:13:21] regret your choices. And yes, this is
[00:13:24] our choices as people. I know we like to
[00:13:26] blame the agents, but we're the ones who
[00:13:28] are not managing them well. And this is
[00:13:30] my guide. If you've never managed agents
[00:13:32] before, this is going to help. And by
[00:13:34] the way, if you think I'm not a vibe
[00:13:35] coder, I just, you know, work with
[00:13:37] Claude for a living. Claude is an agent
[00:13:39] now. These are also things that help
[00:13:41] with stuff like powerpoints. I don't
[00:13:43] know how many times I have sat there and
[00:13:45] said, "Oh, you're trying to generate a
[00:13:47] 100 slide PowerPoint at once." Same
[00:13:49] principle here. It's not a small bet.
[00:13:51] Maybe we should ask Claude to just do 15
[00:13:54] slides at a time. And it works. Small
[00:13:56] bets. Skill number five is about
[00:13:58] learning the questions your agent will
[00:14:01] never ask. All of the stuff I've talked
[00:14:03] about in the last four skills is about
[00:14:05] managing your agent directly. This skill
[00:14:08] is about managing what your agent builds
[00:14:10] because there's a category of dangerous
[00:14:12] problems your agent is never going to
[00:14:14] raise on its own and that frankly vibe
[00:14:17] coding tools of 2025 were too weak to
[00:14:19] deal with and so this is a new kind of
[00:14:21] problem for people who have been vibe
[00:14:22] coding. Let's say your app works great
[00:14:24] when you test it, right? You've gotten a
[00:14:26] few orders, everything is loading
[00:14:27] quickly, but your customers will end up
[00:14:30] submitting empty forms and clicking the
[00:14:32] buy button multiple times and pasting
[00:14:34] emojis into fields that expect numbers
[00:14:36] and generally using it like humans. The
[00:14:39] problem is this, the gap between it
[00:14:41] works for me and it really works for my
[00:14:44] customers who use it in all of the wild
[00:14:46] and woolly ways that humans use apps.
[00:14:49] That's where products go to die in that
[00:14:51] chasm in between. I cannot tell you how
[00:14:54] many times I've had a developer tell me,
[00:14:56] "Well, it works on my machine." Well,
[00:14:58] that's not the point. So, here's how to
[00:15:00] manage that with agents. You have three
[00:15:01] things that you need to demand in your
[00:15:03] files and in conversation. They're
[00:15:05] basically questions that your agent will
[00:15:07] not think of without prompting. And this
[00:15:09] is specifically for vibe coders trying
[00:15:10] to build apps. Number one, when
[00:15:13] something fails, you should instruct an
[00:15:15] agent to show a message, not a blank
[00:15:18] screen. Agents don't think to ask if the
[00:15:21] user needs to see something when there's
[00:15:23] a failure. They won't assume that.
[00:15:25] Payments can get declined. Servers can
[00:15:27] go down. Internet connections can drop.
[00:15:29] If your app doesn't handle these
[00:15:31] gracefully, your customer sees like a
[00:15:34] white page or a just a crash screen.
[00:15:37] Tell your agent every time the app
[00:15:40] communicates with a server. It has to
[00:15:43] handle failure with a very clear and
[00:15:45] friendly message, never a blank screen.
[00:15:47] Number two, please keep your customers
[00:15:50] data safe. Your agent, again, may not
[00:15:52] assume that they need to do that, but
[00:15:54] it's critically important, especially if
[00:15:55] you're dealing with paying customers on
[00:15:57] your app. Frankly, it's really important
[00:15:59] if you're dealing with your kids or your
[00:16:01] data on your app. Like, people who build
[00:16:03] family apps need to think about this,
[00:16:04] too. So, how do you protect customer
[00:16:06] data? You actually give the agent the
[00:16:08] instruction to look into rowle security.
[00:16:12] It's a kind of security where you're
[00:16:14] looking at the security of every single
[00:16:16] row in the database. I explain a lot
[00:16:18] more about it in the Substack post
[00:16:19] today, but the agent will know what that
[00:16:22] means if you say it because it's a very
[00:16:23] common software term. What you really
[00:16:25] want is to say with rowle security that
[00:16:28] each customer can only see their own
[00:16:31] data. You don't want any ad mixture
[00:16:33] between rows in the database. Then I
[00:16:37] have said this, but so many other people
[00:16:39] have said this. Never ever ever ever
[00:16:42] paste your secret keys into a chat with
[00:16:45] AI. Please do not do this if you don't
[00:16:48] know what a secret key is. It is
[00:16:50] something that is usually labeled secret
[00:16:52] key that is part of establishing secure
[00:16:55] connections with data. If you take that
[00:16:57] and it's a lengthy like 30 40 50digit
[00:17:00] hash string with numbers and letters and
[00:17:02] you think it's fine and you just stick
[00:17:04] it into the chat and say please develop
[00:17:05] with this you are running the risk of a
[00:17:07] database leak. It is a very risky thing
[00:17:09] to do. There are lots of other ways to
[00:17:11] deal with it. Many people have written
[00:17:12] guides. Yes, it is in my guide, too, but
[00:17:14] it's not the only place. You need to
[00:17:16] handle your secrets responsibly. And
[00:17:18] last, but not least, in your rules file
[00:17:20] for your agent, please, please, please
[00:17:23] add a rule that says never, ever log
[00:17:26] customer emails or payment information
[00:17:28] because you don't want to be doing that.
[00:17:30] You want to be in a world where payment
[00:17:31] is handled via like Stripe or API or
[00:17:34] something and you're not touching it.
[00:17:35] You want to be in a world where customer
[00:17:37] emails are not something you have to
[00:17:38] keep in a database securely and worry
[00:17:41] about whether or not you encrypted them
[00:17:43] well enough. You want to be in a world
[00:17:44] where you have like a sign-in with
[00:17:46] Google and it's just done. Third thing,
[00:17:48] your agent won't ask. Your agent won't
[00:17:51] ask about growth. You should tell your
[00:17:53] agent early what your growth
[00:17:54] expectations for whatever you're
[00:17:56] building are because sometimes the agent
[00:17:58] overengineers things and says your
[00:18:00] family app needs to support thousands of
[00:18:02] users. And sometimes your agent
[00:18:04] undergineers things and thinks to
[00:18:07] itself, eh, I don't need to do this
[00:18:09] critical security feature because they
[00:18:12] told me they have 300 users currently.
[00:18:14] If you expect your app to eventually get
[00:18:17] to a serious size, you should be telling
[00:18:19] that expectation to your agent because
[00:18:23] you will help it to build accordingly.
[00:18:25] Now, I would advise you here to get
[00:18:27] deeper on technical details than you
[00:18:29] might think you need to. It is worth
[00:18:31] getting a response from the agent,
[00:18:32] getting it explained like you're in high
[00:18:34] school by chatting with Chad GPT so you
[00:18:36] understand the technical term and then
[00:18:38] coming back and making an intelligent
[00:18:40] decision. You don't want to leave
[00:18:41] scaling to chance. The key thing to do
[00:18:43] is to set the expectation before the
[00:18:46] agent builds something so that the agent
[00:18:48] knows is it going to be for 10 users or
[00:18:51] is it going to be for 10,000. Finally,
[00:18:53] part of being good is knowing where to
[00:18:55] stop. Even in an agentic coding
[00:18:58] environment, please bring in a
[00:18:59] professional engineer when things start
[00:19:01] to get serious. Examples of things
[00:19:03] getting serious. If you're handling
[00:19:04] payments beyond basic checkouts for
[00:19:06] goods and services, if you're dealing
[00:19:08] with medical data, if you're dealing
[00:19:10] with children's data, if you're dealing
[00:19:12] with legal compliance, when your app is
[00:19:14] getting slow under real usage and you
[00:19:16] don't know why, when your codebase has
[00:19:18] gotten so messy the agent is struggling
[00:19:20] with it and you don't know why. This
[00:19:21] isn't a failure. If a non-engineer can
[00:19:24] build a product and maybe get real
[00:19:25] customers and then bring in an engineer
[00:19:27] to harden it for scale, you've already
[00:19:29] done something most startups never
[00:19:30] manage to do. You've proved the idea
[00:19:32] works before spending serious money on
[00:19:34] real engineering. And yes, real
[00:19:37] engineering still has a place even in
[00:19:39] the era of agentic development. A lot of
[00:19:41] my videos say that, so I hope that's not
[00:19:42] a surprise. Ultimately, the wall you are
[00:19:45] facing, if you're transitioning from
[00:19:47] vibe coding and you're wondering, how do
[00:19:48] I work with AI agents appropriately?
[00:19:50] That wall is not made of code. That wall
[00:19:53] is not something that you can't get
[00:19:55] through if you're not an engineer. I've
[00:19:57] outlined these skills because they
[00:19:59] really are management skills. Think of
[00:20:01] yourself again as a general contractor.
[00:20:03] You're constructing that house. You need
[00:20:05] to have safe points for the house where
[00:20:08] you can say, "Okay, the beam was put on
[00:20:09] wrong." That's not going to work. You
[00:20:11] need the ability to dig the foundation
[00:20:14] aresh if it's not going well. You need
[00:20:16] the ability to have standing
[00:20:17] instructions written clearly at the work
[00:20:19] site so people know what to do. You need
[00:20:21] the ability to work in small incremental
[00:20:23] features so you can say just do the
[00:20:24] counters today. And you need the ability
[00:20:26] to look around corners and ask the
[00:20:28] questions nobody on the work site is
[00:20:29] asking. All of these are management
[00:20:31] skills. You're just applying them to
[00:20:33] agents. In other words, the wall between
[00:20:36] building with agents and just vibe
[00:20:38] coding is management skills. And they
[00:20:40] are habits that you can practice. And if
[00:20:43] you start to practice them, a lot of
[00:20:45] what makes agents feel mysterious is
[00:20:47] going to evaporate. It's going to
[00:20:49] disappear because what we built in 2025
[00:20:52] was good for the agents and the skills
[00:20:54] and the models of 2025. But the agents
[00:20:57] are now a hundred times more powerful.
[00:21:00] And a lot of the work we did on
[00:21:01] prompting is now necessary but
[00:21:04] insufficient for the power we're dealing
[00:21:06] with here. And so think of what I'm
[00:21:08] giving you as like prompting plus plus.
[00:21:11] Yes, prompting was great. Yes, you still
[00:21:13] need to prompt well. Not an excuse, but
[00:21:16] you have to think much more broadly to
[00:21:18] handle agents this powerful as someone
[00:21:20] who's used to vibe coding. I hope that
[00:21:22] this has been helpful and best of luck
[00:21:24] with what you're building. I'd love to
[00:21:25] see it. Please throw it in the comments
[00:21:26] so we can all see it and chat about it
[00:21:28] together.
