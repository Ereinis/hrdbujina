const json = (data, status = 200, origin = '*') => new Response(JSON.stringify(data), {
  status,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  }
});

function safeName(name) {
  return String(name || 'transcript')
    .replace(/[^\w.\- ]+/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 120) || 'transcript';
}

function encodePath(path) {
  return path.split('/').map(encodeURIComponent).join('/');
}

async function github(env, path, init = {}) {
  const branch = env.GITHUB_BRANCH || 'main';
  const url = `https://api.github.com/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/contents/${encodePath(path)}${init.method === 'GET' ? `?ref=${branch}` : ''}`;
  const response = await fetch(url, {
    ...init,
    headers: {
      'Accept': 'application/vnd.github+json',
      'Authorization': `Bearer ${env.GITHUB_TOKEN}`,
      'User-Agent': 'hrdb-github-uploader',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(init.headers || {})
    }
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : {};
  if (!response.ok) {
    throw new Error(data.message || `GitHub API failed (${response.status})`);
  }
  return data;
}

function requireEnv(env) {
  for (const key of ['GITHUB_TOKEN', 'GITHUB_OWNER', 'GITHUB_REPO']) {
    if (!env[key]) throw new Error(`Missing ${key} environment variable.`);
  }
}

async function requireDiscordAccess(env, accessToken) {
  if (!env.DISCORD_GUILD_ID) return;
  if (!accessToken) throw new Error('Missing Discord access token.');

  const response = await fetch(`https://discord.com/api/v10/users/@me/guilds/${env.DISCORD_GUILD_ID}/member`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!response.ok) throw new Error('Discord role check failed.');

  const member = await response.json();
  const roles = member.roles || [];
  const allowedRoles = String(env.ALLOWED_UPLOAD_ROLES || '')
    .split(',')
    .map(role => role.trim())
    .filter(Boolean);

  if (env.HR_ROLE && !roles.includes(env.HR_ROLE)) {
    throw new Error('User does not have the HR role.');
  }

  if (allowedRoles.length && !allowedRoles.some(role => roles.includes(role))) {
    throw new Error('User does not have permission to manage transcripts.');
  }
}

export default {
  async fetch(request, env) {
    const origin = env.ALLOWED_ORIGIN || '*';

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Methods': 'POST, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
    }

    try {
      requireEnv(env);
      const url = new URL(request.url);
      if (url.pathname !== '/transcripts') {
        return json({ error: 'Not found.' }, 404, origin);
      }

      if (request.method === 'POST') {
        const body = await request.json();
        await requireDiscordAccess(env, body.accessToken);
        if (!body.filename || !body.contentBase64) {
          return json({ error: 'filename and contentBase64 are required.' }, 400, origin);
        }

        const branch = env.GITHUB_BRANCH || 'main';
        const fileName = `${Date.now()}-${safeName(body.filename)}`;
        const path = `transcripts/${fileName}`;
        const commit = await github(env, path, {
          method: 'PUT',
          body: JSON.stringify({
            message: `Upload transcript: ${body.filename}`,
            content: body.contentBase64,
            branch,
            committer: {
              name: 'HRDB Portal',
              email: env.GITHUB_COMMIT_EMAIL || 'noreply@example.com'
            }
          })
        });

        const publicBase = (env.PUBLIC_BASE || `https://${env.GITHUB_OWNER}.github.io/${env.GITHUB_REPO}`).replace(/\/$/, '');
        return json({
          path,
          sha: commit.content?.sha,
          htmlUrl: commit.content?.html_url,
          downloadUrl: `${publicBase}/${encodePath(path)}`
        }, 200, origin);
      }

      if (request.method === 'DELETE') {
        const body = await request.json();
        await requireDiscordAccess(env, body.accessToken);
        if (!body.path) return json({ error: 'path is required.' }, 400, origin);

        const branch = env.GITHUB_BRANCH || 'main';
        let sha = body.sha;
        if (!sha) {
          const existing = await github(env, body.path, { method: 'GET' });
          sha = existing.sha;
        }

        await github(env, body.path, {
          method: 'DELETE',
          body: JSON.stringify({
            message: `Delete transcript: ${body.path}`,
            sha,
            branch,
            committer: {
              name: 'HRDB Portal',
              email: env.GITHUB_COMMIT_EMAIL || 'noreply@example.com'
            }
          })
        });

        return json({ ok: true }, 200, origin);
      }

      return json({ error: 'Method not allowed.' }, 405, origin);
    } catch (error) {
      return json({ error: error.message || 'Unexpected error.' }, 500, origin);
    }
  }
};
