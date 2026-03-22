# Raw Transcript

- Title: AI classrooms, self-evolving AI, Nvidia GTC, AI for polymarket, Google app builder: AI NEWS
- Creator: AI Search
- URL: https://youtu.be/HCVkBC1Vhcw?si=q2iWS23ppOgXRSmQ

---

[00:00:00] AI never sleeps and this week has been
[00:00:03] absolutely
[00:00:05] insane. The Terminator has arrived.
[00:00:08] Nvidia held their largest annual
[00:00:10] conference with a ton of exciting
[00:00:12] announcements. Miniaax and Xiaomi both
[00:00:14] released some incredible
[00:00:16] state-of-the-art models. This AI can
[00:00:18] create an interactive virtual classroom
[00:00:20] for you to effectively learn anything.
[00:00:22] We have another AI that can generate
[00:00:24] videos almost in real time on just a
[00:00:27] single GPU. Google drops a full stack
[00:00:29] vibe coding platform. Google also
[00:00:31] released an incredible upscaler.
[00:00:33] Humanoid robots can now play tennis. We
[00:00:36] have a new state-of-the-art deep
[00:00:37] research agent that's better than the
[00:00:39] closed models. And it's actually really
[00:00:41] good at predicting stuff. Like this
[00:00:42] could be very useful for prediction
[00:00:44] markets. This AI system lets your agent
[00:00:47] like OpenClaw get better and better by
[00:00:49] learning things automatically just by
[00:00:51] regularly chatting with it. We have some
[00:00:53] new AI tools for 3D modeling, including
[00:00:56] one that can turn a skeleton into a full
[00:00:58] model and another one that can generate
[00:01:00] models with meaningful parts. We have
[00:01:02] some ridiculous robot demos and a lot
[00:01:05] more. So, let's jump right in. Thanks to
[00:01:07] HubSpot for sponsoring this video. First
[00:01:09] up, Google releases a really powerful
[00:01:12] video upscaler called Spark VSSR. This
[00:01:16] is a really good video upscaler. So,
[00:01:18] this takes a lowquality video and it
[00:01:21] would output a clean highresolution
[00:01:23] video. So, here are some results. This
[00:01:25] works with wildlife as you can see here.
[00:01:27] It also works very well with scenery,
[00:01:30] either outdoor or indoor scenery. Here
[00:01:32] are some other examples. Notice how it's
[00:01:34] able to even generate and sharpen the
[00:01:37] details of these buildings by quite a
[00:01:39] lot. And you can even apply this to like
[00:01:41] old movies to upscale them or restore
[00:01:44] the quality. This also works with like
[00:01:46] 3D animations or other types of artistic
[00:01:49] styles. Now, if you compare this with
[00:01:51] other video upscalers such as Star or
[00:01:53] CDVR, Flash VSSR, which I covered on my
[00:01:56] channel before, notice that this new one
[00:01:58] from Google, which is on the bottom
[00:02:00] right, is by far the best quality. It's
[00:02:03] not even close. The awesome thing is if
[00:02:05] you scroll up to the top of the page,
[00:02:07] they have released the code to this
[00:02:09] already. So if you click on this code
[00:02:11] button and you scroll down a bit here,
[00:02:13] you can see that they've released not
[00:02:14] only the inference code and the models,
[00:02:16] but also the training code. So here's
[00:02:19] the entire data set that they used to
[00:02:21] train this. And then here's the training
[00:02:23] code. And then finally, here are the
[00:02:25] instructions on how to use it. Note that
[00:02:27] the total size of this is 42.2 GB, so
[00:02:31] you'll need a higherend GPU to run this.
[00:02:34] But this is currently the best
[00:02:36] open-source video upscaler I've seen so
[00:02:38] far. If you're interested in reading
[00:02:40] further, I'll link to this page in the
[00:02:42] description below. Also, this week,
[00:02:44] Miniax releases their best and latest
[00:02:46] model, Miniax M2.7. You know, the crazy
[00:02:49] thing here is it says that M2.7 is the
[00:02:52] first model deeply participating in its
[00:02:55] own evolution. So, specifically during
[00:02:57] training and refinement, the model
[00:02:59] actually helped improve itself by
[00:03:01] running experiments, updating its own
[00:03:04] tools and skills, and iterating in many
[00:03:06] cycles. And the Miniax team calls this a
[00:03:08] form of self-evolution, which is
[00:03:10] actually pretty crazy. Like, if they've
[00:03:12] reached recursive self-improving AI,
[00:03:15] then you can just take the human out of
[00:03:17] the loop. You can just keep this agentic
[00:03:19] iteration framework running and running
[00:03:21] to produce better and better models and
[00:03:23] the progress of this would be
[00:03:25] exponential. Anyways, here are some
[00:03:26] benchmark scores for your reference.
[00:03:28] Note that Miniax M2.7 is designed to do
[00:03:31] particularly well in terms of agentic
[00:03:34] coding and tool use. So here we have
[00:03:36] various coding benchmarks like Swebench
[00:03:38] Pro, Multi Sweedbench, Vibe Pro and as
[00:03:41] you can see for all these benchmarks
[00:03:43] M2.7 performs better than the previous
[00:03:46] M2.5 and it's also quite close to the
[00:03:49] top closed models out there including
[00:03:51] Gemini 3.1 Pro and also Opus 4.6 GBT 5.4
[00:03:56] and then this benchmark GDP val is also
[00:03:59] really important. So, this tests an AI's
[00:04:01] ability to do real world work tasks such
[00:04:03] as creating spreadsheets, legal briefs,
[00:04:05] presentations, design, etc. And as you
[00:04:08] can see, M2.7 showed a huge jump
[00:04:10] compared to M2.5. Still not at the level
[00:04:13] of the top closed models out there, but
[00:04:15] pretty close. Now, those were just some
[00:04:17] of their official benchmarks. Let's also
[00:04:19] look at some independent evaluation. So,
[00:04:21] if you look at this independent
[00:04:22] leaderboard by artificial analysis, then
[00:04:25] Miniax M2.7 is tied with GLM5, which is
[00:04:29] currently the best open-source model out
[00:04:31] there, both scoring 50 points in this
[00:04:34] intelligence index. Still behind the top
[00:04:36] closed models out there, but it's
[00:04:38] getting pretty close. Now, if you look
[00:04:40] at the price of this, then it's insanely
[00:04:42] cheap. So, Miniam M2.7 only costs around
[00:04:45] 50 cents per million tokens, whereas
[00:04:48] even GLM 5 costs more. And also if you
[00:04:50] look at all the closed models out there
[00:04:53] then they cost like way more. For
[00:04:55] example, Gemini 3.1 costs n times more
[00:04:58] and then claude opus costs 20 times
[00:05:00] more. So in terms of performance versus
[00:05:03] cost efficiency then Miniax M2.7 is
[00:05:06] actually the best option. Here's an
[00:05:07] example of a website that it has vibe
[00:05:10] coded. It's pretty good at front end and
[00:05:12] design. Everything is super smooth and
[00:05:14] responsive. Here's an example of its
[00:05:16] financial analysis and spreadsheet
[00:05:18] capabilities. So here's the spreadsheet
[00:05:20] that it has created. You can see
[00:05:22] everything is super detailed and
[00:05:24] comprehensive. Currently M2.7 is already
[00:05:27] fully available on Miniax agent which is
[00:05:30] like their web interface where you can
[00:05:32] use Miniax to autonomously complete
[00:05:34] tasks for you. It's kind of like
[00:05:36] GenSpark and Skywork. And in addition,
[00:05:38] it's also available via their API. So
[00:05:41] you can link this with Claude Code or
[00:05:43] OpenClaw or other services. Anyways, if
[00:05:45] you're interested in reading further,
[00:05:47] I'll link to this main page in the
[00:05:49] description below. Also, this week,
[00:05:51] Xiaomi ain't just making phones anymore.
[00:05:53] They've actually released an incredibly
[00:05:56] powerful series of AI models. So, one of
[00:05:58] them is called Mimo V2 Pro, and this is
[00:06:01] their flagship foundation model built
[00:06:03] for agentic tasks. Here are some specs
[00:06:06] on its architecture. So, this is quite a
[00:06:08] huge model with over a trillion
[00:06:10] parameters. This is a mixture of
[00:06:11] experts. So think of it as like a team
[00:06:13] of AIs working together at once. But
[00:06:15] when you use it, only 42 billion of
[00:06:17] these are active. So it's quite
[00:06:19] efficient. Now this isn't just designed
[00:06:21] for everyday stuff. This is deeply
[00:06:23] optimized for agentic scenarios. So if
[00:06:26] you look at these two benchmarks,
[00:06:28] Pinchbench and Claw Eval, which test its
[00:06:30] ability to do agentic workflows in like
[00:06:33] open claw scenarios, you can see that
[00:06:36] MIMO v2 Pro is really close to the
[00:06:39] performance of Opus 4.6, six, which is
[00:06:41] really impressive. So, here's an example
[00:06:43] of this 3D tower defense game that it
[00:06:46] has vibe coded autonomously. And as you
[00:06:48] can see, this looks very nice. And then
[00:06:50] here's an example of a website that it
[00:06:52] has vibecoded up. So, this is meant to
[00:06:54] mimic like 1990s print magazine
[00:06:57] aesthetics. And as you can see, the
[00:06:58] design is pretty good. And then here are
[00:07:00] some additional benchmarks for your
[00:07:02] reference. Here again, they're comparing
[00:07:03] this to the top closed models out there,
[00:07:05] including Opus 4.6, Gemini 3 Pro. It's
[00:07:09] interesting why they didn't use 3.1 Pro
[00:07:11] and then GPT 5.2. Again, interesting why
[00:07:14] they didn't use 5.4. So, it seems like
[00:07:17] they are cherry-picking here. Now, these
[00:07:18] are just their self-reported benchmarks.
[00:07:20] If you look at an independent evaluator
[00:07:22] called artificial analysis, then as you
[00:07:25] can see, Mimo V2 Pro scores one point
[00:07:28] below GLM5 and also below Miniax M2.7.
[00:07:32] Now, currently, this is available via
[00:07:34] API. So, you can connect this to Claude
[00:07:37] Code or OpenClaw. Or if you want to try
[00:07:39] this out online, you can go to Xiaomi's
[00:07:42] Mimo Studio. And at the top here, you
[00:07:44] can choose this new V2 Pro. If you're
[00:07:47] interested in reading further, I'll link
[00:07:49] to this page in the description below.
[00:07:51] Now, in addition to Mimo V2 Pro, they
[00:07:53] also released Mimo V2 Omni this week.
[00:07:56] And like the name implies, this is a
[00:07:59] multimodal model that can understand and
[00:08:01] generate text, images, video, and audio
[00:08:04] all using the same model. And here, if
[00:08:06] you compare various benchmarks like
[00:08:08] audio, image, and video understanding,
[00:08:10] then as you can see, V2 Omni actually is
[00:08:13] on par with the top closed models out
[00:08:15] there. And because of its vision
[00:08:17] capabilities, you can get this to
[00:08:20] autonomously operate a browser for you.
[00:08:22] So it can like analyze your screen and
[00:08:25] then decide on next steps or where to
[00:08:27] click next. Here's another example where
[00:08:29] we can get V2 Omni to autonomously
[00:08:32] upload a video on Tik Tok. So not only
[00:08:34] does it just upload the video, but it
[00:08:36] also detects like where to input the
[00:08:38] description, tags, etc. And then how to
[00:08:40] submit the entire video. And indeed,
[00:08:42] it's able to successfully publish the
[00:08:45] video as you can see here. So this is
[00:08:47] already out. You can access this via API
[00:08:49] or you can also try it using Xiaomi's AI
[00:08:52] Studio platform. At the top here, you
[00:08:54] can select V2 Omni. Anyways, if you're
[00:08:57] interested in reading further, I'll link
[00:08:59] to this main page in the description
[00:09:00] below. Next up, this AI is super useful.
[00:09:04] So, it's called OpenMIC, which stands
[00:09:06] for Open Multi- Aent Interactive
[00:09:08] Classroom. And this is an open- source
[00:09:10] platform that creates interactive
[00:09:12] virtual AI classrooms for any learning
[00:09:15] topic. Specifically here it says powered
[00:09:17] by multi-agent orchestration. It
[00:09:19] generates slides, quizzes, interactive
[00:09:21] simulations, and project-based learning
[00:09:23] activities all delivered by AI teachers
[00:09:26] and you also get some AI classmates who
[00:09:28] you can interact with. You can draw on a
[00:09:30] whiteboard and engage in real-time
[00:09:32] discussions. And this is a built-in
[00:09:34] openclaw integration where you can
[00:09:36] generate classrooms directly in your
[00:09:38] messaging apps like Telegram. So here's
[00:09:40] an example of how this works. Simply
[00:09:42] enter a prompt specifying what you want
[00:09:44] to learn. For example, here this person
[00:09:47] wants to learn about vibe coding. So you
[00:09:49] just need to enter that in and then
[00:09:50] select the appropriate model and then
[00:09:52] click on enter classroom. And then
[00:09:54] afterwards it's going to proceed to
[00:09:56] draft the course content, draft all the
[00:09:58] pages and interactive exercises plus the
[00:10:01] teaching actions. And then here's what
[00:10:02] you get. You can see it is able to
[00:10:04] generate a ton of slides and also
[00:10:06] generate some interactive exercises for
[00:10:09] you to actively learn. And there's also
[00:10:11] this cute little chat widget here where
[00:10:13] you can chat with your AI classmates and
[00:10:16] ask questions. And then here's an
[00:10:17] interactive whiteboard. And it also
[00:10:20] contains some quizzes for you to
[00:10:22] actually test your understanding. It
[00:10:24] also designs projects for you to
[00:10:26] complete just like in regular education.
[00:10:29] So if you want to learn a certain topic
[00:10:31] or get your kids to effectively learn a
[00:10:34] certain topic, you don't even need to
[00:10:35] hire a tutor anymore. This tool is
[00:10:37] completely for free. It's open source.
[00:10:39] You can run it locally on your computer
[00:10:41] and you just need to enter a topic and
[00:10:43] it can generate all the learning
[00:10:44] materials for you. Anyways, here it
[00:10:47] contains all the instructions on how to
[00:10:49] set this up locally on your computer.
[00:10:52] All the instructions are on this page.
[00:10:54] So, if you're interested in reading
[00:10:55] further, I'll link to this page in the
[00:10:57] description below. Also, this week, this
[00:10:59] AI is incredibly useful. So it's called
[00:11:02] Metaclaw and this is a framework which
[00:11:05] you add on top of OpenClaw to get it to
[00:11:07] learn and get better and better just by
[00:11:10] regularly chatting with it over time.
[00:11:12] This is basically a framework that takes
[00:11:14] your normal conversations and then it
[00:11:16] automatically adds skills which are
[00:11:19] saved in its library of skills. So it
[00:11:21] does this all automatically just as you
[00:11:23] chat with it. And of course, the next
[00:11:25] time you use it, it's going to refer to
[00:11:26] this new library of skills to, you know,
[00:11:29] learn and get better and not commit the
[00:11:31] same mistakes as before. So here it
[00:11:33] says, just talk to your agent as you
[00:11:35] normally would. Metaclaw turns every
[00:11:37] live conversation into a learning
[00:11:38] signal, enabling the agent to
[00:11:40] continuously improve. So specifically
[00:11:43] under the hood, it places your model
[00:11:44] behind a proxy that intercepts your
[00:11:47] conversations. And then afterwards, it
[00:11:49] injects relevant skills at each turn.
[00:11:52] and it saves all of this in a library of
[00:11:55] accumulated skills. So these skills are
[00:11:57] summarized and remembered after every
[00:11:59] session. And if you enable reinforcement
[00:12:02] learning, then this also quietly
[00:12:04] fine-tunes the agent in the background
[00:12:06] during your idle time when you're not
[00:12:07] using it. So on this page, it contains
[00:12:09] all the instructions on how to install
[00:12:12] and configure it. This is just a
[00:12:13] framework which you add on top of open
[00:12:16] claw or other claw variants. This should
[00:12:18] in theory make your agent get smarter
[00:12:20] and more performant and less errorprone
[00:12:23] over time as you interact with it. If
[00:12:25] you're interested in reading further,
[00:12:26] I'll link to this page in the
[00:12:28] description below. Also, this week we
[00:12:30] have a really cool AI called Dreamverse.
[00:12:32] This is an AI video interface built on
[00:12:35] top of something called fast video,
[00:12:37] which is a super fast video generation
[00:12:39] system that uses LTX3 to generate a
[00:12:42] 5-second 1080p video in only 4.5 seconds
[00:12:47] on just a single GPU. Now, this does use
[00:12:50] a B200 GPU, which is not your everyday
[00:12:53] GPU. This is like an enterprisegrade
[00:12:55] high-end GPU, but nevertheless, still
[00:12:57] very impressive that it's able to
[00:12:59] generate a video so quick. Here's a demo
[00:13:02] with this new Dream Vverse platform. And
[00:13:04] as you can see, in just a few seconds
[00:13:06] after you enter your prompt, you can
[00:13:07] already get a full video. And you can
[00:13:09] edit this further. For example, you can
[00:13:11] make the owner a woman and the cat a
[00:13:13] dog. And in just 3 seconds, this is not
[00:13:16] sped up. It's able to edit the video
[00:13:18] just like that. And then you can edit
[00:13:20] this further. For example, you can make
[00:13:22] this in the style of anime. And again,
[00:13:25] it's able to turn this into anime in
[00:13:27] only a few seconds. So, this is
[00:13:29] incredibly fast. If you look at image to
[00:13:32] video and audio, you can see that LTX
[00:13:35] 2.3 using fast video has by far the
[00:13:38] lowest latency, like more than 10 times
[00:13:41] lower than the standard LTX 2.3. And if
[00:13:44] you look at text to video and audio,
[00:13:46] again, fast video has the lowest
[00:13:48] latency. The awesome thing is you can
[00:13:50] try this online. So, if you click on
[00:13:52] this demo link, it takes you to this
[00:13:54] page. And here's where you can enter a
[00:13:56] prompt. Let's try this one. Pixar style,
[00:13:59] a boy and a dog in a park. So, I'm going
[00:14:01] to click this. I'm not even going to
[00:14:02] pause the video so you can see how quick
[00:14:04] this is.
[00:14:05] >> Come on, Biscuit. This way.
[00:14:06] >> You can see in just a few seconds it was
[00:14:08] able to generate this video. Now, I can
[00:14:11] edit this further. I can write like turn
[00:14:13] the dog into a cat. Make the boy's shirt
[00:14:18] blue. And then, again, I'm not going to
[00:14:20] pause the recording so you can see how
[00:14:22] fast this is. In just a few seconds, you
[00:14:24] can see that now it has turned the dog
[00:14:25] into a cat and it has turned the boy's
[00:14:27] shirt blue. Now, because this is almost
[00:14:30] real time, there's a ton of significant
[00:14:32] errors with this generation. There's a
[00:14:34] lot of distortions along the edges. It's
[00:14:36] not perfect, but it is very impressive
[00:14:38] how you can just edit videos now almost
[00:14:40] in real time. Anyways, if you're
[00:14:42] interested in trying this out, I'll link
[00:14:44] to this main page in the description
[00:14:46] below. You've probably heard of how AI
[00:14:48] tools are transforming marketing. But if
[00:14:50] you're not sure how to actually use them
[00:14:52] to build real campaigns without hiring
[00:14:54] developers, this is the ebook for you.
[00:14:57] Check out Master Claude Code for
[00:14:59] Marketing. Four workflows plus 12
[00:15:01] prompts to ship campaigns fast by
[00:15:03] HubSpot. This bundle includes four
[00:15:05] workflows that are like a cheat code for
[00:15:08] building and deploying entire marketing
[00:15:10] campaigns from your terminal. You'll
[00:15:12] learn how to conduct competitor
[00:15:13] research, craft differentiated
[00:15:15] positioning, build interactive lead
[00:15:17] magnets, and deploy landing pages, all
[00:15:20] without writing a single line of code
[00:15:22] yourself. You get 12 readytouse prompts
[00:15:24] to help you unlock Claude Code's full
[00:15:27] potential for marketing tasks. From
[00:15:29] researching competitors to writing email
[00:15:31] sequences that actually convert, use
[00:15:33] them to eliminate the guesswork and get
[00:15:35] highquality outputs faster. My favorite
[00:15:37] one is this Oneshot landing page builder
[00:15:40] workflow. It shows you how to go from
[00:15:42] positioning to a fully deployed landing
[00:15:45] page in a single session, complete with
[00:15:47] distinctive design, mobile
[00:15:49] responsiveness, and clear conversion
[00:15:50] paths. You can access all of this for
[00:15:53] free using the link in the description
[00:15:55] below. This resource was made by
[00:15:57] HubSpot, the sponsor of this video.
[00:16:00] Also, this week, this AI is really good
[00:16:02] for generating text and also emojis and
[00:16:05] glyphs in an image. So, this is called
[00:16:07] Glyph Printer. And here are some
[00:16:09] examples. So on the left is the prompt
[00:16:12] and the first column is this new glyph
[00:16:14] printer. The rest of the columns are
[00:16:16] other competitors. For example, Quen
[00:16:18] image is on the far right. And if you
[00:16:20] look at the first one, we need to
[00:16:21] generate a futuristic video game with
[00:16:23] this Japanese title. And then below it,
[00:16:26] this line. And as you can see, this new
[00:16:28] glyph printer was the only one that was
[00:16:30] able to get all of the characters
[00:16:32] correct. Now, instead of Japanese, this
[00:16:34] can also do Chinese. So here's a Chinese
[00:16:36] example. the book title has to be this
[00:16:39] and then the subtitle has to be this.
[00:16:40] And as you can see, it's able to render
[00:16:43] all the Chinese characters correctly.
[00:16:44] Whereas for the rest of these
[00:16:46] competitors, there are some errors with
[00:16:47] the characters. A lot of them are like
[00:16:49] missing some strokes. And in addition,
[00:16:51] this can also do tie. So here's a Thai
[00:16:54] example. And again, it's able to nail
[00:16:56] the characters that were specified in
[00:16:58] the prompt. And then here's a Korean
[00:17:00] example with this title and this
[00:17:02] subtitle plus coming soon. It's able to
[00:17:05] get all the characters correct. And then
[00:17:06] here's a French example. Now, in
[00:17:09] addition to just generating different
[00:17:11] languages, the really cool thing is that
[00:17:13] it can also take in emojis and glyphs.
[00:17:16] So, for example, for our prompt, we can
[00:17:18] generate a stone cave carved with these
[00:17:20] glyphs on the wall. And indeed, it's
[00:17:23] able to generate this very well. And
[00:17:25] then here's another example where we can
[00:17:26] generate this stone with these carvings.
[00:17:29] And as you can see, it's also able to
[00:17:31] generate this very well. This actually
[00:17:33] looks like the input images. Or in
[00:17:35] addition, you can also enter this glyph
[00:17:38] or font and display that on this paper.
[00:17:40] And indeed, it's able to actually follow
[00:17:43] the font that you input very well. Or
[00:17:45] here's another example where we can
[00:17:47] input these glyphs into your prompt. And
[00:17:49] here is the result. And then here's
[00:17:51] another example of mixing two different
[00:17:53] glyphs. So we have these characters on
[00:17:56] the cake. As you can see here, they look
[00:17:58] pretty accurate. And then we also have
[00:18:00] this happy birthday font on the cake.
[00:18:02] And the font also looks pretty accurate.
[00:18:04] The awesome thing is at the top of the
[00:18:06] page, they've already released the code
[00:18:08] to this. So if you click on this button,
[00:18:10] it takes you to their GitHub repo. And
[00:18:12] if you scroll down a bit here, it
[00:18:14] contains all the instructions on how to
[00:18:16] download and run this locally on your
[00:18:18] computer. And in addition, they also
[00:18:21] provide the training code and the data
[00:18:23] set to this. So this is completely open
[00:18:25] source. The link is up here. So if
[00:18:27] you're interested in reading further,
[00:18:28] I'll link to this page in the
[00:18:30] description below. Next up, this AI is
[00:18:32] quite fascinating. It's called Soulworld
[00:18:35] Model, and this is an AI that can
[00:18:37] generate realistic video tours of actual
[00:18:40] cities. So, you can navigate around this
[00:18:43] realistic city like a video game. They
[00:18:45] first started with Soul, Korea. And here
[00:18:47] are some examples of AI videos that were
[00:18:50] generated with this model. Notice that
[00:18:52] all the buildings and the streets,
[00:18:54] everything resembles what it looks like
[00:18:55] in real life. Here it says this world
[00:18:57] model can generate videos over
[00:18:59] multicometer trajectories without
[00:19:02] accumulating errors. So essentially this
[00:19:04] is just a video generator and the
[00:19:05] problem we've had with existing video
[00:19:07] generators is that if you keep
[00:19:09] generating a longer and longer video
[00:19:11] then the quality degrades and it starts
[00:19:12] looking really bad. But with this AI
[00:19:15] even if you keep navigating in this
[00:19:17] virtual world notice that this video is
[00:19:19] played at 20x speed. The video remains
[00:19:22] very coherent. And here it says it
[00:19:24] supports free form navigation. So, you
[00:19:26] don't have to just navigate along a
[00:19:28] road. You can walk around everywhere.
[00:19:30] You can walk into a park. You can
[00:19:32] explore the city however you want, but
[00:19:34] you can't enter any buildings. Now, the
[00:19:36] cool thing is you can also add in a text
[00:19:38] prompt to add some effects to this. For
[00:19:40] example, you can summon a massive wave
[00:19:42] onto the streets or you can turn it into
[00:19:45] nighttime or sunset or you can generate
[00:19:47] a flood or even generate a UFO or
[00:19:50] generate other things because
[00:19:51] essentially this is just a video
[00:19:53] generator. So how this works is this
[00:19:55] uses rag or retrieval augmented
[00:19:58] generation on millions of street view
[00:20:00] images and then it uses that as like
[00:20:02] frames or anchor points for the video
[00:20:05] generation. So this includes images on
[00:20:07] you know what the scene would look like
[00:20:08] right now as well as look ahead scenes
[00:20:11] so it can plan in advance what the video
[00:20:14] would look like a few frames into the
[00:20:15] future. And if there's sparse data, like
[00:20:17] if there's a certain point that doesn't
[00:20:19] contain a lot of image data, then it
[00:20:21] also uses cross- temporal pairing and
[00:20:23] street view interpolation to basically
[00:20:25] use AI to fill in the blanks. Now, like
[00:20:28] I said, currently they've only trained
[00:20:30] this on the streets of Soul, Korea, but
[00:20:32] you know, this is a really fascinating
[00:20:33] idea. We could extrapolate this to other
[00:20:35] places in the world to build like a
[00:20:38] digital twin of Earth where you can
[00:20:39] explore around. Now, at the top here,
[00:20:41] they have released a code and weights
[00:20:43] button. And if you click into it here,
[00:20:45] it says they are undergoing internal
[00:20:47] review and they do plan to release the
[00:20:50] models as well as the training data. For
[00:20:52] now, if you're interested in reading
[00:20:53] further, I'll link to this page in the
[00:20:55] description below. Now, at the beginning
[00:20:57] of the video, I mentioned that we have
[00:20:59] Terminator this week. I wasn't joking.
[00:21:02] So, this AI is called Terminator. And
[00:21:04] no, it's not this Terminator. This one
[00:21:06] is actually really useful. Now, here's
[00:21:08] what it solves. You see, the problem
[00:21:10] with large reasoning models is that they
[00:21:12] usually overthink and they end up
[00:21:14] spending a lot of tokens. And especially
[00:21:16] if you're paying for like API costs,
[00:21:18] then it's going to cost you a ton of
[00:21:20] money. A ton of these models just
[00:21:21] continue thinking and yapping all day
[00:21:24] and overexlaining things. Most of the
[00:21:26] time it's not actually necessary. So
[00:21:28] what Terminator does is this is a
[00:21:30] lightweight add-on which stops AI models
[00:21:33] from overthinking. It cuts off its
[00:21:35] reasoning once the answer is ready. So
[00:21:37] here you can see that we are using quen
[00:21:40] 3 and on the left we are using this
[00:21:42] terminator add-on. It has already
[00:21:44] detected the final answer and it ends
[00:21:46] its response at 13.2 seconds. Whereas on
[00:21:49] the right if we don't add terminator
[00:21:51] then it keeps thinking and yapping on
[00:21:53] and on and it takes like 76 seconds for
[00:21:56] this response to finish. So this takes
[00:21:58] up a lot more time and uses a lot more
[00:22:00] tokens. So here they say that Terminator
[00:22:02] can cut reasoning length by up to 55%.
[00:22:06] And because it's terminating this early,
[00:22:08] it can like reduce the generation time
[00:22:10] by half. So how this works is this is
[00:22:12] just an add-on. You don't need to train
[00:22:14] the base model further. This is just a
[00:22:16] single layer transformer probe that sits
[00:22:19] on top of existing models and it just
[00:22:21] detects when the final answer has been
[00:22:23] generated. It predicts a zero if the
[00:22:25] answer has not been generated or it
[00:22:27] outputs one if it has and if it has then
[00:22:29] it basically terminates the response
[00:22:32] early. Now, especially if you're using
[00:22:33] Open Claw or other agentic systems,
[00:22:36] which tend to keep yapping on and on,
[00:22:39] this Terminator add-on might be a good
[00:22:41] option to cut its responses early and
[00:22:43] reduce your costs. Now, unfortunately,
[00:22:46] they haven't released the code or the
[00:22:48] data set to this. It says it's coming
[00:22:50] soon, so hopefully they will stick to
[00:22:52] their word and actually open source
[00:22:53] this. For now, if you're interested in
[00:22:55] reading further, I'll link to this page
[00:22:57] in the description below. Also this
[00:22:59] week, as you may know, Nvidia held their
[00:23:01] largest annual conference, GTC. Now,
[00:23:04] there are a ton of different keynotes
[00:23:06] and announcements. In fact, Jensen
[00:23:07] Huang's keynote was over 2 hours long,
[00:23:10] plus there were a ton of other
[00:23:11] announcements. But here are the main
[00:23:13] updates that you need to know about. One
[00:23:15] of them is this Vera Rubin platform.
[00:23:17] This is Nvidia's idea of what a full AI
[00:23:20] supercomput should look like. Instead of
[00:23:22] building one single chip, they designed
[00:23:24] an entire computing system from the
[00:23:26] ground up. This system is optimized to
[00:23:29] run AI agents at a massive scale. It's
[00:23:31] made of seven new chips that work
[00:23:33] together like one team. The Reuben GPU
[00:23:36] does the heavy AI computing. This is the
[00:23:39] main powerhouse for running AI. And then
[00:23:41] we also have the Vera CPU which handles
[00:23:44] control and coordination. And then we
[00:23:46] also have these Envy Link switches for
[00:23:48] moving data around at incredible speeds
[00:23:51] between machines. and then also connect
[00:23:54] X networking and a ton of ultra fast
[00:23:56] specialized chips all tightly integrated
[00:23:58] into liquid cooled racks that behave
[00:24:01] like a single computer. Nvidia calls
[00:24:04] this extreme code design meaning the
[00:24:06] whole data center is treated like one
[00:24:09] unit of compute instead of separate
[00:24:11] servers. A single rack can contain
[00:24:13] dozens of CPUs and GPUs connected with
[00:24:16] terabyte per second links allowing huge
[00:24:18] AI models to share data instantly. The
[00:24:21] system can easily do training,
[00:24:22] inference, and agentic workflows and
[00:24:25] other tasks at very low costs per token.
[00:24:27] In fact, Jensen says demand for these
[00:24:30] Blackwell and Vera Rubin systems could
[00:24:32] reach a trillion dollars, which is
[00:24:35] crazy. And Nvidia claims these machines
[00:24:37] deliver the lowest cost per token ever
[00:24:39] because the whole stack from GPU to CPU
[00:24:42] to networking and storage is built as
[00:24:45] one vertically integrated supercomput.
[00:24:48] Now within the Vera Rubin platform is a
[00:24:51] really powerful component called the Gro
[00:24:53] 3 LPU which stands for language
[00:24:55] processing unit. This is designed
[00:24:57] specifically for one thing. Running AI
[00:25:00] models as fast as possible. You see
[00:25:02] training huge models is expensive but
[00:25:04] the real cost comes later when millions
[00:25:06] of users are constantly asking these
[00:25:09] models questions. Now, this new Gro 3
[00:25:11] LPX compute tray, which contains eight
[00:25:13] Gro 3 LPUs, is optimized to handle all
[00:25:17] these requests. It's ultra low latency,
[00:25:19] so AI agents can respond almost
[00:25:21] instantly instead of working alone.
[00:25:23] Again, these LPX trays sit within the
[00:25:26] huge Vera Rubin supercomputer, which
[00:25:28] includes other CPUs and GPUs, and
[00:25:30] they're all interconnected through
[00:25:32] high-speed links. The idea is that the
[00:25:34] Reuben GPUs will handle the training
[00:25:37] whereas these LPUs will handle the
[00:25:40] non-stop stream of prompts from users
[00:25:42] around the world and they say that this
[00:25:44] will ship in Q3 of this year. Now in
[00:25:47] addition to the Vera Rubin platform,
[00:25:49] here's another noteworthy announcement.
[00:25:51] So Nvidia also announces Nemo Claw,
[00:25:53] which is like Nvidia's enterprisegrade
[00:25:56] version of OpenClaw, built so companies
[00:25:58] can safely deploy autonomous AI agents
[00:26:01] inside real business environments. As
[00:26:03] you may know, OpenClaw allows you to
[00:26:05] create AI agents that can plan tasks and
[00:26:08] call tools and work on their own and run
[00:26:10] 24/7 on your device. But there are a ton
[00:26:13] of security concerns with this. Nemo
[00:26:16] Claw adds that extra security layer
[00:26:18] needed for production use. Instead of
[00:26:21] just letting agents run freely, the
[00:26:22] system routes every action through a
[00:26:24] controlled runtime called OpenShell,
[00:26:27] which enforces policies, privacy rules,
[00:26:29] and network limits. Developers send
[00:26:32] commands to define how an agent should
[00:26:34] behave, what tools it can use, and what
[00:26:36] data it can access. And then the
[00:26:38] platform outputs full running agents
[00:26:40] that operate inside this secure sandbox.
[00:26:44] The goal is to make a gentic AI usable
[00:26:46] in enterprises where you need strict
[00:26:48] control over data permissions and
[00:26:51] external connections. In simple terms,
[00:26:53] Nemoclaw is like OpenClaw but with
[00:26:55] additional guard rails and OpenShell
[00:26:57] makes sure the agent never steps outside
[00:27:00] these rules. Now, in addition to
[00:27:01] OpenClaw, Nvidia also announced a really
[00:27:04] cool ecosystem of various open-source AI
[00:27:07] models. This is an entire collection of
[00:27:09] frontier models, all open weights, so
[00:27:11] anyone can customize and deploy them. At
[00:27:14] the center is Neotron for language,
[00:27:17] reasoning, and agentic systems. This is
[00:27:19] their leading open-source multimodal
[00:27:21] model. And in fact, I covered their
[00:27:23] latest one called Neotron 3 Super last
[00:27:26] week. Then comes Cosmos, which is like a
[00:27:29] virtual world that simulates physics.
[00:27:32] Think of it as like a simulation that
[00:27:33] follows real world physics. And the
[00:27:36] importance of this is you can then train
[00:27:38] robots virtually in this environment
[00:27:41] before deploying them into the real
[00:27:43] world. They also have an open vision
[00:27:45] language model which they call Isaac
[00:27:47] Groot. And this is tuned specifically
[00:27:49] for humanoid robots giving them full
[00:27:51] body control, spatial awareness, and the
[00:27:54] ability to act on instructions in the
[00:27:56] real world. So think of it as like the
[00:27:58] brain of a humanoid robot. And that's
[00:28:00] not all they have to offer. For
[00:28:02] self-driving cars, there's Alpameo,
[00:28:04] delivering human-like perception and
[00:28:06] decision-making on the road. Think of
[00:28:08] this as like an AI for autonomous
[00:28:10] driving. And then in biology and drug
[00:28:12] discovery, they also have Bio Nemo,
[00:28:15] which is an AI model that can predict
[00:28:17] proteins and simulate molecules. This
[00:28:19] would of course be extremely helpful in
[00:28:21] accelerating breakthroughs in
[00:28:22] healthcare, biology, and beyond. And for
[00:28:25] climate, they also have Earth 2, which
[00:28:27] is also open source. This tackles
[00:28:29] weather and atmospheric prediction at an
[00:28:32] unprecedented scale. And we are not done
[00:28:34] yet. So here's another really cool
[00:28:36] update from Nvidia called DLSS 5.0. This
[00:28:39] is Nvidia's next step toward what's
[00:28:42] called neural rendering where
[00:28:43] traditional 3D graphics and AI start to
[00:28:46] merge into a single system. You see, in
[00:28:48] a normal game, the 3D graphics engine
[00:28:51] renders every frame using geometry,
[00:28:53] textures, and lighting calculations,
[00:28:55] which is extremely slow and expensive.
[00:28:58] But with DLSS 5, the game only provides
[00:29:01] the core 3D scene data and a partially
[00:29:03] rendered frame. Then an AI model can
[00:29:05] fill in the rest, adding realistic
[00:29:07] lighting, detail, and even subtle visual
[00:29:10] effects that were never explicitly
[00:29:12] computed. This adds a lot more quality
[00:29:15] and also saves compute. The key idea is
[00:29:18] combining two very different approaches.
[00:29:20] classic 3D graphics which are structured
[00:29:22] and controllable and generative AI which
[00:29:25] is probabilistic and good at generating
[00:29:27] details and realism. By fusing them
[00:29:29] together, the system can produce images
[00:29:31] that look more photorealistic than what
[00:29:34] the game engine actually rendered while
[00:29:36] using far less compute. In other words,
[00:29:38] instead of drawing every pixel the hard
[00:29:40] way, the GPU starts predicting what the
[00:29:42] final image should look like. So, that's
[00:29:44] a ton of stuff, but those were the main
[00:29:46] highlights and announcements from
[00:29:47] Nvidia's GTC. Of course, there's like
[00:29:50] hours and hours of keynotes and other
[00:29:52] presentations, so I only scratched the
[00:29:54] surface. In humanoid robot news, here's
[00:29:56] just a video of an average day in
[00:29:58] Beijing. Here you can see robots
[00:30:00] casually running along the street. Now,
[00:30:02] why are they doing so? It turns out
[00:30:04] they're preparing for a half marathon
[00:30:06] that's happening in a month. So, these
[00:30:08] robotics companies are like training
[00:30:10] their robots for the event. There's a
[00:30:12] ton of different robots that are just
[00:30:14] casually jogging at night in Beijing.
[00:30:16] Really exciting times. Also this week we
[00:30:18] have this stunning demonstration of TA
[00:30:21] operating not just one robot but a swarm
[00:30:24] of robotic hands. The company behind
[00:30:26] this is called Hexa Circle and as you
[00:30:28] can see here a single human operator is
[00:30:31] controlling dozens of robotic hands
[00:30:33] simultaneously with very high precision.
[00:30:36] The operator is wearing this specialized
[00:30:38] motion capture glove with haptic
[00:30:40] feedback elements. So as he moves his
[00:30:43] hand, every robotic hand in the room
[00:30:45] mimics him in real time. The robotic
[00:30:47] hands perform complex individual finger
[00:30:49] movements showing that they aren't just
[00:30:51] simple grippers but possess humanlike
[00:30:53] degrees of freedom. And then similarly
[00:30:55] we have another hand demo. This time
[00:30:58] it's from a company called Orca Hand.
[00:31:00] And here they feature a lineup of
[00:31:02] different hands that were 3D printed.
[00:31:04] This includes Orca Hand, Orca Hand
[00:31:06] Light, and Orca Hand Touch, each with
[00:31:09] varying degrees of freedom and cost. The
[00:31:11] awesome thing is they plan to open
[00:31:13] source everything. Now, in this video,
[00:31:15] you can see the impressive capabilities
[00:31:17] of these hands. It has very precise
[00:31:19] manipulation capabilities. It also has
[00:31:22] tactile feedback. So, here's a demo
[00:31:24] showing its touch sensors, mapping
[00:31:26] pressure in real time as the human
[00:31:28] interacts with the fingers. And this can
[00:31:30] manipulate various everyday items,
[00:31:32] including a tennis ball, a water bottle,
[00:31:34] banana, and more. This has adaptable
[00:31:37] grip styles. It's also really good at
[00:31:39] controlling force. Again, for a lot of
[00:31:41] these items, like the banana, you need
[00:31:42] to apply just the right amount of force
[00:31:44] to hold it without crushing the hell out
[00:31:46] of it. And here's a durability test. So,
[00:31:48] the person hits the robotic hand with a
[00:31:50] hammer, and the joints are designed to
[00:31:52] pop out of place rather than break,
[00:31:55] allowing them to be snapped back
[00:31:56] immediately. And then here it shows the
[00:31:58] hand achieving over 100 newtons of grip
[00:32:01] strength, which is exceptionally high
[00:32:03] for a 3D printed tendon-driven system.
[00:32:06] And here's a time-lapse showing the
[00:32:07] structural components being 3D printed.
[00:32:10] In fact, they promised to open source
[00:32:12] the CAD files and the bill of materials
[00:32:15] for this so that anyone with a 3D
[00:32:17] printer can potentially just print out
[00:32:19] these hands, which is fantastic. In
[00:32:21] other humanoid robot news, this is
[00:32:24] pretty crazy. It turns out that humanoid
[00:32:26] robots have already learned how to play
[00:32:28] tennis. This is actually incredibly
[00:32:31] impressive. Not only does it have to
[00:32:33] hold the racket and hit the ball at
[00:32:34] exactly the right angle and power to get
[00:32:37] it across the other side, but it also
[00:32:39] needs to run across the court towards
[00:32:41] the ball with its legs. It's not just
[00:32:43] standing still this whole time.
[00:32:44] Everything in its body needs to respond
[00:32:46] in real time in order for it to, you
[00:32:49] know, reach and hit the ball. So, this
[00:32:51] demo is from a project called Latent,
[00:32:53] which stands for learning athletic human
[00:32:56] tennis skills from Okay, I'm lost
[00:32:58] already. How on earth can you turn this
[00:33:00] into latent? But anyways, this is an AI
[00:33:03] system that teaches humanoid robots how
[00:33:05] to play tennis or other fast sports.
[00:33:07] Now, this is particularly challenging
[00:33:09] because training a robot to do athletic
[00:33:12] movements often requires precise
[00:33:14] recordings of human motion which are
[00:33:16] hard to collect. We often don't have
[00:33:17] enough of this data. But latent solves
[00:33:20] this by learning from imperfect data.
[00:33:21] The key idea here is that these video
[00:33:24] fragments that only capture basic skills
[00:33:27] like swinging, stepping, or turning
[00:33:29] still contain enough information, and
[00:33:31] the system can combine and correct them
[00:33:33] using reinforcement learning in a
[00:33:35] simulation. And after training it for
[00:33:37] hundreds of thousands of rounds in this
[00:33:39] virtual simulation that follows real
[00:33:41] world physics, it's then deployed to a
[00:33:43] Unitere G1 robot in real life. And as
[00:33:46] you can see here, it can actually play
[00:33:48] tennis. So that's what this project is
[00:33:51] about. If you're interested in reading
[00:33:52] further, I'll link to this page in the
[00:33:54] description below. Also, this week, we
[00:33:56] have two state-of-the-art heavyduty
[00:33:59] research agents that are actually
[00:34:01] incredibly powerful. So, these are
[00:34:03] called Miro Thinker 1.7 and H1. And you
[00:34:07] know, this is even better than some of
[00:34:09] the top closed models out there,
[00:34:11] including GPT and Claude. But before we
[00:34:13] go over the benchmarks, here are some
[00:34:15] ridiculous achievements. So it turns out
[00:34:17] that this mirror thinker model is really
[00:34:20] good at predicting things. So you can
[00:34:22] potentially use this for prediction
[00:34:23] markets like poly market. For example,
[00:34:26] it was asked on February 10th to predict
[00:34:28] the price of gold on February 25th and
[00:34:31] this was its forecast and this was the
[00:34:34] actual result. So it was only off by $4
[00:34:37] or 0.08%.
[00:34:39] This is extremely close. Here you can
[00:34:41] see the full chat. So here's the prompt.
[00:34:44] Pretty simple. And then it proceeds to
[00:34:45] give you a ton of research to give you
[00:34:47] this final answer. And you can see it
[00:34:49] actually cites from all these different
[00:34:51] references in order to formulate its
[00:34:54] prediction. Here's another example. So
[00:34:56] on January 6th, it was asked who was
[00:34:59] going to win this year's Super Bowl. And
[00:35:01] it identified Seattle Seahawks as the
[00:35:04] most likely champion. And indeed on
[00:35:06] February 8th, which was over a month
[00:35:08] later, the Seahawks indeed won the Super
[00:35:12] Bowl LX. So, it correctly identified the
[00:35:14] champion 1 month in advance. Pretty
[00:35:17] crazy. Again, here is the chat history
[00:35:19] for you. So, the prompt is pretty
[00:35:20] simple. Who's going to win the Super
[00:35:21] Bowl? And then here is its response. And
[00:35:24] here's the answer. The Seattle Seahawks
[00:35:26] are the most likely team to win. And
[00:35:28] then here are all the references. Here's
[00:35:30] another crazy example. It also was able
[00:35:32] to correctly predict this year's Grammy
[00:35:35] dominant artist. So on January 8th, it
[00:35:38] was asked which artist is most likely to
[00:35:40] dominate the Grammy Awards. It predicted
[00:35:43] Kendrick Lamar and indeed at the Grammys
[00:35:46] almost a month later he won five awards.
[00:35:49] So it was also able to somehow correctly
[00:35:52] predict this. Then here is the original
[00:35:54] prompt for your reference. So pretty
[00:35:56] crazy how it's able to predict so many
[00:35:58] things one month in advance. Now, these
[00:36:00] are agents designed for heavyduty
[00:36:03] reasoning and research tasks where the
[00:36:05] goal isn't just to answer questions, but
[00:36:07] to investigate and verify conclusions
[00:36:10] like a real researcher. So, instead of
[00:36:12] just using the model's internal memory,
[00:36:14] the system is also built around a loop
[00:36:17] of planning, tool use, and verification.
[00:36:19] Now, the H1 is even more powerful than
[00:36:21] the 1.7. So, the H1 takes it a step
[00:36:24] further by adding verification directly
[00:36:26] into its reasoning process. It also
[00:36:28] checks intermediate steps and audits the
[00:36:30] final answer to make sure it's supported
[00:36:32] by evidence. So as you can see here from
[00:36:34] all these benchmark scores including
[00:36:36] browse comp which is like how good it is
[00:36:38] at web search and then we also have like
[00:36:40] research, math and science and also
[00:36:43] financial analysis. This new H1 model
[00:36:46] even beats the top closed models out
[00:36:48] there including GPT 5.4, Gemini 3.1 Pro
[00:36:52] and Claude Opus 4.6. These are the top
[00:36:56] models out there. Now, interestingly for
[00:36:57] browse comp, they did use the most
[00:36:59] recent models, but then for deep
[00:37:01] research, somehow they reverted this
[00:37:03] back to GPT5 instead of 5.4, Gemini 3
[00:37:07] instead of 3.1, and it's missing Claude
[00:37:09] Opus. So, not sure what's going on
[00:37:11] there. And then same with Frontier
[00:37:13] Science. Somehow they're using GPT 5.2
[00:37:16] here instead of 5.4 and then Gemini 3
[00:37:19] instead of 3.1. The models they're
[00:37:21] comparing to just aren't really
[00:37:22] consistent across these different
[00:37:24] benchmarks. But nevertheless, this is
[00:37:26] open- source and it's among the best of
[00:37:29] the best out there. So, the awesome
[00:37:30] thing is they've released this already.
[00:37:32] If you click on this GitHub repo, it
[00:37:34] contains all the instructions on how to
[00:37:36] download and run this. Here are some
[00:37:37] more specs for your reference. So, Miro
[00:37:39] Thinker 1.7 is 235 billion parameters
[00:37:44] with a 256K context window. If I click
[00:37:47] on the hugging face folder, this 1.7
[00:37:50] model is 470 GB. So, you'll need to link
[00:37:54] multiple high-end GPUs to run this
[00:37:56] locally. In addition, they also released
[00:37:58] a 1.7 mini version. This is smaller but
[00:38:01] less performant. This is considerably
[00:38:04] smaller at only 61 GB in size. All the
[00:38:07] links plus more info are on this page.
[00:38:10] So, if you're interested in reading
[00:38:11] further, I'll link to this page in the
[00:38:13] description below. Next up, this AI is
[00:38:15] pretty cool. So, it's called SegV Genen,
[00:38:18] and this can take a 3D model and
[00:38:20] automatically color or mark its
[00:38:22] different parts so you can separate them
[00:38:24] easily, just like cutting a toy into
[00:38:27] separate pieces. So, how this works is
[00:38:29] it would take a 3D object and you would
[00:38:31] click on various parts and it would
[00:38:32] automatically segment that part. So,
[00:38:35] here's an example where we can choose to
[00:38:37] select or deselect various parts just by
[00:38:40] clicking it. And what it does is it
[00:38:42] outputs the same 3D model but with the
[00:38:44] parts clearly segmented as a GB file.
[00:38:47] Now instead of just tediously clicking
[00:38:49] on each part one at a time, what you can
[00:38:51] also do is just upload a segmentation
[00:38:53] map as you can see on the bottom of
[00:38:55] these videos for it to use as a
[00:38:57] reference. And then afterwards it can
[00:38:59] just proceed to segment the entire
[00:39:01] object based on this segmentation map.
[00:39:03] And as you can see it is very accurate.
[00:39:05] Here are some other examples for your
[00:39:08] reference. And this SEGV genen has
[00:39:10] achieved state-of-the-art results. Here
[00:39:12] they say that it's 40% better on
[00:39:15] interactive part segmentation than the
[00:39:17] prior state-of-the-art model and 15%
[00:39:19] better on full segmentation while only
[00:39:22] using 32% of the training data. So, not
[00:39:25] only is this more performant, but it's
[00:39:27] also a lot more efficient during
[00:39:29] training. It requires way less data. The
[00:39:31] awesome thing is they've released this
[00:39:33] already. So, if you click on this code
[00:39:35] button and you scroll down a bit, here
[00:39:37] it contains all the instructions on how
[00:39:39] to install this. Note that this is based
[00:39:41] on Trellis 2. And here it says you do
[00:39:44] need an Nvidia GPU with at least 24 GB
[00:39:48] of VRAM. If you're interested in reading
[00:39:50] further, I'll link to this page in the
[00:39:51] description below. Also, this week we
[00:39:54] have another AI tool for 3D modeling.
[00:39:57] So, this is called SK Adapter, and this
[00:39:59] is pretty unique. So this lets you make
[00:40:02] or edit 3D objects that follow a
[00:40:05] skeleton structure. This is also called
[00:40:07] skeleton conditioned generation. So for
[00:40:10] example, you can upload this skeleton
[00:40:12] structure first and then plug it through
[00:40:14] this AI and it would generate a full 3D
[00:40:16] model that conforms with the skeleton.
[00:40:18] Here's another example. Here's the input
[00:40:21] skeleton and then here is the output 3D
[00:40:23] model. And then here's another example.
[00:40:25] Here's the skeleton and here's the
[00:40:27] generation. Here are some additional and
[00:40:29] very diverse examples. This even works
[00:40:31] with like birds or crustations or mecha
[00:40:34] robots, spaceships, and this robotic dog
[00:40:38] and a ton of other stuff. If you scroll
[00:40:40] up to the top of the page, they have
[00:40:41] released this code button here. It says
[00:40:44] the code is coming soon. In fact, not
[00:40:46] only are they going to release the
[00:40:48] model, but they're also going to release
[00:40:49] the training data set and training code.
[00:40:51] So, it looks like they are going to
[00:40:53] fully open source this, which is
[00:40:54] fantastic. For now, if you're interested
[00:40:57] in reading further, I'll link to this
[00:40:59] page in the description below. Also,
[00:41:01] this week, Google has announced some
[00:41:02] really cool updates to their platform
[00:41:04] called Stitch. If you haven't heard of
[00:41:06] this, it's basically an AI powered
[00:41:08] Figma, so you can just prompt it on what
[00:41:11] you want to design, and it can generate
[00:41:13] complete UI designs for multiple pages
[00:41:15] for your app or site. Now, I've already
[00:41:18] gone over Stitch several times on my
[00:41:20] channel, but this week, they've added
[00:41:21] even more cooler features. You can now
[00:41:24] add multiple reference images to steer
[00:41:26] the direction of your design. Here you
[00:41:28] can easily upload an image and replace
[00:41:30] the image on a certain page. Here's an
[00:41:33] even cooler thing. You can specify the
[00:41:35] color and the fonts of your entire site
[00:41:37] or app. And then with just one click of
[00:41:40] a button, you can transform all your
[00:41:42] existing pages to match this new color
[00:41:44] and design scheme. Plus, you can also
[00:41:46] just prompt it stuff by using your
[00:41:48] voice. You don't even need to type in a
[00:41:50] prompt anymore. That's how lazy you can
[00:41:52] get. Another cool thing is this can also
[00:41:54] output a markdown file which contains
[00:41:57] design guidelines for agents like
[00:41:59] OpenClaw. You can first get Stitch to
[00:42:01] design some wireframes and then send
[00:42:03] this markdown file over to an actual
[00:42:05] coding agent to code it up following
[00:42:07] these guidelines. Anyways, Stitch has
[00:42:09] been one of my favorite free tools from
[00:42:11] Google. It's just so easy to create UI
[00:42:13] designs without any experience. Anyways,
[00:42:16] if you're interested in trying this out,
[00:42:17] I'll link to this main page in the
[00:42:20] description below. Now, in addition to
[00:42:22] upgrading Stitch, Google has also
[00:42:24] upgraded their AI studio into a full
[00:42:27] stack coding environment. If you're not
[00:42:29] familiar with AI Studio, this is
[00:42:31] Google's platform where you can try out
[00:42:33] the latest models, including Nano Banana
[00:42:35] or VO for video generation, text to
[00:42:38] speech. You can even talk to Gemini
[00:42:40] using your voice in real time. There's a
[00:42:42] ton of other models that you can play
[00:42:44] around with, but over here in this build
[00:42:46] section, they've basically turned this
[00:42:48] into a full stack environment where an
[00:42:51] agent will build an entire application
[00:42:53] for you, including the front end, back
[00:42:55] end, the database, and authentication
[00:42:57] all in one place. So, for example, you
[00:43:00] can link this to other tools via API.
[00:43:02] You can connect it to live data sources.
[00:43:05] As you can see here, their app can now
[00:43:07] use data directly from Google Maps. Or
[00:43:09] you can also connect it to databases or
[00:43:12] payment processors and the agent will
[00:43:14] securely store your API credentials for
[00:43:16] you. For example, here is a fully
[00:43:18] functional multiplayer game where you
[00:43:21] need to guess the location of the other
[00:43:23] player via their photo which was pulled
[00:43:25] from Google Maps. So you can see you can
[00:43:27] interact with this Google map widget
[00:43:29] over here and you need to find where
[00:43:31] this player is. Now, because this is
[00:43:34] full stack, the system can now generate
[00:43:36] the front end, backend, database, and
[00:43:38] authentication all in one place. For
[00:43:40] example, you can configure database
[00:43:42] connections and set up user
[00:43:43] authentication with fire store and
[00:43:45] firebase. Now, if you vibe code an app
[00:43:48] here, you can't really choose another
[00:43:49] provider, but the advantage of this is
[00:43:51] the agent would automatically set up
[00:43:53] everything for you. So, you don't need
[00:43:55] to go inside Firebase yourself and
[00:43:57] manually set things up. Anyways, if
[00:43:59] you're interested in just getting an
[00:44:01] agent to autonomously code a full stack
[00:44:04] app with the front-end backend database
[00:44:06] authentication all built for you, then
[00:44:09] this might be one of the easiest
[00:44:10] platforms to do so. It's kind of like a
[00:44:12] replet competitor. Anyways, if you're
[00:44:14] interested in trying this out, I'll link
[00:44:16] to this main page in the description
[00:44:18] below. Also, this week, AI deep fakes
[00:44:21] just leveled up. So, this AI is called
[00:44:23] ID Laura. And first of all, here's some
[00:44:26] background on existing deep fake tools.
[00:44:28] You see, if you want to get a deep fake
[00:44:30] of a person talking, the problem is that
[00:44:32] current models have a two-step process.
[00:44:35] You need to clone that person's voice
[00:44:36] and then generate that voice speaking
[00:44:38] out the new transcript. And usually this
[00:44:40] involves some texttospech model, but
[00:44:42] then you also need a video model to
[00:44:44] actually generate a video of that person
[00:44:46] talking. And then you need to like
[00:44:48] basically make sure the audio is in sync
[00:44:49] with the video. But because of this
[00:44:51] separation, it's kind of a disconnect.
[00:44:53] It's not optimized. It's not one unified
[00:44:55] model. So, ID Laura solves this by using
[00:44:58] one single unified model to generate
[00:45:00] deep fakes of people talking. So, you
[00:45:02] would input an image of that person plus
[00:45:05] an audio clip plus the text prompt of
[00:45:07] what you want them to say and plug it
[00:45:09] through just one unified model to
[00:45:11] generate the deep fake video of them
[00:45:13] talking. So, here are some examples. We
[00:45:15] can upload a photo of this person. And
[00:45:17] then for the prompt, we can add
[00:45:19] something like a loud crack of wood
[00:45:21] splitting followed by heavy crash of
[00:45:23] branches and trunk hitting the ground.
[00:45:25] So, we want to like get this tree to
[00:45:26] collapse. And then for the speech, we
[00:45:28] want this woman to say, "Did you see
[00:45:30] that? It just fell over right there. But
[00:45:32] also, we need to input this woman's
[00:45:34] original voice first so it can clone her
[00:45:36] voice." So, here's what the reference
[00:45:38] audio sounds like.
[00:45:39] >> I basically embarked on a journey of
[00:45:41] quitting fast fashion once I learned
[00:45:42] that, but not just fast fashion. All
[00:45:44] right. So, given all these inputs, here
[00:45:46] is what it can generate.
[00:45:48] >> Did you see that? It just fell over
[00:45:50] right there.
[00:45:53] >> So, indeed, it was able to clone her
[00:45:55] voice and make her speak this out. Plus,
[00:45:57] also get the tree to collapse in the
[00:45:59] background. Or here's another example.
[00:46:01] Let's say you input this initial frame,
[00:46:03] plus for environment sounds, you can add
[00:46:05] some sharp knocking sounds on a wooden
[00:46:07] table. And then here is what you want to
[00:46:09] get this person to say. And then here's
[00:46:11] the voice you want to clone. Let's hear
[00:46:13] the clone voice first.
[00:46:14] >> It's going to be the only place where
[00:46:16] you can get that kind of direct access
[00:46:18] to me. Also, there's
[00:46:19] >> All right, so here's the final
[00:46:21] generation.
[00:46:21] >> Snugs, listen up everyone. This is
[00:46:23] really important, so pay attention.
[00:46:25] >> The voice does sound like the original
[00:46:27] voice. Plus, he is knocking on the
[00:46:29] table. Here's another example. Here's
[00:46:31] the input image. We can add some
[00:46:33] construction sounds in the background.
[00:46:35] Here's what we want to get this person
[00:46:37] to say. And then here is her voice that
[00:46:40] we need to clone. A lot of my baby
[00:46:41] hotties are still in high school, so I
[00:46:44] wanted to answer a few questions from
[00:46:45] there.
[00:46:46] >> And here's our result.
[00:46:47] >> It is so loud out here with all this
[00:46:49] noise. Um,
[00:46:51] >> now if you compare this with some other
[00:46:53] leading video generators, including
[00:46:55] Cling 2.6 Pro, I'm curious why they
[00:46:57] didn't use Cling 3, which is already
[00:46:59] out. You can see that in terms of voice
[00:47:01] similarity, environment sounds, and also
[00:47:04] speech manners, ID Laura wins most of
[00:47:06] the time. Now, instead of Clling 2.6 6
[00:47:08] Pro if you use 11 Labs plus an
[00:47:10] open-source video generator one 2.2
[00:47:13] again ID Laura wins most of the time.
[00:47:16] The awesome thing is if you scroll up to
[00:47:17] the top of the page they've already
[00:47:19] released the code to this. So here's the
[00:47:21] GitHub repo. Notice that this is built
[00:47:23] on top of the LTX model. So right now it
[00:47:26] supports the latest LTX 2.3. If you
[00:47:29] scroll down a bit here it says that you
[00:47:31] do need a CUDA GPU with at least 24 GB
[00:47:35] of VRAM. 48 is recommended, but if you
[00:47:38] do have this, then here are the
[00:47:39] instructions on how to download and use
[00:47:41] this locally on your computer. The link
[00:47:44] is up here. So, if you're interested in
[00:47:46] reading further, I'll link to this page
[00:47:48] in the description below. And that sums
[00:47:50] up all the highlights in AI this week.
[00:47:53] Let me know in the comments what you
[00:47:54] think of all of this. Which piece of
[00:47:56] news was your favorite? And which tool
[00:47:58] are you most looking forward to trying
[00:48:00] out? As always, I will be on the lookout
[00:48:03] for the top AI news and tools to share
[00:48:06] with you. So, if you enjoyed this video,
[00:48:08] remember to like, share, subscribe, and
[00:48:10] stay tuned for more content. Also,
[00:48:13] there's just so much happening in the
[00:48:14] world of AI every week. I can't possibly
[00:48:17] cover everything on my YouTube channel.
[00:48:19] So, to really stay uptodate with all
[00:48:22] that's going on in AI, be sure to
[00:48:24] subscribe to my free weekly newsletter.
[00:48:26] The link to that will be in the
[00:48:28] description below. Thanks for watching
[00:48:30] and I'll see you in the next one.
