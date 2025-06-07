# Comprehensible Input Language Learning App

Learn any language effectively using this app. It tracks words you already know, and creates adapted AI-generated stories bsaed on YOUR personal vocabulary, while introducing a small percent of new words. This method lets you acquire new vocabulary very quickly by presenting new words in a real-world context with grammar structures adapted to your level.
Generate a story in one click -> Read and listen to it -> Mark words as learned in your dictionary.

## 🚀 Features

- AI-generated short stories based on known vocabulary
- Sentence-by-sentence translation
- Audio playback for listening practice
- Unknown word tracking
- REST API with JWT-based auth

## 🧑‍💻 Tech Stack

- **Frontend:** React / Next.js, Tailwind CSS, TypeScript
- **Backend:**: Node.js / Express.js, TypeScript
- **Database:**: Prisma ORM + Database
- **Auth:** Secure HTTP-only JWT cookies
- **AI:** OpenAI API for generation
- **Audio:** OpenAI API
- **Logging:** Winston
- **Security:** Helmet, CORS, express-rate-limit
- **Validation:** Zod
- **Storage:** Supabase

## Why I created this project

I love learning new languages. I learn German now. But unfortunately I don't have enough time to actively study it. That's when I discovered a method called "Comprehensible Input". It's when you absorb language through interacting with content that you mostly understand, but not fully, and it lets up grow your vocabulary. I started with short stories on YouTube. I quickly started to increase my vocabulary, but even quickier I hit a barrier: **there were no more videos to watch**. It was hard to find a video where vocabulary and grammar levels are suited to personally MY level of knowledge. When I finally found such videos, I rewatched them multiple times, which became very boring.

I'm a heavy AI user in my everyday life, so I decided to generate my own stories. I used ChatGPT for text, ElevenLabs for audio, and I manually tracked my vocabulary. But it was annoying. I spent about **30 minutes** to create each story, including managing my dictionary. It wasn't "passive learning" that I wanted — I spent too much time on it.

Then I thought - why don't create an app that will handle all the work, will create me as many stories as I want, they will be fully personalized, introducing only a small percent of new words, and automatically track my vocabulary? And here it is, **Comprehensible Input Language Learning App** (I will come up with a shorter name later).

Now, I don't need to scour videos on YouTube anymore. The stories are fine-tuned exactly for the user — you can set the topic you want; it will use 90-95% of words you already know; the grammar difficulty will be adjusted specifically for you. Now I create stories in as fast as **60 seconds** — huge improvement of what was before the app. Now it's a really "passive" learning. I don't spend time for preparing at all. I just listen to the stories whenever I want, and this dramatically **improved my skills** in German.
