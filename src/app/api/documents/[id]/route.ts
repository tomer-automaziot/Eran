import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createServerClient } from "@/lib/supabase";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const type = request.nextUrl.searchParams.get("type") || "generated";

  const supabase = createServerClient();

  const { data: doc, error } = await supabase
    .from("pdf_documents")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !doc) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  const path =
    type === "original" ? doc.storage_path : doc.generated_pdf_path;

  if (!path) {
    return NextResponse.json({ error: "File not available" }, { status: 404 });
  }

  const { data: signedData } = await supabase.storage
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
