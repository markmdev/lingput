## Overview

REST API for the Comprehensible Input language-learning app.
Provides endpoints for authentication, story generation, vocabulary management, and unknown-word tracking.

**Base URL:** `http://localhost:3000/api`

---

## Conventions

- **Successful response format**:

  ```json
  {
    "success": true,
    "data": <payload>,
    "pagination"?: { /* pagination object if present */ }
  }
  ```

- **Error response format**:

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

- Uses HTTP-only, Secure JWT cookies (`accessToken`, `refreshToken`).
- CORS: restricted to your frontend origin.

### Rate Limiting

- Default: 100 requests per 15 minutes per authenticated user.

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
        "minimum": 4,
        "type": "string",
        "inclusive": true,
        "exact": false,
        "message": "String must contain at least 4 character(s)",
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
| `audioUrl`        | string        | Path or URL to the audio file          |
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

## Endpoints

### Auth

#### POST `/auth/register`

Create a new user and issue auth cookies.

- **Authentication**: None
- **Request Body** (`application/x-www-form-urlencoded`):

  | Field      | Type   | Required | Description           |
  | ---------- | ------ | -------- | --------------------- |
  | `email`    | string | yes      | must be unique        |
  | `password` | string | yes      | at least 8 characters |

- **Request Example**

  ```bash
  curl -X POST "{BASE_URL}/auth/register" \
    -d "email=test@example.com" \
    -d "password=12345678"
  ```

- **Responses**

  - `201 Created`

    ```json
    {
      "success": true,
      "data": { "id": 2 }
    }
    ```

  - `400 Bad Request` (invalid credentials format)
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
  - See also: [Common Error Responses](#common-error-responses)

---

#### POST `/auth/login`

Authenticate user and set auth cookies.

- **Authentication**: None
- **Request Body**: same as `/auth/register`

- **Request Example**

  ```bash
  curl -X POST "{BASE_URL}/auth/login" \
    -d "email=test@example.com" \
    -d "password=12345678"
  ```

- **Responses**

  - `200 OK`
    ```json
    {
      "success": true,
      "data": { "id": 2 }
    }
    ```
  - `400 Bad Request` (invalid credentials format)
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
  - `401 Unauthorized` (wrong email/password)
    ```json
    {
      "success": false,
      "error": {
        "message": "Invalid credentials",
        "code": 401
      }
    }
    ```
  - See also: [Common Error Responses](#common-error-responses)

---

#### POST `/auth/logout`

Invalidate auth cookies.

- **Authentication**: Required
- **Request Body**: _none_

- **Request Example**

  ```bash
  curl -X POST "{BASE_URL}/auth/logout"
  ```

- **Responses**
  - `200 OK`
    ```json
    {
      "success": true,
      "data": {}
    }
    ```
  - See also: [Common Error Responses](#common-error-responses)

---

#### POST `/auth/refresh`

Exchange a valid `refreshToken` cookie for new tokens.

- **Authentication**: Required (`refreshToken`)
- **Request Body**: _none_

- **Request Example**

  ```bash
  curl -X POST "{BASE_URL}/auth/refresh"
  ```

- **Responses**

  - `200 OK`
    ```json
    {
      "success": true,
      "data": { "id": 1 }
    }
    ```
  - See also: [Common Error Responses](#common-error-responses)

---

### Story

#### POST `/story/generate`

Generate a story with translation, unknown-word list, and audio.

- **Authentication**: Required
- **Request Body** (`application/x-www-form-urlencoded`):

  | Field                  | Type   | Required | Description        |
  | ---------------------- | ------ | -------- | ------------------ |
  | `subject`              | string | no       | max 50 chars       |
  | `languageCode`         | string | yes      | one of ["DE","EN"] |
  | `originalLanguageCode` | string | yes      | one of ["DE","EN"] |

- **Request Example**

  ```bash
  curl -X POST "{BASE_URL}/story/generate" \
    -d "subject=test" \
    -d "languageCode=DE" \
    -d "originalLanguageCode=EN"
  ```

- **Responses**

  - `200 OK`
    ```json
    {
      "success": true,
      "data": {
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
    ```
  - `400 Bad Request` (validation failed)
    ```json
    {
      "success": false,
      "error": {
        "message": "Invalid data",
        "code": 400,
        "details": [
          {
            "code": "too_big",
            "maximum": 50,
            "type": "string",
            "inclusive": true,
            "exact": false,
            "message": "Maximum subject length is 50 characters",
            "path": ["subject"]
          }
        ]
      }
    }
    ```
  - See also: [Common Error Responses](#common-error-responses)

  See the [UnknownWord schema](#unknownword-schema)

---

#### GET `/story/`

List all stories for the authenticated user.

- **Authentication**: Required

- **Request Example**

  ```bash
  curl "{BASE_URL}/story/" --cookie "accessToken=…"
  ```

- **Responses**

  - `200 OK`
    ```json
    {
      "success": true,
      "data": [
        /* array of Story objects */
      ]
    }
    ```
  - See also: [Common Error Responses](#common-error-responses)

  See the [Story schema](#story-schema)

---

#### GET `/story/{storyId}`

Fetch a specific story with its unknown words.

- **Authentication**: Required
- **Path Parameter**: `storyId` (number > 0)

- **Request Example**

  ```bash
  curl "{BASE_URL}/story/15"
  ```

- **Responses**

  - `200 OK`
    ```json
    {
      "success": true,
      "data": {
        /* Story object */
      }
    }
    ```
  - `400 Bad Request` if `storyId` invalid

    ```json
    {
      "success": false,
      "error": {
        "message": "Invalid data",
        "code": 400,
        "details": [
          {
            "code": "invalid_type",
            "expected": "number",
            "received": "nan",
            "path": ["storyId"],
            "message": "Expected number, received nan"
          }
        ]
      }
    }
    ```

  - `404 Not Found` if `storyId` is not found or doesn't belong to a user

    ```json
    {
      "success": false,
      "error": {
        "message": "Story not found"
      }
    }
    ```

  - See also: [Common Error Responses](#common-error-responses)

  See the [Story schema](#story-schema)

---

### Unknown Words

#### POST `/unknown-words/mark-as-learned/{wordId}`

Mark an unknown word as learned.

- **Authentication**: Required
- **Path Parameter**: `wordId` (number > 0)

- **Request Example**

  ```bash
  curl -X POST "{BASE_URL}/unknown-words/mark-as-learned/5"
  ```

- **Responses**
  - `200 OK`
    ```json
    {
      "success": true,
      "data": {
        "message": "Word marked as learned"
      }
    }
    ```
  - `502 Bad Gateway` _(word not found or doesn’t belong to the user)_
  - See also: [Common Error Responses](#common-error-responses)

#### POST `/unknown-words/mark-as-learning/{wordId}`

Mark an unknown word as learning.

- **Authentication**: Required
- **Path Parameter**: `wordId` (number > 0)

- **Request Example**

  ```bash
  curl -X POST "{BASE_URL}/unknown-words/mark-as-learning/5"
  ```

- **Responses**
  - `200 OK`
    ```json
    {
      "success": true,
      "data": {
        "message": "Word marked as learning"
      }
    }
    ```
  - `502 Bad Gateway` _(word not found or doesn’t belong to the user)_
  - See also: [Common Error Responses](#common-error-responses)

---

#### GET `/unknown-words/words`

Retrieve all unknown words with status and stats.

- **Authentication**: Required
- **Request Example**

  ```bash
  curl "{BASE_URL}/unknown-words/words"
  ```

- **Responses**

  - `200 OK`
    ```json
    {
      "success": true,
      "data": [
        {
          "id": 122,
          "word": "Test",
          "translation": "exam, test",
          "article": "der",
          "exampleSentence": "Ich bereite mich auf den Test vor.",
          "exampleSentenceTranslation": "I'm preparing for the exam.",
          "timesSeen": 1,
          "status": "learning",
          "userId": 1
        },
        {
          "id": 125,
          "word": "abschneiden",
          "translation": "perform",
          "article": null,
          "exampleSentence": "Er hat im Wettbewerb gut abgeschnitten.",
          "exampleSentenceTranslation": "He performed well in the competition.",
          "timesSeen": 1,
          "status": "learning",
          "userId": 1
        }
      ]
    }
    ```
  - See also: [Common Error Responses](#common-error-responses)

  See the [UnknownWord schema](#unknownword-schema)

---

### Vocabulary

#### GET `/vocab/words`

Returns a paginated list of saved vocabulary items.

- **Authentication**: Required
- **Query Parameters**: `page` (number > 0), `pageSize` (> 0 ≤ 200)

- **Request Example**

  ```bash
  curl "{BASE_URL}/vocab/words?page=2&pageSize=2"
  ```

- **Responses**

  - `200 OK`
    ```json
    {
      "success": true,
      "data": [
        {
          "id": 429,
          "word": "Bitte",
          "translation": "Please / You are welcome",
          "article": null,
          "userId": 1
        },
        {
          "id": 430,
          "word": "Danke",
          "translation": "Thank you",
          "article": null,
          "userId": 1
        }
      ],
      "pagination": {
        "totalItems": 400,
        "totalPages": 200,
        "currentPage": 2,
        "pageSize": 2
      }
    }
    ```
  - See also: [Common Error Responses](#common-error-responses)

  See the [VocabularyItem schema](#vocabularyitem-schema)
  See the [Pagination schema](#pagination-schema)

---

#### POST `/vocab/words`

Add a single vocabulary word.

- **Authentication**: Required
- **Request Body** (`application/x-www-form-urlencoded`): `word` (1–50 chars), `translation` (1–50), `article` (1–15 or null)

- **Request Example**

  ```bash
  curl -X POST "{BASE_URL}/vocab/words" \
    -d "word=testworld" \
    -d "translation=translation" \
    -d "article=null"
  ```

- **Responses**

  - `201 Created`
    ```json
    {
      "success": true,
      "data": {
        "id": 3,
        "word": "testworld",
        "translation": "translation",
        "article": null,
        "userId": 1
      }
    }
    ```
  - `400 Bad Request` if validation failed
  - See also: [Common Error Responses](#common-error-responses)

  See the [VocabularyItem schema](#vocabularyitem-schema)

---

#### POST `/vocab/words/list`

Add multiple vocabulary entries in a single request.

- **Authentication**: Required
- **Request Body** (`application/json`): an array of objects, each with the following fields: `word` (1–50 chars), `translation` (1–50), `article` (1–15 or null)

- **Request Example**

  ```bash
  curl -X POST "{BASE_URL}/vocab/words/list" \
    -H "Content-Type: application/json" \
    -d '{ "words": [ { "word": "word1", "translation": "translation1", "article": null }, { "word": "word2", "translation": "translation2", "article": "the" } ] }'
  ```

- **Responses**

  - `200 OK`
    ```json
    {
      "success": true,
      "data": [
        {
          "id": 5,
          "word": "word1",
          "translation": "translation1",
          "article": null,
          "userId": 1
        },
        {
          "id": 6,
          "word": "word2",
          "translation": "translation2",
          "article": "the",
          "userId": 1
        }
      ]
    }
    ```
  - `400 Bad Request` if validation failed
  - See also: [Common Error Responses](#common-error-responses)

  See the [VocabularyItem schema](#vocabularyitem-schema)

---

#### PATCH `/vocab/words/{id}`

Update specific fields of a vocabulary entry.

- **Authentication**: Required
- **Path Parameter**: `id` (number > 0)
- **Request Body**: partial `word`, `translation`, `article`

- **Request Example**

  ```bash
  curl -X PATCH "{BASE_URL}/vocab/words/5" \
    -H "Content-Type: application/json" \
    -d '{ "article": "the" }'
  ```

- **Responses**

  - `200 OK`
    ```json
    {
      "success": true,
      "data": {
        "id": 5,
        "word": "word1",
        "translation": "translation1",
        "article": "the",
        "userId": 1
      }
    }
    ```
  - `400 Bad Request` if validation failed
  - See also: [Common Error Responses](#common-error-responses)

  See the [VocabularyItem schema](#vocabularyitem-schema)

---

#### DELETE `/vocab/words/{id}`

Delete a vocabulary entry.

- **Authentication**: Required
- **Path Parameter**: `id` (> 0)

- **Request Example**

  ```bash
  curl -X DELETE "{BASE_URL}/vocab/words/5"
  ```

- **Responses**
  - `204 No Content` _(no body)_
  - See also: [Common Error Responses](#common-error-responses)

---
