# Description

It is an app to learn languages using _Comprehensible Input_ method. It will generate short stories on target language using vocabulary that the user already knows, introducing 2-3% new words.

# Main Features

- [ ] Generate stories with 98% of already known vocabulary
- [ ] Generate audio and sentence-by-sentence translation
- [ ] Track user’s vocabulary
- [ ] Phone app to track time of listening
- [ ] Flexible stories difficulty, based on user’s vocabulary and level of knowledge
- [ ] Custom themes for stories
- [ ] Initial setup to get to know user’s current vocabulary

# Tech Stack

**Frontend:**

- Next.JS
- TailwindCSS
- Typescript
- React Native for Mobile App

**Backend:**

- Express.JS
- Supabase
- Supabase Auth

**Database:**

- Supabase DB

# Deployment Plan

| **Component** | **Hosting Platform** | **Notes** |
| ------------- | -------------------- | --------- |
| Backend       | Render               |           |
| Frontend      | Vercel               |           |
| DB            | Supabase             |           |
| Mobile App    |                      |           |

# API Design

| **Method** | **Endpoint**     | **Auth** | **Body**          | **Description** |
| ---------- | ---------------- | -------- | ----------------- | --------------- |
| POST       | /api/auth/login  | No       | email, password   |                 |
| POST       | /api/auth/signup | No       | email, password   |                 |
| POST       | /api/vocab/words | Yes      | word, translation | Save new word   |

| GET
| /api/vocab/words | Yes | - | Get a list of user’s saved words |
| DELETE | /api/vocab/words/:id | Yes | - | Delete a word |
| POST | /api/stories | Yes | words[], topic, level | Creates new story |
| GET | /api/stories | Yes | - | Get a list of saved stories |
| POST | /api/stories/:id/save | Yes | - | Save a story |
| DELETE | /api/stories/:id/delete | Yes | - | Delete a story |

# Database Design

**Users**

| Column      | Type |
| ----------- | ---- |
| id          | int  |
| email       | text |
| password    | text |
| target_lang | text |
| origin_lang | text |

**Vocabulary**

| Column      | Type                 |
| ----------- | -------------------- |
| id          | int                  |
| word        | text                 |
| translation | text                 |
| user_id     | REFERENCE (users.id) |

**Stories**

| Column      | Type                 |
| ----------- | -------------------- |
| id          | int                  |
| text        | text                 |
| sentences   | text[]               |
| topic       | text                 |
| level       | text                 |
| known_words | text[]               |
| new_words   | text[]               |
| user_id     | REFERENCE (users.id) |

**ListeningLogs**

| **Column**       | **Type**               |
| ---------------- | ---------------------- |
| id               | int                    |
| user_id          | REFERENCE (users.id)   |
| story_id         | REFERENCE (stories.id) |
| duration_seconds | int                    |
| listened_at      | timestamp              |
