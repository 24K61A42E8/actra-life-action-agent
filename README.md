# ACTRA — Your AI Life Action Agent

Actra turns information into action.

## V1 capabilities
- PDF/document, image, text and voice input
- Extract tasks, deadlines, people and required items
- Create action plans
- Track Pending / In Progress / Done
- Source/Why traceability
- Memory for people, commitments and documents
- Chat-style agent UI
- Approval-first action model
- Provider-independent AI adapter
- Local development storage with a simple upgrade path

## Tech
- Frontend: React + Vite
- Backend: Node.js + Express
- Storage: local JSON in V1 for zero-native-dependency Windows setup
- AI: provider adapter supporting OpenAI-compatible and Gemini-compatible configuration
- PDF: pdf-parse
- Images: OCR-ready endpoint structure
- Voice: OpenAI-compatible transcription endpoint when API key is configured

> Note: The V1 storage layer is intentionally JSON-based so the ZIP runs reliably on Windows without native SQLite compilation. The storage API is isolated in `backend/src/storage/store.js`, so SQLite/PostgreSQL can be added later without changing the UI or agent contracts.

## Requirements
- Node.js 20+ recommended
- npm 10+

## Run
### 1. Backend
```powershell
cd backend
npm install
copy .env.example .env
npm run dev
```

Backend: http://localhost:3001

### 2. Frontend
Open another terminal:
```powershell
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:5173

Or use the root Windows launcher:
```powershell
.\start-actra.bat
```

## AI setup
The app works in demo/local extraction mode without an API key.

For real AI:
- Set `AI_PROVIDER=openai` and `OPENAI_API_KEY=...`
- or set `AI_PROVIDER=gemini` and `GEMINI_API_KEY=...`

The provider adapter is in `backend/src/services/aiProvider.js`.

## Safety
Actra does not send messages, make payments, submit forms or perform other consequential external actions automatically in V1. It prepares actions and requires user approval.

## Branding
The provided blue AI robot image is used as Actra's visual brand asset.
