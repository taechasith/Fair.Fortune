<img width="841" height="239" alt="image" src="https://github.com/user-attachments/assets/bd9f3a7a-eade-4311-bb48-8444ffc4c61e" />

# FairFortune (02/19/2026 Version)

FairFortune is a Next.js web app for culturally aware hongbao planning with giver/receiver collaboration.

## What Is Included Now

- Login and registration
- Privacy consent modal on login
- Project creation with custom situation (family, work, or any text)
- Room code collaboration between giver and receiver
- Receiver bank details in room
- Gratitude notes saved in room
- Messaging in room with visibility options:
  - Private (between the two room members)
  - Room-visible
- Giver transfer slip image upload
- Allocation engine with explanation panel and warnings
- Dark mode and light mode support

## Main User Flows

1. User signs up or logs in
2. Giver creates a project and gets a room code
3. Giver shares room code with receiver
4. Receiver joins room and adds bank details
5. Both sides send messages and gratitude notes
6. Giver runs allocation and reviews explanation

## Privacy and Access Model

- Room access is limited to two users:
  - One giver
  - One receiver
- If a receiver is already assigned, other users cannot join that room
- Private messages are only visible to sender and intended recipient

## Tech Stack

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Local JSON persistence for scenario state (browser)
- Server-side room/auth/project store using JSON file or temp storage

## Project Structure (Important Parts)

- `app/login/page.tsx` - login/register + consent UI
- `app/giver/page.tsx` - giver workflow, project + room code + messaging
- `app/receiver/page.tsx` - receiver workflow, bank details + notes + messaging
- `app/api/auth/*` - login/register/session APIs
- `app/api/projects/route.ts` - project list/create API
- `app/api/rooms/*` - room create/join/get/message/note/bank APIs
- `lib/server/collabStore.ts` - server data model and persistence
- `lib/math/*` - allocation and numerical methods engine

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Build

```bash
npm run build
npm run start
```

## Environment Notes

Optional:

- `FAIRFORTUNE_DATA_FILE` - custom path for server data file

Storage behavior:

- Local dev: uses project file storage
- Serverless: uses temp directory fallback

## API Summary

Auth:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`

Projects:

- `GET /api/projects`
- `POST /api/projects`

Rooms:

- `POST /api/rooms/create`
- `POST /api/rooms/join`
- `GET /api/rooms/[code]`
- `PATCH /api/rooms/[code]/bank`
- `POST /api/rooms/[code]/notes`
- `POST /api/rooms/[code]/messages`

## Current Limitations

- Server storage is file-based, not a production database
- On some serverless platforms, temp storage can reset between cold starts
- For long-term production reliability, migrate room/auth/project data to a real database

## Suggested Next Upgrade

- Move auth/projects/rooms/messages to Postgres or Supabase
- Add password hashing and session expiration policies
- Add audit logs and admin moderation tools

## Author

Taechasith Kangkhuntod
