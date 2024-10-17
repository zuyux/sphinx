// /pages/api/ipfs.js
import axios from 'axios';

export default async function handler(req, res) {
  const { cid } = req.query;  // Get the CID from the query

  if (!cid) {
    return res.status(400).json({ error: 'CID is required' });
  }

  try {
    // Replace with the IPFS gateway URL
    const ipfsUrl = `https://ipfs.io/ipfs/${cid}`;

    // Fetch the data from the IPFS gateway
    const response = await axios.get(ipfsUrl);

    // Extract the relevant data (question and context) from the response
    const { question, context } = response.data;

    // Ensure the data contains what we expect
    if (!question || !context) {
      return res.status(400).json({ error: 'Invalid metadata structure' });
    }

    // Send the question and context back to the client
    res.status(200).json({ question, context });
  } catch (error) {
    console.error('Error fetching IPFS data:', error);
    res.status(500).json({ error: 'Failed to fetch IPFS data' });
  }
}
