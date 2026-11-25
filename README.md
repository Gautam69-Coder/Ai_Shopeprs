# Synthetic Shopper Simulator

> An AI-powered virtual consumer simulator designed to evaluate product ideas, marketing concepts, and feature tradeoffs against authentic synthetic customer archetypes.

---

## 1. Project Overview

**Synthetic Shopper** is a full-stack platform built to simulate consumer panels and market research feedback loops using AI. Rather than relying solely on slow and expensive traditional customer surveys, product teams can configure target audiences, generate diverse synthetic consumer cohorts, pitch products or advertisements to them, and gather deep persona-conditioned evaluations.

### Project Roadmap Status
- **Phase 1 (Complete)**: Foundational full-stack architecture, independent runnability, Mongoose connection with graceful degradation, and health check endpoints.
- **Phase 2 (Complete)**: Synthetic Shopper Profile Generation with Groq LLM, Zod validation, MongoDB persistence, and audience batch grouping.
- **Phase 3 (Complete)**: **Simulation Engine**:
  - Input product propositions (title, category, price, description, marketing ad copy).
  - Select target shopper cohorts.
  - Persona roleplay simulation using Groq LLM (`openai/gpt-oss-120b`).
  - Structured qualitative evaluation capturing consideration, attractions, concerns/objections, verbatim quotes, and price reactions.
  - MongoDB `Simulation` persistence and full interactive frontend response viewer.
- **Phase 4 (Complete)**: **Evaluation & Intent Classification**:
  - Automated classification of each shopper response into **Definitely Yes**, **Maybe**, and **No** with conviction confidence scores (0–100%).
  - Extraction of primary purchase drivers and primary objection categories for each persona.
  - Cohort-level synthesis computing **Net Intent Index** (0–100), intent distribution percentages, top drivers, common objections, and actionable optimization recommendations.
  - Frontend interactive decision filter tabs (*All*, *Definitely Yes*, *Maybe*, *No*) and comprehensive `EvaluationSummaryCard`.
- **Phase 5 (Complete & Active)**: **Analytics & Dashboards**:
  - Platform-wide aggregated KPI intelligence: total simulations, total evaluated personas, global mean Net Intent Index, conversion funnel percentages, and category intent/pricing benchmarks.
  - Demographic Cross-Tabulation engine: purchase intent segmented by **Price Sensitivity** (High, Medium, Low), **Age Brackets** (18-25, 26-35, 36-50, 50+), and **Income Tiers** (<₹50k, ₹50k-₹120k, >₹120k).
  - Driver & Friction Objection frequency clustering and ranking across cohorts.
  - Side-by-side **A/B Product Concept Comparison Matrix** evaluating competing concepts and identifying the winning proposition with margin/pricing deltas.
  - Interactive, accessible zero-dependency Tailwind CSS & SVG data visualization suite with exportable JSON analytics reports.
- **Phase 6 (Upcoming & Final Phase)**: **Reliability & Production Hardening**:
  - Concurrency controls and chunked batching policies for LLM traffic.
  - Rate limiting, automatic exponential backoff retries, and network fault tolerance.
  - Groq LLM token consumption and cost estimation tracking.
  - Automated stress testing suite and end-to-end integration tests.

---

## 2. Technology Stack

### Frontend
- **Framework**: React 19
- **Language**: TypeScript (with strict `verbatimModuleSyntax`)
- **Bundler & Tooling**: Vite
- **Styling**: Tailwind CSS v4
- **Iconography**: Lucide React

### Backend
- **Runtime**: Node.js (ES Modules, `"type": "module"`)
- **Server Framework**: Express 4
- **Database ORM**: Mongoose 8
- **LLM Engine**: Groq API (`groq-sdk`, model `openai/gpt-oss-120b`)
- **Validation**: Zod 3
- **Utilities**: CORS, Dotenv

### Database
- **Database**: MongoDB Atlas (`synthetic_shopper`)
- **Fallback**: Graceful standalone startup mode when MongoDB is unavailable

---

## 3. Folder Structure

```text
synthetic-shopper/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                 # Mongoose connection with graceful degradation
│   │   ├── controllers/
│   │   │   ├── healthController.js      # / and /api/health
│   │   │   ├── shopperController.js     # /api/shoppers & direct save
│   │   │   └── simulationController.js  # /api/simulations (run & fetch)
│   │   ├── middlewares/
│   │   │   └── errorHandler.js       # 404 & global JSON error handler
│   │   ├── models/
│   │   │   ├── Shopper.js            # Mongoose schema for synthetic shoppers
│   │   │   └── Simulation.js         # Mongoose schema for simulation runs & responses
│   │   ├── routes/
│   │   │   ├── healthRoutes.js       # Health and welcome routes
│   │   │   ├── shopperRoutes.js      # Profile generation & retrieval routes
│   │   │   ├── simulationRoutes.js   # Simulation engine execution routes
│   │   │   └── index.js              # Central router mounting
│   │   ├── scripts/
│   │   │   └── checkDb.js            # CLI database inspector (npm run db:check)
│   │   ├── services/
│   │   │   ├── groqClient.js         # Groq API client with structured JSON mode
│   │   │   ├── shopperService.js     # Persona generation & batch persistence
│   │   │   └── simulationService.js  # Persona roleplay prompt engine & simulation runner
│   │   ├── validators/
│   │   │   ├── shopperValidator.js   # Zod schemas for shoppers
│   │   │   └── simulationValidator.js# Zod schemas for simulation runs & evaluations
│   │   ├── app.js                    # Express app configuration
│   │   └── server.js                 # Server entrypoint with graceful shutdown
│   ├── .env                          # Local environment variables (gitignored)
│   ├── .env.example                  # Template environment variables
│   └── package.json                  # Backend dependencies & scripts
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Badge.tsx         # Accessible status badge component
│   │   │   │   └── Card.tsx          # Reusable UI card
│   │   │   ├── dashboard/
│   │   │   │   └── SystemStatus.tsx  # Real-time backend & DB connection monitor
│   │   │   ├── layout/
│   │   │   │   ├── Footer.tsx        # Application footer
│   │   │   │   └── Navbar.tsx        # Header navigation with tab switcher
│   │   │   ├── shopper/
│   │   │   │   ├── BatchSelector.tsx # Historical generation batch switcher
│   │   │   │   ├── ShopperCard.tsx   # Persona card with DB ID and traits
│   │   │   │   ├── ShoppersGrid.tsx  # Responsive 3-column shopper grid
│   │   │   │   └── TargetAudienceForm.tsx # Form with slider & example presets
│   │   │   └── simulation/
│   │   │       ├── ProductForm.tsx   # Product pitch form with preset examples
│   │   │       ├── ShopperReactionCard.tsx # Persona reaction with quotes, attractions, concerns
│   │   │       └── SimulationViewer.tsx # Product banner & evaluations grid
│   │   ├── services/
│   │   │   ├── shopperApi.ts         # Shopper API client
│   │   │   └── simulationApi.ts      # Simulation API client
│   │   ├── types/
│   │   │   ├── shopper.ts            # TypeScript interfaces for shoppers
│   │   │   └── simulation.ts         # TypeScript interfaces for simulations
│   │   ├── App.tsx                   # Main dashboard shell & workflow tab switcher
│   │   ├── index.css                 # Tailwind CSS directives & color tokens
│   │   └── main.tsx                  # React DOM mount point
│   ├── index.html                    # Semantic HTML5 document (WCAG AA compliant)
│   ├── package.json                  # Frontend dependencies & scripts
│   ├── tsconfig.json                 # TypeScript configuration
│   └── vite.config.ts                # Vite configuration with Tailwind plugin
├── .gitignore                        # Multi-tier ignore rules
└── README.md                         # Project documentation
```

---

## 4. How to Run the Project

### Running Backend (Port 5000)
```bash
cd backend
npm run dev
```

To inspect database records from the terminal:
```bash
npm run db:check
```

### Running Frontend (Port 5173)
```bash
cd frontend
npm run dev
```

Visit **`http://localhost:5173`** (or `http://127.0.0.1:5173`) in your browser.

### Deployed & Local Environments

| Environment | Frontend | Backend API |
| :--- | :--- | :--- |
| **Production** | `https://ai-shoppers.pages.dev` | `https://ai-shopeprs.onrender.com/api` |
| **Local Development** | `http://localhost:5173` / `http://127.0.0.1:5173` | `http://localhost:5000/api` |

- **Backend CORS (`FRONTEND_URL` / `CORS_ORIGINS`)**: Accepts comma-separated origins (e.g. `http://localhost:5173,http://127.0.0.1:5173,https://ai-shoppers.pages.dev`). Both production (`https://ai-shoppers.pages.dev`, plus `*.ai-shoppers.pages.dev` preview builds) and localhost origins are allowed by default.
- **Frontend API Resolution (`VITE_API_BASE_URL`)**: Automatically selects `http://localhost:5000/api` on `localhost`/`127.0.0.1` or Vite dev mode, and `https://ai-shopeprs.onrender.com/api` in production unless overridden via `VITE_API_BASE_URL`.

---

## 5. API Endpoint Documentation

### Simulation Engine Endpoints

#### Run Simulation
- **URL**: `/api/simulations/run`
- **Method**: `POST`
- **Request Body**:
```json
{
  "batchId": "c7f07fde-e289-4f86-b380-54bcdc2cc6bf",
  "product": {
    "name": "AromaDark Single-Origin Nitro Cold Brew Can",
    "category": "Beverages & Specialty Coffee",
    "price": 180,
    "currency": "INR",
    "description": "Direct-trade Arabica steep-brewed for 18 hours, nitrogen-infused for a silky texture, zero sugar, 150mg natural caffeine.",
    "adCopy": "Café-grade craft cold brew in a sleek pocket can."
  }
}
```
- **Response**: `201 Created`
```json
{
  "success": true,
  "message": "Simulation completed across 3 shopper(s)",
  "simulation": {
    "_id": "6b058e3451d0954c7385a221",
    "batchId": "c7f07fde-e289-4f86-b380-54bcdc2cc6bf",
    "product": { ... },
    "shopperCount": 3,
    "status": "completed",
    "responses": [
      {
        "shopperName": "Arjun Mehta",
        "shopperOccupation": "Full-stack developer (remote)",
        "shopperCity": "Bengaluru",
        "shopperAge": 27,
        "shopperIncome": 180000,
        "priceSensitivity": "medium",
        "consideration": "I’d consider buying it for on-the-go coding marathons, but I’ll still favor my home-brewed pour-over for daily fuel.",
        "reactionQuote": "A nitro can looks like a handy boost for those late-night pull-request sprints, but I’ll keep it as an occasional treat.",
        "attractions": [
          "Single-origin Arabica sourced direct-trade",
          "Nitrogen-infused silky texture with 150mg natural caffeine",
          "Zero-sugar, clean energy vibe"
        ],
        "concerns": [
          "May not match the freshness and ritual of my own pour-over",
          "Canned format adds waste and isn't as sustainable",
          "Price is comparable to a premium bag of beans"
        ],
        "willingnessToPayFeedback": "₹180 feels reasonable for an occasional premium cold brew, but a bit pricey for daily consumption."
      }
    ]
  }
}
```

---

#### List Simulations
- **URL**: `/api/simulations`
- **Method**: `GET`
- **Response**: `200 OK` (includes product, shopper count, and `evaluationSummary` metadata)

---

#### Get Simulation By ID
- **URL**: `/api/simulations/:id`
- **Method**: `GET`
- **Response**: `200 OK` (includes nested shopper responses with individual classifications)

---

### Phase 4 Evaluation Endpoints

#### Evaluate Simulation (Run Classification & Cohort Synthesis)
- **URL**: `/api/simulations/:id/evaluate`
- **Method**: `POST`
- **Response**: `200 OK`
```json
{
  "success": true,
  "message": "Simulation responses successfully classified and synthesized",
  "simulation": {
    "_id": "6b058e3451d0954c7385a221",
    "evaluationSummary": {
      "intentBreakdown": {
        "definitelyYes": 0,
        "maybe": 3,
        "no": 0,
        "intentScore": 50
      },
      "topDrivers": [
        "Convenient energy boost",
        "Premium single-origin coffee",
        "Premium convenience of ready-to-drink format"
      ],
      "commonObjections": [
        "High price",
        "Perceived waste from single-serve cans",
        "Sustainability concerns about packaging"
      ],
      "recommendations": [
        "Introduce a smaller-size or multi-pack pricing tier to lower per-unit cost",
        "Switch to recyclable aluminum or biodegradable cans and highlight eco-friendly packaging",
        "Amplify premium origin story in marketing and offer loyalty bundle"
      ],
      "executiveSummary": "The cohort shows strong latent demand—100% indicated a 'Maybe'—but price and sustainability are key blockers..."
    }
  }
}
```

---

#### Get Evaluation Summary
- **URL**: `/api/simulations/:id/evaluation`
- **Method**: `GET`
- **Response**: `200 OK` (Lightweight endpoint returning product, evaluationSummary, and per-shopper classification verdicts)

---

### Phase 5 Analytics Endpoints

#### Get Platform Analytics Overview
- **URL**: `/api/analytics/overview`
- **Method**: `GET`
- **Response**: `200 OK`
```json
{
  "success": true,
  "overview": {
    "totalSimulations": 3,
    "totalEvaluations": 6,
    "averageIntentScore": 50,
    "globalDecisionBreakdown": {
      "definitelyYes": 0,
      "maybe": 6,
      "no": 0,
      "total": 6,
      "yesPercent": 0,
      "maybePercent": 100,
      "noPercent": 0
    },
    "topPlatformDrivers": [
      { "name": "Convenient energy boost", "count": 1, "percentage": 17 },
      { "name": "Effective Active Noise Cancellation", "count": 1, "percentage": 17 }
    ],
    "topPlatformObjections": [
      { "name": "Price and waste", "count": 2, "percentage": 33 },
      { "name": "Price sensitivity", "count": 1, "percentage": 17 }
    ],
    "categoryBenchmarks": [
      {
        "category": "Consumer Electronics & Audio",
        "simulationCount": 1,
        "totalShoppers": 2,
        "averagePrice": 1299,
        "averageIntentScore": 50
      }
    ]
  }
}
```

---

#### Get Simulation Demographic Cross-Tabulation
- **URL**: `/api/analytics/simulations/:id`
- **Method**: `GET`
- **Response**: `200 OK` (Returns deep cross-tabulations segmented by `priceSensitivity`, `ageBrackets`, `incomeTiers`, and frequency-ranked drivers/objections)

---

#### Compare Product Simulations (A/B Matrix)
- **URL**: `/api/analytics/compare?ids=id1,id2`
- **Method**: `GET`
- **Response**: `200 OK` (Returns side-by-side metric comparison, intent score deltas, and the winning concept)

---

### Shopper Endpoints (Phase 2)
- `POST /api/shoppers/generate`: Generate 1–20 personas with Groq LLM
- `POST /api/shoppers`: Directly save custom profiles to MongoDB
- `GET /api/shoppers`: Retrieve shoppers (supports `?batchId=...`)
- `GET /api/shoppers/batches`: List distinct generation batches

---

## 6. Next Steps (Phase 6 Roadmap: Reliability & Production Hardening)
- [ ] Concurrency limits and queue controls for LLM API calls.
- [ ] Automatic exponential backoff retries on rate limit (429) and transient network failures.
- [ ] LLM token consumption, latency, and operational cost estimation tracking.
- [ ] Comprehensive unit and integration test suite with synthetic benchmark fixtures.
