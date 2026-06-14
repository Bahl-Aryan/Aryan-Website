# aryanOS

my portfolio, built as a tiny macOS. every dock icon opens a real window you can
drag, resize, and stack. there's a Finder for projects, an Activity Monitor for
what i'm working on, a Calendar for the timeline, a live Notes app, Messages (with
a guardrailed bot), a Terminal, Apple Music, and a Preview for my resume. no
scrolling, all windows.

built with next.js, typescript, tailwind, and framer-motion.

## Run it locally

```bash
npm install
npm run dev
```

open [http://localhost:3000](http://localhost:3000).

## Optional services

everything works with no env vars (the AI chat falls back to a canned auto-reply,
and notes read from the bundled file). to turn the live features on, set these:

| var                        | what it does                                                                                                                                           |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `OPENAI_API_KEY`           | turns the Messages bot into a real, guardrailed chat about me. without it, Messages uses a canned reply.                                               |
| `OPENAI_MODEL`             | optional, defaults to `gpt-4o-mini`.                                                                                                                   |
| `UPSTASH_REDIS_REST_URL`   | redis (REST) for live notes. `KV_REST_API_URL` also works.                                                                                             |
| `UPSTASH_REDIS_REST_TOKEN` | token for the above. `KV_REST_API_TOKEN` also works.                                                                                                   |
| `NOTES_ADMIN_TOKEN`        | a long random secret. unlocks the in-app notes editor (the hidden lock icon in the Notes app). i paste this once and can edit notes live for everyone. |

if redis isn't set, notes fall back to reading `content/notes.json` from GitHub,
then to the bundled copy.

## Deploy on Railway

1. create a new project from this repo. Railway auto-detects next.js and runs
   `npm run build` then `npm run start`.
2. add the env vars above in the service settings.
3. for live notes, add an Upstash Redis database (Upstash exposes the REST URL +
   token that the notes API expects) and point the two `UPSTASH_REDIS_REST_*`
   vars at it.

that's it. the OS is one page, so there's nothing else to wire up.
