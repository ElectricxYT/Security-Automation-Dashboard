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

const app = express(); //Create an instance of an Express application, stored in constant variable 'app'

const PORT = 3000; //Set the port number for the server to listen on

/**
 * Calculate Picket risk score from VirusTotal stats
 * See GitHub README for more risk calculation details
 * @param {Object} stats - VirusTotal stats object
 * @param {number} reputation - VirusTotal reputation score
 * @returns {string} - Risk
 */
function calculateRisk(stats, reputation) {
  const { 
    harmless, 
    malicious,
    suspicious,
    timeout
  } = stats;

  if (
    malicious > 0 &&
    (suspicious > 0 || reputation < 0 || timeout > 0)
  ) {
    return "High";
  }

  if (
    malicious > 0 &&
    reputation <= 0 &&
    timeout > 0
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
    timeout === 0 &&
    harmless > 0 &&
    reputation > 0
  ) {
    return "Low";
  }

  return "Medium"; //If the IP address somehow doesn't meet any of the above conditions, its risk is iffy. Return "Medium"
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

/**
 * Endpoint to query VirusTotal for IP address information
 */
app.get("/test/vt/ip/:ip", async (req, res) => { //Define a GET endpoint at "/test/vt/ip/:ip"
  try { //If there is an error during the execution of this code, the catch block will execute 
    const ip = req.params.ip; //Extract the IP address from the request parameters

    const response = await axios.get( //Make an asynchronous GET request to the VirusTotal API using axios

      `https://www.virustotal.com/api/v3/ip_addresses/${ip}`, //Construct the URL for the VirusTotal API endpoint using the extracted IP address
      { 
        headers: { //Set the headers for the request
          "x-apikey": process.env.VIRUSTOTAL_API_KEY //Use the API key stored in the environment variable 'VIRUSTOTAL_API_KEY' to authenticate the request
        }
      }
    );

    const stats = response.data.data.attributes.last_analysis_stats; //Save the analysis stats from the response data in constant 'stats'
    const reputation = response.data.data.attributes.reputation; //Save the reputation score from the response data in constant 'reputation'

    const risk = calculateRisk(stats, reputation); //Calculate the risk score using the 'calculateRisk' function with the extracted stats and reputation score

    //
    res.json({ //Tells Express to send a JSON response to the client containing the following data:
      ip,
      risk,
      stats,
      reputation,
      raw: response.data //'raw' returns everything to the backend, and the frontend will choose what to display
     });

 //Send the response data from the VirusTotal API back to the client as JSON
  } catch (error) { //If an error occured during execution of the try block,
    console.error(error.response?.data || error.message); //Log the error message to the console
    res.status(500).send("Error querying VirusTotal"); //Send a 500 Internal Server Error response to the client with a message indicating that there was an error querying VirusTotal
  }
});
