export async function GET() {
  return Response.json({
    firebaseProjectId: process.env.FIREBASE_PROJECT_ID || null,
    supabase: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    openai: !!process.env.OPENAI_API_KEY,
    pinecone: !!process.env.PINECONE_API_KEY,
    bucket: process.env.SUPABASE_BUCKET || null,
  });
}
