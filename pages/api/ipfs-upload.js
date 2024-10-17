// /pages/api/ipfs-upload.js
import axios from 'axios';

export default async function handler(req, res) {
  try {
    const metadata = req.body;
    const response = await axios.post('https://ipfs.infura.io:5001/api/v0/add', metadata, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    res.status(200).json({ cid: response.data.Hash }); // Return the CID (IPFS hash)
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    res.status(500).json({ error: 'Failed to upload to IPFS' });
  }
}
