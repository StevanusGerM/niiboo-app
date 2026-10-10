# NiiBooo 你

**NiiBooo** is a gamified Mandarin learning web app for Indonesian speakers. It combines structured HSK 1–6 preparation, a Beelinguapp-style parallel reader, interactive Hanzi stroke-order practice, speech practice, an AI roleplay tutor, and token-based booking for live Zoom sessions with human teachers.

> UI language: **Bahasa Indonesia** · Learning language: **Mandarin (简体中文)**

---

## ✨ Features

| Module | Route | What it does |
| --- | --- | --- |
| **Welcome & Auth** | `/welcome`, `/login`, `/signup` | Kid-friendly entry flow with **Boo the panda** mascot (SVG, reacts to typing: waves, cheers, covers its eyes while you type a password, looks sad on errors). First-time visitors are routed to `/welcome` by middleware and choose *Daftar*, *Masuk*, or *Coba dulu* (guest mode via the `niibooo_guest` cookie). Chunky 3D buttons, friendly Indonesian error messages, responsive for phone and desktop. |
| **Journey Map** | `/journey` | Game-style level map: 6 themed worlds (HSK 1–6) with a winding path of chunky nodes — lessons, stories, a Hanzi challenge, HSK practice and a timed **boss exam**. Nodes unlock in sequence (units below your HSK level are open), earn up to 3 ⭐, and Boo marks “you are here”. |
| **Bento-Grid Dashboard** | `/` | Daily XP goal ring, streak tracker, HSK level progress, story of the day, word of the day (with TTS), mock-exam shortcut, AI tutor and expert booking cards, 7-day activity chart. |
| **Adaptive Placement Test** | `/placement` | 12-item staircase test: a correct answer raises difficulty, a wrong one lowers it. Estimates HSK 1–6 (highest level with ≥50% accuracy) and saves it to `profiles.current_hsk_level`. |
| **Practice Room** | `/practice` | Replay corner for everything already unlocked on the map: re-run a lesson's flashcards / Hanzi writing / speaking, or re-read stories from the library. Locked items point back to the map. (`/learn` and `/reader` without a target redirect here.) |
| **Structured Curriculum** | `/learn?lesson=…` | Lessons per HSK level with: Leitner-style **flashcards** (3D flip, score saved to `user_progress`), **Hanzi writing in 3 stages** — *Lihat* (stroke-order animation), *Latihan* (traced over a shadow guide, order enforced by `hanzi-writer`) and *Tes* (blank pad, written from memory; only the **shape** is scored — order and direction are ignored, see `src/lib/hanzi-shape.ts`), and **speech practice** using the Web Speech API (`zh-CN`) with a Levenshtein-based pronunciation score. |
| **Parallel Story Reader** | `/reader/[id]` | Mandarin ↔ Indonesian side-by-side / stacked / “test yourself” layouts, ruby pinyin, **karaoke highlighting** (sentence + word level) driven by timestamped audio (`audio_url` + `start/end`) or browser TTS fallback, speed control, **instant glossary** on every word, saved-vocabulary list. |
| **HSK Prep** | `/hsk`, `/hsk/[level]/mock`, `/hsk/[level]/practice` | **Timed mock exams** (Listening / Reading / Writing, per-section timers, 2-play audio limit, question navigator, scaled score /200 or /300, pass mark 60%) and an untimed **practice bank** with instant feedback and detailed explanations. Writing includes tap-to-build sentence ordering. |
| **AI Smart Tutor** | `/tutor`, `POST /api/tutor` | **Boo Laoshi** — open-ended chat on any topic powered by Claude (`claude-opus-5-5`), replying at the learner's HSK level with hanzi + pinyin + Indonesian, tone/grammar corrections, Indonesian explanations, and tappable reply suggestions. Optional roleplay starters (introductions, restaurant, taxi, market). Without `ANTHROPIC_API_KEY` it falls back to the rule-based roleplay simulation with tone checking. Voice input via speech recognition. |
| **Human Expert Booking** | `/experts` | Laoshi Brigita Chuanes · 4 tokens / 50 min. Teacher catalogue (`src/data/experts.ts`), weekday slot picker in WIB, token wallet, atomic booking/cancellation via Postgres RPC, status tracking, Zoom link shown once confirmed. |

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
- Floating capsule navigation (`CapsuleNav`) fixed at the bottom with 5 tabs — Beranda · Peta · Tutor AI · HSK · Pakar (lessons, stories and the practice room sit under *Peta*); sticky top bar with streak & token pills.
- Fonts: Nunito (rounded, kid-friendly UI) + Noto Sans SC (Hanzi) via `next/font`.
- Supporting palette for categories and rewards: **mint** `#3CCFA4` (success, Hanzi), **ocean** `#5AB4F5` (listening, practice), **lilac** `#A78BFA` (reading, stories), **sunny** `#FFC94A` (stars, XP) — each with `-light`/`-dark` shades and a `shadow-chunky-*`.
- Cartoons: **Boo** the panda (`mascot/Boo.tsx`, 6 moods), **Xiao Long** the little dragon and 12 kawaii stickers (`mascot/Stickers.tsx`), and `BooWith` (Boo holding a prop).
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
│   │   ├── (auth)/             # full-screen: welcome, login, signup
│   │   ├── (app)/              # main app shell: TopBar + CapsuleNav
│   │   ├── auth/callback/      # email confirmation code exchange
│   │   └── api/tutor/route.ts  # tutor endpoint
│   ├── components/
│   │   ├── ui/                 # design-system primitives
│   │   ├── mascot/             # Boo the panda + speech bubble
│   │   ├── auth/               # WelcomeScreen, AuthForm, ChunkyButton
│   │   ├── journey/            # JourneyMap
│   │   ├── practice/           # PracticeRoom
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
│   │   ├── journey.ts          # builds units/nodes, unlock + star rules
│   │   ├── journey-store.ts    # per-device node & Hanzi results
│   │   ├── use-journey.ts      # shared unlock/star state hook
│   │   ├── hanzi-shape.ts      # shape-only scoring for the free-hand test
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

### Progress storage
Lesson results go to `user_progress` (Supabase). Journey results for stories, HSK practice/boss exams and Hanzi tests are stored per device in `localStorage`.

### Browser support
Speech recognition needs Chrome or Edge (desktop/Android). TTS works in all modern browsers; quality depends on the installed Chinese voice. Hanzi stroke data is loaded from the `hanzi-writer-data` CDN at runtime.

---

## 🤖 AI tutor (Claude)

`src/lib/tutor/ai.ts` calls the Claude Messages API with structured JSON output (`output_config.format`), low effort for snappy chat, and server-side refusal fallbacks (`fallbacks: "default"`). The system prompt keeps replies kid-friendly, at the learner's HSK level, and never asks for personal data.

1. Create an API key at [console.anthropic.com](https://console.anthropic.com).
2. Set `ANTHROPIC_API_KEY` in `.env.local` (local) and in **Vercel → Settings → Environment Variables** (production), then redeploy.
3. `GET /api/tutor` reports `{ ai: true }` once it's active; the chat header shows **AI aktif**.

Cost control: each message is one API call (billed to your Anthropic account). `/api/tutor` applies a best-effort limit of 30 messages per 5 minutes per IP; for stricter limits, require sign-in or add a shared rate limiter (e.g. Upstash Redis).

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
