CREATE TABLE "SiteSettings" (
    "id" TEXT NOT NULL DEFAULT 'site',
    "accentPreset" TEXT NOT NULL DEFAULT 'moss',
    "accentColor" TEXT NOT NULL DEFAULT '#4F7A68',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);

INSERT INTO "SiteSettings" ("id", "accentPreset", "accentColor", "updatedAt")
VALUES ('site', 'moss', '#4F7A68', CURRENT_TIMESTAMP);
