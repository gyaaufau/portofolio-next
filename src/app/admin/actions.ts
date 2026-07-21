"use server";

import { prisma } from "@/lib/prisma";
import { r2Url } from "@/lib/r2";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import {
  ADMIN_COOKIE,
  adminCookieOptions,
  createSessionToken,
  passwordMatches,
  requireAdmin,
} from "@/lib/auth";
import { resolveAccent } from "@/lib/theme";
import type { Prisma } from "@prisma/client";

function parseSections(value: unknown): Prisma.InputJsonValue {
  if (!value) return [];
  try {
    const parsed = JSON.parse(String(value));
    return Array.isArray(parsed) ? (parsed as Prisma.InputJsonValue) : [];
  } catch {
    return [];
  }
}

export async function login(password: string) {
  try {
    if (!passwordMatches(password)) return { error: "Invalid password" };
    const cookieStore = await cookies();
    cookieStore.set(ADMIN_COOKIE, await createSessionToken(), adminCookieOptions);
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Admin authentication is not configured.";
    return { error: message };
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE);
  return { success: true };
}

// Apps
export async function createApp(formData: FormData) {
  await requireAdmin();
  const data = Object.fromEntries(formData);
  const slug = String(data.slug || data.title).toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  await prisma.app.create({
    data: {
      id: slug,
      title: String(data.title),
      slug,
      tagline: String(data.tagline || ""),
      description: String(data.description || ""),
      featured: data.featured === "on",
      appType: String(data.appType || "mobile"),
      workType: String(data.workType || "personal"),
      period: String(data.period || ""),
      periodShort: String(data.periodShort || ""),
      sortOrder: Number(data.sortOrder || 0),
      appStoreUrl: String(data.appStoreUrl || "") || null,
      playStoreUrl: String(data.playStoreUrl || "") || null,
      websiteUrl: String(data.websiteUrl || "") || null,
      githubUrl: String(data.githubUrl || "") || null,
      otherUrl: String(data.otherUrl || "") || null,
      otherUrlLabel: String(data.otherUrlLabel || "") || null,
      appIconSrc: String(data.appIconSrc || r2Url("/data/myself/me.jpg")),
      appIconAlt: String(data.appIconAlt || ""),
      thumbnailSrc: String(data.thumbnailSrc || r2Url("/data/myself/me.jpg")),
      thumbnailAlt: String(data.thumbnailAlt || ""),
      stack: String(data.stack || "").split(",").map((s) => s.trim()).filter(Boolean),
      highlights: String(data.highlights || "").split("\n").filter(Boolean),
      sections: parseSections(data.sections),
    },
  });

  revalidatePath("/admin/apps");
  revalidatePath("/apps");
  revalidatePath("/");
}

export async function updateApp(id: string, formData: FormData) {
  await requireAdmin();
  const data = Object.fromEntries(formData);

  await prisma.app.update({
    where: { id },
    data: {
      title: String(data.title),
      tagline: String(data.tagline || ""),
      description: String(data.description || ""),
      featured: data.featured === "on",
      appType: String(data.appType || "mobile"),
      workType: String(data.workType || "personal"),
      period: String(data.period || ""),
      periodShort: String(data.periodShort || ""),
      sortOrder: Number(data.sortOrder || 0),
      appStoreUrl: String(data.appStoreUrl || "") || null,
      playStoreUrl: String(data.playStoreUrl || "") || null,
      websiteUrl: String(data.websiteUrl || "") || null,
      githubUrl: String(data.githubUrl || "") || null,
      otherUrl: String(data.otherUrl || "") || null,
      otherUrlLabel: String(data.otherUrlLabel || "") || null,
      appIconSrc: String(data.appIconSrc || ""),
      appIconAlt: String(data.appIconAlt || ""),
      thumbnailSrc: String(data.thumbnailSrc || ""),
      thumbnailAlt: String(data.thumbnailAlt || ""),
      stack: String(data.stack || "").split(",").map((s) => s.trim()).filter(Boolean),
      highlights: String(data.highlights || "").split("\n").filter(Boolean),
      sections: parseSections(data.sections),
    },
  });

  revalidatePath("/admin/apps");
  revalidatePath(`/apps/${id}`);
  revalidatePath("/apps");
  revalidatePath("/");
}

export async function deleteApp(id: string) {
  await requireAdmin();
  await prisma.app.delete({ where: { id } });
  revalidatePath("/admin/apps");
  revalidatePath("/apps");
  revalidatePath("/");
}

export async function toggleAppFeatured(id: string) {
  await requireAdmin();
  const app = await prisma.app.findUnique({ where: { id } });
  if (app) {
    await prisma.app.update({ where: { id }, data: { featured: !app.featured } });
    revalidatePath("/admin/apps");
    revalidatePath("/apps");
    revalidatePath("/");
  }
}

// Certificates
export async function createCertificate(formData: FormData) {
  await requireAdmin();
  const data = Object.fromEntries(formData);
  const id = String(data.id || data.title).toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  await prisma.certificate.create({
    data: {
      id,
      title: String(data.title),
      featured: data.featured === "on",
      issuer: String(data.issuer),
      issued: String(data.issued),
      type: String(data.type || "Certificate"),
      summary: String(data.summary || ""),
      details: String(data.details || "").split("\n").filter(Boolean),
      relevance: String(data.relevance || ""),
      issuerNotes: String(data.issuerNotes || "").split("\n").filter(Boolean),
      imageSrc: String(data.imageSrc || "") || null,
      imageAlt: String(data.imageAlt || "") || null,
      imageWidth: Number(data.imageWidth || 0) || null,
      imageHeight: Number(data.imageHeight || 0) || null,
    },
  });

  revalidatePath("/admin/certificates");
  revalidatePath("/certificates");
}

export async function updateCertificate(id: string, formData: FormData) {
  await requireAdmin();
  const data = Object.fromEntries(formData);

  await prisma.certificate.update({
    where: { id },
    data: {
      title: String(data.title),
      featured: data.featured === "on",
      issuer: String(data.issuer),
      issued: String(data.issued),
      type: String(data.type || "Certificate"),
      summary: String(data.summary || ""),
      details: String(data.details || "").split("\n").filter(Boolean),
      relevance: String(data.relevance || ""),
      issuerNotes: String(data.issuerNotes || "").split("\n").filter(Boolean),
      imageSrc: String(data.imageSrc || "") || null,
      imageAlt: String(data.imageAlt || "") || null,
      imageWidth: Number(data.imageWidth || 0) || null,
      imageHeight: Number(data.imageHeight || 0) || null,
    },
  });

  revalidatePath("/admin/certificates");
  revalidatePath(`/certificates/${id}`);
  revalidatePath("/certificates");
}

export async function deleteCertificate(id: string) {
  await requireAdmin();
  await prisma.certificate.delete({ where: { id } });
  revalidatePath("/admin/certificates");
  revalidatePath("/certificates");
}

// Work Experience
export async function createWorkExperience(formData: FormData) {
  await requireAdmin();
  const data = Object.fromEntries(formData);

  await prisma.workExperience.create({
    data: {
      company: String(data.company),
      location: String(data.location || ""),
      role: String(data.role),
      start: String(data.start || ""),
      end: String(data.end || ""),
      period: String(data.period || ""),
      sortOrder: Number(data.sortOrder || 0),
      summary: String(data.summary || ""),
      highlights: String(data.highlights || "").split("\n").filter(Boolean),
    },
  });

  revalidatePath("/admin/work-experience");
  revalidatePath("/");
}

export async function updateWorkExperience(id: string, formData: FormData) {
  await requireAdmin();
  const data = Object.fromEntries(formData);

  await prisma.workExperience.update({
    where: { id },
    data: {
      company: String(data.company),
      location: String(data.location || ""),
      role: String(data.role),
      start: String(data.start || ""),
      end: String(data.end || ""),
      period: String(data.period || ""),
      sortOrder: Number(data.sortOrder || 0),
      summary: String(data.summary || ""),
      highlights: String(data.highlights || "").split("\n").filter(Boolean),
    },
  });

  revalidatePath("/admin/work-experience");
  revalidatePath("/");
}

export async function deleteWorkExperience(id: string) {
  await requireAdmin();
  await prisma.workExperience.delete({ where: { id } });
  revalidatePath("/admin/work-experience");
  revalidatePath("/");
}

// Profile
export async function updateProfile(formData: FormData) {
  await requireAdmin();
  const data = Object.fromEntries(formData);
  const existing = await prisma.profile.findFirst();

  const profileData = {
    name: String(data.name),
    role: String(data.role),
    intro: String(data.intro || ""),
    location: String(data.location || ""),
    openToOpportunities: data.openToOpportunities === "on",
    photoSrc: String(data.photoSrc || r2Url("/data/myself/me.jpg")),
    photoAlt: String(data.photoAlt || ""),
    photoWidth: Number(data.photoWidth || 400),
    photoHeight: Number(data.photoHeight || 500),
  };

  if (existing) {
    await prisma.profile.update({ where: { id: existing.id }, data: profileData });
  } else {
    await prisma.profile.create({ data: profileData });
  }

  revalidatePath("/admin/profile");
  revalidatePath("/");
}

// Contact
export async function updateContact(formData: FormData) {
  await requireAdmin();
  const data = Object.fromEntries(formData);
  const existing = await prisma.contact.findFirst();

  const contactData = {
    email: String(data.email),
    whatsapp: String(data.whatsapp || ""),
    github: String(data.github || ""),
    linkedin: String(data.linkedin || ""),
    playStore: String(data.playStore || ""),
    playConsole: String(data.playConsole || ""),
    cv: String(data.cv || ""),
  };

  if (existing) {
    await prisma.contact.update({ where: { id: existing.id }, data: contactData });
  } else {
    await prisma.contact.create({ data: contactData });
  }

  revalidatePath("/admin/contact");
  revalidatePath("/");
}

// Skills
export async function updateSkillCategory(id: string, formData: FormData) {
  await requireAdmin();
  const data = Object.fromEntries(formData);

  await prisma.skillCategory.update({
    where: { id },
    data: {
      items: String(data.items || "").split("\n").filter(Boolean),
    },
  });

  revalidatePath("/admin/skills");
  revalidatePath("/");
}

export type AppearanceState = { error?: string; success?: string } | null;

export async function updateSiteSettings(
  _previousState: AppearanceState,
  formData: FormData
): Promise<AppearanceState> {
  await requireAdmin();
  const result = resolveAccent(formData.get("accentPreset"), formData.get("accentColor"));
  if ("error" in result) return { error: result.error };

  await prisma.siteSettings.upsert({
    where: { id: "site" },
    create: {
      id: "site",
      accentPreset: result.preset,
      accentColor: result.color,
    },
    update: {
      accentPreset: result.preset,
      accentColor: result.color,
    },
  });

  revalidatePath("/", "layout");
  revalidatePath("/admin/appearance");
  return { success: "Accent updated." };
}
