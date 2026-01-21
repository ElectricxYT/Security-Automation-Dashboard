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
* npm or yarn (for Picket, I opted for npm)
* API keys for VirusTotal and AbuseIPDB

### Backend Setup

TBD

### Frontend Setup

TBD

---

## Learning Journey
### Day One
On Day One, I began by planning how to approach and setup my project. 
 - Because the first step is for a user to input either a domain or IP Address, I decided to start with setting up the backend of Picket.
 - Like with my Password Strength Analyzer Project, I first brainstormed how the provided domain or IP Address's risk score would be calculated. I settled on a scale of "Low, Low-Medium, Medium, Medium-High, High" for its more intuitive and user friendly. The backend processes will equate all 5 with rule based lables (ex: if flagged by >= 4 venders, then risk score = Medium-High).
 - The signals received from both APIs (Number of vendors flagging malicious, abuse confidence score, etc) will factor into the risk score of the domain/IP Address. As such, Picket assigns risk labels based on the presence and strength of known malicious indicators reported by trusted threat intelligence sources (VirusTotal and AbuseIPDB).
 - I registered both a VirusTotal and AbuseIPDB account to gain access to both of their APIs. I then ran a test request to each of them and searched through the JSON responses for useful signals to use when calculating a domain/IP Address's risk score.
   * First, I learned how to make API requests to both VirusTotal and AbuseIPDB.
   * Then, I decided to have Picket use Axios to make HTTP requests from the Express backend. Axios will do only one thing: send HTTP requests and return responses.
   * Next, I began setting up my backend to test requesting from the APIs. I first downloaded Visual Studio Code as well as Node.js and its corresponding npm. I created a folder for the backend of Picket and    opened it with both VS Code and Powershell, running "node -v" and "npm -v" in the Powershell terminal to ensure that both were installed correctly. I then used the "npm init" command to create the package.json, which immediately appeared within my backend folder and within Visual Studio Code.
   * After that, it was time to install Express, what will be the middle man between the frontend and the two APIs. I did this by running "npm install express" in Powershell, to which "package-lock.json" and a dropdown called "node_modules" appeared.
   * To test my backend, I created a file within VS Code called "index.js" and made a HTTP GET request to PORT 3000, outputting to the console "Picket backend is running" to test whether Picket's Express backend was up and running.
   * Next, it was time to download Axios. To do this, I ran "npm install axios" in the Powershell terminal.
   * Finally, I stored my API key within an environmental variable so as to ensure confidentiality. So that Node can read the file in which I stored my API key, I installed dotenv. 
### Day Two
On Day Two, I finished testing requests to both APIs and decided on which signals to use for risk scoring.


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

To assist me in completing my project, I employed the help of ChatGPT. To ensure that I learned from this project, I set ChatGPT as my assistant and commited into its memory that I will be the one "calling the shots". I then forbade ChatGPT from providing me with full answers or writing out full code for me, and instructed it to instead lead me in the right direction when prompted. 

For this project, I used ChatGPT to:

* Plan out the risk scoring approach 

**Example:**

Looking for ideas on how to approach the risk scoring, I prompted ChatGPT with: "I want Picket to support both ip addresses and domains. That way not only will users be able to query safe websites to visit, but safe machines and users as well. With that in mind, let's focus on the risk scoring. I believe that scoring IPs and domains on a Low, Low-Medium, Medium, Medium-High, High scale would be best, for it is more user friendly than a number range."

---

## Future Work

TBD

---

## Screenshots / Demo

*(Will add screenshots or a short demo GIF here once available)*

---

## Author

**Kaden Williams**
