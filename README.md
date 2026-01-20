# Picket – Security Automation Dashboard

## Overview

**Picket** will be a full-stack Security Automation Dashboard that acts as an automated sentry for threat intelligence analysis. Much like a military picket performs guard duty by monitoring and reporting potential threats, Picket continuously evaluates suspicious indicators using multiple security data sources and delivers a clear, automated verdict.

Instead of relying on manual lookups across different platforms, Picket aggregates and correlates threat intelligence from multiple APIs, applies deterministic scoring logic, and presents the results through an interactive dashboard.

## Why This Project?

As an aspiring Cybersecurity Engineer, this project is being built as a foundational project aligned with my interest in security automation and backend engineering. I hope to use this project to learn new skills relating to JavaScript (TypeScript), React, HTML/CSS, and Express, thus furthering my goal of expanding my skill set and acquiring a diverse Computer Science education/skillset.

## How Will it Work?

Picket will start out as a Minimum Viable Project (MVP) Security Automation Dashboard that will:
1. Take either a domain or an IP Address from the user via a React GUI
2. Analyze that domain or ip address to determine whether it is risky or not by querying multiple threat intelligence APIs
3. Store that domain/ip address and its score within the Firebase database (indicator value, indicator type, timestamp, API results, final risk score, and verdict)
4. Output to the user the final risk score, the verdict label, the breakdown by source, and (possibly) a short explanation

Picket will use two threat intelligence APIs so that Picket doesn't trust just one source blindly. Discrepancies will result in a slightly higher risk score. The threat intelligence APIs that Picket will use are:
- VirusTotal
- AbuseIPDB

Picket will use Firebase Firestore as its database to increase setup speed and maintain a low risk of failure. 

---

## Features

* Submit an indicator (IP address or domain) for automated threat analysis
* Server-side aggregation of multiple threat intelligence APIs
* Automated risk scoring and verdict classification
* Transparent breakdown of results by source
* Persistent scan history stored in a database
* Responsive, TypeScript-based React dashboard

---

## Tech Stack

### Frontend

* React
* TypeScript
* HTML/CSS
* Axios

### Backend

* Node.js
* Express
* TypeScript

### Database

* Firebase Firestore

### External APIs

* VirusTotal API
* AbuseIPDB API

---

## Architecture Overview

```
React Frontend
      |
      |  POST /scan
      v
Express Backend
      |
      |--> VirusTotal API
      |--> AbuseIPDB API
      |
Risk Normalization + Scoring
      |
   Firebase Firestore
```

All third-party API calls will be handled exclusively by the backend to protect sensitive API keys and to centralize automation logic.

---

## Setup

### Prerequisites

* Node.js (v18+ recommended)
* npm or yarn
* API keys for VirusTotal and AbuseIPDB

### Backend Setup

TBD

### Frontend Setup

TBD

---

## Learning Journey
### January 19, 2026
Today, I began setting up my project. 



### Inspiration

The idea for Picket came from observing how much time security practitioners spend manually checking indicators across different tools. I wanted to build a system that performs this repetitive guard duty automatically, allowing analysts to focus on higher-level decision-making.

### What I Learned

TBD

### Potential Impact

TBD

---

## Technical Rationale

### Backend & Frontend Structure

I will intentionally separate frontend and backend responsibilities to:

* Protect API keys and sensitive configuration
* Centralize scoring and automation logic
* Keep the frontend focused on presentation and user interaction

### Key Tradeoffs

* **Firebase vs MongoDB:** Firebase was chosen to minimize setup complexity and deployment risk within a short timeline, allowing me to focus on automation logic rather than database management.
* **Rule-based scoring:** I will use deterministic scoring rules to keep risk decisions transparent and explainable, prioritizing clarity over complexity.

### Most Difficult Technical Challenge

TBD

---

## AI Usage

I used ChatGPT as a development assistant to:

* Brainstorm system architecture

**Example:**
I prompted ChatGPT to provide me with the strengths of both Firebase and MongoDB. I then completed further research to decide which database would be best for my project. 

---

## Future Work

TBD

---

## Screenshots / Demo

*(Will add screenshots or a short demo GIF here once available)*

---

## Author

**Kaden Williams**
