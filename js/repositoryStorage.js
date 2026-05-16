import { GITHUB_UPLOAD_ENDPOINT } from './config.js';

function endpoint(path = '') {
  const base = GITHUB_UPLOAD_ENDPOINT.replace(/\/$/, '');
  if (!base) {
    throw new Error('GitHub upload endpoint is not configured in js/config.js.');
  }
  return `${base}${path}`;
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1]);
    reader.onerror = () => reject(reader.error || new Error('Could not read file.'));
    reader.readAsDataURL(file);
  });
}

async function parseResponse(response) {
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};
  if (!response.ok) {
    throw new Error(data.error || `Repository request failed (${response.status}).`);
  }
  return data;
}

function getAccessToken() {
  try {
    return JSON.parse(sessionStorage.getItem('hr_session') || '{}').accessToken || null;
  } catch {
    return null;
  }
}

export async function uploadTranscriptFile(file, session) {
  const contentBase64 = await fileToBase64(file);
  const response = await fetch(endpoint('/transcripts'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      filename: file.name,
      contentType: file.type || 'application/octet-stream',
      contentBase64,
      uploadedBy: session.username,
      uploaderId: session.id,
      accessToken: session.accessToken
    })
  });

  return parseResponse(response);
}

export async function deleteTranscriptFile(path, sha) {
  const response = await fetch(endpoint('/transcripts'), {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path, sha, accessToken: getAccessToken() })
  });

  return parseResponse(response);
}
