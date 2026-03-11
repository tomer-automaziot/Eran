import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  const expectedKey = process.env.AUTOMATION_API_KEY;

  if (!authHeader || authHeader !== `Bearer ${expectedKey}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { document_id, progress, status, continue_fill_url, generated_pdf_path } = body;

    if (!document_id) {
      return NextResponse.json(
        { error: "document_id is required" },
        { status: 400 }
      );
    }

    const updateFields: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (progress !== undefined) updateFields.progress = progress;
    if (status !== undefined) updateFields.status = status;
    if (continue_fill_url !== undefined) updateFields.continue_fill_url = continue_fill_url;
    if (generated_pdf_path !== undefined) updateFields.generated_pdf_path = generated_pdf_path;

    const supabase = createServerClient();

    const { error } = await supabase
      .from("pdf_documents")
      .update(updateFields)
      .eq("id", document_id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
