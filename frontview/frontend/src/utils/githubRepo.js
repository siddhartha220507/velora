/** Backend requires https://github.com/owner/repo.git */
const GIT_URL_RE =
  /^https:\/\/(www\.)?github\.com\/[^/]+\/.+\.git$/i;

export function parseGithubRepoInput(raw) {
  let u = (raw || "").trim();
  if (!u) {
    return { ok: false, error: "Repository URL is required." };
  }
  if (!/^https?:\/\//i.test(u)) {
    u = `https://${u}`;
  }
  u = u.replace(/^http:\/\//i, "https://");
  if (/^https:\/\/www\./i.test(u)) {
    u = u.replace(/^https:\/\/www\./i, "https://");
  }

  let pathAfterHost;
  try {
    const parsed = new URL(u);
    if (!/github\.com$/i.test(parsed.hostname)) {
      return { ok: false, error: "Only github.com HTTPS URLs are supported." };
    }
    pathAfterHost = parsed.pathname
      .replace(/^\/+|\/+$/g, "")
      .replace(/\.git$/i, "");
  } catch {
    return { ok: false, error: "Invalid URL." };
  }

  const parts = pathAfterHost.split("/").filter(Boolean);
  if (parts.length < 2) {
    return {
      ok: false,
      error: "Use https://github.com/owner/repo-name ( .git optional )",
    };
  }

  const owner = parts[0];
  const repoSlug = parts[1];

  const repoUrl = `https://github.com/${owner}/${repoSlug}.git`;

  if (!GIT_URL_RE.test(repoUrl)) {
    return { ok: false, error: "Could not normalize repository URL." };
  }

  return {
    ok: true,
    repoUrl,
    repoName: `${owner}/${repoSlug}`,
  };
}
