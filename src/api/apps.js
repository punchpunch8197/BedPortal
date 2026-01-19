const API_BASE = '/api';

async function handleResponse(response) {
  const contentType = response.headers.get('content-type');

  if (!contentType || !contentType.includes('application/json')) {
    throw new Error('Server error: API not available');
  }

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data;
}

export async function fetchApps(options = {}) {
  const { q, category, limit, offset } = options;

  const params = new URLSearchParams();
  if (q) params.append('q', q);
  if (category) params.append('category', category);
  if (limit) params.append('limit', limit);
  if (offset) params.append('offset', offset);

  const queryString = params.toString();
  const url = `${API_BASE}/apps${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url);
  const data = await handleResponse(response);

  return data.data;
}

export async function fetchAppById(id) {
  const response = await fetch(`${API_BASE}/apps/${id}`);
  const data = await handleResponse(response);

  return data.data;
}

export async function uploadFile(file, type = 'files') {
  const formData = new FormData();
  formData.append(type === 'icons' ? 'icon' : 'appFile', file);

  const response = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    body: formData
  });

  const data = await handleResponse(response);
  return data.url;
}

export async function createApp(appData) {
  const response = await fetch(`${API_BASE}/apps`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(appData)
  });

  const data = await handleResponse(response);

  return data.data;
}
