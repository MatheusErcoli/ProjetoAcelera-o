import { useState } from 'react';
import { apiUrl } from '@/config/api';

interface RegisterData {
  name: string;
  email: string;
  whatsapp: string;
  password: string;
  role: 'contratante' | 'prestador';
  address: {
    cep: string;
    logradouro: string;
    numero: string;
    complemento: string;
    bairro: string;
    cidade: string;
    uf: string;
  };
  services?: number[];
}

export const useRegister = () => {
  const [isLoading, setIsLoading] = useState(false);

  const register = async (data: RegisterData) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${apiUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao registrar usuário');
      }

      const responseData = await response.json();
      
      // Após o registro bem-sucedido, fazer login automático
      if (responseData.token) {
        localStorage.setItem('token', responseData.token);
        return responseData.user;
      }
      
      return responseData;
    } catch (error: any) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { register, isLoading };
};
