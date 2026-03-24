# Clean Transcript

- Title: Do THIS with OpenClaw so you don't fall behind... (14 Use Cases)
- Creator: Matthew Berman

---

This is Jensen Hang, CEO of Nvidia.

>> Open Claw is the number one opensource project in the history of humanity.

Every single enterprise company, every single software company in the world need an agent strategy. You need to have an open claw strategy.

>> So even if you're a power user of OpenClaw, you're probably not getting the most out of it. I have spent over 200 hours and billions of tokens perfecting my OpenClaw setup. And in this video, I'm going to teach you every best practice that I have learned. So, the first thing I want to show you and potentially the biggest and easiest unlock is Telegram threads. And it's actually not specific to Telegram. If you're using WhatsApp, if you're using

Discord, you can get this working. But the key is you want threading. You do not want to have one single long chat window with your OpenClaw. And I always wondered why people were struggling with OpenClaw's memory. and OpenClaw would just forget things all the time and I literally never had that problem once and I was using the default OpenClaw memory system and I couldn't figure out why everybody else was having issues and I wasn't. Well, this is the reason. And

so here's the problem. When you have one long chat thread, you are interle topics all in one conversation. And this presents a few problems. One, if you want to switch topics and come back to a previous topic, it's very awkward. You have to say, "Hey, OpenClaw, hold that thought. Let's talk about this other thing and we're going to come back to it." The other problem is that the entire chat history gets loaded into memory, gets loaded into the context

window, and it contains a bunch of different topics, and that's not what you want. To get the most out of OpenClaus memory, to get the most out of open clause context window, what you want to do is have a single topic. And the way to do that is with threads. So, here's what my threads look like. I have split every topic that I generally talk about with OpenClaw into separate topic threads. And the way that I've set this up is through Telegram groups. You

basically create a group. You only put yourself and your OpenClaw bot in it.

And then you can create different topics. So, I have general, I have my CRM, I have my knowledge base, cron updates, and a bunch of others. And so now each topic gets its own context window, gets its own session, and it only loads that session when I'm chatting with it. So it not only makes it easier for OpenClaw to stay on topic, to remember things, but it also makes it easier for me. I don't have to tell OpenClaw to hold that thought and I'm going to come back to it. Instead, I can

just go to the specific topic and just start talking about that. And it is much easier to have multiple conversations going with your OpenCloud bot in parallel. It just makes it easier for me as the human and easier for it as the agent. So you get less context, more focused context put into the context window. It remembers things better and it's easier for you. Please do this. Oh, and hey, my team put together a full free guide for how to get going in

OpenClaw if you are an absolute beginner. I'll drop a link down below for the ebook. You can download it free right now. The next thing I want to show you in Telegram, but this really should apply to any chat app that you're using is voice memos. This is actually something that I've only recently started using and it has been an incredible unlock for me. So, check it out. I have Telegram loaded up. Imagine you're out and the only thing you have access to is your phone. And especially

if you're driving, the last thing you want to do is take it out and start typing a long message to your open claw.

But here's the thing, you don't actually have to do it. So in Telegram, in the bottom right, there's this little microphone icon, and if you just hold it down, it records a voice memo that will send to your open claw. So you can just talk asynchronously to your open claw.

Most other chat apps have this as well.

And so let me show you how that works.

So, I'm simply going to hold down the mic icon and ask it any question or give it any task. Tell me about the Eiffel Tower. So, as soon as I do that, you can see the waveform right there. And there it is. It's giving me information about the Eiffel Tower. And it is that simple and very fast. And it's built in natively. You don't need to install anything to get this to work. You simply start using it. And I use this all the time. I tell it to go do tasks for me. I

ask it questions. I tell it to code things for me. It is an incredible timesaver, especially when you only have access to a phone and you don't want to type out these long prompts. So, please use voice memos. Super useful. And the next thing I want to tell you about is actually also the sponsor of today's video, which is here. Now, which is an agent first platform for hosting any type of artifact or website that your agents might create. And it's super

useful. So, I'm very excited to tell you about this. So, let me show you how this works. And I'm having some trouble with Sonnet right now. I think Anthropic might be down. So, I actually switched over to GPT 5.4 and now I'm using that.

So, I said publish this to here.now as a website. And it's basically the Eiffel Tower information that I put earlier. A very simple use case, but you can basically publish anything. And while that's working, let me tell you about here. Now, because it's pretty awesome.

It is actually built from the ground up for agents. So, it is meant exclusively to be used by agents, not humans. So, you go to the homepage, you simply copy the setup instructions right here. You just click it, paste it into your agent, and it will immediately know how to use it. It is free to get started, and then if you use it a ton, you could pay a little bit, and it is completely free right now. So, anything that you need your agent to publish, to share with

other agents, to share with other people, you can do that. PDFs, HTML, images, pretty much anything that doesn't require a backend. So, there we go. It is that easy. And then you could just click here and there it is.

Information about the Eiffel Tower. This will expire after 24 hours. So, if you don't need it long term, this is a great way to quickly publish. You also don't even need an account. If you do want this permanently, you do have to claim an account, but it is so easy to do. And then you could just have this website up forever. And the front end didn't actually look good. That's because GPT 5.4 is not great at making frontends.

But the good thing about herenow is you can actually just edit it easily. So I simply said make it texton. And just less than 20 seconds later, done. Same URL now text only. I click into it and there it is. And it's just so easy to use. So please check them out. Here.now is really cool. I'm a big believer in products built specifically for agents.

So go check them out here. Now I'll drop a link down below. And next, what I want to talk about a little bit more of a complex topic is using the right model for the right job. You should not be using a single model for everything you're doing with OpenClaw. You should be using a wide spectrum of models. And I am very bullish on a multimodel future. And that includes both closed source frontier models and open-source local models, although we're not going

to get too deep into open source today.

So here are just some of the use cases that I'm using openclaw for and the model that I'm using for it. So here for main chat right now I'm using sonnet 4.6 although usually I use opus 4.6 and I just want to briefly talk about why I ran out of quota last week using anthropic models. So now I'm using sonnet which is cheaper and uses less quota. But again, generally I'm trying to use the best possible model that is the main model that you're interacting

with in OpenClaw day-to-day. And there's a reason for that. This is the model that does planning. This is the model that orchestrates other models and sub aents. So you really want it to be the best possible model because then you're going to get the best possible plan and best possible delegation to other sub aents. Now for fallback, I'm using GPT 5.4. For coding, I'm using Opus 4.6 for all of my different nightly councils.

And I'll get into that a little bit later. I'm using mostly Opus 4.6. One for Sonnet. Now, for my use cases that don't require Frontier Intelligence, I'm using Sonnet, although to be honest, Sonnet is fantastic. For Grock Search, I'm using Grock, obviously. For video processing, I'm using Gemini 3.1 Pro.

For deep research, I'm using Gemini Deep Research Pro. for my training pipeline and that's training open- source models and all of the fun that comes with that I'm using GPT 5.4 extra high and so on.

For my embeddings I'm using Nomic. For my local models I'm using Quen 35. So you can see I'm using a mixture of different models and this list is constantly changing. And so I recommend thinking about which models do you need Frontier Intelligence for and which you don't. And certain models are better at certain things and other models are better at other things. So make sure you're choosing the right model for the right task. Now how do you actually do

that? Openclaw actually stores a config of all the models that you use and the fallbacks of those models. And so you can simply tell OpenClaw use this model for this use case and it will mostly remember that. Obviously it is non-deterministic and so sometimes it makes mistakes and it uses the wrong model, but mostly it's pretty darn good.

And if you are ever confused about which model is being used in main chat, you can always type slashstatus and it will tell you. So you can see here's the openclaw model. Here is the model I'm using as my main chat model. The number of tokens allowed and how much cash hit we're getting. You get all the information right there. And now that we're using different threads, something that is a new feature in OpenClaw is you can actually assign specific models to

specific threads. So, for example, if you have a thread in which you're just doing Q&A, you can probably use a less powerful model. But if you have another thread that you're doing really hard coding on, you probably want a Frontier model. And there are a number of benefits to this one. If you don't need Frontier Intelligence, you can usually get much faster results by using a smaller, less performance model. It's also cheaper. It's also more efficient.

And so if you're a power user of OpenCloud, this is a great way to help optimize your token budget. Now, I said I wasn't going to go too deep into open-source models, but I want to touch on that for a second. A project that I'm currently exploring is having an autonomous system that extracts different use cases from my openclaw stack, figures out which ones I can actually fine-tune a small local model for, and then replace the frontier model with that small model. And so, one

example is email labeling. I've been doing that a ton. I've built up a pretty large amount of email label data using Opus 4.6. And now I can simply fine-tune a smaller model, which is what I did. I have a Quen 3.5 model, 9 billion parameters that performs as well at email labeling as Opus 4.6. And you know what? It's free. The only thing I pay for is electricity. And so you can start to get very sophisticated with how you delegate out to different models. The

next major topic I want to talk about is delegating to sub aents and how to use sub aents appropriately. I try to use sub aents as much as possible. A very frustrating thing I come across is if I give a task or a question to my main agent and it just sits there thinking and everything else I want to do at the same time becomes blocked by that. And so by delegating to a sub agent, you are unblocking your main agent. You can say delegate this task to a sub agent and

let's chat about something else in the meantime. That is the right way to use agents. And so as I said, I'm delegating often to sub aents. Here's how I'm doing it. All coding work gets delegated to a sub agent. specifically cursor agent CLI for coding for searches API calls multi-step tasks for data processing file operations beyond simple reads calendar email operations knowledgebased ingestion anything that would take over 10 seconds and really I've even got more

aggressive than that at times but right now I'm saying if it takes more than 10 seconds delegate it and of course it's non-deterministic so sometimes it doesn't delegate appropriately and you could just continue to get more aggressive with it by telling it, "Okay, just delegate everything." The things that it doesn't delegate, simple conversational replies, clarifying questions and acknowledgements, quick file reads, manual inbox launches, and training status checks. And so, I want

to actually show you what some of that delegation looks like. So, we're going to have our main agent at the top. And this tends to be a frontier model. Then, from there, it can delegate out to sub agents. And so, you see here we have our main agent. it can delegate out to sub aents. And I would recommend delegating early and often. And for these sub agents, you should use the model that makes the most sense. For simple tasks, use faster, cheaper models. So let's say

for this one, I want to use Sonnet. For this one, I'm going to use GPT 5.4. And for this one, I'm going to use an open-source model. Now, you can also delegate to Agentic harnesses as well.

So you can say okay I'm going to delegate out to cursor agent. You can also delegate out to claude code. So these are different types of delegations and sub agents can even delegate out to different agentic harnesses. And what happens when you delegate to one of these agentic harnesses is it basically just takes over runs your entire task end to end and then comes back with its summary of what happened. that gets reported back up to the sub agent which

then gets reported back up to your main agent. So very very useful to delegate as often as you can. You do not want your main agent blocked. Now here's something very important if you're using multiple models. Every model behaves differently depending on how you structure a prompt. For example, Opus 4.6 doesn't like it if you use all caps.

It also doesn't like it if you tell it what not to do. it far prefers telling it what to do versus GPT 5.4 before which says yes use caps yes tell it what not to do explicitly and so how do you have a single prompt that can be optimized for both types of models you really can't and thus you need multiple prompts and this starts to get pretty complex and at times can be difficult to manage but hopefully I'll give you a little bit of direction on how to do it

so let's say we're using anthropic models and we're using open AI models now by default you only get one prompt file that means Both models are going to be reading from that prompt file. And the prompt file can be anything. It could be the soul file, the memory.m MD file, the skills files, anything where you have natural language telling the model what to do. Now, the problem is both models are going to be reading from this. And if you're using a mixture of

multiple models, that really presents a challenge because a prompt file that is optimized for cloud won't work as well for GPT 5.4 and vice versa. And so what you want to do is have multiple prompt files. And again, it's a little complicated to keep track of, but I'll give you some best practices. And so Opus can read from its prompt file and GPT 5.4 can read from its prompt file.

And those prompt files are optimized for those specific models. So how do you actually know how to optimize the prompt file? Well, every major Frontier lab publishes a best practices for prompting for their specific model. So you simply ask OpenClaw to download it and store it. And so you download these best practices document and you have OpenClaw reference them. And you say create a second version of each prompt file that is optimized for that model. OpenClaw

will read from the best practices and optimize each of these prompt files. So all of a sudden you have this really nice separation. And you also want to document this best practice somewhere.

you have to tell OpenClaw that this is the strategy you want to use. So you can usually put that in something like a PRD document or the memory document. And so OpenClaw will read it and reference the right prompt for the right model. Now if you have a primary model that you use and a fallback that you also use, let's say Opus is your primary and GPT 5.4 for is your fallback. Then you can have all of your claude prompts in your root directory and you can have all of your

fallback prompts in a separate directory. So let's say this one's in root and this one is in slashgpt.

Now you need a way to keep them in sync if they get out of sync. And the way that I do that is with a scheduled job, a cron. Every night it compares the two documents and forces two things. one that it's staying within best practices for that specific model and it again references these docs right here and that both of them have the same information and so with that all of a sudden you're going to get so much more efficiency and effectiveness out of your

model simply by optimizing the prompt.

All right, one of the most important unlocks for you in OpenClaw is using crons. Crons are basically scheduled tasks. If you want to get useful work done, schedules are fantastic. And I use crons for so many different things. Look at my list of all the crrons that I have. So everything from sponsor inbox refresh, fathom polls, all of these daily crons that run during the middle of the night and I'm going to talk about why I do that in a second. I have my

weekly crrons here and then I have my disabled ones there. So why does it look like I schedule crowns throughout the night every 5 minutes? What is the usefulness in that? Well, I don't want a bunch of crons running throughout the day while I'm also using OpenClaw. It shouldn't cause an issue, but I like to offload the higher compute times to times where I know I'm not going to be using it. But there's also a second benefit if you have a rolling quota

window, which if you're using your codec subscription, if you're using an anthropic subscription, you will have.

So, here's an example. This is my anthropic subscription and you can see I have a 5-hour rolling window. So if I'm doing a bunch of cron jobs throughout the day that require a cloud model and then I also go to use a cloud model directly I might run out of quota and so the things that I know that I need to do daily but it doesn't really matter when I do them I offload them to the middle of the night and I spread them out throughout the night. So you can see

that here I have cron health. I have lane documentation drift. I have a prompt quality checker. I have a config consistency checker. I have my daily backup. All of this just runs throughout the night. Then of course I have my crons that run every few hours. Whether it's my HubSpot sync, my Asauna sync, my PII and secrets reviewer basically looking for anything that might be leaking. This is so useful. set up crons for anything that you need to do on a

scheduled basis. And next I want to talk about security. Probably the thing that prevents most people from using OpenClaw. They are just nervous about using it. They are nervous about the security implications because this project went mega viral basically overnight. And literally since then, Peter Seberger and the OpenClaw team have been releasing security updates, security fixes non-stop. So, it's a lot better than it was, but it's still vulnerable to things like prompt

injection. And I want to show some tips and tricks that I use to harden my system even further. So, I'm going to share this link to this article down below. So, I think about a few main security issues that I want to harden up. One, and the primary one is prompt injection. That means when my model is reading something from the web or from an email, basically from anything external, it might be poisoned. meaning they might have something in that text

that tries to hijack my model that is called prompt injection and I want to prevent it as best as possible and so I have a multi-layer system to do so.

First I have text sanitation. It basically looks for common prompt injection techniques such as forget previous instructions and I am now your owner using non-standard characters and so on. And so I have a deterministic layer, a traditional code that looks through anything that I'm about to ingest throughout my entire system from the open web from email and I scan it.

And next, I have a frontier scanner.

Just in case someone crafty gets past that deterministic layer, I now have a non-deterministic layer to review it. So I take the best possible model that can be GPT 5.4 or Opus 4.6. You always want to use the best possible model because those are going to be the most resilient to prompt injection. And you simply tell it you are about to be fed text that might contain a prompt injection. Look at it, review it, and quarantine it if it looks dangerous. And so that's simply

what I do. I have a risk score calculated by my frontier model and it looks at every piece of text coming in that gets past the deterministic layer and makes a determination if it should be quarantined or not. Now, with these two layers, it's actually incredibly powerful. And just being mindful that any external data might be dirty, might be poisoned is the first step in hardening your system to prompt injection. And by the way, at the bottom of this article, there's an entire

prompt to set up all of this easily within your OpenClaw or agent environment. Now, that's not enough.

Let's say it gets past tech sanitation.

Let's say it gets past the frontier scanner. Then the next thing I do is review everything going outbound and I look, is it about to share a secret? Is it about to share PII, personally identifiable information? And if so, it redacts it instantly. And it does this everywhere. If I share something in Slack for my own team, it will redact phone numbers, emails, anything like that, and it does that with my email responses. It does that with everything.

It redacts very aggressively, and sometimes I actually have to tell it, "No, no, it's okay. You can share that." I also put a lot of time and effort into scoping permissions at a very granular level. I only give my AI the exact permissions it needs and nothing more.

For example, it can read email from my inboxes, but it cannot send emails. It can read files from Box, but it can't delete files. And then I also have an approval system. If anything is about to have a destructive action, I always get notified first for approval. And this gets a little annoying at times, but it's better than getting hacked or all of your data being deleted. And the next thing I learned, and this is going to be a little hint at a video I have coming

with special guest Ply the prompter, is what he called wallet draining.

Basically, I have a Frontier model scanning all text coming in. And so, somebody who didn't think they could necessarily get through my prompt injection defenses could basically just use all of my token budget simply by continuously sending garbage. And so I implemented something called runtime governance which basically looks at the total LLM calls and puts rate limits on them and spending limits. And then I realized actually that's a pretty cool

feature. I should apply that everywhere because there is a chance that something in OpenClaw runs into a recursive loop and just continuously does LLM calls over and over again and I just get a huge bill at the end of the month. And so I have spending caps, volume limits, and loop detection. And so with all of these defenses in place, you are going to be in a much better place security-wise. All right, the next tip I want to give you, and this is a critical

one, is log everything. Logging means your system keeps a record of everything that happens within itself. And it's incredibly cheap to do this. You can simply log everything to a database. You can log it to log files. Do whatever you want. It doesn't take a lot of room on your hard drive. I've been logging everything for about 2 months now and I probably only have about 1 gigabyte of logs so far. So, it's very easy to log everything and very useful. And the

reason is if anything goes wrong, you don't have to try to debug it with AI yourself. You can simply say look at the logs, find out what happened, and give me a fix. And so one thing I do every morning is I say, "Look at the logs from last night. Look for any errors or warnings and just go ahead and propose fixes for them." So I did that right now. Look at the logs from last night.

Tell me the major issues. And so it did that. It's typing. Let's see what it says. All right. So here's the response.

And it looked through the logs and it found everything that went wrong overnight. And yes, even for me, things go wrong all the time. And I'm constantly fixing it. That is the price you pay for being at the frontier. So, Google O broke. Sponsor inbox refresh got hammered by that. Specifically, the daily brief failed because the calendar fetch failed. Basically, everything tied to my O stopping. There's a smaller code bug and the sponsor inbox refresh. What

did not look broken? The heartbeats, general gateway outage, GitHub autosync.

So, I could just say now, okay, go fix it. So, you don't need to be super knowledgeable about how it's all working, but if you just tell it to log everything, that's the way to fix it more easily. All right, the next thing I do is check for openclaw updates frequently. Peter Steinberger and the team are absolutely cracked and they are shipping updates all the time, basically once every day or two. And so I have a curron set up at about 9:00 p.m. every

night to check for the latest updates.

Now, it turns out they usually publish the updates even later than that in the day. So I'm usually about a day behind unless I see it on Twitter that they publish something and I go ahead and update it automatically myself. And so it checks for an update, pulls down the change log, gives me a summary of what was changed, how I might use it, and then updates itself, restarts automatically. It's really nice. That also keeps you in the most secure spot

because they are constantly hardening their system. All right. Next, I've talked about this a little bit, but I want to re-emphasize that using your subscription through OpenAI or through Anthropic is the way to go. Do not use the API if you can because the API is significantly more expensive than using your subscription. So, as you can see here, this is my subscription. This is my usage. And of course, there was that drama a few weeks ago about Anthropic

basically saying, "No, you cannot use your Claude OOTH in OpenClaw." But then they said you can use the agents SDK in OpenClaw, which is basically the same thing. And so if you don't already have it installed, you simply tell OpenClaw, use the agents SDK, then you authenticate into it, and then you are using your subscription and it's within Anthropics terms of service. So you're good to go. And Peter Steinberger joined OpenAI and explicitly said using the

codeex OOTH for OpenAI models is totally okay and that uses your ChachiPT subscription. And so you're paying a flat fee every month and you get a pretty large quota that you can use rather than paying for every single API call which can be multiple times more expensive than using your subscription.

So as much as you can use your subscription and you have to do so within the agents SDK through enthropic and the codeex ooth for openai and if you don't know how to install that literally just tell openclaw to do it for you. The next thing I want to tell you about is very similar to log everything. Document everything. If you have really good documentation, you will find OpenClaw is much more effective at getting things done for you. And by the way, logging everything and documenting

everything are not specific to OpenClaw.

It is specific to anything that you're vibe coding. It is going to make your life so much easier. So here are all of the documents that I have. Agents, soul, identity, user, tools, heartbeat. These are the ones that are built into OpenClaw. It also has memory, sub Asian policy, and restore. And the things that I've created specifically, I have my PRD, which is a product requirements document, basically explaining all of the different functionality I have in

OpenClaw. So, it doesn't have to go and search through the code to figure out what features I have. It looks at the PRD and just knows. And it also knows where those features are and how they work. I have my use cases workflows which talks about in even more detail the different workflows that I use. I have my workspace files which documents the organization of everything. I have my Opus prompting guide which we talked about earlier. My GPT5 prompting guide

which we also talked about. So this is what I downloaded from the Frontier Labs and it tells my system how to optimize its prompts. I have my security my security best practices, my prompt injection defense guide and a ton of others. I won't list them all, but some of these, like the learnings.md are super important. You don't want OpenClaw or any Vibe code system to make the same mistake over and over again. So, I usually, if I run into a bug, have it

document in learnings so it doesn't make the same mistake twice. So, document everything. And you can set up a cron to look for any documentation gaps. So once a day what I do is I have OpenClaw look through all of its documentation, compare that to everything it sees in the code, looks at all of my commits, which I'll talk about git in a minute, and it updates the documentation to make sure everything is covered. And speaking of git, let me just tell you what that

is if you're not familiar with coding.

It is a way to version your code. It basically saves a snapshot of your code in a certain state. So if you ever have any problems, you can roll back. You can go to previous versions. You can also see every single feature that you've added over time. So if you ever have a problem, you can say, "Oh, you know what? That happened recently." So, hey, OpenClaw, look at the last few commits and find out what might have broken this part of your code. It also helps if your

computer ever gets wiped or something happens, you have a backup in something called GitHub. It is a place to put those snapshots that stores it in the cloud. So if your local machine ever gets lost or stolen or wiped anything, you can simply say OpenCloud download the latest version from GitHub. Very very important to save early and often.

This is again logging, documenting, and backing up. These are critical for any vibe coding that you're doing. Now the last thing that you want to back up besides the code is basically everything else that you're doing. So that's databases or images that you're using, PDFs that you've created. You want these things backed up just in case something goes wrong, you can always reference it.

And Box is what I use to back up my databases and my different files that don't get backed up in Git. And Box has a really easy to use CLI and you can get it working with your agent. So, shout out to Box. That's what I use. And last, the fourth pillar of a great Vibe Code session is testing. You need to have your OpenClaw write tests for everything. But what is a test? It is a piece of code that tests if another piece of code is working. So let's say

you have a piece of code that does simple math. 2 + 2 equals 4. You can have the test say, "Okay, when I do 2 + 2, is it equaling four? If it is, the test passes. And if it's not, something's wrong with your code." And so you want thorough tests for everything. And all you have to do is tell OpenClaw to write those tests. So when I first started using OpenClaw for the first few weeks, I would get so many different notifications, especially because I had so many scheduled jobs

running throughout the day. I was getting pinged left and right, and it became such a headache and such a distraction, and I didn't need it. And so what I decided to do was actually batch notifications. So I have multiple levels of batching for anything that is low priority. I basically have it collect all those notifications and every 3 hours it sends me a summary. And so here's an example. This is the three-hour digest. And all of these are low priority, but every three hours I

get this summary of every notification that came in for the last three hours.

Then I have a higher priority batch that runs every hour. And so that's what you're seeing here. And so you can see my sponsor inbox failed. I can see different notifications about things that I have running in the background.

And I get that hourly. Now, for any critical issues, it skips the batching and notifies me immediately. things like open clause down and so I want those to come through immediately and it does and it just saves my sanity. I don't get nearly as many notifications anymore and when I do they're not separate messages they're all summarized together batched together and if I ever need to dive deeper into it I simply ask OpenClaw to tell me about it. The last thing I want

to mention is how I actually build openclaw. Now you can definitely build openclaw through telegram and a lot of people do that and sometimes I still do that but I find it much easier to use an external system to build out the use cases for openclaw and then I actually use openclaw through telegram. My preference is cursor. Shout out to cursor but you can use whatever you want. You can use codec. You can use claude code. If you're feeling wild you

can even use sublime text. So use whatever you want, but I prefer having a separate system for modifying and building out OpenClaw. That's because it's just much easier to read. These systems are built for iterating on code for vibe coding. Telegram is not. So that's what I prefer. So that's it for today. Hey, if you enjoyed this video, please consider giving a like and subscribe.
