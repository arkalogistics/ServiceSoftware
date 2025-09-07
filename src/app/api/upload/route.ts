import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("file");
  const subdir = (form.get("subdir") as string) || "misc";
  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "No file" }, { status: 400 });
  }
  const blob = file as unknown as File;
  const arrayBuffer = await blob.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  if (buffer.byteLength > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large" }, { status: 413 });
  }
  const uploadsDir = path.join(process.cwd(), "public", "uploads", subdir);
  await fs.mkdir(uploadsDir, { recursive: true });
  const sanitizedName = (blob.name || "upload").replace(/[^a-zA-Z0-9_.-]+/g, "-");
  const filename = `${randomUUID()}-${sanitizedName}`;
  const filepath = path.join(uploadsDir, filename);
  await fs.writeFile(filepath, buffer);
  const publicPath = `/uploads/${subdir}/${filename}`;
  return NextResponse.json({ path: publicPath });
}

