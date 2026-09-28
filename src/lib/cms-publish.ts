export async function publishDraftBatch<T>(
  drafts: readonly T[],
  publish: (draft: T) => Promise<void>,
  remove: (draft: T) => Promise<void>,
  identify: (draft: T) => string = (draft) => String(draft),
) {
  let succeeded = 0;
  const failed: Array<{ id: string; message: string }> = [];
  for (const draft of drafts) {
    try {
      await publish(draft);
      await remove(draft);
      succeeded++;
    } catch (error) {
      failed.push({ id: identify(draft), message: error instanceof Error ? error.message : "Publish failed" });
    }
  }
  return { succeeded, failed };
}
