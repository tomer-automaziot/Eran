import { NextResponse } from "next/server";
import { createServerClient, createAdminClient } from "@/lib/supabase";

export async function GET() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("pdf_documents")
    .select("*")
    .order("uploaded_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const documents = (data || []).map((doc) => ({
    ...doc,
    generated_pdf_url: doc.generated_pdf_path || null,
  }));

  return NextResponse.json({ documents });
}
