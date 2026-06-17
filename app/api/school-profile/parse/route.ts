import { NextRequest } from "next/server";
import { PDFParse } from "pdf-parse";
import { createWorker } from "tesseract.js";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_BYTES = 15 * 1024 * 1024;
const MAX_TEXT_CHARS = 8000;

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return Response.json({ error: "No file provided" }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return Response.json({ error: "File is too large (max 15MB)" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

    let text = "";

    if (isPdf) {
      const parser = new PDFParse({ data: buffer });
      const result = await parser.getText();
      text = result.text;
    } else if (file.type.startsWith("image/")) {
      const worker = await createWorker("eng", 1, { cachePath: "/tmp" });
      try {
        const result = await worker.recognize(buffer);
        text = result.data.text;
      } finally {
        await worker.terminate();
      }
    } else {
      return Response.json({ error: "Upload a PDF or an image (JPG/PNG) of your school profile" }, { status: 400 });
    }

    text = text.trim().slice(0, MAX_TEXT_CHARS);
    if (!text) {
      return Response.json({ error: "Couldn't find any readable text in that file" }, { status: 400 });
    }

    return Response.json({ text });
  } catch (err: unknown) {
    console.error("[api/school-profile/parse]", err);
    return Response.json({ error: "Couldn't read that file — try a clearer scan or a text-based PDF" }, { status: 500 });
  }
}
