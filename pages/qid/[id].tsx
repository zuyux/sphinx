import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
    callReadOnlyFunction, makeStandardSTXPostCondition, stringUtf8CV, cvToJSON,
    AnchorMode, FungibleConditionCode 
} from '@stacks/transactions';
import axios from 'axios';
import { openContractCall } from '@stacks/connect';
import { StacksTestnet } from '@stacks/network';

// Interface for the metadata
interface QuestionMetadata {
  question: string;
  context: string;
  contractAddress: string;
  txid: string;
}

const network = new StacksTestnet();

export default function Quest() {
  const router = useRouter();
  const { txid } = router.query; // Get the TXID from the URL
  const [metadata, setMetadata] = useState<QuestionMetadata | null>(null);
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch the contract address based on the TXID when the page loads
  useEffect(() => {
    if (txid) {
      fetchContractAddressFromTxid(txid as string);
    }
  }, [txid]);

  // Fetch the contract address from the TXID using the Stacks API
  async function fetchContractAddressFromTxid(txid: string) {
    try {
      const response = await axios.get(
        `https://stacks-node-api.testnet.stacks.co/extended/v1/tx/${txid}`
      );

      const contractAddress = response.data.smart_contract?.contract_id;
      if (contractAddress) {
        fetchQuestionMetadata(contractAddress, txid); // Fetch metadata using contract address
      } else {
        console.error('Contract address not found for this TXID.');
      }
    } catch (error) {
      console.error('Error fetching contract address from TXID:', error);
    }
  }

  // Fetch the question metadata from the contract
  async function fetchQuestionMetadata(contractAddress: string, txid: string) {
    try {
      const [contractAddr, contractName] = contractAddress.split('.');
      const result = await callReadOnlyFunction({
        contractAddress: contractAddr,
        contractName: contractName,
        functionName: 'get-question-details',
        functionArgs: [],
        network,
        senderAddress: 'ST28B2GFEWHR2MXA6P0XNW2GVV9K30HYSC3D9Q0SR',
      });

      const data = cvToJSON(result);
      const ipfsLink = data.value.metadata;

      if (ipfsLink) {
        const { data: fetchedMetadata } = await axios.get(ipfsLink);
        setMetadata({
          ...fetchedMetadata,
          contractAddress, // Include contract address in metadata
          txid, // Include TXID for reference
        });
      }
    } catch (error) {
      console.error('Error fetching metadata:', error);
    }
  }

  // Function to submit a response
  async function handleSubmitResponse() {
    setLoading(true);

    if (!metadata) {
      console.error('Metadata not loaded');
      setLoading(false);
      return;
    }

    const [contractAddress, contractName] = metadata.contractAddress.split('.');

    const options = {
      contractAddress,
      contractName,
      functionName: 'submit-response',
      functionArgs: [stringUtf8CV(response)],
      network,
      postConditions: [
        makeStandardSTXPostCondition(
          'ST3J2GVMMM2R07ZFBJDWTYEYAR8FZH5WKDTFJ9AHA',
          FungibleConditionCode.GreaterEqual,
          1e6 // 1 STX in micro-STX
        ),
      ],
      anchorMode: AnchorMode.Any,
    };

    try {
      await openContractCall(options);
      alert('Response submitted successfully!');
      setResponse('');
    } catch (error) {
      console.error('Error submitting response:', error);
      alert('Error submitting response.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Question Details</h1>
      {!metadata ? (
        <p>Loading question...</p>
      ) : (
        <>
          <h2>{metadata.question}</h2>
          <p>{metadata.context}</p>
          <p>
            <strong>Contract Address:</strong> {metadata.contractAddress}
          </p>
          <p>
            <strong>TXID:</strong> {metadata.txid}
          </p>
        </>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmitResponse();
        }}
        style={{ marginTop: '20px' }}
      >
        <textarea
          placeholder="Submit your response..."
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          style={{ width: '100%', height: '100px' }}
        />
        <button type="submit" disabled={loading || !response}>
          {loading ? 'Submitting...' : 'Submit Response (1 STX)'}
        </button>
      </form>
    </div>
  );
}
