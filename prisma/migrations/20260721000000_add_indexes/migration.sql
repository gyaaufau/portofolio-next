-- CreateIndex
CREATE INDEX "App_featured_sortOrder_idx" ON "App"("featured", "sortOrder");

-- CreateIndex
CREATE INDEX "AppScreenshot_appId_order_idx" ON "AppScreenshot"("appId", "order");

-- CreateIndex
CREATE INDEX "Certificate_featured_issued_idx" ON "Certificate"("featured", "issued");

-- CreateIndex
CREATE INDEX "WorkExperience_sortOrder_idx" ON "WorkExperience"("sortOrder");
