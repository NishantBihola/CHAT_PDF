import { Pinecone } from "@pinecone-database/pinecone";
export const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
export const pcIndex = pinecone.Index(process.env.PINECONE_INDEX!);
