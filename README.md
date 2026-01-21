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

### Backend

* Node.js
* Express
* Axios
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
On Day Two, I finished testing requests to both APIs, decided on which signals to use for risk scoring, and designed the risk scoring algorithm.
 - After testing an API request to VirusTotal and receiving a long JSON output back, I scanned the output for useful signals to factor into the risk score.
 - Originally, I started drafting how the risk score logic could work:
   ```
   Given (tested on 8.8.8.8, or Google):
   
   "last_analysis_stats": {
   "malicious": 0,
   "suspicious": 0,
   "undetected": 31,
   "harmless": 62,
   "timeout": 0
   }
   "reputation": 527

   //Risk scoring logic draft
   If # of harmless > # of malicious, reputation > 0, and # of malicious is 0, risk == Low.
   If # of harmless > # of malicious, reputation > 0, but # of malicious > 0, risk == Low-Medium.
   If # of harmless is within +-10 of # of malicious and reputation is between -200 and 200 or # of malicious > 0 and # of suspicious > 0, risk == Medium.
   If # of harmless < # of malicious and reputation < 0 and # of suspicious > 0, risk == Medium-High.
   If harmless == 0 or # of malicious > 0 and # of suspicious > 0 and timeout > 0 and reputation < 0, risk == High.
   ```
   - The rationale behind this approach was tho use and blend multiple signals to mimic real threat scoring models and avoid single source errors.
   - To learn about flaws with my logic, I prompted ChatGPT with "For the risk scoring, what logic flaws might I encounter with this risk scoring logic outline: [Risk scoring logic draft here]".
     * From this, I learned
     * 1. Many bad IPs have a larger number of harmless reports opposed to malicious reports, and so malicious presence should outweigh harmless volume.
     * 2. Repeating conditions (such as # of malicous > 0) introduce ambiguity. As a software engineer, I should ask myself "If multiple rules match, which one should win?"
     * 3. harmless == 0 is extremely rare
   - Using this feedback, I adjusted the risk scoring model to follow a layered model where red flags would immediately result in a higher risk score, mixed signals would result in a middle risk score, and a general, safe consensus would result in a lower risk score. Picket will adopt a security philosophy where if there is a slight hint of malicious-ness, the score can never be "Low". Although false positives are possible and prevalent, if there is a slight chance that a website or IP is malicious, then the user should be made aware of that slight chance. That one malicious report could be fake, but it's just like exploring a sound in the middle of the woods at night: better to not find out what it really is.
   - Because I would rather have a website be rated more malicious than it is over rating it as less malicious than it actually is, I will construct the if statement hierarchy to move from a risk score rating of High > Medium-High > Medium > Low - Medium > Low. As such, I designed this second draft for the risk scoring logic:
   ```
   If malicious_count > 0 and (suspicious_count > 0 or reputation < 0 or timeout_count > 0), Risk == High
   If malicious_count > 0 and reputation <= 0 and suspicious_count > 0, Risk == Medium-High
   If malicious_count > 0 and reputation >= 0 and suspicious_count == 0, Risk == Medium 
   If malicious_count == 0 and harmless_count > 0 and reputation > 0, Risk == Low-Medium
   If malicious_count == 0 and harmless_count > 0 and reputation > 0 and suspicious_count == 0 and timeout_count == 0, Risk == Low
   ```

### Inspiration

The idea for Picket came from observing how much time security practitioners spend manually checking indicators across different tools. I wanted to build a system that performs this repetitive guard duty automatically, allowing analysts to focus on higher-level decision-making. Creating this system would additionally help me learn Full-Stack and associated skills and concepts, such as APIs, JavaScript, Node.js (Express, Axios, npm), React, and Firebase. 

### What I Learned

Working on Picket has taught me:
- The foundations of JavaScript <--- Day One
- What an Advanced Programming Interface (API) is and how they work within Full-Stack applications <--- Day One
- How an API Request makes a HTTP GET request to a specific URL with 1) an API key and 2) input (e.g. an IP or domain) to receive a JSON back, all done through the backend <--- Day One
- What Node.js is (a runtime environment that allows JavaScript to run outside of the browser, where it used to be confinded, and includes the npm package manager and node for runtime) and how to install it <--- Day One
- How to setup the backend of a full-stack application using PowerShell, File Explorer, and Visual Studio Code <--- Day One
- What Axios is (a library that lets the backend make HTTP requests to other servers, protecting against XSRF and providing automatic JSON transformation) and how to install it <--- Day One
- Why an API key should be stored within an environment variable (ensures confidentiality) <--- Day Two
- How to make an API Request using my API Key, receiving a JSON back to scan for data <--- Day Two
- How to plan and design a layered risk scoring system to avoid ambiguity and prevent false lows. <--- Day Two

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
