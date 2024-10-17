import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { txid } = req.query;

  if (!txid) {
    return res.status(400).json({ error: 'TXID is required' });
  }

  try {
    const response = await axios.get(`https://stacks-node-api.testnet.stacks.co/extended/v1/tx/${txid}`);
    
    // Forward the data from the external API to the client
    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Error fetching TXID data:', error);
    return res.status(500).json({ error: 'Failed to fetch transaction data' });
  }
}
