"use server";

import { cookies } from "next/headers";
import { storageUrl } from "@/lib/storage";
import { revalidatePath } from "next/cache";
import { HERO_GAMES } from "@/games/registry";
import {
  ADMIN_COOKIE,
  adminCookieOptions,
  createSessionToken,
  passwordMatches,
  requireAdmin,
} from "@/lib/auth";
import { resolveAccent } from "@/lib/theme";
import { createAdminClient } from "@/utils/supabase/admin";

function getSupabase() {
  return createAdminClient();
}

function parseSections(value: unknown): unknown[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(String(value));
    return Array.isArray(parsed) ? parsed : [];
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
  const supabase = await getSupabase();
  const data = Object.fromEntries(formData);
  const slug = String(data.slug || data.title).toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  await supabase.from("app").insert({
    id: slug,
    title: String(data.title),
    slug,
    tagline: String(data.tagline || ""),
    description: String(data.description || ""),
    featured: data.featured === "on",
    app_type: String(data.appType || "mobile"),
    work_type: String(data.workType || "personal"),
    period: String(data.period || ""),
    period_short: String(data.periodShort || ""),
    sort_order: Number(data.sortOrder || 0),
    app_store_url: String(data.appStoreUrl || "") || null,
    play_store_url: String(data.playStoreUrl || "") || null,
    website_url: String(data.websiteUrl || "") || null,
    github_url: String(data.githubUrl || "") || null,
    other_url: String(data.otherUrl || "") || null,
    other_url_label: String(data.otherUrlLabel || "") || null,
    app_icon_src: String(data.appIconSrc || storageUrl("/data/myself/me.webp")),
    app_icon_alt: String(data.appIconAlt || ""),
    thumbnail_src: String(data.thumbnailSrc || storageUrl("/data/myself/me.webp")),
    thumbnail_alt: String(data.thumbnailAlt || ""),
    stack: String(data.stack || "").split(",").map((s) => s.trim()).filter(Boolean),
    highlights: String(data.highlights || "").split("\n").filter(Boolean),
    sections: parseSections(data.sections),
    has_privacy_policy: data.hasPrivacyPolicy === "on",
    privacy_policy_content: String(data.privacyPolicyContent || ""),
    has_account_deletion: data.hasAccountDeletion === "on",
    account_deletion_content: String(data.accountDeletionContent || ""),
    account_deletion_requires_auth: data.accountDeletionRequiresAuth === "on",
  });

  // Save screenshots if provided
  const count = Number(data.screenshotCount || 0);
  if (count > 0) {
    const rows: { app_id: string; src: string; alt: string; order: number; width: number; height: number }[] = [];
    for (let i = 0; i < count; i++) {
      const src = data[`screenshotSrc_${i}`];
      const alt = data[`screenshotAlt_${i}`];
      const order = Number(data[`screenshotOrder_${i}`] || i);
      if (src) {
        rows.push({ app_id: slug, src: String(src), alt: String(alt || ""), order, width: 0, height: 0 });
      }
    }
    if (rows.length > 0) {
      await supabase.from("app_screenshot").insert(rows);
    }
  }

  revalidatePath("/admin/apps");
  revalidatePath("/apps");
  revalidatePath("/");
}

export async function updateApp(id: string, formData: FormData) {
  await requireAdmin();
  const supabase = await getSupabase();
  const data = Object.fromEntries(formData);

  await supabase.from("app").update({
    title: String(data.title),
    tagline: String(data.tagline || ""),
    description: String(data.description || ""),
    featured: data.featured === "on",
    app_type: String(data.appType || "mobile"),
    work_type: String(data.workType || "personal"),
    period: String(data.period || ""),
    period_short: String(data.periodShort || ""),
    sort_order: Number(data.sortOrder || 0),
    app_store_url: String(data.appStoreUrl || "") || null,
    play_store_url: String(data.playStoreUrl || "") || null,
    website_url: String(data.websiteUrl || "") || null,
    github_url: String(data.githubUrl || "") || null,
    other_url: String(data.otherUrl || "") || null,
    other_url_label: String(data.otherUrlLabel || "") || null,
    app_icon_src: String(data.appIconSrc || ""),
    app_icon_alt: String(data.appIconAlt || ""),
    thumbnail_src: String(data.thumbnailSrc || ""),
    thumbnail_alt: String(data.thumbnailAlt || ""),
    stack: String(data.stack || "").split(",").map((s) => s.trim()).filter(Boolean),
    highlights: String(data.highlights || "").split("\n").filter(Boolean),
    sections: parseSections(data.sections),
    has_privacy_policy: data.hasPrivacyPolicy === "on",
    privacy_policy_content: String(data.privacyPolicyContent || ""),
    has_account_deletion: data.hasAccountDeletion === "on",
    account_deletion_content: String(data.accountDeletionContent || ""),
    account_deletion_requires_auth: data.accountDeletionRequiresAuth === "on",
  }).eq("id", id);

  revalidatePath("/admin/apps");
  revalidatePath(`/apps/${id}`);
  revalidatePath("/apps");
  revalidatePath("/");
}

export async function updateScreenshots(appId: string, formData: FormData) {
  await requireAdmin();
  const supabase = await getSupabase();

  const count = Number(formData.get("screenshotCount") || 0);
  const screenshots: { src: string; alt: string; order: number; id?: string }[] = [];

  for (let i = 0; i < count; i++) {
    const src = formData.get(`screenshotSrc_${i}`) as string;
    const alt = formData.get(`screenshotAlt_${i}`) as string;
    const order = Number(formData.get(`screenshotOrder_${i}`) || i);
    const id = formData.get(`screenshotId_${i}`) as string | null;
    if (src) {
      screenshots.push({ src, alt: alt || "", order, id: id || undefined });
    }
  }

  // Delete existing screenshots for this app
  await supabase.from("app_screenshot").delete().eq("app_id", appId);

  // Insert updated screenshots
  if (screenshots.length > 0) {
    const rows = screenshots.map((s) => ({
      app_id: appId,
      src: s.src,
      alt: s.alt,
      order: s.order,
      width: 0,
      height: 0,
    }));
    await supabase.from("app_screenshot").insert(rows);
  }

  revalidatePath("/admin/apps");
  revalidatePath(`/apps/${appId}`);
  revalidatePath("/apps");
}

export async function deleteApp(id: string) {
  await requireAdmin();
  const supabase = await getSupabase();
  await supabase.from("app").delete().eq("id", id);
  revalidatePath("/admin/apps");
  revalidatePath("/apps");
  revalidatePath("/");
}

export async function toggleAppFeatured(id: string) {
  await requireAdmin();
  const supabase = await getSupabase();
  const { data: app } = await supabase.from("app").select("featured").eq("id", id).single();
  if (app) {
    await supabase.from("app").update({ featured: !app.featured }).eq("id", id);
    revalidatePath("/admin/apps");
    revalidatePath("/apps");
    revalidatePath("/");
  }
}

// Certificates
export async function createCertificate(formData: FormData) {
  await requireAdmin();
  const supabase = await getSupabase();
  const data = Object.fromEntries(formData);
  const id = String(data.id || data.title).toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  await supabase.from("certificate").insert({
    id,
    title: String(data.title),
    featured: data.featured === "on",
    issuer: String(data.issuer),
    issued: String(data.issued),
    type: String(data.type || "Certificate"),
    summary: String(data.summary || ""),
    details: String(data.details || "").split("\n").filter(Boolean),
    relevance: String(data.relevance || ""),
    issuer_notes: String(data.issuerNotes || "").split("\n").filter(Boolean),
    image_src: String(data.imageSrc || "") || null,
    image_alt: String(data.imageAlt || "") || null,
    image_width: Number(data.imageWidth || 0) || null,
    image_height: Number(data.imageHeight || 0) || null,
  });

  revalidatePath("/admin/certificates");
  revalidatePath("/certificates");
}

export async function updateCertificate(id: string, formData: FormData) {
  await requireAdmin();
  const supabase = await getSupabase();
  const data = Object.fromEntries(formData);

  await supabase.from("certificate").update({
    title: String(data.title),
    featured: data.featured === "on",
    issuer: String(data.issuer),
    issued: String(data.issued),
    type: String(data.type || "Certificate"),
    summary: String(data.summary || ""),
    details: String(data.details || "").split("\n").filter(Boolean),
    relevance: String(data.relevance || ""),
    issuer_notes: String(data.issuerNotes || "").split("\n").filter(Boolean),
    image_src: String(data.imageSrc || "") || null,
    image_alt: String(data.imageAlt || "") || null,
    image_width: Number(data.imageWidth || 0) || null,
    image_height: Number(data.imageHeight || 0) || null,
  }).eq("id", id);

  revalidatePath("/admin/certificates");
  revalidatePath(`/certificates/${id}`);
  revalidatePath("/certificates");
}

export async function deleteCertificate(id: string) {
  await requireAdmin();
  const supabase = await getSupabase();
  await supabase.from("certificate").delete().eq("id", id);
  revalidatePath("/admin/certificates");
  revalidatePath("/certificates");
}

// Work Experience
export async function createWorkExperience(formData: FormData) {
  await requireAdmin();
  const supabase = await getSupabase();
  const data = Object.fromEntries(formData);

  await supabase.from("work_experience").insert({
    company: String(data.company),
    location: String(data.location || ""),
    role: String(data.role),
    start: String(data.start || ""),
    end: String(data.end || ""),
    period: String(data.period || ""),
    sort_order: Number(data.sortOrder || 0),
    summary: String(data.summary || ""),
    highlights: String(data.highlights || "").split("\n").filter(Boolean),
  });

  revalidatePath("/admin/work-experience");
  revalidatePath("/");
}

export async function updateWorkExperience(id: string, formData: FormData) {
  await requireAdmin();
  const supabase = await getSupabase();
  const data = Object.fromEntries(formData);

  await supabase.from("work_experience").update({
    company: String(data.company),
    location: String(data.location || ""),
    role: String(data.role),
    start: String(data.start || ""),
    end: String(data.end || ""),
    period: String(data.period || ""),
    sort_order: Number(data.sortOrder || 0),
    summary: String(data.summary || ""),
    highlights: String(data.highlights || "").split("\n").filter(Boolean),
  }).eq("id", id);

  revalidatePath("/admin/work-experience");
  revalidatePath("/");
}

export async function deleteWorkExperience(id: string) {
  await requireAdmin();
  const supabase = await getSupabase();
  await supabase.from("work_experience").delete().eq("id", id);
  revalidatePath("/admin/work-experience");
  revalidatePath("/");
}

// Profile
export async function updateProfile(formData: FormData) {
  await requireAdmin();
  const supabase = await getSupabase();
  const data = Object.fromEntries(formData);
  const { data: existing } = await supabase.from("profile").select("id").limit(1).single();

  const profileData = {
    name: String(data.name),
    role: String(data.role),
    intro: String(data.intro || ""),
    location: String(data.location || ""),
    open_to_opportunities: data.openToOpportunities === "on",
    photo_src: String(data.photoSrc || storageUrl("/data/myself/me.webp")),
    photo_alt: String(data.photoAlt || ""),
    photo_width: Number(data.photoWidth || 400),
    photo_height: Number(data.photoHeight || 500),
  };

  if (existing) {
    await supabase.from("profile").update(profileData).eq("id", existing.id);
  } else {
    await supabase.from("profile").insert(profileData);
  }

  revalidatePath("/admin/profile");
  revalidatePath("/");
}

// Contact
export async function updateContact(formData: FormData) {
  await requireAdmin();
  const supabase = await getSupabase();
  const data = Object.fromEntries(formData);
  const { data: existing } = await supabase.from("contact").select("id").limit(1).single();

  const contactData = {
    email: String(data.email),
    whatsapp: String(data.whatsapp || ""),
    github: String(data.github || ""),
    linkedin: String(data.linkedin || ""),
    play_store: String(data.playStore || ""),
    play_console: String(data.playConsole || ""),
    cv: String(data.cv || ""),
  };

  if (existing) {
    await supabase.from("contact").update(contactData).eq("id", existing.id);
  } else {
    await supabase.from("contact").insert(contactData);
  }

  revalidatePath("/admin/contact");
  revalidatePath("/");
}

// Skills
export async function updateSkillCategory(id: string, formData: FormData) {
  await requireAdmin();
  const supabase = await getSupabase();
  const data = Object.fromEntries(formData);

  await supabase.from("skill_category").update({
    items: String(data.items || "").split("\n").filter(Boolean),
  }).eq("id", id);

  revalidatePath("/admin/skills");
  revalidatePath("/");
}

export type AppearanceState = { error?: string; success?: string } | null;

export async function updateSiteSettings(
  _previousState: AppearanceState,
  formData: FormData
): Promise<AppearanceState> {
  await requireAdmin();
  const supabase = await getSupabase();
  const result = resolveAccent(formData.get("accentPreset"), formData.get("accentColor"));
  if ("error" in result) return { error: result.error };

  const heroGameId = formData.get("heroGameId") as string;
  const validGameIds = Object.keys(HERO_GAMES);
  const gameId = heroGameId === "" ? "" : validGameIds.includes(heroGameId) ? heroGameId : "pixel-fighter";
  const logoSrc = (formData.get("logoSrc") as string)?.trim() ?? "";

  await supabase.from("site_settings").upsert({
    id: "site",
    accent_preset: result.preset,
    accent_color: result.color,
    hero_game_id: gameId,
    logo_src: logoSrc,
  });

  revalidatePath("/", "layout");
  revalidatePath("/admin/appearance");
  return { success: "Appearance updated." };
}
