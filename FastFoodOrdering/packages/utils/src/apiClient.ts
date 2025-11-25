let API_BASE_URL = '';

export const setApiBaseUrl = (url: string) => {
  API_BASE_URL = url;
};

export const apiClient = async (
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body: any = null,
  token: string | null = null
) => {
  if (!API_BASE_URL) {
    throw new Error('API_BASE_URL is not set. Call setApiBaseUrl() at app launch.');
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = { method, headers };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    const text = await response.text();
    const data = text ? JSON.parse(text) : {};
    
    if (!response.ok) {
      throw new Error(data.error || data.message || 'API request failed');
    }
    return data;
  } catch (error) {
    throw error;
  }
};