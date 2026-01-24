/**
 * Frontend JavaScript for Picket application
 * 
 * Handles user input, fetches verdict from backend, and updates UI accordingly
 * @author Kaden Williams
 */

/**
 * Handle Enter key press to submit target
 * @param {*} event 
 */
function handleEnter(event) {
  if (event.key === "Enter") {
    submitTarget();
  }
}

/**
 * Uses entered target to fetch verdict from backend
 * @returns 
 */
async function submitTarget() {
  const input = document.getElementById("targetInput").value.trim();
  if (!input) return;

  try {
    const response = await fetch(`http://localhost:3000/verdict/${input}`);
    const data = await response.json();
    displayResults(data);
  } catch (error) {
    alert("Error fetching verdict.");
    console.error(error);
  }
}

/**
 * Display the results on the webpage
 * @param {*} data 
 */
function displayResults(data) {
  const resultsDiv = document.getElementById("results");
  const verdictLabel = document.getElementById("verdictLabel");
  const riskBar = document.getElementById("riskBar");
  const scoreText = document.getElementById("scoreText");

  const label = data.verdict.label;
  const score = data.verdict.score;

  verdictLabel.innerText = `Final Verdict: ${label}`;
  scoreText.innerText = `Risk Score: ${Math.round(score * 100)}%`;

  riskBar.style.width = `${score * 100}%`;
  riskBar.className = "risk-bar " + riskClass(label);

  resultsDiv.classList.remove("hidden");
}

/**
 * Link risk label to CSS class for styling
 * @param {*} label 
 * @returns 
 */
function riskClass(label) {
  switch (label) {
    case "Low": return "low";
    case "Low-Medium": return "low-medium";
    case "Medium": return "medium";
    case "Medium-High": return "medium-high";
    case "High": return "high";
    default: return "";
  }
}
