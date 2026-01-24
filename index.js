/**
 * Picket Backend Server
 *
 * This server provides endpoints to query VirusTotal for IP address information
 * and calculate a risk score based on the analysis stats and reputation.
 * All comments written by the author Kaden Williams for future learning purposes.
 * @author Kaden Williams, January 2026
 */

require("dotenv").config(); //Load and configure the dotenv package

const axios = require("axios"); //Load the axios package for making HTTP requests

const express = require("express"); //Load the express package for creating the server

const dns = require("dns").promises; // Use promises-based DNS

const app = express(); //Create an instance of an Express application, stored in constant variable 'app'

const PORT = 3000; //Set the port number for the server to listen on

/**
 * Calculate Picket risk score from VirusTotal stats
 * See GitHub README for more risk calculation details
 * @param {Object} stats - VirusTotal stats object
 * @param {number} reputation - VirusTotal reputation score
 * @returns {string} - Risk
 */
function calculateVirusTotalRiskScore(stats, reputation) {
  const { harmless, malicious, suspicious, timeout } = stats;

  const safeTimeout = timeout ?? 0; //If timeout is undefined, set it to 0

  if (malicious > 0 && (suspicious > 0 || reputation < 0 || safeTimeout > 0)) {
    return "High";
  }

  if (malicious > 0 && reputation <= 0 && safeTimeout > 0) {
    return "Medium-High";
  }

  if (malicious > 0 && reputation === 0 && suspicious > 0) {
    return "Medium";
  }

  if (malicious > 0 && reputation > 0) {
    return "Low-Medium";
  }

  if (
    malicious === 0 &&
    suspicious === 0 &&
    safeTimeout === 0 &&
    harmless > 0 &&
    reputation > 0
  ) {
    return "Low";
  }

  return "Medium"; //If the IP address somehow doesn't meet any of the above conditions, its risk is iffy. Return "Medium"
}

/**
 * Calculate Picket risk score from AbuseIPDB stats
 * See GitHub README for more risk calculation details
 * @param {Object} stats - Stats object
 * @returns {string} - Risk label
 */
function calculateAbuseIPDBRiskScore(stats) {
  const { harmless, malicious, suspicious } = stats;

  if (malicious > 0 && suspicious > 0) {
    return "High";
  }

  if (malicious > 0 && suspicious === 0) {
    return "Medium-High";
  }

  if (malicious === 1 && harmless === 0 && suspicious === 0) {
    return "Medium";
  }

  if (malicious === 1 && harmless > 0 && suspicious === 0) {
    return "Low-Medium";
  }

  if (malicious === 0 && suspicious === 0 && harmless > 0) {
    return "Low";
  }

  return "Medium"; // fallback
}

/**
 * Calculate final risk score from both VirusTotal and AbuseIPDB risks scores
 * @param {*} vtRisk
 * @param {*} abuseRisk
 * @returns
 */
function calculateFinalRisk(vtRisk, abuseRisk) {
  const riskOrder = ["Low", "Low-Medium", "Medium", "Medium-High", "High"];

  const vtIndex = riskOrder.indexOf(vtRisk);
  const abuseIndex = riskOrder.indexOf(abuseRisk);

  if (vtIndex === -1 && abuseIndex === -1) {
    //If both risks are invalid
    return "Medium"; //Fallback on medium
  }

  if (vtIndex === -1) {
    return abuseRisk; //If only VirusTotal risk is invalid, return AbuseIPDB risk
  }

  if (abuseIndex === -1) {
    return vtRisk; //If only AbuseIPDB risk is invalid, return VirusTotal risk
  }

  const safeVtIndex = vtIndex === -1 ? 2 : vtIndex; //If VirusTotal risk is invalid, set it to medium index
  const safeAbuseIndex = abuseIndex === -1 ? 2 : abuseIndex; //If AbuseIPDB risk is invalid, set it to medium index
  const finalRiskIndex = Math.max(safeVtIndex, safeAbuseIndex); //Take the higher risk index
  return riskOrder[finalRiskIndex];
}

/**
 * Checks whether the user's input is an IP address or domain
 * @param {} input
 * @returns
 */
function isIpAddress(input) {
  return /^(?:\d{1,3}\.){3}\d{1,3}$/.test(input);
}

/**
 * Root endpoint to verify server is running
 * Works by:
 * 1. Sending a request to the root URL '/'
 * 2. (Express) building the 'req' object
 * 3. The code reads from 'req'
 * 4. The code writes to the 'res' object
 */
app.get("/", (req, res) => {
  //Define a GET endpoint at the root URL '/'
  res.send("Picket backend is running"); //Send a response to indicate that the server is running
});

/**
 * Start the server and listen on the specified port
 */
app.listen(PORT, () => {
  //Start the server and listen on the specified port 'PORT'
  console.log(`Server listening on port ${PORT}`); //Log a message to the console to indicate that the server is running
});

/**
 * Query VirusTotal for IP verdict
 * @param {*} ip
 * @returns
 */
async function queryVirusTotalIp(ip) {
  const response = await axios.get(
    `https://www.virustotal.com/api/v3/ip_addresses/${ip}`,
    { headers: { "x-apikey": process.env.VIRUSTOTAL_API_KEY } },
  );

  const stats = response.data.data.attributes.last_analysis_stats;
  const reputation = response.data.data.attributes.reputation;
  const risk = calculateVirusTotalRiskScore(stats, reputation);

  return { risk, stats, reputation };
}

/**
 * Query VirusTotal for domain verdict
 * @param {} domain
 * @returns
 */
async function queryVirusTotalDomain(domain) {
  const response = await axios.get(
    `https://www.virustotal.com/api/v3/domains/${domain}`,
    { headers: { "x-apikey": process.env.VIRUSTOTAL_API_KEY } },
  );

  const stats = response.data.data.attributes.last_analysis_stats;
  const reputation = response.data.data.attributes.reputation;
  const risk = calculateVirusTotalRiskScore(stats, reputation);

  return { risk, stats, reputation };
}

/**
 * Query AbuseIPDB for both IP and Domain verdict
 * @param {*} ip
 * @returns
 */
async function queryAbuseIPDB(ip) {
  const response = await axios.get("https://api.abuseipdb.com/api/v2/check", {
    params: { ipAddress: ip, maxAgeInDays: 90 },
    headers: {
      Key: process.env.ABUSEIPDB_API_KEY,
      Accept: "application/json",
    },
  });

  const abuseScore = response.data.data.abuseConfidenceScore;

  const stats = {
    malicious: abuseScore > 50 ? 1 : 0,
    suspicious: abuseScore > 0 && abuseScore <= 50 ? 1 : 0,
    harmless: abuseScore === 0 ? 1 : 0,
  };

  const risk = calculateAbuseIPDBRiskScore(stats);

  return { risk, abuseConfidenceScore: abuseScore };
}

/**
 * Endpoint to get verdict for either IP or domain
 */
app.get("/verdict/:target", async (req, res) => {
  try {
    const target = req.params.target;
    const isIp = isIpAddress(target);

    let vtResult;
    let abuseResult;

    if (isIp) {
      vtResult = await queryVirusTotalIp(target);
      abuseResult = await queryAbuseIPDB(target);
    } else {
      const ips = await dns.resolve4(target);
      const ip = ips[0];

      vtResult = await queryVirusTotalDomain(target);
      abuseResult = await queryAbuseIPDB(ip);
    }

    // Final verdict
    const vtIndex = [
      "Low",
      "Low-Medium",
      "Medium",
      "Medium-High",
      "High",
    ].indexOf(vtResult.risk);
    const abuseIndex = [
      "Low",
      "Low-Medium",
      "Medium",
      "Medium-High",
      "High",
    ].indexOf(abuseResult.risk);

    const finalRiskIndex = Math.max(vtIndex, abuseIndex);
    const finalRisk = ["Low", "Low-Medium", "Medium", "Medium-High", "High"][
      finalRiskIndex
    ];

    res.json({
      target,
      type: isIp ? "ip" : "domain",
      verdict: finalRisk,
      sources: {
        virustotal: vtResult,
        abuseipdb: abuseResult,
      },
    });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).send("Error generating verdict");
  }
});
