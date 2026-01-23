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
  const { 
    harmless, 
    malicious,
    suspicious,
    timeout
  } = stats;

  const safeTimeout = timeout ?? 0; //If timeout is undefined, set it to 0

  if (
    malicious > 0 &&
    (suspicious > 0 || reputation < 0 || safeTimeout > 0)
  ) {
    return "High";
  }

  if (
    malicious > 0 &&
    reputation <= 0 &&
    safeTimeout > 0
  ) {
    return "Medium-High";
  }

  if (
    malicious > 0 &&
    reputation === 0 &&
    suspicious > 0
  ) {
    return "Medium";
  }

  if (
    malicious > 0 &&
    reputation > 0
  ) {
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
function calculateFinalRisk(vtRisk, abuseRisk){
  const riskOrder = ["Low", "Low-Medium", "Medium", "Medium-High", "High"];

  const vtIndex = riskOrder.indexOf(vtRisk);
  const abuseIndex = riskOrder.indexOf(abuseRisk);
  
  if (vtIndex === -1 && abuseIndex === -1) { //If both risks are invalid
    return "Medium"; //Fallback on medium
  }

  if (vtIndex === -1){
    return abuseRisk; //If only VirusTotal risk is invalid, return AbuseIPDB risk
  }

  if (abuseIndex === -1){
    return vtRisk; //If only AbuseIPDB risk is invalid, return VirusTotal risk
  }

  const finalRiskIndex = Math.max(vtIndex, abuseRisk); //Take the higher risk index
  return riskOrder[finalRiskIndex]; 
}


/**
 * Root endpoint to verify server is running
 * Works by:
 * 1. Sending a request to the root URL '/'
 * 2. (Express) building the 'req' object
 * 3. The code reads from 'req'
 * 4. The code writes to the 'res' object
 */
app.get("/", (req, res) => { //Define a GET endpoint at the root URL '/'
  res.send("Picket backend is running"); //Send a response to indicate that the server is running
});

/**
 * Start the server and listen on the specified port
 */
app.listen(PORT, () => { //Start the server and listen on the specified port 'PORT'
  console.log(`Server listening on port ${PORT}`); //Log a message to the console to indicate that the server is running
});



// IP ENDPOINT


/**
 * Endpoint to query both VirusTotal and AbuseIPDB for an IP address and
 * generate a final risk score verdict
 */
app.get("/test/vt/ip/:ip", async (req, res) => { //Define a GET endpoint at "/test/vt/ip/:ip"
  try { //If there is an error during the execution of this code, the catch block will execute 
    const ip = req.params.ip; //Extract the IP address from the request parameters

    // ** VirusTotal API Request **
    const vtResponse = await axios.get( //Make an asynchronous GET request to the VirusTotal API using axios

      `https://www.virustotal.com/api/v3/ip_addresses/${ip}`, //Construct the URL for the VirusTotal API endpoint using the extracted IP address
      { 
        headers: { //Set the headers for the request
          "x-apikey": process.env.VIRUSTOTAL_API_KEY //Use the API key stored in the environment variable 'VIRUSTOTAL_API_KEY' to authenticate the request
        }
      }
    );

    const vtStats = vtResponse.data.data.attributes.last_analysis_stats; //Save the analysis stats from the response data in constant 'stats'
    const vtReputation = vtResponse.data.data.attributes.reputation; //Save the reputation score from the response data in constant 'reputation'

    const vtRisk = calculateVirusTotalRiskScore(vtStats, vtReputation); //Calculate the risk score using the 'calculateRisk' function with the extracted stats and reputation score

    // **AbuseIPDB**
    const abuseResponse = await axios.get(
      `https://api.abuseipdb.com/api/v2/check`, 
      {
        params: { ipAddress: ip, maxAgeInDays: 90},
        headers: {
          Key: process.env.ABUSEIPDB_API_KEY,
          Accept: "application/json"
        }
      }
    );

    const abuseScore = abuseResponse.data.data.abuseConfidenceScore;

    const abuseStats = {
      malicious: abuseScore > 50 ? 1 : 0,
      suspicious: abuseScore > 0 && abuseScore <= 50 ? 1 : 0,
      harmless: abuseScore === 0 ? 1 : 0,
    };

    const abuseRisk = calculateAbuseIPDBRiskScore(abuseStats);

    // **Final Verdict**
    const finalRisk = calculateFinalRisk(vtRisk, abuseRisk); //Calculate the final risk score based on both VirusTotal and AbuseIPDB risk scores

    res.json({
      ip,
      verdict: finalRisk,
      sources: {
        virustotal: {
          risk: vtRisk,
          stats: vtStats,
          reputation: vtReputation
        },
        abuseipdb: {
          risk: abuseRisk,
          abuseConfidenceScore: abuseScore
        }
      }
    });

  } catch (error){
    console.error(error.response?.data || error.message); //Log the error message to the console
    res.status(500).send("Error generating a final verdict");
  }
});
    


// DOMAIN ENDPOINT

/**
 * Endpoint to query both VirusTotal and AbuseIPDB for a domain and
 * generate a final risk score verdict
 */
app.get("/test/vt/domain/:domain", async (req, res) => {
  try {
    const domain = req.params.domain;

    const ips = await dns.resolve4(domain);
    if (!ips || ips.length === 0) {
      return res.status(404).send("Could not resolve domain to IP");
    }

    const ip = ips[0]; // Take first IP
    if (!ip) {
      return res.status(404).send("Could not resolve domain to IP");
    }

    // **VirusTotal Domains**

    const vtResponse = await axios.get(
      `https://www.virustotal.com/api/v3/domains/${domain}`,
      {
        headers: {
          "x-apikey": process.env.VIRUSTOTAL_API_KEY
        }
      }
    );

    const vtStats = vtResponse.data.data.attributes.last_analysis_stats;
    const vtReputation = vtResponse.data.data.attributes.reputation;
    const vtRisk = calculateVirusTotalRiskScore(vtStats, vtReputation);

    // **AbuseIPDB Domains (resolved to IP)**
    const abuseResponse = await axios.get(
      `https://api.abuseipdb.com/api/v2/check`,
      {
        params: { ipAddress: ip, maxAgeInDays: 90 },
        headers: {
          Key: process.env.ABUSEIPDB_API_KEY,
          Accept: "application/json"
        }
      } 
    );

    const abuseScore = abuseResponse.data.data.abuseConfidenceScore;

    const abuseStats = {
      malicious: abuseScore > 50 ? 1 : 0,
      suspicious: abuseScore > 0 && abuseScore <= 50 ? 1 : 0,
      harmless: abuseScore === 0 ? 1 : 0
    };

    const abuseRisk = calculateAbuseIPDBRiskScore(abuseStats);

    // **Final Verdict**
    const finalRisk = calculateFinalRisk(vtRisk, abuseRisk);

    res.json({
      domain,
      resolvedIp: ip,
      verdict: finalRisk,
      sources: {
        virustotal: {
          risk: vtRisk,
          stats: vtStats,
          reputation: vtReputation
        },
        abuseipdb: {
          risk: abuseRisk,
          abuseConfidenceScore: abuseScore
        }
      }
    });

  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).send("Error generating Picket domain verdict");
  }
});
