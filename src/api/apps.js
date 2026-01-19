const API_BASE = '/api';

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
  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch apps');
  }

  return data.data;
}

export async function fetchAppById(id) {
  const response = await fetch(`${API_BASE}/apps/${id}`);
  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch app');
  }

  return data.data;
}

export async function createApp(formData) {
  const response = await fetch(`${API_BASE}/apps`, {
    method: 'POST',
    body: formData
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Failed to create app');
  }

  return data.data;
}
