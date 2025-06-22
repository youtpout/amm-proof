'use client';

import { useState } from 'react';
import { UltraPlonkBackend } from '@aztec/bb.js';
import { abi, Noir } from '@noir-lang/noir_js';

export default function ProofComponent() {
  const [root, setRoot] = useState('');
  const [user, setUser] = useState('');
  const [result, setResult] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [proofResult, setProofResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [verificationStatus, setVerificationStatus] = useState('');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [data, setData] = useState<string | null>(null);

  const handleGenerateProof = async () => {
    setIsLoading(true);
    setProofResult(null);
    setErrorMsg('');
    setVerificationStatus('');
    setTxHash(null);

    try {

      const circuit_json = await fetch("/noir/target/noir.json")
      const noir_data = await circuit_json.json();

      const input = {
        "root": root,
        "user": user,
        "requester": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        "index": "0",
        "witness": ["0x00", "0x27b1d0839a5b23baf12a8d195b18ac288fcf401afb2f70b8a4b529ede5fa9fed", "0x21dbfd1d029bf447152fcf89e355c334610d1632436ba170f738107266a71550", "0x0bcd1f91cf7bdd471d0a30c58c4706f3fdab3807a954b8f5b5e3bfec87d001bb"],
      }
      const noir = new Noir({ bytecode: noir_data.bytecode, abi: noir_data.abi as any });
      const execResult = await noir.execute(input);
      console.log("Witness Generated:", execResult);

      const plonk = new UltraPlonkBackend(noir_data.bytecode, { threads: 2 });
      const { proof, publicInputs } = await plonk.generateProof(execResult.witness);
      const vk = await plonk.getVerificationKey();


      setProofResult({ proof: '0x' + Buffer.from(proof).toString('hex'), publicInputs });

      //   Send to backend for verification
      const res = await fetch('/api/relayer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ proof: proof, publicInputs: publicInputs, vk: Buffer.from(vk).toString('base64') })
      });

      const data = await res.json();

      if (res.ok) {
        setVerificationStatus('✅ Proof verified successfully!');
        console.log('Proof submission result:', data);
        setData(JSON.stringify(data));
        if (data.txHash) {
          setTxHash(data.txHash);
        }
      } else {
        setVerificationStatus('❌ Proof verification failed.');
      }
    } catch (error) {
      console.error('Error generating proof or verifying:', error);
      setErrorMsg(
        '❌ Error generating or verifying proof. Please check your inputs and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-4xl font-bold mb-6">zkVerify Noir NextJS</h1>

      {/* Inputs */}
      <div className="flex flex-col space-y-4 w-64 mb-6">
        <input
          type="text"
          placeholder="Enter root"
          value={root}
          onChange={(e) => setRoot(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          placeholder="Enter user"
          value={user}
          onChange={(e) => setUser(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

      </div>

      {/* Generate Proof Button */}
      <button
        onClick={handleGenerateProof}
        disabled={isLoading}
        className={`${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
          } text-white font-semibold px-6 py-2 rounded-lg`}
      >
        {isLoading ? 'Processing...' : 'Generate Proof'}
      </button>

      {/* Loading */}
      {isLoading && (
        <div className="mt-6 text-blue-600 font-semibold">Working on it, please wait...</div>
      )}

      {/* Error Message */}
      {errorMsg && (
        <div className="mt-6 text-red-600 font-medium">{errorMsg}</div>
      )}

      {/* Verification Result */}
      {verificationStatus && (
        <div className="mt-4 text-lg font-medium text-blue-700">
          {verificationStatus}
        </div>
      )}

      {/* TX Hash */}
      {txHash && (
        <div className="mt-2 text-blue-800 underline">
          <a
            href={`https://zkverify-testnet.subscan.io/extrinsic/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            🔗 View on Subscan (txHash: {txHash.slice(0, 10)}...)
          </a>
        </div>
      )}

      {data && (
        <div className="mt-2 text-black-800 " style={{  overflowWrap: "break-word", width: "600px"}}>
          {data}
        </div>
      )}

      {/* Output */}
      {proofResult && (
        <div className="mt-8 bg-white shadow-md p-4 rounded-lg w-full max-w-xl">
          <h2 className="text-xl font-bold mb-2 text-green-700">✅ Proof Generated</h2>
          <pre className="text-sm overflow-x-auto whitespace-pre-wrap break-words">
            {JSON.stringify(proofResult, null, 2)}
          </pre>
        </div>
      )}


    </div>
  );
}