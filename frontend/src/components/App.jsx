/**
 * Picket Frontend Application implemented with React
 * 
 * Handles user input, fetches verdict from backend, and updates UI accordingly
 * @author Kaden Williams
 */

import { useState } from "react";
import { db } from './firebase';                    // adjust path if firebase.js is in a subfolder
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Map risk labels to colors
const riskColors = {
  "Low":        "#20dd33",     // bright green
  "Low-Medium": "#127a38",     // dark green
  "Medium":     "#f6df0d",     // yellow
  "Medium-High":"#f97316",     // orange
  "High":       "#ec2222",     // red
  // Optional fallbacks
  "Unknown":    "#9ca3af",     // gray
  "N/A":        "#9ca3af",
};

// Inline styles for simplicity
const styles = {
  page: {
  backgroundColor: "#0b1220",
  minHeight: "100vh",
  color: "white",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "2rem",
  fontFamily: "Arial, sans-serif",
  textAlign: "center"
},
  form: {
    marginTop: "1rem",
    marginBottom: "2rem"
  },
  input: {
    padding: "0.5rem",
    width: "250px",
    marginRight: "0.5rem" 
  },
  button: {
    padding:        "0.5rem 1rem",
    cursor:         "pointer",
    backgroundColor: "#60a5fa",    
    color:          "white",
    border:         "1px solid #3b82f6",   // slightly darker blue border (blue-500)
    borderRadius:   "6px",                 // softer corners
    fontWeight:     "500",
  },
  results: {
    marginTop: "0.8rem"
  },
  panels: {
    display: "flex",
    gap: "2rem",
    marginTop: "1rem"
  },
  panel: {
    backgroundColor: "#111a2f",
    padding: "1rem",
    borderRadius: "8px",
    width: "300px"
  }
};

// Component to display results
function App() {
  //State hooks for input, loading, error, and result
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  //Handle form submission
  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError(null);
  setResult(null);

  try {
    const response = await fetch(
      `http://localhost:3000/verdict/${input}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch verdict");
    }

    const data = await response.json();
    setResult(data);

    
    // Save to Firestore right after a good result
    try {
      const scanData = {
        query: input.trim(),                    // the IP or domain entered
        type: input.includes('.') && !input.includes(':') ? 'domain' : 'ip',  // simple guess; improve later if needed
        verdict: {
          score: data.verdict.score,
          label: data.verdict.label,
        },
        sources: {
          virustotal: data.sources?.virustotal || null,
          abuseipdb: data.sources?.abuseipdb || null,
        },
        createdAt: serverTimestamp(),           // automatic server time
        // Optional: add more context later
        // userId: "anonymous",                 // if you add auth later
      };

      const docRef = await addDoc(collection(db, "scans"), scanData);
      
      console.log("Scan saved with ID:", docRef.id);   // for debugging — remove later if you want
    } catch (firestoreErr) {
      console.error("Failed to save to Firestore:", firestoreErr);
      // Optional: show a non-blocking warning in UI
      // setError("Analysis complete, but save to history failed.");
    }
    // ────────────────────────────────────────────────

  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

  return (
    // Main application UI
    <div style={styles.page}>
      <h1 style={{ fontSize: "5rem", marginBottom: "0.2rem" }}>Picket</h1>
      <p style={{ fontSize: "1.5rem", marginTop: 0, color: "#9ca3af" }}>
        Security Automation Dashboard
      </p>

      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          placeholder="Enter IP or domain"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={styles.input}
          required
        />
        <button type="submit" style={styles.button}>
          Analyze
        </button>
      </form>

      {/*Ensures React never renders both loading and error/results at the same time*/}
      {loading && <p>Analyzing…</p>}

      {error && (
        <p style={{ color: "red" }}>
          {error}
        </p>
      )}

      {!loading && !error && result && result.verdict && (
        <Results data={result} />
      )}

    </div>
  );
}

 //Displays the final verdict
 function Results({ data }) {
  if (!data?.sources?.virustotal || !data?.sources?.abuseipdb) {
    return <p>Incomplete analysis data</p>;
  }

  const scorePercent = Math.round(data.verdict.score * 100);
  const label = data.verdict.label || "Unknown";           // safe fallback

  const labelColor = riskColors[label] || "#9ca3af";      // default gray

  return (
    <div style={styles.results}>
      <h2>
        Risk Score: {scorePercent}% (
        <span style={{ color: labelColor, fontWeight: "bold" }}>
          {label}
        </span>
        )
      </h2>

      <div style={styles.panels}>
        <VirusTotalPanel vt={data.sources.virustotal} />
        <AbuseIPDBPanel abuse={data.sources.abuseipdb} />
      </div>
    </div>
  );
}

//VirusTotal results panel. Displays various stats from VirusTotal analysis
function VirusTotalPanel({ vt }) {
  if (!vt) return null;

  const risk = vt.risk ?? 0;
  const stats = vt.stats ?? {};
  return (
    <div style={styles.panel}>
      <h3>VirusTotal</h3>
      <p><strong>Risk:</strong> {risk}</p>
      <p>Malicious: {stats.malicious ?? 0}</p>
      <p>Suspicious: {stats.suspicious ?? 0}</p>
      <p>Harmless: {stats.harmless ?? 0}</p>
      <p>Timeout: {stats.timeout ?? 0}</p>
      <p>Reputation: {vt.reputation ?? "N/A"}</p>

    </div>
  );
}

//AbuseIPDB results panel. Displays various stats from AbuseIPDB analysis
function AbuseIPDBPanel({ abuse }) {
  if (!abuse) return null;

  const risk = abuse.risk ?? 0;
  const score = abuse.abuseConfidenceScore ?? 0;
  return (
    <div style={styles.panel}>
      <h3>AbuseIPDB</h3>
      <p><strong>Risk:</strong> {risk}</p>
      <p>Abuse Confidence Score: {score}</p>
    </div>
  );
}




export default App;
