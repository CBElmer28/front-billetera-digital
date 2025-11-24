// 1. Apuntar a Producción (Gateway)
const API_BASE_URL = 'https://pixel-money.koyeb.app'; 

class ApiClient {
  public async request(endpoint: string, options: RequestInit = {}) {
    
    const token = typeof window !== 'undefined' ? localStorage.getItem('pixel-token') : null;

    const config: RequestInit = {
      ...options, 
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Lógica mejorada para leer errores del Backend (FastAPI/Pydantic)
        let errorMessage = errorData.detail || errorData.message;
        
        if (Array.isArray(errorMessage)) {
            // Si es error de validación Pydantic (lista de campos)
            errorMessage = errorMessage.map((err: any) => err.msg).join(' | ');
        } else if (typeof errorMessage === 'object') {
            errorMessage = JSON.stringify(errorMessage);
        }
        
        if (!errorMessage) errorMessage = `Error del servidor (${response.status})`;

        throw new Error(errorMessage);
      }
      
      if (response.status === 204) return null;
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // ... (get, post, put, delete se quedan igual)
  async get(endpoint: string) { return this.request(endpoint, { method: 'GET' }); }
  async post(endpoint: string, data: unknown) { return this.request(endpoint, { method: 'POST', body: JSON.stringify(data) }); }
  async put(endpoint: string, data: unknown) { return this.request(endpoint, { method: 'PUT', body: JSON.stringify(data) }); }
  async delete(endpoint: string) { return this.request(endpoint, { method: 'DELETE' }); }
}

export const apiClient = new ApiClient();