## Overview
The backend for Picket, a Security Automation Dashboard, that handles API requests to VirusTotal and AbuseIPDB, aggregates risk scores for IPs/domains, and stores results in Firebase Firestore. Built with Node.js and Express.

## Features
- Endpoint: ```/verdict/:query``` for risk analysis.
- Integrates VirusTotal (reputation, malicious/suspicious counts) and AbuseIPDB (abuse confidence).
- Layered, deterministic risk scoring: High to Low based on rules.
- Domain-to-IP resolution using Node.js dns.
- Stores scans in Firestore.

## Prerequisites

- Node.js (v18+)
- npm
- Firebase project (for Firestore and Cloud Functions)
- Your own API keys: VirusTotal and AbuseIPDB – **keys not provided**; register an account for free keys.

## Installation

- Navigate to backend/: ```textcd backend```
- Install dependencies: ```textnpm install```

## Configuration

- Set API keys and Firebase config as environment variables or Firebase secrets:
```
VIRUSTOTAL_API_KEY=your_key
ABUSEIPDB_API_KEY=your_key
```
- For Firebase: Initialize with ```firebase init functions``` and set secrets via ```firebase functions:config:set```.

## Running Locally

- Start server: ```node index.js```
- Access at ```http://localhost:3000/verdict/<ip-or-domain>```.

## Deployment

- Deploy as Firebase Cloud Function: ```firebase deploy --only functions```.
- Update frontend to use the deployed URL.

## Project Structure
```
textbackend/
├── index.js      # Express app, routes, API logic
├── package.json  # Dependencies (express, axios, firebase-admin, etc.)
└── .env.example  # Template for env vars
```
## Troubleshooting

- CORS errors: Ensure cors middleware allows frontend origin.
- API limits: Free tiers have quotas; handle errors gracefully.
- Google Cloud SDK: Ensure that the Google Cloud SDK CLI is installed and configured to the project. 

## License
MIT.
