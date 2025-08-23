## Overview

REST API for the Comprehensible Input language-learning app.
Provides endpoints for authentication, story generation, vocabulary management, unknown-word tracking, assessment, and job status.

- Base path: `/api`
- Base URL varies by environment:
  - Dev (via NGINX in docker-compose-dev): `http://localhost:3050/api`
  - Direct backend (default port): `http://localhost:4000/api`

---

## Conventions

- Successful response format:

  ```json
  {
    "success": true,
    "data": <payload>,
    "pagination"?: { /* pagination object if present */ }
  }
  ```

- Error response format:

  ```json
  {
    "success": false,
    "error": {
      "message": "<Human-readable description>",
      "code": <HTTP status code>,
      "details"?: <array of validation issues>
    }
  }
  ```

### Security

- Uses HTTP-only JWT cookies (`accessToken`, `refreshToken`).
  - `accessToken` TTL: 15 minutes
  - `refreshToken` TTL: 7 days
  - Cookies are `httpOnly`, `sameSite: lax`; `secure` is enabled in production
- CORS: open by default in development; in production, configure allowed origins at the reverse proxy or app level.

### Rate Limiting

- Global: 1000 requests per 15 minutes per client.
- Story generation daily limit: 5 stories per user per calendar day (America/Los_Angeles); exceeding returns `429`.

---

## Status Codes

| Code | Meaning                        |
| ---- | ------------------------------ |
| 200  | OK                             |
| 201  | Created                        |
| 204  | No Content                     |
| 400  | Bad Request (validation error) |
| 401  | Unauthorized                   |
| 403  | Forbidden                      |
| 404  | Not Found                      |
| 429  | Too Many Requests              |
| 503  | Service Unavailable            |
| 502  | Database / Storage error       |
| 500  | Internal Server Error          |

---

## Common Error Responses

| HTTP Code | Condition                                             |
| --------- | ----------------------------------------------------- |
| 400       | Validation error (invalid parameters or request body) |
| 401       | Unauthorized (missing/invalid access token)           |
| 404       | Resource not found                                    |
| 429       | Too Many Requests (rate limit exceeded)               |
| 502       | Database/storage error                                |
| 500       | Internal server error                                 |

---

## Error Response Examples

### 400 Bad Request

```json
{
  "success": false,
  "error": {
    "message": "Invalid data",
    "code": 400,
    "details": [
      {
        "code": "too_small",
        "minimum": 8,
        "type": "string",
        "inclusive": true,
        "exact": false,
        "message": "String must contain at least 8 character(s)",
        "path": ["password"]
      }
    ]
  }
}
```

### 401 Unauthorized

```json
{
  "success": false,
  "error": {
    "message": "Unauthorized",
    "code": 401
  }
}
```

### 404 Not Found

```json
{
  "success": false,
  "error": {
    "message": "Story not found",
    "code": 404
  }
}
```

### 429 Too Many Requests

```json
{
  "success": false,
  "error": {
    "message": "Too many requests. Please try again later.",
    "code": 429
  }
}
```

### 503 Service Unavailable (readiness)

```json
{
  "status": "unhealthy",
  "dbOk": false,
  "redisOk": true
}
```

### 502 Database Error

```json
{
  "success": false,
  "error": {
    "message": "Unable to mark word as learning",
    "code": 502
  }
}
```

### 500 Internal server error

```json
{
  "success": false,
  "error": {
    "message": "Something went wrong on the server.",
    "code": 500
  }
}
```

---

## Object Schemas

### `UnknownWord` schema

| Field                        | Type   | Description                                |
| ---------------------------- | ------ | ------------------------------------------ |
| `id`                         | number | Unique identifier                          |
| `word`                       | string | The unknown word                           |
| `translation`                | string | Translation(s)                             |
| `article`                    | string | Grammatical article (nullable)             |
| `status`                     | string | `"learning"` or `"learned"`                |
| `timesSeen`                  | number | Number of times the user has seen the word |
| `exampleSentence`            | string | Sentence using the word                    |
| `exampleSentenceTranslation` | string | Translation of the example sentence        |

---

### `Story` schema

| Field             | Type          | Description                            |
| ----------------- | ------------- | -------------------------------------- |
| `id`              | number        | Unique story identifier                |
| `storyText`       | string        | The generated text in target language  |
| `translationText` | string        | English translation of the story       |
| `audioUrl`        | string        | Path (key) in storage (e.g., Supabase) |
| `unknownWords`    | UnknownWord[] | List of related unknown-word objects   |
| `userId`          | number        | ID of the user who generated the story |

---

### `VocabularyItem` schema

| Field         | Type           | Description                          |
| ------------- | -------------- | ------------------------------------ |
| `id`          | number         | Unique vocabulary entry identifier   |
| `word`        | string         | The vocabulary word                  |
| `translation` | string         | Meaning of the word                  |
| `article`     | string \| null | Grammatical article, or null if none |
| `userId`      | number         | ID of the owning user                |

---

### `Pagination` schema

| Field         | Type   | Description              |
| ------------- | ------ | ------------------------ |
| `currentPage` | number | Current page number      |
| `pageSize`    | number | Number of items per page |
| `totalItems`  | number | Total number of items    |
| `totalPages`  | number | Total pages available    |

---

### `Job` schemas

- `JobResponse`

  ```json
  { "jobId": "string" }
  ```

- `JobStatusResponse`

  ```json
  {
    "status": "completed | failed | waiting | active | delayed | paused",
    "value"?: <result when completed>,
    "failedReason"?: "string",
    "progress"?: {
      "phase": { "name": "string", "index": number, "description": "string" },
      "totalSteps": number
    }
  }
  ```

---

## Endpoints

### Auth

#### POST `/auth/register`

Create a new user and issue auth cookies.

- Authentication: None
- Request Body (application/json):

  | Field      | Type   | Required | Description           |
  | ---------- | ------ | -------- | --------------------- |
  | `email`    | string | yes      | must be unique        |
  | `password` | string | yes      | at least 8 characters |

- Request Example

  ```bash
  curl -X POST "{BASE_URL}/auth/register" \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"12345678"}'
  ```

- Responses

  - `200 OK`

    ```json
    {
      "success": true,
      "data": { "id": 2 }
    }
    ```

  - `400 Bad Request` (invalid credentials format)

---

#### POST `/auth/login`

Authenticate user and set auth cookies.

- Authentication: None
- Request Body: same as `/auth/register`

- Request Example

  ```bash
  curl -X POST "{BASE_URL}/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"12345678"}'
  ```

- Responses

  - `200 OK`

    ```json
    {
      "success": true,
      "data": { "id": 2 }
    }
    ```

  - `401 Unauthorized` (wrong email/password)

---

#### POST `/auth/logout`

Invalidate auth cookies.

- Authentication: Required
- Request Body: none

- Request Example

  ```bash
  curl -X POST "{BASE_URL}/auth/logout"
  ```

- Responses

  - `200 OK`

    ```json
    { "success": true, "data": {} }
    ```

---

#### POST `/auth/refresh`

Exchange a valid `refreshToken` cookie for new tokens.

- Authentication: Required (`refreshToken`)
- Request Body: none

- Request Example

  ```bash
  curl -X POST "{BASE_URL}/auth/refresh"
  ```

- Responses

  - `200 OK`

    ```json
    { "success": true, "data": { "id": 1 } }
    ```

---

#### GET `/auth/me`

Return current authenticated user info.

- Authentication: Required
- Request Example

  ```bash
  curl "{BASE_URL}/auth/me"
  ```

- Responses

  - `200 OK`

    ```json
    { "success": true, "data": { "user": { "userId": 1 } } }
    ```

---

### Story

#### POST `/story/generate`

Start asynchronous story generation.

- Authentication: Required
- Request Body (application/json):

  | Field                  | Type   | Required | Description        |
  | ---------------------- | ------ | -------- | ------------------ |
  | `subject`              | string | no       | max 50 chars       |
  | `languageCode`         | string | yes      | one of ["DE","EN"] |
  | `originalLanguageCode` | string | yes      | one of ["DE","EN"] |

- Request Example

  ```bash
  curl -X POST "{BASE_URL}/story/generate" \
    -H "Content-Type: application/json" \
    -d '{"subject":"test","languageCode":"DE","originalLanguageCode":"EN"}'
  ```

- Responses

  - `200 OK` (job created)

    ```json
    { "success": true, "data": { "jobId": "123" } }
    ```

  - Then poll: `GET /jobs/status/{jobId}` or fetch `GET /story` after completion

  - Errors
    - `429 Too Many Requests` when daily story limit is reached

  Example completed job:

  ```json
  {
    "success": true,
    "data": {
      "status": "completed",
      "value": {
        "id": 15,
        "storyText": "Heute gibt es…",
        "translationText": "Today there is…",
        "audioUrl": "file.mp3",
        "unknownWords": [
          /* UnknownWord objects */
        ],
        "userId": 1
      }
    }
  }
  ```

---

#### GET `/story`

List all stories for the authenticated user (latest first).

- Authentication: Required

- Request Example

  ```bash
  curl "{BASE_URL}/story" --cookie "accessToken=…"
  ```

- Responses

  - `200 OK`

    ```json
    {
      "success": true,
      "data": [
        /* array of Story objects */
      ]
    }
    ```

---

### Unknown Words

#### POST `/unknown-words/mark-as-learned/{wordId}`

Mark an unknown word as learned (asynchronous).

- Authentication: Required
- Path Parameter: `wordId` (number > 0)

- Request Example

  ```bash
  curl -X POST "{BASE_URL}/unknown-words/mark-as-learned/5"
  ```

- Responses

  - `200 OK` (job created)

    ```json
    { "success": true, "data": { "jobId": "abc" } }
    ```

- Poll job status at `GET /jobs/status/{jobId}`

---

#### POST `/unknown-words/mark-as-learning/{wordId}`

Mark an unknown word as learning (asynchronous).

- Authentication: Required
- Path Parameter: `wordId` (number > 0)

- Request Example

  ```bash
  curl -X POST "{BASE_URL}/unknown-words/mark-as-learning/5"
  ```

- Responses

  - `200 OK` (job created)

    ```json
    { "success": true, "data": { "jobId": "def" } }
    ```

- Poll job status at `GET /jobs/status/{jobId}`

---

#### GET `/unknown-words/words`

Retrieve all unknown words with status and stats.

- Authentication: Required

- Request Example

  ```bash
  curl "{BASE_URL}/unknown-words/words"
  ```

- Responses

  - `200 OK`

    ```json
    {
      "success": true,
      "data": [
        /* UnknownWord[] */
      ]
    }
    ```

---

### Vocabulary

#### GET `/vocab/words-count`

Return the total count of saved vocabulary items for the user.

- Authentication: Required
- Responses

  - `200 OK`

    ```json
    { "success": true, "data": 123 }
    ```

---

#### GET `/vocab/allwords`

Return the full list of saved vocabulary items (no pagination).

- Authentication: Required
- Responses

  - `200 OK`

    ```json
    {
      "success": true,
      "data": [
        /* VocabularyItem[] */
      ]
    }
    ```

---

#### GET `/vocab/words`

Returns a paginated list of saved vocabulary items.

- Authentication: Required
- Query Parameters: `page` (number > 0), `pageSize` (> 0 ≤ 200)

- Request Example

  ```bash
  curl "{BASE_URL}/vocab/words?page=2&pageSize=2"
  ```

- Responses

  - `200 OK`

    ```json
    {
      "success": true,
      "data": [
        /* VocabularyItem[] */
      ],
      "pagination": {
        "totalItems": 400,
        "totalPages": 200,
        "currentPage": 2,
        "pageSize": 2
      }
    }
    ```

---

#### POST `/vocab/words`

Add a single vocabulary word.

- Authentication: Required
- Request Body (application/json): `word` (1–50 chars), `translation` (1–50), `article` (1–15 or null)

- Request Example

  ```bash
  curl -X POST "{BASE_URL}/vocab/words" \
    -H "Content-Type: application/json" \
    -d '{"word":"testword","translation":"translation","article":null}'
  ```

- Responses

  - `201 Created`

    ```json
    {
      "success": true,
      "data": {
        "id": 3,
        "word": "testword",
        "translation": "translation",
        "article": null,
        "userId": 1
      }
    }
    ```

---

#### POST `/vocab/words/list`

Add multiple vocabulary entries in a single request.

- Authentication: Required
- Request Body (application/json): `{ "words": Array<{ word, translation, article|null }> }`

- Request Example

  ```bash
  curl -X POST "{BASE_URL}/vocab/words/list" \
    -H "Content-Type: application/json" \
    -d '{ "words": [ { "word": "word1", "translation": "translation1", "article": null }, { "word": "word2", "translation": "translation2", "article": "the" } ] }'
  ```

- Responses

  - `201 Created`

    ```json
    {
      "success": true,
      "data": [
        /* VocabularyItem[] */
      ]
    }
    ```

---

#### PATCH `/vocab/words/{id}`

Update specific fields of a vocabulary entry.

- Authentication: Required
- Path Parameter: `id` (number > 0)
- Request Body: partial `word`, `translation`, `article`

- Request Example

  ```bash
  curl -X PATCH "{BASE_URL}/vocab/words/5" \
    -H "Content-Type: application/json" \
    -d '{ "article": "the" }'
  ```

- Responses

  - `200 OK`

    ```json
    {
      "success": true,
      "data": {
        /* VocabularyItem */
      }
    }
    ```

---

#### DELETE `/vocab/words/{id}`

Delete a vocabulary entry.

- Authentication: Required
- Path Parameter: `id` (> 0)

- Request Example

  ```bash
  curl -X DELETE "{BASE_URL}/vocab/words/5"
  ```

- Responses
  - `204 No Content` (no body)

---

### Vocabulary Assessment

#### GET `/vocab-assessment/start`

Start a new assessment session and get the first batch of words.

- Authentication: Required
- Responses

  - `200 OK`

    ```json
    {
      "success": true,
      "data": {
        "sessionId": "uuid",
        "status": "active",
        "wordsToReview": [
          {
            "id": 1,
            "source_language": "en",
            "target_language": "de",
            "word": "house",
            "translation": "Haus",
            "frequencyRank": 123
          }
        ],
        "lastStep": false,
        "step": 1
      }
    }
    ```

---

#### POST `/vocab-assessment/answer`

Continue an assessment session with the user’s answers.

- Authentication: Required
- Request Body (application/json):

  ```json
  { "sessionUUID": "uuid", "wordsData": { "<wordId>": true | false, "<wordId2>": true } }
  ```

- Responses

  - `200 OK` (active)

    ```json
    {
      "success": true,
      "data": {
        "sessionId": "uuid",
        "status": "active",
        "wordsToReview": [
          /* next batch */
        ],
        "lastStep": false,
        "step": 2
      }
    }
    ```

  - `200 OK` (completed)

    ```json
    {
      "success": true,
      "data": {
        "sessionId": "uuid",
        "status": "completed",
        "vocabularySize": 1500
      }
    }
    ```

---

### Jobs

#### GET `/jobs/status/{jobId}`

Get status of a background job.

- Authentication: Required
- Path Parameter: `jobId` (string)

- Responses

  - `200 OK`

    ```json
    {
      "success": true,
      "data": {
        "status": "active",
        "value": null,
        "failedReason": null,
        "progress": {
          "phase": {
            "name": "translation",
            "index": 4,
            "description": "Translating the story for you"
          },
          "totalSteps": 8
        }
      }
    }
    ```

  - `404 Not Found` if job is missing

---

### Onboarding

#### POST `/onboarding/complete`

Mark onboarding as completed for the current user.

- Authentication: Required
- Request Body: none
- Responses

  - `200 OK`

    ```json
    { "success": true }
    ```

---

#### GET `/onboarding/check`

Get onboarding status for the current user.

- Authentication: Required
- Responses

  - `200 OK`

    ```json
    { "success": true, "data": { "status": "completed" } }
    ```

    or

    ```json
    { "success": true, "data": { "status": "not_started" } }
    ```

---

### Health

#### GET `/healthz`

Liveness probe.

- Authentication: None
- Responses

  - `200 OK`

    ```json
    { "status": "ok" }
    ```

---

#### GET `/readyz`

Readiness probe (checks DB and Redis).

- Authentication: None
- Responses

  - `200 OK` when healthy

    ```json
    { "status": "ok", "dbOk": true, "redisOk": true }
    ```

  - `503 Service Unavailable` when not ready

    ```json
    { "status": "unhealthy", "dbOk": false, "redisOk": false }
    ```

---
