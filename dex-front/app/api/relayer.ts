import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import { Buffer } from "buffer";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    try {
        const API_URL = 'https://relayer-api.horizenlabs.io/api/v1';

        const proofUint8 = new Uint8Array(Object.values(req.body.proof));

        const params = {
            "proofType": "ultraplonk",
            "vkRegistered": false,
            "proofOptions": {
                "numberOfPublicInputs": 2
            },
            "proofData": {
                "proof": Buffer.from(concatenatePublicInputsAndProof(req.body.publicInputs, proofUint8)).toString("base64"),
                "vk": req.body.vk
            }
        }

        const requestResponse = await axios.post(`${API_URL}/submit-proof/${process.env.API_KEY}`, params)
        console.log(requestResponse.data)

        if (requestResponse.data.optimisticVerify != "success") {
            console.error("Proof verification, check proof artifacts");
            return;
        }

        while (true) {
            const jobStatusResponse = await axios.get(`${API_URL}/job-status/${process.env.API_KEY}/${requestResponse.data.jobId}`);
            if (jobStatusResponse.data.status === "IncludedInBlock") {
                console.log("Job Included in Block successfully");
                res.status(200).json(jobStatusResponse.data);
                return;
            } else {
                console.log("Job status: ", jobStatusResponse.data.status);
                console.log("Waiting for job to finalize...");
                await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for 5 seconds before checking again
            }
        }
    } catch (error) {
        console.log(error)
    }
}

function hexToUint8Array(hex: any) {
    if (hex.startsWith('0x')) hex = hex.slice(2);
    if (hex.length % 2 !== 0) hex = '0' + hex;

    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < bytes.length; i++) {
        bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
    }
    return bytes;
}

function concatenatePublicInputsAndProof(publicInputsHex: any, proofUint8: any) {
    const publicInputBytesArray = publicInputsHex.flatMap((hex: any) =>
        Array.from(hexToUint8Array(hex))
    );

    const publicInputBytes = new Uint8Array(publicInputBytesArray);

    console.log(publicInputBytes.length, proofUint8.length)

    const newProof = new Uint8Array(publicInputBytes.length + proofUint8.length);
    newProof.set(publicInputBytes, 0);
    newProof.set(proofUint8, publicInputBytes.length);

    return newProof;
}