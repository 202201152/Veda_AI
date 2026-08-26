# VedaAI — AI Teacher's Toolkit (AssessAI)

> **Assessment Extraction, Handwritten Answer Mapping, Highlighting & AI Grading**

AssessAI (built as the *AI Teacher's Toolkit* within the VedaAI platform) is an intelligent evaluation assistant designed to bridge printed question papers and handwritten student answer sheets. It automates question parsing, handwriting OCR, regional coordinate detection, answer-to-question mapping, and rubric-free AI feedback.

---

## 🚀 Live Demo & Repository
- **Tech Stack:** Next.js 15 (App Router) + React 19 + TypeScript + Tailwind CSS
- **AI Vision / LLM Engine:** Google Gemini 2.0 Flash (`gemini-2.0-flash` via `@google/generative-ai`)
- **Document Rasterization:** `pdfjs-dist` (client-side canvas rendering)
- **Deployment:** Vercel (Edge-ready Node.js runtime)

---

## 💡 Key Features

1. **Dual Document Intake & Client Validation:**
   - Drag-and-drop or browse question papers and student answer sheets (PDF, PNG, JPG).
   - Real-time client-side type and file size validation (up to 15MB) with instant page count detection.
   - Elegant file-chip state matching the VedaAI design system.

2. **Real 4-Stage AI Pipeline:**
   - **Stage 1 (`POST /api/extract-questions`):** Extracts all questions in printed order, preserving numbering and isolating labelled sub-parts (e.g. `11(a)`, `11(b)`).
   - **Stage 2 (`POST /api/extract-answers`):** OCRs student handwriting, detects visible question labels, and generates normalized page bounding boxes (`[x, y, width, height]`), linking multi-page answers.
   - **Stage 3 (`POST /api/map-answers`):** Matches answers to questions using label matching with content/order fallback reasoning. Accurately surfaces *unanswered* questions and flags unassigned handwriting into a separate *unmatched* panel.
   - **Stage 4 (`POST /api/grade`):** Evaluates answer correctness, assigns scores and concise constructive feedback inline, and calculates total score with summary insights. (Unanswered questions scored 0 locally without wasting AI tokens).

3. **Interactive Side-by-Side Assessment Workspace:**
   - **Question List:** Neutral Charcoal circular number badges, sub-part tags, status badges (`Answered`, `Out of order`, `Unanswered`, or score pills), and expandable inline AI feedback cards.
   - **Answer Sheet Viewer:** High-resolution page rasterization, zoom controls (`50%`–`200%`), and smooth page navigation.
   - **Click-to-Highlight Interaction:** Clicking any question auto-scrolls to the answer page and renders a translucent green bounding box with a pinned `Q#` tag. Multi-page answers highlight across all relevant pages with page jump shortcuts.
   - **Unmatched Handwriting Panel:** Isolated section with dashed error styling for examiner review of rough work or unassigned notes.
   - **Grading Summary Panel:** Total score percentage ring, question performance metrics, overall commentary, and permanent AI disclosure badge.

4. **Responsive Mobile Experience:**
   - Automatically adapts on mobile viewports into a single-column layout with a `"Questions | Answer Sheet"` pill tab switcher.
   - Selecting a question on mobile smoothly auto-switches tabs and focuses on the highlighted answer region.

---

## 🛠️ Architecture & Security Model

```
                    ┌────────────────────────┐
                    │  Next.js 15 + React 19 │
                    │   VedaAI App Shell     │
                    └───────────┬────────────┘
                                │
                 ┌──────────────┴──────────────┐
                 ↓                             ↓
          Question Paper                 Answer Sheet
         (PDF / Images)                 (PDF / Images)
                 │                             │
                 ↓                             ↓
       /api/extract-questions         /api/extract-answers
       (Gemini OCR + Subparts)        (Gemini OCR + Bounding Boxes)
                 │                             │
                 └──────────────┬──────────────┘
                                ↓
                        /api/map-answers
                 (Label + Context Reasoning)
                                │
                 ┌──────────────┴──────────────┐
                 ↓                             ↓
            /api/grade               AnswerSheetViewer
       (Scoring + Feedback)         (pdfjs-dist + HighlightOverlay)
                 │                             │
                 └──────────────┬──────────────┘
                                ↓
                        Next.js Split UI
                   (Questions + PDF Highlights)
```

### Security & Session Isolation
- **No Authentication Required:** The app provides immediate open access per the project specification. Teacher name ("Mrs. Sharma") and school info ("Delhi Public School") are static placeholder props for platform visual fidelity.
- **Zero Server-Side Storage / Database:** Uploaded files and responses live purely in-memory for the duration of a single request. No global or module-level user data leaks between concurrent requests.
- **Server-Side API Key Protection:** `GEMINI_API_KEY` is strictly read on the server side in API route handlers and never exposed to the client bundle.
- **In-Memory Rate Limiting:** Per-IP request limiter (`lib/rateLimiter.ts`) protects against quota abuse and returns polite `429` responses with `Retry-After` headers.

---

## 📋 Assumptions & Limitations

1. **No Accounts / In-Memory Session:** Refreshing the browser resets the session. No database is used.
2. **AI-Generated Grading (Rubric-Free):** Grading is the AI's best-effort assessment based on question text and student response; it is clearly disclosed to educators as an assistive tool rather than an authoritative rubric match.
3. **Single Student Assessment:** Evaluates one question paper against one student answer sheet per session.
4. **Handwriting Legibility:** Assumes reasonably legible handwriting and clear scan/photo resolution. Low-quality scans gracefully degrade to lower confidence tags.
5. **English Language:** Optimized for English-language exam papers and answers.

---

## 💻 Local Setup & Development

### 1. Prerequisites
- Node.js 18.18+ or 20+
- npm / yarn / pnpm

### 2. Clone & Install Dependencies
```bash
git clone <repo-url>
cd Veda_AI
npm install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the root:
```env
GEMINI_API_KEY=your_google_gemini_api_key
GEMINI_MODEL=gemini-2.0-flash
MAX_FILE_SIZE_MB=15
RATE_LIMIT_PER_MINUTE=10
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production
```bash
npm run build
npm start
```
