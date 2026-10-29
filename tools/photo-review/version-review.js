const respond = (value, status = 200) => new Response(JSON.stringify(value), {
  status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
});

export async function versionReview(request, storage, manifest) {
  const empty = { comments: [], revision: 0 };
  if (request.method === 'GET') return respond(await storage.get('discussion') || empty);
  if (request.method !== 'POST') return respond({ error: 'Method not allowed' }, 405);
  let op;
  try {
    const text = await request.text();
    if (text.length > 8192) return respond({ error: 'Comment is too large' }, 413);
    op = JSON.parse(text);
  } catch { return respond({ error: 'Invalid comment' }, 400); }
  if (!op || !['Pedro', 'Jack'].includes(op.author) || typeof op.text !== 'string' ||
      !op.text.trim() || op.text.length > 2000 ||
      !manifest.versions.some(v => v.id === op.versionId) ||
      !manifest.pages.some(p => p.id === op.pageId) ||
      typeof op.requestId !== 'string' || !/^[a-zA-Z0-9-]{16,80}$/.test(op.requestId)) {
    return respond({ error: 'Check the author, page, version and comment (up to 2,000 characters).' }, 400);
  }
  return storage.transaction(async tx => {
    const state = await tx.get('discussion') || empty;
    const old = state.comments.find(c => c.id === op.requestId);
    if (old) {
      if (old.text !== op.text.trim() || old.author !== op.author ||
          old.pageId !== op.pageId || old.versionId !== op.versionId) {
        return respond({ error: 'This save identifier was already used. Refresh before saving a new comment.' }, 409);
      }
      return respond(state);
    }
    if (state.comments.length >= 500) return respond({ error: 'This review is full. Ask Jack to export it before starting another round.' }, 409);
    state.comments.push({ id: op.requestId, author: op.author, text: op.text.trim(),
      versionId: op.versionId, pageId: op.pageId, createdAt: new Date().toISOString() });
    state.revision += 1;
    await tx.put('discussion', state);
    return respond(state);
  });
}
