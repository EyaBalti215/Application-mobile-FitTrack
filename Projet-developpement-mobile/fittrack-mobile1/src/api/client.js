import { API_BASE_URLS } from '../config';

const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
};

function getErrorMessage(data) {
  if (!data) {
    return null;
  }

  if (typeof data === 'string' && data.trim()) {
    return data;
  }

  if (typeof data.message === 'string' && data.message.trim()) {
    return data.message;
  }

  if (data.errors && typeof data.errors === 'object') {
    const firstValidationError = Object.values(data.errors).find(
      (value) => typeof value === 'string' && value.trim()
    );
    if (firstValidationError) {
      return firstValidationError;
    }
  }

  if (typeof data.detail === 'string' && data.detail.trim()) {
    return data.detail;
  }

  return null;
}

async function parseJson(response) {
  const text = await response.text();
  if (!text) {
    return null;
  }
  try {
    return JSON.parse(text);
  } catch (error) {
    return text;
  }
}

export async function apiRequest(path, options = {}) {
  const attempted = [];
  for (const baseUrl of API_BASE_URLS) {
    let response;
    try {
      response = await fetch(`${baseUrl}${path}`, {
        ...options,
        headers: {
          ...DEFAULT_HEADERS,
          ...(options.headers || {}),
        },
      });
    } catch (error) {
      attempted.push(baseUrl);
      continue;
    }

    const data = await parseJson(response);
    if (!response.ok) {
      const message = getErrorMessage(data) || `Request failed (${response.status})`;
      throw new Error(message);
    }

    return data;
  }

  const tried = attempted.length ? attempted.join(', ') : API_BASE_URLS.join(', ');
  throw new Error(`Network error: cannot reach API. Tried: ${tried}`);
}
