import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createServerClient } from "@/lib/supabase";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("pdf_documents")
    .select("*")
    .order("uploaded_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const documents = await Promise.all(
    (data || []).map(async (doc) => {
      let generatedPdfUrl = null;
      if (doc.generated_pdf_path) {
        const { data: signedData } = await supabase.storage
          .from("pdfs")
          .createSignedUrl(doc.generated_pdf_path, 3600);
        generatedPdfUrl = signedData?.signedUrl || null;
      }
      return { ...doc, generated_pdf_url: generatedPdfUrl };
    })
  );

  return NextResponse.json({ documents });
}
