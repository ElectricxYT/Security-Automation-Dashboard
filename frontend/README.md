## Overview
The frontend for Picket, a Security Automation Dashboard, provides a React-based UI for querying IPs/domains and displaying risk verdicts. Communicates with the backend API.
Features

## Input form for IPs/domains.
 - Displays risk score, verdict, and API breakdowns.
 - Color-coded results (green for Low, red for High).
 - Responsive design.

## Prerequisites

 - Node.js (v18+)
 - npm
 - Backend deployed (local or Firebase).

## Installation

 - Navigate to frontend/: ```cd frontend```
 - Install dependencies: ```npm install```

## Configuration

- Update API base URL in src/App.tsx or env: ```REACT_APP_API_URL=https://your-backend-url```
- For local: ``` http://localhost:3000 ```.

## Running Locally

- Start dev server: ```npm run dev```
- Access at ``` http://localhost:5173 ```.

## Build & Deployment

- Build: ```npm run build```.
- Deploy to Firebase Hosting: ```firebase deploy --only hosting```.

## Project Structure
```
textfrontend/
├── src/
│   ├── components/  # UI components (Input, Results)
│   ├── App.tsx      # Main app logic
│   ├── main.tsx     # Entry point
│   └── vite-env.d.ts # Type defs
├── public/          # Static assets
├── package.json     # Dependencies (react, typescript, etc.)
├── tsconfig.json    # TypeScript config
└── vite.config.ts   # Vite setup
```
## Troubleshooting

**"Failed to fetch"**: Check backend URL and ensure it's running.
Use your own API keys in backend; **not** provided here.

## License
MIT.
