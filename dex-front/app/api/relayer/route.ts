import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import { Buffer } from "buffer";
import { NextRequest, NextResponse } from 'next/server'

export async function Get(req: NextRequest) {


    // Traitement de la requête ici
    return NextResponse.json({ status: 'ok' })
}


export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const API_URL = 'https://relayer-api.horizenlabs.io/api/v1';

        const proofUint8 = new Uint8Array(Object.values(body.proof));

        const params = {
            "proofType": "ultraplonk",
            "vkRegistered": false,
            "chainId": 84532,
            "proofOptions": {
                "numberOfPublicInputs": 2
            },
            "proofData": {
                "proof": Buffer.from(concatenatePublicInputsAndProof(body.publicInputs, proofUint8)).toString("base64"),
                "vk": body.vk
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
            if (jobStatusResponse.data.status === "Aggregated") {
                console.log("Job aggregated successfully");
                console.log(jobStatusResponse.data);
                return NextResponse.json(jobStatusResponse.data)
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