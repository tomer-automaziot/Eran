import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createAdminClient } from "@/lib/supabase";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const type = request.nextUrl.searchParams.get("type") || "generated";

  const admin = createAdminClient();
  const { data: doc, error } = await admin
    .from("pdf_documents")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !doc) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  const path = type === "original" ? doc.storage_path : doc.generated_pdf_path;

  if (!path) {
    return NextResponse.json({ error: "File not available" }, { status: 404 });
  }

  const { data: signedData } = await admin.storage
    .from("pdfs")
    .createSignedUrl(path, 3600);

  if (!signedData?.signedUrl) {
    return NextResponse.json(
      { error: "Could not generate download link" },
      { status: 500 }
    );
  }

  return NextResponse.redirect(signedData.signedUrl);
}
