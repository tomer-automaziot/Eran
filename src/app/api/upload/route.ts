import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createServerClient } from "@/lib/supabase";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const supabase = createServerClient();
    const results = [];

    for (const file of files) {
      if (file.type !== "application/pdf") {
        continue;
      }

      const timestamp = Date.now();
      const storagePath = `uploads/${timestamp}_${file.name}`;

      const buffer = Buffer.from(await file.arrayBuffer());

      const { error: uploadError } = await supabase.storage
        .from("pdfs")
        .upload(storagePath, buffer, {
          contentType: "application/pdf",
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        continue;
      }

      const { data, error: insertError } = await supabase
        .from("pdf_documents")
        .insert({
          file_name: file.name,
          storage_path: storagePath,
          file_size: file.size,
        })
        .select()
        .single();

      if (insertError) {
        console.error("Insert error:", insertError);
        continue;
      }

      results.push(data);
    }

    return NextResponse.json({ success: true, documents: results });
  } catch (err) {
    console.error("Upload handler error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
