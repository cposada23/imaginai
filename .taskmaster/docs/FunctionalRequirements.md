# ImaginAI — Functional Requirements (Concise)

## 0) Tech Stack & Setup
- **Framework**: Next.js 15 (App Router), React 19.
- **UI**: TailwindCSS, shadcn/ui, lucide-react.
- **Forms/Validation**: react-hook-form + zod.
- **OpenAI**: Images API with `model: "gpt-image-1"`.
- **Storage**: `IndexedDB` for image binaries; `localStorage` for config (API key, preferences).
- **Build/Styling**: Dark/light theme via Tailwind, CSS variables friendly.

---

## 1) Core Concept
ImaginAI is a Midjourney-style image generation tool with a unified **chat-like prompt input** and a **scrollable timeline** of generated results. Prompts create background jobs that append to the timeline as images are produced.

---

## 2) Roles
- **User (anonymous/local)** — no server auth; everything runs client-side except OpenAI calls using user-provided key.

---

## 3) Primary Flows
1. **Prompt → Generate**  
   - User enters prompt + options → submit → job enqueued → timeline shows **Pending** card(s) → when images arrive, cards update to **Completed** (or **Failed**).
2. **Details View**  
   - Clicking a prompt group opens a details drawer/page: full metadata and all images; can **Re-run** and **Download**.
3. **Re-run from History**  
   - Clicking a previous prompt (timeline or details) repopulates the input with the same text/options; user can submit immediately.
4. **Settings**  
   - User sets OpenAI API key and client preferences; saved locally.

---

## 4) Functional Requirements

### 4.1 Prompt Input & Options
- FR-P1: Single unified input at the top/bottom of the page (sticky on desktop/mobile).
- FR-P2: Options (collapsible “Advanced”):
  - **quality**: `low | mid | high` (internal mapping to API params + compression rules; see 4.4).
  - **aspect_ratio**: `1024x1024 | 1536x1024 | 1024x1536`.
  - **output_compression**: `0–100%` (default **50%**) applied when encoding **WEBP** client-side.
  - **output_format**: **webp** (client-side transcode before saving/downloading).
  - **moderation**: `"low"` (client-side flag; see 4.6).
  - **n**: number of images to generate per prompt (>=1; reasonable max, e.g., 4–8).
  - **model**: fixed default `"gpt-image-1"` (editable for future-proofing).
  - **response_format**: attempt `"b64_json"` if available; otherwise handle base64 default transparently.
- FR-P3: react-hook-form + zod validation (required prompt; bounded `n`; bounded compression; enumerated options).
- FR-P4: Submit adds a **Job** with status `queued` and renders placeholder cards.

### 4.2 Timeline (Results Feed)
- FR-T1: **Infinite scroll** with cursor-based pagination over local dataset.
- FR-T2: **Responsive grid**: 1 col (≤sm), 2 cols (md), 4 cols (lg+).
- FR-T3: **Minimal filters** (combinable):
  - Date range (createdAt).
  - Status: `queued | running | completed | failed`.
  - Aspect ratio (three values).
  - Order: `newest` (default) | `oldest`.
- FR-T4: Each grid item shows:
  - Square container with the image letterboxed to preserve true aspect ratio.
  - Tiny status chip + created timestamp + `n` count.
  - Click → opens **Details** (4.3).
- FR-T5: When a prompt is resubmitted, new items are appended in place without resetting scroll.

### 4.3 Details View (Prompt Group)
- FR-D1: Shows:
  - **All images** for the prompt (carousel/grid).
  - **jobId**, **created**, **status**, **imageCount**, **dimensions**, **model**, **quality**.
- FR-D2: Actions:
  - **Re-run** (preload form with same prompt/options and submit).
  - **Download** each image (WEBP).
- FR-D3: Deep linkable route: `/prompt/[jobId]`.

### 4.4 OpenAI Integration (gpt-image-1)
- FR-A1: Calls OpenAI Images API with:
  - `model: "gpt-image-1"`.
  - `prompt: string`.
  - `n: number`.
  - `size`: from `aspect_ratio`:
    - `1024x1024` → `"1024x1024"`.
    - `1536x1024` → `"1536x1024"` (landscape).
    - `1024x1536` → `"1024x1536"` (portrait).
  - `quality`: derived from `low|mid|high`:
    - `low` → API `quality: "standard"` + lower client compression target.
    - `mid` → API `quality: "standard"` + default compression (50%).
    - `high` → API `quality: "hd"` (if available) + lower compression artifacts (higher file size).
  - `response_format`: attempt `"b64_json"`; gracefully handle default base64 payloads if param is ignored.
- FR-A2: **Transcode** returned base64 → `Blob` → **WEBP** using canvas/OffscreenCanvas; apply `output_compression`.
- FR-A3: **Background jobs**:
  - Client runs a queue: `queued → running → completed/failed`.
  - Concurrency limit (e.g., 1–2) to avoid rate-limit bursts.
  - Retry policy with exponential backoff (max 2 retries).
- FR-A4: **Rate-limit & timeout** handling:
  - Surface user-friendly error toast + mark job `failed`.
  - Partial success allowed (e.g., some images succeed).

### 4.5 Downloading & Local Storage
- FR-S1: Clicking an image (in timeline or details) triggers **download** of the WEBP (filename: `imaginai_{jobId}_{index}.webp`).
- FR-S2: **IndexedDB**:
  - Store: prompt record, options, job metadata, and image binaries (as Blobs).
  - Pagination queries support filters & sort (indexes on createdAt, status, aspect ratio).
- FR-S3: **localStorage**:
  - API key, UI preferences (theme, default options), last used filters/sort.
- FR-S4: **Import/Export**:
  - Export a prompt group as a `.zip` (images + `metadata.json`).
  - (Optional) Export entire library snapshot.

### 4.6 Moderation & Safety
- FR-M1: **Client-side pre-filters** based on keywords when `moderation = "low"`:
  - Light heuristic check; warn user and require confirmation if flagged.
- FR-M2: Provide **disclaimer** in Settings and first-run modal.

### 4.7 Navigation & Layout
- FR-N1: Simple top **Navbar**: brand, search (client-side filter), **Settings** button (sheet/dialog).
- FR-N2: Settings:
  - **OpenAI API Key** (masked; stored in localStorage).
  - Default generation options (quality, aspect ratio, `n`, compression).
  - Clear data (images / keys) with confirm.
- FR-N3: Mobile-friendly: sticky input, collapsible filters, pull-to-refresh (optional).

### 4.8 Accessibility & UX
- FR-X1: Keyboard navigation for prompt input and grid focus states.
- FR-X2: ARIA labels on interactive elements; alt text from prompt.
- FR-X3: Progress indicators for running jobs; error toasts are screen-reader friendly.

### 4.9 Performance
- FR-PF1: Image **virtualization** in timeline; lazy decode & intersection-observer.
- FR-PF2: Client image **transcode** offloaded to Web Worker (if supported).
- FR-PF3: Cache thumbnails separately (smaller WEBP) for grid; full-res in details.

### 4.10 Observability (Client)
- FR-O1: Lightweight event log (in-memory + IndexedDB) for job lifecycle.
- FR-O2: Optional console debug toggle in Settings.

---

## 5) Data Model (Client-Side)
- **PromptJob**
  - `jobId: string` (UUID)
  - `prompt: string`
  - `options: { quality, aspect_ratio, output_compression, output_format:"webp", moderation:"low", n, model, response_format:"b64_json" | "auto" }`
  - `status: "queued" | "running" | "completed" | "failed"`
  - `createdAt: number` (epoch ms)
  - `updatedAt: number`
  - `imageCount: number`
  - `dimensions: "1024x1024" | "1536x1024" | "1024x1536"`
- **GeneratedImage**
  - `id: string` (UUID)
  - `jobId: string`
  - `index: number`
  - `blobKey: string` (IndexedDB key)
  - `width: number`
  - `height: number`
  - `status: "ready" | "failed"`
- **Settings**
  - `apiKey: string`
  - `defaults: { quality, aspect_ratio, n, output_compression }`
  - `ui: { theme: "system|light|dark" }`

---

## 6) UI Components (shadcn/ui + Tailwind)
- **Navbar** (Button: Settings; Search input w/ debounce).
- **PromptForm** (Textarea + Advanced Options; Submit Button; validation messages).
- **FiltersBar** (DateRangePicker, StatusSelect, AspectRatioSelect, SortSelect).
- **TimelineGrid** (virtualized grid; infinite loader; empty & end states).
- **ResultCard** (square container; status chip; click → Details).
- **DetailsDrawer/Page** (metadata, image gallery, actions).
- **SettingsDialog** (API key, defaults, data management).
- **Toaster** (success/error).
- **Loading/Spinner** components.

---

## 7) Acceptance Criteria (Samples)
- AC-1: Submitting a prompt with `n=4` creates 4 placeholders; within the same job they update to images or failed states; timeline scroll position remains intact.
- AC-2: Grid renders **1/2/4** columns on mobile/tablet/desktop breakpoints.
- AC-3: Filtering by **status=completed** and **aspect_ratio=1024x1536** returns only matching cards; changing **order** flips sequence without reloading images.
- AC-4: Details view shows **all images**, **jobId**, **created**, **status**, **image count**, **dimensions**, **model**, **quality**; **Re-run** repopulates the form exactly.
- AC-5: Clicking an image downloads a **.webp** file that opens locally; filename pattern matches spec.
- AC-6: API key persists between reloads; clearing data removes keys and images from localStorage/IndexedDB.
- AC-7: Images preserve true aspect ratio inside a square card (no stretching); letterboxing is visible where needed.
- AC-8: Infinite scrolling appends additional pages seamlessly; no duplicate items.

---

## 8) Security & Privacy
- API key only stored locally; never sent to third parties other than OpenAI.
- Provide a kill-switch in Settings to clear all local data.
- Avoid logging prompts or keys beyond local optional debug.

---

## 9) Notes / Constraints
- Some OpenAI image parameters may differ across providers/versions. The client must:
  - Prefer `b64_json` responses when supported; otherwise handle base64 payloads without an explicit `response_format` parameter.
  - Map `quality` (`low|mid|high`) to available API options and adjust client-side compression accordingly.
- This app intentionally avoids server persistence; exporting `.zip` enables manual backup/sharing.

