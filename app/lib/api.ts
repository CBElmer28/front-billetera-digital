const API_BASE_URL = 'https://pixel-money.koyeb.app'; // 👈 CORREGIDO: Apunta al Gateway

// lib/api.ts

class ApiClient {
  public async request(endpoint: string, options: RequestInit = {}) {
    
    const token = typeof window !== 'undefined' ? localStorage.getItem('pixel-token') : null;
    console.log("[ApiClient] Intentando leer 'pixel-token':", token ? "ENCONTRADO" : "NULL");

    const config: RequestInit = {
      // 1. Primero ponemos todas las opciones generales (method, body, etc.)
      ...options, 
      
      // 2. Luego definimos los headers, mezclando los globales con los específicos
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers, // Aquí se suma la Idempotency-Key sin borrar lo anterior
      },
    };

    console.log("[ApiClient] Enviando headers:", config.headers); 

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("❌ [ApiClient] Error respuesta:", response.status, errorData);
        
        // 👇 MEJORA: Detectar si el error es una lista de validación (Pydantic)
        let errorMessage = errorData.detail;
        
        if (Array.isArray(errorMessage)) {
            // Si es un array (ej: [{loc: ['new_password'], msg: 'field required'}])
            // Lo convertimos a texto legible
            errorMessage = errorMessage.map((err: any) => 
                `${err.loc[err.loc.length - 1]}: ${err.msg}`
            ).join(' | ');
        } else if (typeof errorMessage === 'object') {
            errorMessage = JSON.stringify(errorMessage);
        } else if (!errorMessage) {
            errorMessage = `HTTP error! status: ${response.status}`;
        }

        throw new Error(errorMessage);
      }
      
      if (response.status === 204) return null;
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }
// ... resto igual

  async get(endpoint: string) {
    return this.request(endpoint, { method: 'GET' });
  }

  async post(endpoint: string, data: unknown) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint: string, data: unknown) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint: string) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();