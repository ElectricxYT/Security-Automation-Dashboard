# Picket – Security Automation Dashboard

## Overview

**Picket** is a full-stack Security Automation Dashboard that acts as an automated sentry for threat intelligence analysis. Much like a military picket performs guard duty by monitoring and reporting potential threats, Picket continuously evaluates suspicious indicators using multiple security data sources and delivers a clear, automated verdict.

Instead of relying on manual lookups across different platforms, Picket aggregates and correlates threat intelligence from multiple APIs, applies deterministic scoring logic, and presents the results through an interactive dashboard to inform users on the security of websites and IP Adresses. 

## Why This Project?

This project was built as a foundational project aligned with my interest in security automation and backend engineering. I hope to use this project to learn new skills relating to JavaScript, React, HTML/CSS, Express, and Firebase, thus furthering my goal of expanding my skill set and acquiring a diverse Computer Science education/skillset.

## How Will it Work?

Picket will start out as a Minimum Viable Project (MVP) Security Automation Dashboard that will:
1. Take either a domain or an IP Address from the user via a React GUI
2. Analyze that domain or ip address to determine whether it is risky or not by querying multiple threat intelligence APIs (VirusTotal and AbusIPDB, to start)
3. Store that domain/ip address and its score within a Firebase database (indicator value, indicator type, timestamp, API results, final risk score, and verdict)
4. Output to the user the final risk score, the verdict label, and the breakdown by source

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
* JavaScript
* HTML/CSS

### Backend

* Node.js
* Express
* Axios
* JavaScript

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
### Day Three
On Day Three, I implemented the risk scoring algorithm, verified that the IP request to VirusTotal worked end-to-end, tweaked the risk scoring further, and configured VirusTotal to take in domains, as well as set up the AbuseIPDB API
 - I translated the second draft of my risk scoring algorithm into JavaScript and wrote the code below the imports and constraints and above the routes.
 - To verify that everything worked end-to-end, I ran the backend using the 'node index.js' command in PowerShell and tested Google's IP Address (8.8.8.8). See "Day 3 Progress" under the Screenshots / Demo section below.
 - Then, I duplicated the code for requesting IP data from VirusTotal and altered it to work for domains.
 - To implement AbuseIPDB, I followed the same steps as implementing VirusTotal:
   * I added the AbuseIPDB API Key to the .env file
   * I followed the exact same format as VirusTotal's get functions. Because AbuseIPDB doesn't have the stats "harmless" or "reputation", I created a new calculateRisk method that omits taking in reputation as a parameter and similarly evaluates the score to the calculateRisk method that VirusTotal will use. 
   * Because AbuseIPDB is IP focused, any domain provided will need to be resolved to an IP using Node's DNS (Domain Name Sysem, Port 53, translates website names into IP addresses) module
   * Finally, since AbuseIPDB does not provide the number of malicious, harmless, suspicious, or timeout reports from security engines, I decided to map the abuseConfidenceScore onto these values. That way, the risk functions will treat both APIs consistently. I chose a threshold of 50 so that a majority (> 50) will lead to an increased negative report.
### Day Four
On Day Four, I finished the backend of Picket and created the base of the frontend. 
 - I started by creating a calculateFinalRisk method that would take in the risk scores from both VirusTotal and AbuseIPDB and come to a verdict on what the risk score should be. The higher risk score wins, as false negatives are always better than false positives.
 - Then, I consolidated all four endpoints into two endpoints that query both APIs when passed either an IP or domain.
 - Next, I implemented risk scale mapping to convert each of the five risk scores to numbers, thus allowing easier implementation with the frontend.
At last, the base of Picket's backend was complete! It was then time to setup the frontend. Because the starting goal of Picket was to get setup as a MVP, I wanted to keep the frontend simple for now. As such, I designed the frontend file structure as follows:
   ```
   frontend/
      ├── index.html
      ├── style.css
      └── app.js
   ```
 - In order to prevent my browser from blocking requests from my localhost site, I downloaded CORS to enable browser fetch.
 - After that, I worked on index.html. index.html handles the layout and input as well as links style.css and loads app.js.
 - To see the frontend webpage as I worked, I downloaded the Live Server extension via Visual Studio Code (See Screenshots/Demo).
 - After completing the index.html, style.css, and app.js files, I tested Picket's front end by first opening the backend and then loading the website for the frontend (See Screenshots/Demo). 
### Day Five
On Day Five, I wrapped up the core of what would be Picket by moving the frontend to React, implementing a Firebase Firestore database, and displaying the stats collected from both APIs on the frontend once an IP Address or domain is queried, simultaneously expanded UI data. 
 - First, I created the React app and implemented it into the frontend by using Vite, with the experimental Rolldown included. Once it was installed, I deleted the src/assets/ and app.css files, changed my PowerShell directory to the picket-frontend folder I created, and then used "npm run dev" to run React. This provided me with a base webpage that proved React was running correctly.
 - Then, I began rebuilding the Picket webpage. I started by re-implementing the input button by altering the code within app.jsx. After that, I added results panels for both VirusTotal and AbuseIPDB so that the user can see the stats that contributed to Picket's final risk score (See Screenshots/Demo).
 - After making the UI more resilient to crashes, I repositioned the UI elements to be more centered and mapped the risk labels to respective colors (e.g, Low = bright green, High = Red).
 - Finally, I ensured that two panels containing the stats from both APIs would be displayed underneath the input bar once the user submitted an IP Address or domain.
 - Once the frontend was complete, it was time to implement the Firestore database. I first created a project for Picket via firebase.google.com.
 - Then, I set up a collection (query: 8.8.8.8, type: ip) and created a firebase.js file within the src file of the frontend.
 - Finally, I imported both the Firebase app and Firestore, configured the required firebase information for the API (API key, appId, projectId, etc), and initialized both Firebase and Firestore.
   * To ensure that the database was configured correctly, I tested it with a query to both the 8.8.8.8 ip and the google.com domain.
 - Lastly, I deployed Picket using the Firebase CLI. I ran "firebase init hosting" and "npm run build" in PowerShell from within the frontend directory to begin initializing the deployment before running "firebase deploy" to deploy Picket and receive the Host URL. Then, I ran "firebase init functions" to add Cloud functions so Firebase could host Picket's Express backend. After that, I stored both API keys as secrets and ran "firebase deploy --only functions" to deploy Picket

### Inspiration

I decided to work on creating a security automation dashboard to gain experience as a full-stack developer while simultaneously learning how security automation dashboards function and how APIs make them possible, all through a hands-on project. The idea for Picket came from observing how much time security practitioners spend manually checking indicators across different tools. I wanted to build a system that performs this repetitive guard duty automatically, allowing analysts to focus on higher-level decision-making. Picket will eventually host dozens of security engine APIs, thus providing security professionals with reliable and accurate information on domains and IPs. 

### What I Learned

Working on Picket has taught me the immense amount of work that goes into creating applications that seem simple on paper, but are really complex in practice. I learned the differences between an application's frontend and backend and how both work in tandem to form an app. Also, working on Picket has taught me the foundations of JavaScript and HTML/CSS. 

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

For this project, I used ChatGPT to assist me with:

* Planning out the risk scoring approach
* Debugging my index.js file
* Debugging my app.js file
* Translating my webpage design into HTML and CSS
* Making the React UI more resilient
  

**Example:**

Looking for ideas on how to approach the risk scoring, I prompted ChatGPT with: "I want Picket to support both ip addresses and domains. That way not only will users be able to query safe websites to visit, but safe machines and users as well. With that in mind, let's focus on the risk scoring. I believe that scoring IPs and domains on a Low, Low-Medium, Medium, Medium-High, High scale would be best, for it is more user friendly than a number range."

---

## Future Work

- Update risk scoring algorithm to involve ratios for security engine reports
- Add more APIs to improve security feedback
- Create a logo for Picket and "pretty up" the webpage
- 

---

## Screenshots / Demo
**Day 3 Progress (Backend Test)**

<img width="345" height="292" alt="Day3BackendTest" src="https://github.com/user-attachments/assets/7da94b5d-2d3a-4b24-965f-7484a93edfd2" />

(The result of my code in index.js on the localhost webpage, Port 3000, requesting IP 1.1.1.1 from VirusTotal)


<img width="345" height="292" alt="Day3BackendTest2" src="https://github.com/user-attachments/assets/05dcd2ca-2114-4bfb-90e9-0a32c258df37" />

(The result of my code in index.js on the localhost webpage, Port 3000, requesting domain google.com from VirusTotal)

<img width="345" height="292" alt="Day3BackendTest3" src="https://github.com/user-attachments/assets/224ebf23-8377-4920-99bb-a28eda3947e8" />

(The result of my code in index.js on the localhost webpage, Port 3000, requesting IP 8.8.8.8 from AbuseIPDB)

<img width="345" height="292" alt="Day3BackendTest4" src="https://github.com/user-attachments/assets/27714c9a-d79a-4444-91fa-84df431fc0b5" />

(The result of my code in index.js on the localhost webpage, Port 3000, requesting domain google.com from AbuseIPDB)

**Day 4 Progress (Frontend Test)**

<img width="345" height="456" alt="Day4FrontEndWork" src="https://github.com/user-attachments/assets/19ab95ae-895c-4943-ac4a-fbfd9e0554d8" />

(Working on Picket's frontend during Day 4, side by side with code)

<img width="345" height="511" alt="Day4FrontEndWork2" src="https://github.com/user-attachments/assets/1dc84ed6-cd01-4c8b-ba54-6a3027141e1f" />

(Testing Picket's webpage on handling IP Addresses)

<img width="345" height="502" alt="Day4FrontEndWork3" src="https://github.com/user-attachments/assets/a115b451-4299-4a36-9638-403a5a5473ab" />

(Testing Picket's webpage on handling domains)

**Day 5 Work (React Implementation and Deployment)**

<img width="345" height="592" alt="Day5ReactImplementation" src="https://github.com/user-attachments/assets/aecee61b-eacd-4262-8628-5892235b6bb2" />

(Moving the frontend to React)

<img width="345" height="592" alt="Day5ReactImplementation2" src="https://github.com/user-attachments/assets/67d14209-6b7f-4e6f-aaa0-509d32411e78" />

(Re-implementing the input bar and two risk score labels )

<img width="345" height="592" alt="Day5ReactImplementation3" src="https://github.com/user-attachments/assets/5860e5d7-f0cf-4515-91cb-852d7b8c8ac2" />

(Centerting everything)





---

## Author

**Kaden Williams**
