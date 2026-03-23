# Raw Transcript

- Title: I Mapped Where Every AI Agent Actually Sits. Most People Pick Wrong.
- Creator: AI News & Strategy Daily | Nate B Jones
- URL: https://youtu.be/b7IS4C9QALc?si=NN0wyDc7FqjUS7xt

---

[00:00:00] Open Claw is the most consequential meto
[00:00:02] moment in the history of AI all the way
[00:00:03] since Chad GPT which in the history of
[00:00:05] AI is a long time but in real life is
[00:00:07] like two years. And all of the coverage
[00:00:08] of OpenClaw has either been about oh
[00:00:10] it's a horse race between these other
[00:00:12] people who are copying OpenClaw etc. or
[00:00:14] it's been about oh my gosh what a
[00:00:16] terrible terrible dumpster fire of a
[00:00:18] security issue openclaw is and how do we
[00:00:20] fix it? Both of those stories are real
[00:00:22] and important but they're really hiding
[00:00:24] what's underneath the open claw
[00:00:26] phenomenon. And I want to talk about the
[00:00:28] real story here. The real story is that
[00:00:30] every major company responding to Open
[00:00:33] Claw has actually made a different bet.
[00:00:36] They've made a different bet with some
[00:00:38] different tradeoffs based on their
[00:00:39] positions on the board. And if you
[00:00:41] understand those bets, and you can, you
[00:00:44] can do something that most people cannot
[00:00:46] right now, which is to look at any new
[00:00:48] agent product out there and figure out
[00:00:50] what it's actually for, whether it works
[00:00:52] for you, and why you should care. So
[00:00:54] instead of reacting to every
[00:00:55] announcement and saying, "Oh my gosh, is
[00:00:57] this another open call? How do I have to
[00:00:58] pay attention to it? What did cloud
[00:01:00] launch etc. You can see the strategic
[00:01:02] logic underneath and you can see whether
[00:01:05] or not it really matters. And this is
[00:01:07] not optional to understand partly
[00:01:09] because we are living in a world that is
[00:01:11] avalanched with openclaw competitors.
[00:01:14] Right? Nvidia built Nemo claw and Jensen
[00:01:17] decided to compare openclaw to Linux.
[00:01:19] Openai has aqua hired Peter and is
[00:01:21] actively planning a launch very soon.
[00:01:24] Meta spent $2 billion on Manis and
[00:01:26] immediately pivoted it to OpenClaw. Even
[00:01:28] Lovable, which was the most copied
[00:01:30] product of 2025 in AI, is now becoming
[00:01:33] the copier by trying to launch something
[00:01:35] like OpenClaw. How the tables have
[00:01:38] turned. And part of what makes this
[00:01:39] impossible to follow is the sheer number
[00:01:42] of projects that are coming out. It's
[00:01:43] not just these big companies, right?
[00:01:45] This is an opensource project and there
[00:01:47] are lots of open-source forks, right?
[00:01:50] ZeroClaw rewrote openclaw in Rust.
[00:01:53] Moltus targeted enterprise Rust
[00:01:55] deployments. Open Fang pitched itself as
[00:01:58] an agent operating system. Nanobot from
[00:02:00] Hong Kong stripped OpenClaw down to just
[00:02:02] 4,000 lines of code. All of these
[00:02:04] attacked what they perceived as a
[00:02:06] weakness in the original implementation
[00:02:08] and tried to put their own spin on it.
[00:02:10] This is what happens when a product
[00:02:12] defines a category so clearly that every
[00:02:15] single weakness in that product becomes
[00:02:17] a thesis for an individual startup.
[00:02:19] Linux had the same dynamic. So did
[00:02:21] Android. The original is messy and it's
[00:02:24] powerful and it's big and it's precisely
[00:02:27] because of how big and wild it is that
[00:02:29] it's so widely adopted and the entire
[00:02:31] ecosystem is then about well what is the
[00:02:34] next open claw? What is the next Linux?
[00:02:36] What is the next thing that is built on
[00:02:38] a gap in this ecosystem? And the problem
[00:02:40] is that all of these products blur
[00:02:42] together because they're all built off
[00:02:44] of forks of this product. So it's hard
[00:02:45] to tell. But if you peel back that
[00:02:47] onion, if you have the discipline to
[00:02:49] look underneath, you're going to see
[00:02:51] that these products are making distinct
[00:02:53] bets on the future and they're worth
[00:02:55] thinking about because as Peter himself
[00:02:57] says, OpenClaw isn't for everyone. I've
[00:02:59] said that too. Like OpenClaw is not
[00:03:01] something that is easy to install.
[00:03:03] Peter's talked about the fact that like
[00:03:05] he went to OpenAI because he wants his
[00:03:06] mother to be able to use an OpenClaw
[00:03:09] style agent and OpenClaw itself is far
[00:03:11] too technical for his mom to use.
[00:03:13] Typical media narrative tends to frame
[00:03:15] this as a spectrum of control. And so
[00:03:17] they'll say, well, OpenClaw gives you
[00:03:18] the most control because it's roll your
[00:03:20] own and you can swap out any component
[00:03:22] and other products give you less and
[00:03:23] less control from there. It's not wrong.
[00:03:25] It's just incomplete in a way that leads
[00:03:28] you and me to bad decisions if we're
[00:03:29] trying to figure out what to build. So
[00:03:31] let's actually talk about what are the
[00:03:33] axes that matter in the open claw
[00:03:35] universe so that you can figure out what
[00:03:37] of all these variants in forks actually
[00:03:39] make sense for you. Number one, where
[00:03:42] does your agent run? Is your agent
[00:03:45] local? Is it cloud-based? Is it hybrid?
[00:03:48] That matters because that tells you the
[00:03:50] data privacy posture. It tells you your
[00:03:52] security surface area. It tells you
[00:03:53] who's responsible when the agent deletes
[00:03:55] your inbox. All of that. Number two, who
[00:03:58] is going to orchestrate the
[00:03:59] intelligence? Who organizes and lets the
[00:04:01] intelligence spin up sub agents or not?
[00:04:03] Is it one model that does everything? Is
[00:04:05] it a multimodel where there's a harness
[00:04:07] that selects a model for a particular
[00:04:09] task? Is it somehow model agnostic and
[00:04:11] you plug in your own model? This
[00:04:13] determines cost. It determines the
[00:04:14] quality of the work your agent can do.
[00:04:16] It determines whether you feel locked
[00:04:17] into a vendor. Number three, what's the
[00:04:20] interface contract? Do you interact
[00:04:23] through a messaging app that you already
[00:04:24] use? Do you have a dedicated desktop
[00:04:27] app? Do you have a phone? What is the
[00:04:29] way you message this agent? And how
[00:04:31] flexible is it? Again, it determines the
[00:04:33] product experience. It's not something
[00:04:35] light. It's not a small thing. If you
[00:04:38] look at where your agent lives, if you
[00:04:40] look at how your agent orchestrates
[00:04:42] intelligence, and if you look at how you
[00:04:44] message your agent, you have the three
[00:04:46] axes that will tell you whether a
[00:04:48] particular agent play in this open claw
[00:04:51] ecosystem writ large, and I'm including
[00:04:53] all of the corporate spin-offs here,
[00:04:55] whether one of those is right for you or
[00:04:57] not. And you can kind of pick your
[00:04:58] flavor because you can pick where you
[00:04:59] are on that spectrum. Now, the first and
[00:05:02] most obvious one is to profile OpenClaw
[00:05:04] itself. And I'll do it really simply
[00:05:05] because we've talked about it a lot.
[00:05:07] Open Claw runs locally. It runs on your
[00:05:09] machine with your API keys and your
[00:05:11] data. It is a data sovereignty play,
[00:05:14] right? You can plug any LLM you want.
[00:05:16] That's a composable plugin for the Open
[00:05:18] Claw. In fact, you can plug in most of
[00:05:20] the modules to OpenClaw. It's designed
[00:05:21] to be interoperable and that's part of
[00:05:23] what's made it so powerful as a
[00:05:24] framework. And that's also part of what
[00:05:26] makes it technical. And yes, that means
[00:05:28] you can plug any messaging platform you
[00:05:29] want into it, right? Telegram, WhatsApp,
[00:05:31] Signal, etc., Slack, you can plug
[00:05:34] anything you want because it's modular.
[00:05:36] The whole idea is that OpenClaw belongs
[00:05:38] to the user full stop. And that is part
[00:05:40] of why OpenClaw's presence has shaken up
[00:05:44] corporate so much because corporate has
[00:05:46] assumed that any given product, whether
[00:05:48] it's a messaging application like
[00:05:49] WhatsApp or whether it's a product like
[00:05:51] Amazon that is available on the web
[00:05:53] should by default be whatever the
[00:05:55] company wants it to be and however they
[00:05:58] want to position it to humans. And Open
[00:05:59] Claus's whole thesis is you bring and
[00:06:02] mix and match your own stuff. you bring
[00:06:04] your own LLM and then you figure out
[00:06:06] from there what you want to do with it.
[00:06:07] And so if you want to bring your own
[00:06:09] telegram approach, you can roll that
[00:06:11] into open claw really easily and then
[00:06:13] you can tell your LLM to go search
[00:06:15] Amazon and you should be able to do
[00:06:16] that. Similarly, you shouldn't have to
[00:06:19] pick an LLM that's only open source. You
[00:06:21] should be able to bring in Chad GPT. You
[00:06:22] should be able to bring in Claude, etc.
[00:06:24] The whole play is to disintermediate all
[00:06:26] of these companies and let you be in
[00:06:28] charge of what your intelligence should
[00:06:30] be. And that's part of why people I
[00:06:32] think have responded to OpenCloud
[00:06:33] because they want to be in charge of
[00:06:34] their AI in their future. But as we've
[00:06:36] discussed, the security surface area is
[00:06:38] a real issue. Researchers have found
[00:06:40] over 30,000 publicly exposed instances
[00:06:43] of weak or missing authentication in
[00:06:45] openclaw plugins. The skills registry
[00:06:48] has been hit with a supply chain attack
[00:06:49] with over 800 compromised skills
[00:06:51] documented. I could go on and on. You
[00:06:54] name the security researcher, they have
[00:06:56] put out a statement on OpenClaw and they
[00:06:57] are very worried about. Now that doesn't
[00:06:59] mean it's not popular, right? As we've
[00:07:01] discussed, 250,000 users, they have
[00:07:03] opinions. Developers and technical power
[00:07:05] users who want maximum control. This is
[00:07:08] who OpenClaw is for. You want your own
[00:07:10] infrastructure. You want to control
[00:07:12] where the model lives. You want to make
[00:07:13] it as interoperable and changeable as
[00:07:15] possible. You can swap those Lego bricks
[00:07:17] in and out. Great. But this is not for
[00:07:19] non-technical users, right? This is not
[00:07:21] for users who are not comfortable with
[00:07:23] that degree of control over their
[00:07:25] infrastructure and who don't want to
[00:07:27] wade into the security mess and make
[00:07:29] good decisions to have a strong security
[00:07:31] stance on open clock. And that brings us
[00:07:33] to perplexity because really what
[00:07:35] perplexity has done is take that
[00:07:36] weakness for nontechnical users and turn
[00:07:38] it into their whole product. Perplexity
[00:07:40] computer is the delegation play for
[00:07:43] openclaw. It runs entirely in the cloud.
[00:07:46] You describe the outcome. the system
[00:07:48] will independently decompose it into
[00:07:50] subtasks and run agents against it and
[00:07:52] do the entire computation in the cloud
[00:07:54] to get you the result you want. Whether
[00:07:56] that's a website or an analysis or an
[00:07:57] ongoing dashboard and Perplexity claims
[00:08:00] that it can do very long running tasks,
[00:08:02] including tasks that last for months,
[00:08:03] which I have yet to see because it
[00:08:05] hasn't been months since it released,
[00:08:06] but we'll find out. The strategic bet
[00:08:08] here is really really different from
[00:08:09] openclaw where openclaw says your data
[00:08:11] is yours and you are sovereign and you
[00:08:13] have to make all of these decisions and
[00:08:14] that includes the risks of security that
[00:08:16] come with making all of those decisions.
[00:08:18] Perplexity says we'll take that weight
[00:08:20] off you. We'll ensure it's safe. It runs
[00:08:22] in a virtual box in the cloud. You don't
[00:08:24] have to worry about the security. But
[00:08:26] the trade-off is you're paying for a
[00:08:28] cloud service, right? This comes at 200
[00:08:30] bucks a month. You have to be committed
[00:08:31] to using it. You have to plug in all of
[00:08:33] your data. You have to trust Perplexity
[00:08:34] with all of your data. You have to trust
[00:08:36] the way they'll evolve the product. They
[00:08:38] own the orchestration. They decide what
[00:08:40] model they're using. They say, "Trust
[00:08:42] us." What's funny about all of this is
[00:08:44] that the gravity well of open claw is so
[00:08:47] strong that even though they started as
[00:08:50] a cloud play, they know that people who
[00:08:52] use OpenClaw by definition care about
[00:08:55] their personal data and they do want to
[00:08:56] reach them. And so as much as they want
[00:08:57] to say delegate trust us that's the core
[00:08:59] of our product. Open cloud the
[00:09:01] phenomenon is such a big deal that
[00:09:02] they're like okay but actually really
[00:09:04] we're also going to launch personal
[00:09:06] computer for your hard drive where you
[00:09:08] can have a delegated secure container on
[00:09:10] the computer that you run that
[00:09:12] perplexity will run and still please pay
[00:09:14] us for that but your data will be more
[00:09:16] secure etc etc. In other words, they
[00:09:18] want to keep you paying but also enable
[00:09:22] you to have your data securely because
[00:09:23] they assume that's what people who like
[00:09:25] open call want to do but also if you
[00:09:27] don't want that you can do the cloud.
[00:09:29] And I kid around a little bit. I've
[00:09:31] tried perplexity computer. Don't take
[00:09:32] away from this that it's not good. It's
[00:09:34] actually a really solid product. The
[00:09:36] reason I'm kidding around is because
[00:09:38] this is the agony of positioning that
[00:09:41] you go through when you are not the
[00:09:42] first in the door for product market
[00:09:44] fit. Openclaw has product market fit.
[00:09:46] Perplexity computer is trying to get
[00:09:48] product market fit after the fact in the
[00:09:50] same category and it has to go through
[00:09:52] all these twists and turns on the value
[00:09:53] proposition to try and persuade people.
[00:09:55] It's the thing for them that's also not
[00:09:57] open claw. And so that's where some
[00:09:58] humorous sort of limitations and twists
[00:10:00] and turns on messaging come out. But
[00:10:02] that being said, if you are a knowledge
[00:10:05] worker, if you are an enterprise team
[00:10:07] who wants outcome level work out of
[00:10:09] perplexity and you want to have
[00:10:11] perplexity handle some of the
[00:10:12] infrastructure, it is quite seriously a
[00:10:15] thing to look at. you should be
[00:10:16] considering perplexity computer. It
[00:10:18] would be irresponsible not to. Now, if
[00:10:20] you want to tinker with the underlying
[00:10:22] models, if you want full data
[00:10:24] sovereignty and control, if you don't
[00:10:25] want to pay 200 bucks a month, or if
[00:10:27] you're not interested in enterprise
[00:10:28] scale rollouts, this is not the thing
[00:10:30] for you. So, at least that's a clear yes
[00:10:33] no rationale and I think that we can
[00:10:34] move on. Now, let's get to Manis. Manis
[00:10:37] is the distribution play, right? In this
[00:10:39] world of OpenClaw, you can look at
[00:10:40] sovereignty, which is OpenClaw original.
[00:10:42] You can look at delegation which is sort
[00:10:44] of how perplexity chooses to handle
[00:10:46] things and you can look at distribution
[00:10:48] which is how Manis is choosing now.
[00:10:49] Manis the original web-based tool is
[00:10:53] already a massive win right it was the
[00:10:55] fastest 0 to$und00 million company at
[00:10:58] the time and that was before Meta bought
[00:11:00] it. Now this launch is the first one
[00:11:02] since Meta bought Manis and you might
[00:11:04] think well they're going to go for ads.
[00:11:06] You might think, well, they're going to
[00:11:07] go for an internal tool that people can
[00:11:09] use to make ad creative automatically
[00:11:10] when people say, "Please launch my ads."
[00:11:12] I still think that is a plausible play
[00:11:15] for Manis internally. But I think that
[00:11:17] Zuck saw the open claw moment and he was
[00:11:20] like, "Wait a minute. We need something
[00:11:22] that plays in this space." What Zuck
[00:11:24] really needs is a product that captures
[00:11:26] this moment, that captures the attention
[00:11:29] that would otherwise go other places
[00:11:32] that his three billion customers are
[00:11:35] currently spending on Facebook. If you
[00:11:37] think of the world in terms of how Zuck
[00:11:38] sees it, Zuck sees it as a series of
[00:11:41] hours in the day with eyeballs, right?
[00:11:42] Where are people's eyeballs right now?
[00:11:44] Are they on a meta product or are they
[00:11:46] not on a meta product? And so if the
[00:11:48] open claw moment is viral and real, part
[00:11:50] of what he wants is people who are
[00:11:53] spending time on agents spending time in
[00:11:56] the meta ecosystem. That is a very
[00:11:59] simple explanation for what Manis is
[00:12:01] doing. It is a agent to capture the
[00:12:03] agent moment that he can run at scale
[00:12:06] and enable people to spend that time
[00:12:08] within the meta ecosystem and at his
[00:12:11] scale he can worry about ads and
[00:12:12] monetization in that world much much
[00:12:14] down the road. It doesn't mean he has to
[00:12:16] jump to monetization right away. Now,
[00:12:18] Manis is unlike Perplexity not making an
[00:12:22] enterprise quality argument with this
[00:12:24] launch. They are making a we can serve
[00:12:26] customers at scale argument. And the
[00:12:29] rumor is that they are serving this with
[00:12:31] a mix of local meta models and other
[00:12:33] models that they choose to bring in.
[00:12:34] They're keeping that a little bit dark.
[00:12:36] And really what you should do is sort of
[00:12:38] look at the agent as this is an agent
[00:12:40] that if I trust suck with my data, I can
[00:12:42] get a lot of stuff done with as a
[00:12:44] customer. And that's really the
[00:12:45] question, right? Because before Meta
[00:12:47] bought Manis, the question was whether
[00:12:49] you trusted a company that had Chinese
[00:12:51] roots with your data if you lived in the
[00:12:52] US. And now the question is, do you
[00:12:54] trust a company that is owned by Meta
[00:12:56] with your data? And for a lot of people
[00:12:58] I talked to, the answer is no. Now that
[00:13:01] doesn't mean that that's the majority of
[00:13:02] people, right? I have no illusion.
[00:13:03] There's a reason Zuck has three billion
[00:13:05] users. I think this is actually for
[00:13:07] consumers and small businesses who want
[00:13:10] AI agent capability but who are a little
[00:13:12] bit nervous about the terminal and just
[00:13:14] want the idea of an agent on their
[00:13:15] computer and Manis just fits that
[00:13:17] perfectly and it captures their
[00:13:19] attention and keeps them in the meta
[00:13:20] ecosystem. Now developers who want model
[00:13:23] flexibility, enterprises that care about
[00:13:24] data, even individuals that care about
[00:13:26] data and privacy, they're not going to
[00:13:28] go for this because ultimately you're
[00:13:29] trading off your data privacy for the
[00:13:32] distribution play. Now what about
[00:13:33] Anthropic? Enthropic has launched
[00:13:36] dispatch which is basically the ability
[00:13:37] to message in from your phone and drive
[00:13:39] Anthropic on your computer. The whole
[00:13:42] core of the argument that Anthropic is
[00:13:44] making in this open claw ecosystem world
[00:13:47] is we all had safety concerns about
[00:13:49] openclaw. Use the safe option use
[00:13:52] anthropic. Use claude it's safer. Now
[00:13:54] the anthropic model is quite simple and
[00:13:56] really quite primitive right now. You're
[00:13:58] not managing multiple conversations.
[00:13:59] You're not starting multiple instances
[00:14:01] with claude. All you are doing is
[00:14:03] saying, "Hey, I'm messaging through
[00:14:05] dispatch into coowork," which has a
[00:14:07] special dispatch terminal. And you're
[00:14:09] doing one instance that you're working
[00:14:10] with clawed on in co-work from your
[00:14:13] phone. You can also do as I am recording
[00:14:16] this a telegram option for claude code,
[00:14:19] which is designed to be more developer
[00:14:21] friendly. I would anticipate that by the
[00:14:23] time you see this Anthropic, which ships
[00:14:25] I think every eight hours at this point,
[00:14:27] it's absolutely insane. They've probably
[00:14:29] launched more messaging options. They
[00:14:30] are clearly going for messaging is not
[00:14:33] the issue. We just want you to have a
[00:14:34] secure singlethreaded option through
[00:14:36] claude. Please trust us and you can get
[00:14:38] what you want done. And to be fair,
[00:14:41] because Claude is a gentic on the
[00:14:42] computer because they've built that
[00:14:44] foundation over the last 3 or 4 months,
[00:14:46] you can really get a lot of stuff done.
[00:14:47] You can let Claude browse for you on
[00:14:49] your computer while you're on your phone
[00:14:51] messaging it. You can let Claude make a
[00:14:53] PowerPoint, etc. You can let Claude run
[00:14:55] your calendar. You can let Claude look
[00:14:56] at your email. You get the idea. But the
[00:14:58] thing is you don't get the flexibility
[00:15:00] that comes from a true multimodel
[00:15:02] routing option which you could do using
[00:15:04] multimodel orchestration and open
[00:15:06] clause. So if you want a more complex
[00:15:08] harness where you say I want a simpler
[00:15:10] model for my easier queries I want a
[00:15:12] more complex model to handle my harder
[00:15:14] agent queries. That's not for you,
[00:15:15] right? Like this is just not the story
[00:15:17] that you're going to have with Claude.
[00:15:18] But if you're a non- tech professional
[00:15:20] and you want to do the work you've been
[00:15:21] doing with Claude, it is way way easier
[00:15:24] to just message Claude from your phone
[00:15:26] than to go through all the hassle of
[00:15:27] setting up an open claw. And I know a
[00:15:29] lot of people who had exactly that
[00:15:31] conclusion as soon as this launched. And
[00:15:32] so this reflects the idea that where
[00:15:35] some companies are seeing
[00:15:36] disintermediation and worrying about it
[00:15:38] like Google is anthropic is saying we
[00:15:41] actually see this as a way to reinforce
[00:15:43] our brand and say that claude is a way
[00:15:44] that you can work anywhere you want. And
[00:15:46] so they're deciding that they can trust
[00:15:48] people to remember what Claude is if
[00:15:50] they reinforce that Claude is the secure
[00:15:52] and safe option, which has been their
[00:15:54] brand stance all along. And now we come
[00:15:56] to the irony of Lovable. I I swear this
[00:15:58] should be a case study taught in
[00:15:59] business schools because Lovable has
[00:16:01] been the most imitated product in AI
[00:16:04] until the last couple of months. It's a
[00:16:07] vibe coding tool that has soared past
[00:16:09] $300 million in ARR. I cannot give you
[00:16:12] enough superlatives about how excited
[00:16:14] people have been about it in 2025
[00:16:16] because really what it did was it took
[00:16:17] the idea of vibe coding and made it
[00:16:20] something everybody could do. It was
[00:16:22] intuitive. It was an easy interface. It
[00:16:24] actually built complete working products
[00:16:26] that worked well. I know real people who
[00:16:28] built real businesses off of lovable.
[00:16:30] And on March 19, 2026, just a couple of
[00:16:33] days after Manis launched, after
[00:16:34] Anthropic launched their messaging, what
[00:16:36] did Lovable do? They decided to announce
[00:16:38] they were expanding beyond building
[00:16:40] websites and they were now more of an
[00:16:41] everything tool for complex execution.
[00:16:44] In other words, they said being lovable,
[00:16:46] being one of the fastest growing
[00:16:47] products in history. That's not enough.
[00:16:49] We're going into open clause world where
[00:16:51] a general purpose agent, executor, and
[00:16:52] builder. Now, life comes at you fast in
[00:16:54] the world of AI. You might think you
[00:16:56] have a structural advantage in 2025 if
[00:16:59] you are the most copied product and
[00:17:00] nobody can come close to your growth in
[00:17:02] product market fit because they did have
[00:17:04] product market fit and they do. But
[00:17:06] because agents are coming for the world,
[00:17:10] because they're eating the rest of
[00:17:12] commerce so fast, lovable has to adapt.
[00:17:15] Lovable has to recognize that their
[00:17:17] entire interface was structured around
[00:17:19] the idea that a human would type a
[00:17:21] prompt. And now we're in a world where
[00:17:22] people want agents to do complex tasks
[00:17:25] for them. Agents have gotten better and
[00:17:27] people have evolved what they want. Even
[00:17:28] Lovable has to think about how they go
[00:17:30] from being a really powerful AI tool
[00:17:32] that was human mediated to being a
[00:17:34] really powerful AI tool that is agent
[00:17:36] first and humans can kick off agentic
[00:17:38] workflows. That is a level of
[00:17:40] abstraction higher and it's a difficult
[00:17:42] position for lovable to walk given the
[00:17:44] fact that they have many many many
[00:17:46] millions of devoted fans who like
[00:17:48] lovable the way it is. That's just the
[00:17:49] reality of being a product that people
[00:17:51] know and love. Like you have to figure
[00:17:52] out how to walk the tight rope toward
[00:17:54] change if you want to keep growing. And
[00:17:55] this really leads to one of my core
[00:17:57] thesis for 2026. Relentless
[00:18:00] simplification. Agents are compressing
[00:18:02] the interface layer. Every vertical
[00:18:04] tool, whether it's an app builder or
[00:18:06] whether it's an analytics platform or or
[00:18:08] a document generator, all of them are
[00:18:11] under pressure to collapse into a single
[00:18:14] conversational agent that handles all of
[00:18:17] it, that handles everything. And the
[00:18:19] products that survive this compression
[00:18:21] are going to be the ones that either go
[00:18:23] deep enough to have specific capability
[00:18:25] that doesn't exist anywhere else or they
[00:18:28] have general enough execution that they
[00:18:30] become a default delegation layer. And
[00:18:34] ironically, you can see in these
[00:18:35] competitors different plays like lovable
[00:18:37] is arguably a go deep play. Perplexity
[00:18:40] computer is clearly a broad play. Open
[00:18:42] claw is also a broad play. The middle is
[00:18:45] where you go to die, right? the tools
[00:18:47] that are good but not bestin-class, the
[00:18:48] tools that are not general enough to be
[00:18:50] general purpose agents, those are
[00:18:52] recipes for product death in 2026. And
[00:18:54] that gets me to how to evaluate the next
[00:18:56] Open Claw launch, which I am sure as you
[00:18:58] are watching this, there will be one
[00:18:59] that drops right after this video within
[00:19:00] 24 hours. It's just that's how fast this
[00:19:02] is going. So, what do you ask yourself
[00:19:04] when you want to decide if you should
[00:19:06] pay attention? Number one, ask yourself
[00:19:09] where it runs. We come back to that
[00:19:10] framework. Understand, do you care about
[00:19:12] having it run locally? Do you want it to
[00:19:14] run securely in the cloud? Where does
[00:19:16] your agent live? And why does that
[00:19:19] matter to you? And that is often a
[00:19:20] security and privacy answer. It is
[00:19:22] sometimes a convenience answer. Second,
[00:19:25] ask yourself, do I care about who picks
[00:19:27] the model? Do I want to pick the model?
[00:19:29] Do I trust the company that is picking
[00:19:31] the model to pick the model on my best
[00:19:33] interest, not because of what it wants
[00:19:35] to get done and the agenda that that
[00:19:37] company has? If you care about the model
[00:19:39] quality, I tend to care about model
[00:19:41] quality. If you care about which model
[00:19:42] you're using, you should probably think
[00:19:44] about finding a solution that lets you
[00:19:47] do that. Third, ask yourself, what does
[00:19:50] this interface assume about me? Is this
[00:19:53] interface something that I am
[00:19:54] comfortable with? Am I already in Slack?
[00:19:56] Am I already in Telegram? Am I already
[00:19:58] in Signal? The way these products frame
[00:20:01] themselves assumes that you have an
[00:20:03] opinion. OpenClaw lets you configure.
[00:20:05] dispatch. The Claude launch assumes that
[00:20:07] you have the Claude app and you're
[00:20:09] willing to use the Claude app on your
[00:20:11] phone to message the Claude app on your
[00:20:13] desktop. It essentially assumes you're a
[00:20:14] super fan of Claude. You need to think
[00:20:17] about what these products assume about
[00:20:19] your behavior. And you need to be honest
[00:20:20] enough with yourself to say, I'm
[00:20:22] probably not changing my behavior here,
[00:20:24] so I should probably pick a messaging
[00:20:26] solution that works for me already. And
[00:20:29] don't worry if you're using a weird
[00:20:30] messaging solution. You're like, well,
[00:20:32] there's no open claw for me. If you wait
[00:20:34] like a week, there will be one. That's
[00:20:36] how big this is. Open claw owns the top
[00:20:38] right. Right? You have maximum this that
[00:20:39] and the other thing, right? You have
[00:20:40] maximum flexibility, maximum technical
[00:20:42] control, maximum risk that you're
[00:20:44] managing, maximum security postures that
[00:20:46] you have to sort out. It's basically
[00:20:48] taking the maximum on both axis. If you
[00:20:50] have technical complexity and risk on
[00:20:51] one axis and you have user control on
[00:20:53] the other axis, open claw maxes out
[00:20:55] both. But now let's look at some of the
[00:20:57] other plays, right? If your perplexity
[00:21:00] really you're minimum on both, you're
[00:21:02] lower left on both. You have very very
[00:21:04] little technical risk here and you also
[00:21:06] have very very little user control.
[00:21:07] You're trading that away for the
[00:21:09] enterprise to be able to manage its
[00:21:12] risk, right? You're trading that away
[00:21:14] for a professionalgrade solution. Manis
[00:21:18] is kind of in between, right? Like it
[00:21:20] gives you a little bit more
[00:21:21] configurability. It gives you a little
[00:21:23] bit more user control. It's certainly
[00:21:24] not where OpenClaw is. and you're
[00:21:26] trading away the data side, which is
[00:21:27] probably a Z-axis. Dispatch is
[00:21:29] absolutely sort of a professional-grade
[00:21:32] middle of the road, right? You're
[00:21:33] definitely trading down the technical
[00:21:34] complexity. It's pretty low there, but
[00:21:36] you're getting a little bit more control
[00:21:38] out of it because frankly, Claude is for
[00:21:40] more technical people, and they're going
[00:21:42] to continue to give you more messaging
[00:21:43] options. Lovable is almost on its own
[00:21:46] island here. Lovable is very, very low
[00:21:48] on the technical complexity side, but
[00:21:50] it's going to give you as a user a ton
[00:21:52] of control because that is what Lovable
[00:21:54] is known for. So we're just going to
[00:21:55] have to see where that evolves and gets
[00:21:56] to. The point here is not where exactly
[00:21:59] are these products today. The point is
[00:22:01] to understand that openclaw set the
[00:22:04] terms of the debate by saying these are
[00:22:06] the verticals that matter for customers.
[00:22:08] We are going to make a sovereignty play
[00:22:10] to make the strongest possible case for
[00:22:11] agentic primitives that give users
[00:22:14] control over agents in the future. And
[00:22:16] people responded to that in droves. Now
[00:22:18] everyone else is playing on their terms.
[00:22:19] Everyone else is playing on this graph
[00:22:21] that openclaw defined and said we are up
[00:22:23] and to the right. And the question of
[00:22:25] 2026 is going to be how many niches are
[00:22:28] there in this open claw ecosystem that
[00:22:30] other people can thrive in? And which of
[00:22:33] these bets is going to win by making a
[00:22:36] case to a subset of users that wants an
[00:22:39] agent experience like OpenClaw but isn't
[00:22:41] satisfied with something? Maybe it's the
[00:22:42] delegation, maybe it's the
[00:22:43] responsibility for safety, maybe it's
[00:22:45] the level of control you have and they
[00:22:47] don't want that. Not everyone wants all
[00:22:48] that control. And so when you're
[00:22:50] thinking about the openclaw me too
[00:22:52] universe that is going to keep exploding
[00:22:54] and building, I would encourage you to
[00:22:56] think about it in these terms. Think
[00:22:57] about it with this frame in mind because
[00:23:00] if you don't, every single drop is just
[00:23:02] going to confuse you. Oh my gosh,
[00:23:04] there's this, there's that. You know,
[00:23:05] another drop comes along in 8 hours. And
[00:23:07] if you have a framework, if you
[00:23:08] understand the bets people are making,
[00:23:10] you're going to have a classic case
[00:23:12] study in business strategy and you're
[00:23:14] going to see it play out over the course
[00:23:15] of 2026. And really, this is one of the
[00:23:18] big ones because how agents evolve in
[00:23:20] 2026 is going to shape the way we all do
[00:23:23] business for the next 10 or 20 years.
[00:23:25] And so the open claw moment is the
[00:23:27] moment when the title wave of agent
[00:23:29] commerce started. And we have to see
[00:23:31] which ones redefine the niches inside
[00:23:32] the open claw universe and actually
[00:23:34] carve out little markets for themselves
[00:23:35] that tell us where customers are willing
[00:23:38] to trade down and trade up in order to
[00:23:40] get more of what they want out of their
[00:23:43] agents. The one thing I'm certain about,
[00:23:46] the one thing those 250,000
[00:23:48] GitHub stars for OpenClaw assure me of
[00:23:50] is that this is not going anywhere. The
[00:23:53] agent universe is here to stay. This is
[00:23:55] an ecosystem play that's very stable and
[00:23:57] dependable, even if it's new. And we
[00:23:59] should be assuming that there is going
[00:24:02] to be more activity around agents rather
[00:24:04] than less for the foreseeable future.
[00:24:06] And I mean like three, four, five, 10
[00:24:08] years down the road. Agents are how
[00:24:10] commerce is going to be done. And so I
[00:24:12] am really curious to see as we start to
[00:24:14] go forward how all of us start to shape
[00:24:18] that world. How does your choice of
[00:24:19] which agent you'll use start to shape
[00:24:21] how markets behave? And you might think,
[00:24:23] oh, I can't choose it by myself or or me
[00:24:25] by myself. It doesn't really matter.
[00:24:27] Well, look, all of us together
[00:24:29] collectively are choosing how we want to
[00:24:32] make agents work in the future.
[00:24:34] Thousands of you ended up building
[00:24:36] Openrain because you decided that you
[00:24:38] wanted to control your data. People are
[00:24:41] using OpenClaw because they want to
[00:24:42] control their agents and people who are
[00:24:45] choosing not to have that level of
[00:24:46] control are intentionally choosing
[00:24:48] companies that they trust to do business
[00:24:50] with. How we delegate agentic trust is
[00:24:54] the question of 2026 and we should be
[00:24:56] asking ourselves that. That is the lens
[00:24:57] we should be using to read and
[00:25:00] understand all of this agent news. It is
[00:25:02] a much more useful and practical lens
[00:25:04] than all of the horse race hype, all of
[00:25:06] the safety hype. Let's read past that
[00:25:08] and let's look at the real story. Good
[00:25:10] luck picking an agent.
