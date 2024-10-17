import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  bufferCVFromString,
  callReadOnlyFunction,
  cvToJSON
} from '@stacks/transactions';
import axios from 'axios';
import { StacksTestnet } from '@stacks/network';
import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { supabase } from '../../supabase';
import '@/app/locals.css'

const network = new StacksTestnet(); // Using the testnet

// Interface for metadata (question and context)
interface QuestionMetadata {
  question: string;
  context: string;
}

// Define the expected type for user data
interface UserData {
  profile: {
    stxAddress: {
      testnet: string;
    };
  };
  name?: string; 
  image?: string; 
}

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });

export default function Quest() {
  const router = useRouter();
  const { id } = router.query; // Get the contract_id from the URL
  const [metadata, setMetadata] = useState<QuestionMetadata | null>(null);
  const [loading] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [response, setResponse] = useState(''); // User response state

  const fetchMetadataFromContract = useCallback(async (contractAddress: string) => {
    try {
      const [contractAddr, contractName] = contractAddress.split('.');
      const options = {
        contractAddress: contractAddr,
        contractName,
        functionName: 'get-metadata',
        functionArgs: [],
        network,
        senderAddress: 'ST28B2GFEWHR2MXA6P0XNW2GVV9K30HYSC3D9Q0SR',
      };
    
      const result = await callReadOnlyFunction(options);
      const data = cvToJSON(result);
      const ipfsCID = data.value;
      const cid = ipfsCID.value;
    
      const metadata = await fetchMetadataFromProxy(cid);
      setMetadata(metadata);
    } catch (error) {
      console.error('Error fetching metadata from contract:', error);
    }
  }, [network]);

  // Fetch the metadata when the page loads
  useEffect(() => {
    if (id) {
      fetchMetadataFromContract(id as string);
    }
    // Check if there is an active session
    if (userSession.isUserSignedIn()) {
      const userData = userSession.loadUserData() as UserData;
      setUserData(userData);
    } else if (userSession.isSignInPending()) {
      userSession.handlePendingSignIn().then((userData: UserData) => {
        setUserData(userData as UserData);
      });
    }
  }, [id, fetchMetadataFromContract]);

  const connectWallet = () => {
    showConnect({
      appDetails: {
        name: 'Sphinx',
        icon: 'https://sphinx-brown.vercel.app/icon.png',
      },
      userSession,
      onFinish: async () => {
        const userData = userSession.loadUserData() as UserData;
        setUserData(userData);
        const walletAddress = userData.profile.stxAddress.testnet;

        // Save user data to Supabase if not already registered
        const { data, error } = await supabase
          .from('sph_users')
          .select('*')
          .eq('add', walletAddress);

        if (error) return console.error('Error checking user:', error);

        if (data && data.length === 0) {
          const { error: insertError } = await supabase.from('sph_users').insert([
            {
              add: walletAddress,
              name: userData.name || 'nony',
              pic: userData.image || null,
            },
          ]);
          if (insertError) console.error('Error inserting user:', insertError);
          else console.log('User inserted successfully!');
        }
      },
    });
  };

  // Function to format the address
  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 5)}...${address.slice(-3)}`;
  };

  
  // Fetch the metadata (IPFS link) from the backend proxy
  const fetchMetadataFromProxy = async (cid: string) => {
    try {
      const proxyUrl = `/api/ipfs?cid=${cid}`;
      const response = await axios.get(proxyUrl);
      return response.data;
    } catch (error) {
      console.error('Error fetching metadata from backend proxy:', error);
      return null;
    }
  };

  // Upload response to IPFS
  const uploadResponseToIPFS = async (responseText: string) => {
    const metadata = {
      response: responseText,
      timestamp: new Date().toISOString(),
      stxAddress: userSession.loadUserData().profile.stxAddress.testnet, // Fetch the STX address
    };
    const result = await axios.post('/api/ipfs-upload', metadata); // Assuming a backend proxy for IPFS upload
    return result.data.cid; // Get CID from the result
  };

  // Submit the response to the contract
  const submitResponse = async () => {
    try {
      const ipfsCID = await uploadResponseToIPFS(response); // Upload the response and get the CID

      const txOptions = {
        contractAddress: 'ST28B2GFEWHR2MXA6P0XNW2GVV9K30HYSC3D9Q0SR',
        contractName: 'responser241015A',
        functionName: 'submit-response',
        functionArgs: [bufferCVFromString(ipfsCID)], // Submit the CID as a buffer
        senderKey: userSession.loadUserData().appPrivateKey, // Use the user's private key
        network,
        anchorMode: AnchorMode.Any,
      };

      const transaction = await makeContractCall(txOptions);
      const broadcastResponse = await broadcastTransaction(transaction, network);
      console.log('Transaction submitted:', broadcastResponse.txid);
      alert('Response submitted successfully!');
    } catch (error) {
      console.error('Error submitting response:', error);
      alert('Failed to submit the response.');
    }
  };

  return (
    <div>
      <div>
        <Link href="/" className='fixed top-4 left-6 font-bold'>sphinx</Link>
        <span className='fixed top-5 left-[91px] text-[11px] py-[1px]'>ANSWER TO EARN</span>
        {userData ? (
          <Link href={`/avatar/${userData.profile.stxAddress.testnet}`}>
            <button className="fixed top-4 right-6 text-[11px]">
              {formatAddress(userData.profile.stxAddress.testnet)}
            </button>
          </Link>
        ) : (
          <button className="fixed top-4 right-6 text-[11px]" onClick={connectWallet}>
            CONNECT
          </button>
        )}
      </div>
      <div className='lg:w-1/3 mx-auto my-8'>
        <p className='text-[11px] mb-4'>{id}</p>
        {!metadata ? (
          <p>Loading question...</p>
        ) : (
          <>
            <h1 className='sharetech font-bold text-3xl mb-4'>{metadata?.question}</h1>
            <p><b>Context:</b> {metadata?.context}</p>

            {/* Add form for response submission */}
            <textarea
              className='block w-full mt-4 border rounded-md p-2'
              placeholder='Write your response here...'
              value={response}
              onChange={(e) => setResponse(e.target.value)}
            />
            <button
              className='bg-blue-500 text-white px-4 py-2 mt-4 rounded-md'
              onClick={submitResponse}
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Response'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
