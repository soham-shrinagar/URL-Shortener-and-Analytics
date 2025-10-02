# URL Shortener + Analytics

A scalable URL shortener service with analytics tracking. Shorten long URLs, track clicks, and view analytics such as unique clicks, IP addresses, and user-agent data.

---

## Features

- Shorten long URLs into easy-to-share short codes
- Redirect users to the original URL
- Track analytics for each short URL: total clicks, unique clicks (by IP), user-agent and IP address
- Caching with Redis for fast redirects
- Optional expiry and custom aliases

---

## Tech Stack

- **Backend:** Node.js + Express
- **Database:** PostgreSQL (Prisma ORM)
- **Cache:** Redis
- **Other:** Prisma Client for database interaction

---

## Project Setup

1. Clone the repository:

```bash
git clone <your-repo-url>
cd <project-folder>
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment variables:

```bash
cp .env.example .env
# Fill in values for NODE_ENV, PORT, DATABASE_URL, REDIS_URL, BASE_URL, DEFAULT_CACHE_TTL
```

4. Start PostgreSQL and Redis on your machine.

5. Run Prisma migrations to create tables:

```bash
npx prisma migrate dev --name init
```

6. Start the server:

```bash
npm run dev
```