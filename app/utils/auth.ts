export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

export const setToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('token', token);
};

export const removeToken = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('token');
};

export const decodeToken = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

export const getUserIdFromToken = (): number | null => {
  const token = getToken();
  if (!token) return null;

  const decoded = decodeToken(token);
  return decoded?.sub ? parseInt(decoded.sub) : null;
};

export const isTokenValid = (): boolean => {
  const token = getToken();
  if (!token) return false;

  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return false;

  // Verificar si el token ha expirado
  return Date.now() < decoded.exp * 1000;
};