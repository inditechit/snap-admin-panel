const API_BASE_URL = "https://api.clickplick.co.uk";
const ACCESS_KEY = "app_access_token";
const REFRESH_KEY = "app_refresh_token";

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

export const getAccessToken = () => localStorage.getItem(ACCESS_KEY);
export const getRefreshToken = () => localStorage.getItem(REFRESH_KEY);

export const setAuthTokens = (accessToken: string, refreshToken: string) => {
  localStorage.setItem(ACCESS_KEY, accessToken);
  localStorage.setItem(REFRESH_KEY, refreshToken);
};

export const clearAuthTokens = () => {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
};

const parseJsonSafely = async (response: Response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      clearAuthTokens();
      localStorage.removeItem("app_user");
      return null;
    }

    const data = await parseJsonSafely(response);
    if (!data?.accessToken || !data?.refreshToken) {
      clearAuthTokens();
      localStorage.removeItem("app_user");
      return null;
    }

    setAuthTokens(data.accessToken, data.refreshToken);
    return data.accessToken;
  })();

  const token = await refreshPromise;
  isRefreshing = false;
  refreshPromise = null;
  return token;
};

export const authFetch = async (
  input: string,
  init: RequestInit = {},
  retry = true
): Promise<Response> => {
  const token = getAccessToken();
  const headers = new Headers(init.headers || {});
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(input, { ...init, headers });

  if (response.status === 401 && retry) {
    const nextToken = await refreshAccessToken();
    if (!nextToken) {
      return response;
    }

    const retryHeaders = new Headers(init.headers || {});
    retryHeaders.set("Authorization", `Bearer ${nextToken}`);
    return fetch(input, { ...init, headers: retryHeaders });
  }

  return response;
};

export { API_BASE_URL };
