# Clean Transcript

- Title: AI classrooms, self-evolving AI, Nvidia GTC, AI for polymarket, Google app builder: AI NEWS
- Creator: AI Search

---

AI never sleeps and this week has been absolutely insane. The Terminator has arrived.

Nvidia held their largest annual conference with a ton of exciting announcements. Miniaax and Xiaomi both released some incredible state-of-the-art models. This AI can create an interactive virtual classroom for you to effectively learn anything.

We have another AI that can generate videos almost in real time on just a single GPU. Google drops a full stack vibe coding platform. Google also released an incredible upscaler.

Humanoid robots can now play tennis. We have a new state-of-the-art deep research agent that's better than the closed models. And it's actually really good at predicting stuff. Like this could be very useful for prediction markets. This AI system lets your agent like OpenClaw get better and better by learning things automatically just by regularly chatting with it. We have some new AI tools for 3D modeling, including one that can turn a skeleton into a full

model and another one that can generate models with meaningful parts. We have some ridiculous robot demos and a lot more. So, let's jump right in. Thanks to HubSpot for sponsoring this video. First up, Google releases a really powerful video upscaler called Spark VSSR. This is a really good video upscaler. So, this takes a lowquality video and it would output a clean highresolution video. So, here are some results. This works with wildlife as you can see here.

It also works very well with scenery, either outdoor or indoor scenery. Here are some other examples. Notice how it's able to even generate and sharpen the details of these buildings by quite a lot. And you can even apply this to like old movies to upscale them or restore the quality. This also works with like 3D animations or other types of artistic styles. Now, if you compare this with other video upscalers such as Star or CDVR, Flash VSSR, which I covered on my

channel before, notice that this new one from Google, which is on the bottom right, is by far the best quality. It's not even close. The awesome thing is if you scroll up to the top of the page, they have released the code to this already. So if you click on this code button and you scroll down a bit here, you can see that they've released not only the inference code and the models, but also the training code. So here's the entire data set that they used to

train this. And then here's the training code. And then finally, here are the instructions on how to use it. Note that the total size of this is 42.2 GB, so you'll need a higherend GPU to run this.

But this is currently the best open-source video upscaler I've seen so far. If you're interested in reading further, I'll link to this page in the description below. Also, this week, Miniax releases their best and latest model, Miniax M2.7. You know, the crazy thing here is it says that M2.7 is the first model deeply participating in its own evolution. So, specifically during training and refinement, the model actually helped improve itself by running experiments, updating its own

tools and skills, and iterating in many cycles. And the Miniax team calls this a form of self-evolution, which is actually pretty crazy. Like, if they've reached recursive self-improving AI, then you can just take the human out of the loop. You can just keep this agentic iteration framework running and running to produce better and better models and the progress of this would be exponential. Anyways, here are some benchmark scores for your reference.

Note that Miniax M2.7 is designed to do particularly well in terms of agentic coding and tool use. So here we have various coding benchmarks like Swebench Pro, Multi Sweedbench, Vibe Pro and as you can see for all these benchmarks M2.7 performs better than the previous M2.5 and it's also quite close to the top closed models out there including Gemini 3.1 Pro and also Opus 4.6 GBT 5.4 and then this benchmark GDP val is also really important. So, this tests an AI's

ability to do real world work tasks such as creating spreadsheets, legal briefs, presentations, design, etc. And as you can see, M2.7 showed a huge jump compared to M2.5. Still not at the level of the top closed models out there, but pretty close. Now, those were just some of their official benchmarks. Let's also look at some independent evaluation. So, if you look at this independent leaderboard by artificial analysis, then Miniax M2.7 is tied with GLM5, which is

currently the best open-source model out there, both scoring 50 points in this intelligence index. Still behind the top closed models out there, but it's getting pretty close. Now, if you look at the price of this, then it's insanely cheap. So, Miniam M2.7 only costs around 50 cents per million tokens, whereas even GLM 5 costs more. And also if you look at all the closed models out there then they cost like way more. For example, Gemini 3.1 costs n times more

and then claude opus costs 20 times more. So in terms of performance versus cost efficiency then Miniax M2.7 is actually the best option. Here's an example of a website that it has vibe coded. It's pretty good at front end and design. Everything is super smooth and responsive. Here's an example of its financial analysis and spreadsheet capabilities. So here's the spreadsheet that it has created. You can see everything is super detailed and comprehensive. Currently M2.7 is already

fully available on Miniax agent which is like their web interface where you can use Miniax to autonomously complete tasks for you. It's kind of like GenSpark and Skywork. And in addition, it's also available via their API. So you can link this with Claude Code or OpenClaw or other services. Anyways, if you're interested in reading further, I'll link to this main page in the description below. Also, this week, Xiaomi ain't just making phones anymore.

They've actually released an incredibly powerful series of AI models. So, one of them is called Mimo V2 Pro, and this is their flagship foundation model built for agentic tasks. Here are some specs on its architecture. So, this is quite a huge model with over a trillion parameters. This is a mixture of experts. So think of it as like a team of AIs working together at once. But when you use it, only 42 billion of these are active. So it's quite efficient. Now this isn't just designed

for everyday stuff. This is deeply optimized for agentic scenarios. So if you look at these two benchmarks, Pinchbench and Claw Eval, which test its ability to do agentic workflows in like open claw scenarios, you can see that MIMO v2 Pro is really close to the performance of Opus 4.6, six, which is really impressive. So, here's an example of this 3D tower defense game that it has vibe coded autonomously. And as you can see, this looks very nice. And then

here's an example of a website that it has vibecoded up. So, this is meant to mimic like 1990s print magazine aesthetics. And as you can see, the design is pretty good. And then here are some additional benchmarks for your reference. Here again, they're comparing this to the top closed models out there, including Opus 4.6, Gemini 3 Pro. It's interesting why they didn't use 3.1 Pro and then GPT 5.2. Again, interesting why they didn't use 5.4. So, it seems like

they are cherry-picking here. Now, these are just their self-reported benchmarks.

If you look at an independent evaluator called artificial analysis, then as you can see, Mimo V2 Pro scores one point below GLM5 and also below Miniax M2.7.

Now, currently, this is available via API. So, you can connect this to Claude Code or OpenClaw. Or if you want to try this out online, you can go to Xiaomi's Mimo Studio. And at the top here, you can choose this new V2 Pro. If you're interested in reading further, I'll link to this page in the description below.

Now, in addition to Mimo V2 Pro, they also released Mimo V2 Omni this week.

And like the name implies, this is a multimodal model that can understand and generate text, images, video, and audio all using the same model. And here, if you compare various benchmarks like audio, image, and video understanding, then as you can see, V2 Omni actually is on par with the top closed models out there. And because of its vision capabilities, you can get this to autonomously operate a browser for you.

So it can like analyze your screen and then decide on next steps or where to click next. Here's another example where we can get V2 Omni to autonomously upload a video on Tik Tok. So not only does it just upload the video, but it also detects like where to input the description, tags, etc. And then how to submit the entire video. And indeed, it's able to successfully publish the video as you can see here. So this is already out. You can access this via API

or you can also try it using Xiaomi's AI Studio platform. At the top here, you can select V2 Omni. Anyways, if you're interested in reading further, I'll link to this main page in the description below. Next up, this AI is super useful.

So, it's called OpenMIC, which stands for Open Multi- Aent Interactive Classroom. And this is an open- source platform that creates interactive virtual AI classrooms for any learning topic. Specifically here it says powered by multi-agent orchestration. It generates slides, quizzes, interactive simulations, and project-based learning activities all delivered by AI teachers and you also get some AI classmates who you can interact with. You can draw on a

whiteboard and engage in real-time discussions. And this is a built-in openclaw integration where you can generate classrooms directly in your messaging apps like Telegram. So here's an example of how this works. Simply enter a prompt specifying what you want to learn. For example, here this person wants to learn about vibe coding. So you just need to enter that in and then select the appropriate model and then click on enter classroom. And then afterwards it's going to proceed to

draft the course content, draft all the pages and interactive exercises plus the teaching actions. And then here's what you get. You can see it is able to generate a ton of slides and also generate some interactive exercises for you to actively learn. And there's also this cute little chat widget here where you can chat with your AI classmates and ask questions. And then here's an interactive whiteboard. And it also contains some quizzes for you to

actually test your understanding. It also designs projects for you to complete just like in regular education.

So if you want to learn a certain topic or get your kids to effectively learn a certain topic, you don't even need to hire a tutor anymore. This tool is completely for free. It's open source.

You can run it locally on your computer and you just need to enter a topic and it can generate all the learning materials for you. Anyways, here it contains all the instructions on how to set this up locally on your computer.

All the instructions are on this page.

So, if you're interested in reading further, I'll link to this page in the description below. Also, this week, this AI is incredibly useful. So it's called Metaclaw and this is a framework which you add on top of OpenClaw to get it to learn and get better and better just by regularly chatting with it over time.

This is basically a framework that takes your normal conversations and then it automatically adds skills which are saved in its library of skills. So it does this all automatically just as you chat with it. And of course, the next time you use it, it's going to refer to this new library of skills to, you know, learn and get better and not commit the same mistakes as before. So here it says, just talk to your agent as you normally would. Metaclaw turns every

live conversation into a learning signal, enabling the agent to continuously improve. So specifically under the hood, it places your model behind a proxy that intercepts your conversations. And then afterwards, it injects relevant skills at each turn.

and it saves all of this in a library of accumulated skills. So these skills are summarized and remembered after every session. And if you enable reinforcement learning, then this also quietly fine-tunes the agent in the background during your idle time when you're not using it. So on this page, it contains all the instructions on how to install and configure it. This is just a framework which you add on top of open claw or other claw variants. This should

in theory make your agent get smarter and more performant and less errorprone over time as you interact with it. If you're interested in reading further, I'll link to this page in the description below. Also, this week we have a really cool AI called Dreamverse.

This is an AI video interface built on top of something called fast video, which is a super fast video generation system that uses LTX3 to generate a 5-second 1080p video in only 4.5 seconds on just a single GPU. Now, this does use a B200 GPU, which is not your everyday GPU. This is like an enterprisegrade high-end GPU, but nevertheless, still very impressive that it's able to generate a video so quick. Here's a demo with this new Dream Vverse platform. And

as you can see, in just a few seconds after you enter your prompt, you can already get a full video. And you can edit this further. For example, you can make the owner a woman and the cat a dog. And in just 3 seconds, this is not sped up. It's able to edit the video just like that. And then you can edit this further. For example, you can make this in the style of anime. And again, it's able to turn this into anime in only a few seconds. So, this is

incredibly fast. If you look at image to video and audio, you can see that LTX 2.3 using fast video has by far the lowest latency, like more than 10 times lower than the standard LTX 2.3. And if you look at text to video and audio, again, fast video has the lowest latency. The awesome thing is you can try this online. So, if you click on this demo link, it takes you to this page. And here's where you can enter a prompt. Let's try this one. Pixar style,

a boy and a dog in a park. So, I'm going to click this. I'm not even going to pause the video so you can see how quick this is.

>> Come on, Biscuit. This way.

>> You can see in just a few seconds it was able to generate this video. Now, I can edit this further. I can write like turn the dog into a cat. Make the boy's shirt blue. And then, again, I'm not going to pause the recording so you can see how fast this is. In just a few seconds, you can see that now it has turned the dog into a cat and it has turned the boy's shirt blue. Now, because this is almost real time, there's a ton of significant errors with this generation. There's a

lot of distortions along the edges. It's not perfect, but it is very impressive how you can just edit videos now almost in real time. Anyways, if you're interested in trying this out, I'll link to this main page in the description below. You've probably heard of how AI tools are transforming marketing. But if you're not sure how to actually use them to build real campaigns without hiring developers, this is the ebook for you.

Check out Master Claude Code for Marketing. Four workflows plus 12 prompts to ship campaigns fast by HubSpot. This bundle includes four workflows that are like a cheat code for building and deploying entire marketing campaigns from your terminal. You'll learn how to conduct competitor research, craft differentiated positioning, build interactive lead magnets, and deploy landing pages, all without writing a single line of code yourself. You get 12 readytouse prompts

to help you unlock Claude Code's full potential for marketing tasks. From researching competitors to writing email sequences that actually convert, use them to eliminate the guesswork and get highquality outputs faster. My favorite one is this Oneshot landing page builder workflow. It shows you how to go from positioning to a fully deployed landing page in a single session, complete with distinctive design, mobile responsiveness, and clear conversion

paths. You can access all of this for free using the link in the description below. This resource was made by HubSpot, the sponsor of this video.

Also, this week, this AI is really good for generating text and also emojis and glyphs in an image. So, this is called Glyph Printer. And here are some examples. So on the left is the prompt and the first column is this new glyph printer. The rest of the columns are other competitors. For example, Quen image is on the far right. And if you look at the first one, we need to generate a futuristic video game with this Japanese title. And then below it,

this line. And as you can see, this new glyph printer was the only one that was able to get all of the characters correct. Now, instead of Japanese, this can also do Chinese. So here's a Chinese example. the book title has to be this and then the subtitle has to be this.

And as you can see, it's able to render all the Chinese characters correctly.

Whereas for the rest of these competitors, there are some errors with the characters. A lot of them are like missing some strokes. And in addition, this can also do tie. So here's a Thai example. And again, it's able to nail the characters that were specified in the prompt. And then here's a Korean example with this title and this subtitle plus coming soon. It's able to get all the characters correct. And then here's a French example. Now, in addition to just generating different

languages, the really cool thing is that it can also take in emojis and glyphs.

So, for example, for our prompt, we can generate a stone cave carved with these glyphs on the wall. And indeed, it's able to generate this very well. And then here's another example where we can generate this stone with these carvings.

And as you can see, it's also able to generate this very well. This actually looks like the input images. Or in addition, you can also enter this glyph or font and display that on this paper.

And indeed, it's able to actually follow the font that you input very well. Or here's another example where we can input these glyphs into your prompt. And here is the result. And then here's another example of mixing two different glyphs. So we have these characters on the cake. As you can see here, they look pretty accurate. And then we also have this happy birthday font on the cake.

And the font also looks pretty accurate.

The awesome thing is at the top of the page, they've already released the code to this. So if you click on this button, it takes you to their GitHub repo. And if you scroll down a bit here, it contains all the instructions on how to download and run this locally on your computer. And in addition, they also provide the training code and the data set to this. So this is completely open source. The link is up here. So if you're interested in reading further,

I'll link to this page in the description below. Next up, this AI is quite fascinating. It's called Soulworld Model, and this is an AI that can generate realistic video tours of actual cities. So, you can navigate around this realistic city like a video game. They first started with Soul, Korea. And here are some examples of AI videos that were generated with this model. Notice that all the buildings and the streets, everything resembles what it looks like

in real life. Here it says this world model can generate videos over multicometer trajectories without accumulating errors. So essentially this is just a video generator and the problem we've had with existing video generators is that if you keep generating a longer and longer video then the quality degrades and it starts looking really bad. But with this AI even if you keep navigating in this virtual world notice that this video is played at 20x speed. The video remains

very coherent. And here it says it supports free form navigation. So, you don't have to just navigate along a road. You can walk around everywhere.

You can walk into a park. You can explore the city however you want, but you can't enter any buildings. Now, the cool thing is you can also add in a text prompt to add some effects to this. For example, you can summon a massive wave onto the streets or you can turn it into nighttime or sunset or you can generate a flood or even generate a UFO or generate other things because essentially this is just a video generator. So how this works is this uses rag or retrieval augmented

generation on millions of street view images and then it uses that as like frames or anchor points for the video generation. So this includes images on you know what the scene would look like right now as well as look ahead scenes so it can plan in advance what the video would look like a few frames into the future. And if there's sparse data, like if there's a certain point that doesn't contain a lot of image data, then it also uses cross- temporal pairing and

street view interpolation to basically use AI to fill in the blanks. Now, like I said, currently they've only trained this on the streets of Soul, Korea, but you know, this is a really fascinating idea. We could extrapolate this to other places in the world to build like a digital twin of Earth where you can explore around. Now, at the top here, they have released a code and weights button. And if you click into it here, it says they are undergoing internal

review and they do plan to release the models as well as the training data. For now, if you're interested in reading further, I'll link to this page in the description below. Now, at the beginning of the video, I mentioned that we have Terminator this week. I wasn't joking.

So, this AI is called Terminator. And no, it's not this Terminator. This one is actually really useful. Now, here's what it solves. You see, the problem with large reasoning models is that they usually overthink and they end up spending a lot of tokens. And especially if you're paying for like API costs, then it's going to cost you a ton of money. A ton of these models just continue thinking and yapping all day and overexlaining things. Most of the

time it's not actually necessary. So what Terminator does is this is a lightweight add-on which stops AI models from overthinking. It cuts off its reasoning once the answer is ready. So here you can see that we are using quen 3 and on the left we are using this terminator add-on. It has already detected the final answer and it ends its response at 13.2 seconds. Whereas on the right if we don't add terminator then it keeps thinking and yapping on and on and it takes like 76 seconds for

this response to finish. So this takes up a lot more time and uses a lot more tokens. So here they say that Terminator can cut reasoning length by up to 55%.

And because it's terminating this early, it can like reduce the generation time by half. So how this works is this is just an add-on. You don't need to train the base model further. This is just a single layer transformer probe that sits on top of existing models and it just detects when the final answer has been generated. It predicts a zero if the answer has not been generated or it outputs one if it has and if it has then it basically terminates the response

early. Now, especially if you're using Open Claw or other agentic systems, which tend to keep yapping on and on, this Terminator add-on might be a good option to cut its responses early and reduce your costs. Now, unfortunately, they haven't released the code or the data set to this. It says it's coming soon, so hopefully they will stick to their word and actually open source this. For now, if you're interested in reading further, I'll link to this page

in the description below. Also this week, as you may know, Nvidia held their largest annual conference, GTC. Now, there are a ton of different keynotes and announcements. In fact, Jensen Huang's keynote was over 2 hours long, plus there were a ton of other announcements. But here are the main updates that you need to know about. One of them is this Vera Rubin platform.

This is Nvidia's idea of what a full AI supercomput should look like. Instead of building one single chip, they designed an entire computing system from the ground up. This system is optimized to run AI agents at a massive scale. It's made of seven new chips that work together like one team. The Reuben GPU does the heavy AI computing. This is the main powerhouse for running AI. And then we also have the Vera CPU which handles control and coordination. And then we

also have these Envy Link switches for moving data around at incredible speeds between machines. and then also connect X networking and a ton of ultra fast specialized chips all tightly integrated into liquid cooled racks that behave like a single computer. Nvidia calls this extreme code design meaning the whole data center is treated like one unit of compute instead of separate servers. A single rack can contain dozens of CPUs and GPUs connected with

terabyte per second links allowing huge AI models to share data instantly. The system can easily do training, inference, and agentic workflows and other tasks at very low costs per token.

In fact, Jensen says demand for these Blackwell and Vera Rubin systems could reach a trillion dollars, which is crazy. And Nvidia claims these machines deliver the lowest cost per token ever because the whole stack from GPU to CPU to networking and storage is built as one vertically integrated supercomput.

Now within the Vera Rubin platform is a really powerful component called the Gro 3 LPU which stands for language processing unit. This is designed specifically for one thing. Running AI models as fast as possible. You see training huge models is expensive but the real cost comes later when millions of users are constantly asking these models questions. Now, this new Gro 3 LPX compute tray, which contains eight Gro 3 LPUs, is optimized to handle all

these requests. It's ultra low latency, so AI agents can respond almost instantly instead of working alone.

Again, these LPX trays sit within the huge Vera Rubin supercomputer, which includes other CPUs and GPUs, and they're all interconnected through high-speed links. The idea is that the Reuben GPUs will handle the training whereas these LPUs will handle the non-stop stream of prompts from users around the world and they say that this will ship in Q3 of this year. Now in addition to the Vera Rubin platform, here's another noteworthy announcement.

So Nvidia also announces Nemo Claw, which is like Nvidia's enterprisegrade version of OpenClaw, built so companies can safely deploy autonomous AI agents inside real business environments. As you may know, OpenClaw allows you to create AI agents that can plan tasks and call tools and work on their own and run 24/7 on your device. But there are a ton of security concerns with this. Nemo Claw adds that extra security layer needed for production use. Instead of

just letting agents run freely, the system routes every action through a controlled runtime called OpenShell, which enforces policies, privacy rules, and network limits. Developers send commands to define how an agent should behave, what tools it can use, and what data it can access. And then the platform outputs full running agents that operate inside this secure sandbox.

The goal is to make a gentic AI usable in enterprises where you need strict control over data permissions and external connections. In simple terms, Nemoclaw is like OpenClaw but with additional guard rails and OpenShell makes sure the agent never steps outside these rules. Now, in addition to OpenClaw, Nvidia also announced a really cool ecosystem of various open-source AI models. This is an entire collection of frontier models, all open weights, so

anyone can customize and deploy them. At the center is Neotron for language, reasoning, and agentic systems. This is their leading open-source multimodal model. And in fact, I covered their latest one called Neotron 3 Super last week. Then comes Cosmos, which is like a virtual world that simulates physics.

Think of it as like a simulation that follows real world physics. And the importance of this is you can then train robots virtually in this environment before deploying them into the real world. They also have an open vision language model which they call Isaac Groot. And this is tuned specifically for humanoid robots giving them full body control, spatial awareness, and the ability to act on instructions in the real world. So think of it as like the

brain of a humanoid robot. And that's not all they have to offer. For self-driving cars, there's Alpameo, delivering human-like perception and decision-making on the road. Think of this as like an AI for autonomous driving. And then in biology and drug discovery, they also have Bio Nemo, which is an AI model that can predict proteins and simulate molecules. This would of course be extremely helpful in accelerating breakthroughs in healthcare, biology, and beyond. And for

climate, they also have Earth 2, which is also open source. This tackles weather and atmospheric prediction at an unprecedented scale. And we are not done yet. So here's another really cool update from Nvidia called DLSS 5.0. This is Nvidia's next step toward what's called neural rendering where traditional 3D graphics and AI start to merge into a single system. You see, in a normal game, the 3D graphics engine renders every frame using geometry,

textures, and lighting calculations, which is extremely slow and expensive.

But with DLSS 5, the game only provides the core 3D scene data and a partially rendered frame. Then an AI model can fill in the rest, adding realistic lighting, detail, and even subtle visual effects that were never explicitly computed. This adds a lot more quality and also saves compute. The key idea is combining two very different approaches.

classic 3D graphics which are structured and controllable and generative AI which is probabilistic and good at generating details and realism. By fusing them together, the system can produce images that look more photorealistic than what the game engine actually rendered while using far less compute. In other words, instead of drawing every pixel the hard way, the GPU starts predicting what the final image should look like. So, that's a ton of stuff, but those were the main

highlights and announcements from Nvidia's GTC. Of course, there's like hours and hours of keynotes and other presentations, so I only scratched the surface. In humanoid robot news, here's just a video of an average day in Beijing. Here you can see robots casually running along the street. Now, why are they doing so? It turns out they're preparing for a half marathon that's happening in a month. So, these robotics companies are like training their robots for the event. There's a

ton of different robots that are just casually jogging at night in Beijing.

Really exciting times. Also this week we have this stunning demonstration of TA operating not just one robot but a swarm of robotic hands. The company behind this is called Hexa Circle and as you can see here a single human operator is controlling dozens of robotic hands simultaneously with very high precision.

The operator is wearing this specialized motion capture glove with haptic feedback elements. So as he moves his hand, every robotic hand in the room mimics him in real time. The robotic hands perform complex individual finger movements showing that they aren't just simple grippers but possess humanlike degrees of freedom. And then similarly we have another hand demo. This time it's from a company called Orca Hand.

And here they feature a lineup of different hands that were 3D printed.

This includes Orca Hand, Orca Hand Light, and Orca Hand Touch, each with varying degrees of freedom and cost. The awesome thing is they plan to open source everything. Now, in this video, you can see the impressive capabilities of these hands. It has very precise manipulation capabilities. It also has tactile feedback. So, here's a demo showing its touch sensors, mapping pressure in real time as the human interacts with the fingers. And this can manipulate various everyday items,

including a tennis ball, a water bottle, banana, and more. This has adaptable grip styles. It's also really good at controlling force. Again, for a lot of these items, like the banana, you need to apply just the right amount of force to hold it without crushing the hell out of it. And here's a durability test. So, the person hits the robotic hand with a hammer, and the joints are designed to pop out of place rather than break, allowing them to be snapped back

immediately. And then here it shows the hand achieving over 100 newtons of grip strength, which is exceptionally high for a 3D printed tendon-driven system.

And here's a time-lapse showing the structural components being 3D printed.

In fact, they promised to open source the CAD files and the bill of materials for this so that anyone with a 3D printer can potentially just print out these hands, which is fantastic. In other humanoid robot news, this is pretty crazy. It turns out that humanoid robots have already learned how to play tennis. This is actually incredibly impressive. Not only does it have to hold the racket and hit the ball at exactly the right angle and power to get

it across the other side, but it also needs to run across the court towards the ball with its legs. It's not just standing still this whole time.

Everything in its body needs to respond in real time in order for it to, you know, reach and hit the ball. So, this demo is from a project called Latent, which stands for learning athletic human tennis skills from Okay, I'm lost already. How on earth can you turn this into latent? But anyways, this is an AI system that teaches humanoid robots how to play tennis or other fast sports.

Now, this is particularly challenging because training a robot to do athletic movements often requires precise recordings of human motion which are hard to collect. We often don't have enough of this data. But latent solves this by learning from imperfect data.

The key idea here is that these video fragments that only capture basic skills like swinging, stepping, or turning still contain enough information, and the system can combine and correct them using reinforcement learning in a simulation. And after training it for hundreds of thousands of rounds in this virtual simulation that follows real world physics, it's then deployed to a Unitere G1 robot in real life. And as you can see here, it can actually play

tennis. So that's what this project is about. If you're interested in reading further, I'll link to this page in the description below. Also, this week, we have two state-of-the-art heavyduty research agents that are actually incredibly powerful. So, these are called Miro Thinker 1.7 and H1. And you know, this is even better than some of the top closed models out there, including GPT and Claude. But before we go over the benchmarks, here are some

ridiculous achievements. So it turns out that this mirror thinker model is really good at predicting things. So you can potentially use this for prediction markets like poly market. For example, it was asked on February 10th to predict the price of gold on February 25th and this was its forecast and this was the actual result. So it was only off by $4 or 0.08%.

This is extremely close. Here you can see the full chat. So here's the prompt.

Pretty simple. And then it proceeds to give you a ton of research to give you this final answer. And you can see it actually cites from all these different references in order to formulate its prediction. Here's another example. So on January 6th, it was asked who was going to win this year's Super Bowl. And it identified Seattle Seahawks as the most likely champion. And indeed on February 8th, which was over a month later, the Seahawks indeed won the Super

Bowl LX. So, it correctly identified the champion 1 month in advance. Pretty crazy. Again, here is the chat history for you. So, the prompt is pretty simple. Who's going to win the Super Bowl? And then here is its response. And here's the answer. The Seattle Seahawks are the most likely team to win. And then here are all the references. Here's another crazy example. It also was able to correctly predict this year's Grammy dominant artist. So on January 8th, it

was asked which artist is most likely to dominate the Grammy Awards. It predicted Kendrick Lamar and indeed at the Grammys almost a month later he won five awards.

So it was also able to somehow correctly predict this. Then here is the original prompt for your reference. So pretty crazy how it's able to predict so many things one month in advance. Now, these are agents designed for heavyduty reasoning and research tasks where the goal isn't just to answer questions, but to investigate and verify conclusions like a real researcher. So, instead of just using the model's internal memory, the system is also built around a loop

of planning, tool use, and verification.

Now, the H1 is even more powerful than the 1.7. So, the H1 takes it a step further by adding verification directly into its reasoning process. It also checks intermediate steps and audits the final answer to make sure it's supported by evidence. So as you can see here from all these benchmark scores including browse comp which is like how good it is at web search and then we also have like research, math and science and also financial analysis. This new H1 model

even beats the top closed models out there including GPT 5.4, Gemini 3.1 Pro and Claude Opus 4.6. These are the top models out there. Now, interestingly for browse comp, they did use the most recent models, but then for deep research, somehow they reverted this back to GPT5 instead of 5.4, Gemini 3 instead of 3.1, and it's missing Claude Opus. So, not sure what's going on there. And then same with Frontier Science. Somehow they're using GPT 5.2 here instead of 5.4 and then Gemini 3

instead of 3.1. The models they're comparing to just aren't really consistent across these different benchmarks. But nevertheless, this is open- source and it's among the best of the best out there. So, the awesome thing is they've released this already.

If you click on this GitHub repo, it contains all the instructions on how to download and run this. Here are some more specs for your reference. So, Miro Thinker 1.7 is 235 billion parameters with a 256K context window. If I click on the hugging face folder, this 1.7 model is 470 GB. So, you'll need to link multiple high-end GPUs to run this locally. In addition, they also released a 1.7 mini version. This is smaller but less performant. This is considerably

smaller at only 61 GB in size. All the links plus more info are on this page.

So, if you're interested in reading further, I'll link to this page in the description below. Next up, this AI is pretty cool. So, it's called SegV Genen, and this can take a 3D model and automatically color or mark its different parts so you can separate them easily, just like cutting a toy into separate pieces. So, how this works is it would take a 3D object and you would click on various parts and it would automatically segment that part. So, here's an example where we can choose to

select or deselect various parts just by clicking it. And what it does is it outputs the same 3D model but with the parts clearly segmented as a GB file.

Now instead of just tediously clicking on each part one at a time, what you can also do is just upload a segmentation map as you can see on the bottom of these videos for it to use as a reference. And then afterwards it can just proceed to segment the entire object based on this segmentation map.

And as you can see it is very accurate.

Here are some other examples for your reference. And this SEGV genen has achieved state-of-the-art results. Here they say that it's 40% better on interactive part segmentation than the prior state-of-the-art model and 15% better on full segmentation while only using 32% of the training data. So, not only is this more performant, but it's also a lot more efficient during training. It requires way less data. The awesome thing is they've released this

already. So, if you click on this code button and you scroll down a bit, here it contains all the instructions on how to install this. Note that this is based on Trellis 2. And here it says you do need an Nvidia GPU with at least 24 GB of VRAM. If you're interested in reading further, I'll link to this page in the description below. Also, this week we have another AI tool for 3D modeling.

So, this is called SK Adapter, and this is pretty unique. So this lets you make or edit 3D objects that follow a skeleton structure. This is also called skeleton conditioned generation. So for example, you can upload this skeleton structure first and then plug it through this AI and it would generate a full 3D model that conforms with the skeleton.

Here's another example. Here's the input skeleton and then here is the output 3D model. And then here's another example.

Here's the skeleton and here's the generation. Here are some additional and very diverse examples. This even works with like birds or crustations or mecha robots, spaceships, and this robotic dog and a ton of other stuff. If you scroll up to the top of the page, they have released this code button here. It says the code is coming soon. In fact, not only are they going to release the model, but they're also going to release the training data set and training code.

So, it looks like they are going to fully open source this, which is fantastic. For now, if you're interested in reading further, I'll link to this page in the description below. Also, this week, Google has announced some really cool updates to their platform called Stitch. If you haven't heard of this, it's basically an AI powered Figma, so you can just prompt it on what you want to design, and it can generate complete UI designs for multiple pages

for your app or site. Now, I've already gone over Stitch several times on my channel, but this week, they've added even more cooler features. You can now add multiple reference images to steer the direction of your design. Here you can easily upload an image and replace the image on a certain page. Here's an even cooler thing. You can specify the color and the fonts of your entire site or app. And then with just one click of a button, you can transform all your

existing pages to match this new color and design scheme. Plus, you can also just prompt it stuff by using your voice. You don't even need to type in a prompt anymore. That's how lazy you can get. Another cool thing is this can also output a markdown file which contains design guidelines for agents like OpenClaw. You can first get Stitch to design some wireframes and then send this markdown file over to an actual coding agent to code it up following

these guidelines. Anyways, Stitch has been one of my favorite free tools from Google. It's just so easy to create UI designs without any experience. Anyways, if you're interested in trying this out, I'll link to this main page in the description below. Now, in addition to upgrading Stitch, Google has also upgraded their AI studio into a full stack coding environment. If you're not familiar with AI Studio, this is Google's platform where you can try out

the latest models, including Nano Banana or VO for video generation, text to speech. You can even talk to Gemini using your voice in real time. There's a ton of other models that you can play around with, but over here in this build section, they've basically turned this into a full stack environment where an agent will build an entire application for you, including the front end, back end, the database, and authentication all in one place. So, for example, you

can link this to other tools via API.

You can connect it to live data sources.

As you can see here, their app can now use data directly from Google Maps. Or you can also connect it to databases or payment processors and the agent will securely store your API credentials for you. For example, here is a fully functional multiplayer game where you need to guess the location of the other player via their photo which was pulled from Google Maps. So you can see you can interact with this Google map widget over here and you need to find where

this player is. Now, because this is full stack, the system can now generate the front end, backend, database, and authentication all in one place. For example, you can configure database connections and set up user authentication with fire store and firebase. Now, if you vibe code an app here, you can't really choose another provider, but the advantage of this is the agent would automatically set up everything for you. So, you don't need to go inside Firebase yourself and

manually set things up. Anyways, if you're interested in just getting an agent to autonomously code a full stack app with the front-end backend database authentication all built for you, then this might be one of the easiest platforms to do so. It's kind of like a replet competitor. Anyways, if you're interested in trying this out, I'll link to this main page in the description below. Also, this week, AI deep fakes just leveled up. So, this AI is called

ID Laura. And first of all, here's some background on existing deep fake tools.

You see, if you want to get a deep fake of a person talking, the problem is that current models have a two-step process.

You need to clone that person's voice and then generate that voice speaking out the new transcript. And usually this involves some texttospech model, but then you also need a video model to actually generate a video of that person talking. And then you need to like basically make sure the audio is in sync with the video. But because of this separation, it's kind of a disconnect.

It's not optimized. It's not one unified model. So, ID Laura solves this by using one single unified model to generate deep fakes of people talking. So, you would input an image of that person plus an audio clip plus the text prompt of what you want them to say and plug it through just one unified model to generate the deep fake video of them talking. So, here are some examples. We can upload a photo of this person. And then for the prompt, we can add

something like a loud crack of wood splitting followed by heavy crash of branches and trunk hitting the ground.

So, we want to like get this tree to collapse. And then for the speech, we want this woman to say, "Did you see that? It just fell over right there. But also, we need to input this woman's original voice first so it can clone her voice." So, here's what the reference audio sounds like.

>> I basically embarked on a journey of quitting fast fashion once I learned that, but not just fast fashion. All right. So, given all these inputs, here is what it can generate.

>> Did you see that? It just fell over right there.

>> So, indeed, it was able to clone her voice and make her speak this out. Plus, also get the tree to collapse in the background. Or here's another example.

Let's say you input this initial frame, plus for environment sounds, you can add some sharp knocking sounds on a wooden table. And then here is what you want to get this person to say. And then here's the voice you want to clone. Let's hear the clone voice first.

>> It's going to be the only place where you can get that kind of direct access to me. Also, there's >> All right, so here's the final generation.

>> Snugs, listen up everyone. This is really important, so pay attention.

>> The voice does sound like the original voice. Plus, he is knocking on the table. Here's another example. Here's the input image. We can add some construction sounds in the background.

Here's what we want to get this person to say. And then here is her voice that we need to clone. A lot of my baby hotties are still in high school, so I wanted to answer a few questions from there.

>> And here's our result.

>> It is so loud out here with all this noise. Um, >> now if you compare this with some other leading video generators, including Cling 2.6 Pro, I'm curious why they didn't use Cling 3, which is already out. You can see that in terms of voice similarity, environment sounds, and also speech manners, ID Laura wins most of the time. Now, instead of Clling 2.6 6 Pro if you use 11 Labs plus an open-source video generator one 2.2 again ID Laura wins most of the time.

The awesome thing is if you scroll up to the top of the page they've already released the code to this. So here's the GitHub repo. Notice that this is built on top of the LTX model. So right now it supports the latest LTX 2.3. If you scroll down a bit here it says that you do need a CUDA GPU with at least 24 GB of VRAM. 48 is recommended, but if you do have this, then here are the instructions on how to download and use this locally on your computer. The link

is up here. So, if you're interested in reading further, I'll link to this page in the description below. And that sums up all the highlights in AI this week.

Let me know in the comments what you think of all of this. Which piece of news was your favorite? And which tool are you most looking forward to trying out? As always, I will be on the lookout for the top AI news and tools to share with you. So, if you enjoyed this video, remember to like, share, subscribe, and stay tuned for more content. Also, there's just so much happening in the world of AI every week. I can't possibly cover everything on my YouTube channel.

So, to really stay uptodate with all that's going on in AI, be sure to subscribe to my free weekly newsletter.

The link to that will be in the description below. Thanks for watching and I'll see you in the next one.
