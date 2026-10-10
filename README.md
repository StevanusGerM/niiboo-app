# NiiBooo 你

**NiiBooo** is a gamified Mandarin learning web app for Indonesian speakers. It combines structured HSK 1–6 preparation, a Beelinguapp-style parallel reader, interactive Hanzi stroke-order practice, speech practice, an AI roleplay tutor, and token-based booking for live Zoom sessions with human teachers.

> UI language: **Bahasa Indonesia** · Learning language: **Mandarin (简体中文)**

---

## ✨ Features

| Module | Route | What it does |
| --- | --- | --- |
| **Bento-Grid Dashboard** | `/` | Daily XP goal ring, streak tracker, HSK level progress, story of the day, word of the day (with TTS), mock-exam shortcut, AI tutor and expert booking cards, 7-day activity chart. |
| **Adaptive Placement Test** | `/placement` | 12-item staircase test: a correct answer raises difficulty, a wrong one lowers it. Estimates HSK 1–6 (highest level with ≥50% accuracy) and saves it to `profiles.current_hsk_level`. |
| **Structured Curriculum** | `/learn` | Lessons per HSK level with: Leitner-style **flashcards** (3D flip, score saved to `user_progress`), **Hanzi stroke-order** writing via `hanzi-writer` (watch + quiz modes on a 米字格 grid), and **speech practice** using the Web Speech API (`zh-CN`) with a Levenshtein-based pronunciation score. |
| **Parallel Story Reader** | `/reader`, `/reader/[id]` | Mandarin ↔ Indonesian side-by-side / stacked / “test yourself” layouts, ruby pinyin, **karaoke highlighting** (sentence + word level) driven by timestamped audio (`audio_url` + `start/end`) or browser TTS fallback, speed control, **instant glossary** on every word, saved-vocabulary list. |
| **HSK Prep** | `/hsk`, `/hsk/[level]/mock`, `/hsk/[level]/practice` | **Timed mock exams** (Listening / Reading / Writing, per-section timers, 2-play audio limit, question navigator, scaled score /200 or /300, pass mark 60%) and an untimed **practice bank** with instant feedback and detailed explanations. Writing includes tap-to-build sentence ordering. |
| **AI Smart Tutor** | `/tutor`, `POST /api/tutor` | Scenario roleplay (introductions, restaurant, taxi, market bargaining). Accepts Hanzi, toneless pinyin, or tone numbers (`ni3 hao3`) and returns **tone corrections**, third-tone sandhi reminders, hints, and model answers. Voice input via speech recognition. |
| **Human Expert Booking** | `/experts` | Teacher catalogue, weekday slot picker in WIB, token wallet, atomic booking/cancellation via Postgres RPC, status tracking, Zoom link shown once confirmed. |

### Demo mode
If Supabase env vars are missing, the app runs fully in **demo mode**: bundled sample content is served and progress, streaks, tokens and bookings live in `localStorage`. Add Supabase keys to switch to real accounts — no code changes needed.

---

## 🎨 Design system

Modern Neo-Pop × clean Bento grid.

| Token | Value | Tailwind |
| --- | --- | --- |
| Primary — Bubblegum Blossom | `#FF6584` | `blossom` |
| Secondary — Peach Sherbet | `#FFB385` | `peach` |
| Secondary — Soft Rose | `#FFD1DC` | `rose` |
| Dark — Deep Plum | `#2B2D42` | `plum` |
| Background — Cream | `#F9F8F6` | `cream` |

- Cards: `rounded-bento` (28px) / `rounded-bento-lg` (32px), `shadow-soft`, optional `shadow-glow` for primary actions.
- Floating capsule navigation (`CapsuleNav`) fixed at the bottom; sticky top bar with streak & token pills.
- Fonts: Plus Jakarta Sans (UI) + Noto Sans SC (Hanzi) via `next/font`.
- Primitives live in `src/components/ui/index.tsx` (`BentoCard`, `Button`, `ButtonLink`, `Badge`, `HskBadge`, `ProgressRing`, `ProgressBar`, `PageHeader`).

---

## 🏗️ Architecture

```
niibooo/
├── supabase/
│   ├── schema.sql              # tables, RLS policies, triggers, booking RPCs
│   └── seed.sql                # generated sample content (lessons, stories, exams)
├── scripts/
│   ├── generate-seed.ts        # src/data → supabase/seed.sql
│   ├── push-to-github.ps1      # Windows push helper
│   └── push-to-github.sh       # macOS/Linux/Git Bash push helper
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx            # Bento dashboard
│   │   ├── placement/          # adaptive placement test
│   │   ├── learn/              # curriculum (flashcards, Hanzi, speech)
│   │   ├── reader/[id]/        # parallel story reader
│   │   ├── hsk/[level]/{mock,practice}/
│   │   ├── tutor/              # AI tutor UI
│   │   ├── experts/            # booking UI
│   │   ├── login/              # Supabase email/password auth
│   │   ├── auth/callback/      # email confirmation code exchange
│   │   └── api/tutor/route.ts  # tutor endpoint
│   ├── components/
│   │   ├── ui/                 # design-system primitives
│   │   ├── layout/             # TopBar, CapsuleNav
│   │   ├── providers/          # UserProvider (profile, progress, streak, XP)
│   │   ├── dashboard/          # BentoDashboard
│   │   ├── reader/             # ParallelReader
│   │   ├── hsk/                # MockTest, HskHub
│   │   ├── learn/              # LearnStudio, Flashcards, HanziWriterPad, SpeechPractice
│   │   ├── placement/          # PlacementTest
│   │   ├── tutor/              # TutorChat
│   │   └── experts/            # BookingPanel
│   ├── data/                   # sample content (also used to generate seed.sql)
│   ├── lib/
│   │   ├── supabase/           # config, browser client, server client
│   │   ├── data.ts             # server data access with sample-data fallback
│   │   ├── bookings.ts         # booking service (RPC or localStorage)
│   │   ├── tutor/              # scenarios + rule-based tutor engine
│   │   ├── speech.ts           # TTS, speech recognition, pronunciation scoring
│   │   ├── pinyin.ts           # tone numbers ↔ marks
│   │   └── storage.ts, utils.ts
│   ├── middleware.ts           # refreshes Supabase session cookies
│   └── types/
│       ├── database.ts         # typed Database for supabase-js
│       └── content.ts          # JSONB shapes (LessonContent, StoryPair, ExamQuestion)
└── tailwind.config.ts          # brand tokens
```

**Data flow**
- Content pages (`/`, `/reader`, `/hsk`, `/learn`, `/placement`) are **Server Components** that read via `src/lib/data.ts`. Each read tries Supabase first and falls back to `src/data/*`.
- User state (profile, progress, streak, XP, tokens) lives in the client `UserProvider`, which writes to Supabase when signed in or to `localStorage` in demo mode.
- Token deductions/refunds happen only inside the `book_expert_session` / `cancel_expert_session` **security-definer RPCs**; a trigger stops clients from editing `token_balance` directly.

---

## 🗄️ Database (Supabase / PostgreSQL)

| Table | Columns |
| --- | --- |
| `profiles` | id, username, full_name, avatar_url, current_hsk_level, streak_days, **token_balance**\* |
| `lessons` | id, hsk_level, title, category, content_json |
| `user_progress` | id, user_id, lesson_id, is_completed, score |
| `parallel_stories` | id, title_zh, title_id, hsk_level, content_pairs, audio_url |
| `hsk_exams` | id, hsk_level, section_type, questions_json |
| `expert_bookings` | id, user_id, expert_name, scheduled_time, status, zoom_link, **token_cost**\* |

\* Added on top of the base spec so the token wallet and refunds work. Timestamps (`created_at`, `updated_at`) are added where useful.

RLS: content tables are publicly readable; `profiles`, `user_progress` and `expert_bookings` are owner-only. A trigger creates a `profiles` row on sign-up.

**JSONB shapes** are documented in `src/types/content.ts`. For karaoke sync with a real audio file, set `audio_url` and add `start`/`end` (seconds) to every item in `content_pairs`. Without them, the reader uses browser TTS.

---

## 🚀 Getting started

Requirements: **Node.js 20+** (Node 22.18+ to run the seed generator), npm.

```bash
npm install
cp .env.example .env.local   # optional — skip to use demo mode
npm run dev                  # http://localhost:3000
```

### Connect Supabase
1. Create a project at [supabase.com](https://supabase.com).
2. In **SQL Editor**, run `supabase/schema.sql`, then `supabase/seed.sql`.
3. Copy **Project URL** and **anon public key** (Project Settings → API) into `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   ```
4. In **Authentication → URL Configuration**, add `http://localhost:3000/auth/callback` (and your production URL) to the redirect URLs.
5. Restart `npm run dev` and sign up at `/login`.

Confirming a booking (admin side): update the row with the service role, for example
`update expert_bookings set status = 'confirmed', zoom_link = 'https://zoom.us/j/...' where id = '...';`

### Scripts
| Command | Description |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` / `npm start` | Production build / serve |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run seed:generate` | Regenerate `supabase/seed.sql` from `src/data` |

### Browser support
Speech recognition needs Chrome or Edge (desktop/Android). TTS works in all modern browsers; quality depends on the installed Chinese voice. Hanzi stroke data is loaded from the `hanzi-writer-data` CDN at runtime.

---

## 🤖 Upgrading the AI tutor to a real LLM

The tutor is a deterministic, rule-based simulation (`src/lib/tutor/engine.ts`). To use an LLM:
1. Add `ANTHROPIC_API_KEY` to `.env.local`.
2. Replace the body of `generateTutorReply` with a model call that receives the scenario, step and learner message and returns JSON matching `TutorResponse` (`reply`, `feedback`, `nextStep`, `done`).
3. The UI and `/api/tutor` contract stay unchanged.

---

## 🗺️ Roadmap ideas
- Move the expert catalogue into a `experts` table and look rates up inside the booking RPC.
- Token top-up via a payment gateway (e.g. Midtrans/Xendit) with a webhook that credits `token_balance`.
- Spaced-repetition scheduling (SM-2) for saved words.
- Recorded native audio with timestamps for every story.

---

## 📦 Push to GitHub

See [`scripts/push-to-github.ps1`](scripts/push-to-github.ps1) (Windows) or [`scripts/push-to-github.sh`](scripts/push-to-github.sh), or run manually:

```bash
git init
git add .
git commit -m "feat: initial NiiBooo app"
git branch -M main
git remote add origin https://github.com/StevanusGerM/niiboo-app.git
git push -u origin main
```

Create the empty repository `niiboo-app` on GitHub first (without a README, .gitignore or license). If it already has commits, run `git pull --rebase origin main` before pushing.
