import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomBytes } from "crypto";
import { z } from "zod";
import { put } from "@vercel/blob";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { isPresetVip, isFontVip } from "@/lib/themes";

export const dynamic = "force-dynamic";

const UPLOAD_DIR = join(process.cwd(), "public", "uploads");
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

// Save an uploaded avatar and return its public URL.
// - Production (Vercel): uses Vercel Blob cloud storage (BLOB_READ_WRITE_TOKEN).
// - Local dev: writes to public/uploads so no cloud account is needed.
async function saveUpload(file: File): Promise<string> {
  const ext =
    file.type === "image/png" ? "png"
    : file.type === "image/webp" ? "webp"
    : file.type === "image/gif" ? "gif"
    : "jpg";
  const name = `${randomBytes(12).toString("hex")}.${ext}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`avatars/${name}`, file, {
      access: "public",
      contentType: file.type,
    });
    return blob.url;
  }

  await mkdir(UPLOAD_DIR, { recursive: true });
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(join(UPLOAD_DIR, name), bytes);
  return `/uploads/${name}`; // public URL
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authorized" }, { status: 401 });

  const form = await req.formData();
  const data: Record<string, unknown> = {};

  const name = form.get("name");
  const bio = form.get("bio");
  if (typeof name === "string" && name.trim()) data.name = name.trim();
  if (typeof bio === "string") data.bio = bio.trim();

  const photo = form.get("photo");
  if (photo instanceof File && photo.size > 0) {
    if (!ALLOWED.has(photo.type)) {
      return NextResponse.json({ error: "Use a JPG, PNG, WEBP or GIF image" }, { status: 400 });
    }
    if (photo.size > MAX_BYTES) {
      return NextResponse.json({ error: "Image must be under 5 MB" }, { status: 400 });
    }
    data.profilePhoto = await saveUpload(photo);
  }

  const updated = await db.user.update({ where: { id: user.id }, data });
  return NextResponse.json({ ok: true, profilePhoto: updated.profilePhoto });
}

// JSON settings update: tagline, layout template, and theme/font choice.
const patchSchema = z.object({
  tagline: z.string().max(60).optional(),
  template: z.enum(["grid", "editorial", "minimal"]).optional(),
  themePreset: z.string().max(20).optional(),
  themeFont: z.string().max(20).optional(),
  themeCustom: z.string().max(20000).nullable().optional(),
  // Profile photo as a URL or base64 data URL (works with no cloud storage).
  profilePhoto: z.string().max(4_000_000).optional(),
  removePhoto: z.boolean().optional(),
});

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authorized" }, { status: 401 });

  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const b = parsed.data;

  // VIP gating is enforced for premium themes/fonts/custom modes.
  if (b.themePreset && isPresetVip(b.themePreset) && !user.isVip) {
    return NextResponse.json({ error: "That theme is VIP-only." }, { status: 403 });
  }
  if (b.themeFont && isFontVip(b.themeFont) && !user.isVip) {
    return NextResponse.json({ error: "That font is VIP-only." }, { status: 403 });
  }

  const data: Record<string, unknown> = {};
  if (b.tagline !== undefined) data.tagline = b.tagline;
  if (b.template !== undefined) data.template = b.template;
  if (b.themePreset !== undefined) data.themePreset = b.themePreset;
  if (b.themeFont !== undefined) data.themeFont = b.themeFont;
  if (b.themeCustom !== undefined) data.themeCustom = b.themeCustom;
  if (b.profilePhoto !== undefined) data.profilePhoto = b.profilePhoto;
  if (b.removePhoto) data.profilePhoto = null;

  await db.user.update({ where: { id: user.id }, data });
  return NextResponse.json({ ok: true });
}
