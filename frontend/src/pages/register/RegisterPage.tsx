import { useState, FormEvent, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useRegister } from '@/hooks/useRegister';
import {
  validateEmail,
  validatePassword,
  validateName,
  validateWhatsapp,
  validateCep,
  applyPhoneMask,
  applyCepMask,
} from './validations';
import { fetchAddressByCep } from './cepService';
import './styles.css';
import { apiUrl } from '@/config/api';
import { useAuth } from '@/hooks/useAuth';

interface FormData {
  name: string;
  email: string;
  whatsapp: string;
  password: string;
  services: number[]; // Array de IDs de serviços
  confirmPassword: string;
  userType: 'contratante' | 'prestador';
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
  servicos: string;
}

interface FormErrors {
  name: string;
  email: string;
  whatsapp: string;
  password: string;
  confirmPassword: string;
  cep: string;
  servicos: string;
}

interface Service {
  id: number;
  name: string;
  is_active: boolean;
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, isLoading } = useAuth();

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    whatsapp: '',
    password: '',
    services: [],
    confirmPassword: '',
    userType: 'contratante',
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    uf: '',
    servicos: '',
  });

  const [errors, setErrors] = useState<FormErrors>({
    name: '',
    email: '',
    whatsapp: '',
    password: '',
    confirmPassword: '',
    cep: '',
    servicos: '',
  });

    const [availableServices, setAvailableServices] = useState<Service[]>([]);
  
    useEffect(() => {
      // Buscar serviços disponíveis
      fetch(`${apiUrl}/services`)
        .then(res => res.json())
        .then(data => {
          setAvailableServices(data.filter((s: any) => s.is_active));
        })
        .catch(err => {
          console.error("Erro ao buscar serviços:", err);
        });
    }, []);

  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleBlur = (field: keyof FormErrors) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field, formData[field]);
  };

  const handleChange = (field: keyof FormData, value: string) => {
    let processedValue = value;

    if (field === 'whatsapp') {
      processedValue = applyPhoneMask(value);
    } else if (field === 'cep') {
      processedValue = applyCepMask(value);
    }

    setFormData((prev) => ({ ...prev, [field]: processedValue }));

    if (touched[field]) {
      validateField(field as keyof FormErrors, processedValue);
    }
  };

  const validateField = (field: keyof FormErrors, value: string): boolean => {
    let error = '';

    switch (field) {
      case 'name':
        if (!value.trim()) {
          error = 'Nome é obrigatório';
        } else if (!validateName(value)) {
          error = 'Nome deve conter apenas letras e ter pelo menos 2 caracteres';
        }
        break;
      case 'email':
        if (!value.trim()) {
          error = 'Email é obrigatório';
        } else if (!validateEmail(value)) {
          error = 'Email inválido';
        }
        break;
      case 'whatsapp':
        if (!value) {
          error = 'WhatsApp é obrigatório';
        } else if (!validateWhatsapp(value)) {
          error = 'WhatsApp deve ter 11 dígitos';
        }
        break;
      case 'password':
        if (!value) {
          error = 'Senha é obrigatória';
        } else if (!validatePassword(value)) {
          error = 'Senha deve ter pelo menos 6 caracteres';
        }
        break;
      case 'confirmPassword':
        if (!value) {
          error = 'Confirmação de senha é obrigatória';
        } else if (value !== formData.password) {
          error = 'Senhas não coincidem';
        }
        break;
      case 'cep':
        if (!value) {
          error = 'CEP é obrigatório';
        } else if (!validateCep(value)) {
          error = 'CEP deve ter 8 dígitos';
        }
        break;
      case 'servicos':
        if (formData.userType === 'prestador') {
          if (formData.services.length === 0) {
            error = 'Selecione pelo menos um serviço';
          }
        }
        break;
    }

    setErrors((prev) => ({ ...prev, [field]: error }));
    return error === '';
  };

  const handleCepBlur = async () => {
    handleBlur('cep');
    if (validateCep(formData.cep)) {
      const cleanCep = formData.cep.replace(/\D/g, '');
      const address = await fetchAddressByCep(cleanCep);
      if (address) {
        setFormData((prev) => ({
          ...prev,
          logradouro: address.logradouro || '',
          bairro: address.bairro || '',
          cidade: address.localidade || '',
          uf: address.uf || '',
        }));
      }
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setAlert(null);

    // Mark all fields as touched
    const fieldsToValidate: (keyof FormErrors)[] = [
      'name',
      'email',
      'whatsapp',
      'password',
      'confirmPassword',
      'cep',
    ];
    if (formData.userType === 'prestador') {
      fieldsToValidate.push('servicos');
    }

    const newTouched: Record<string, boolean> = {};
    fieldsToValidate.forEach((field) => {
      newTouched[field] = true;
    });
    setTouched(newTouched);

    // Validate all fields
    let allValid = true;
    fieldsToValidate.forEach((field) => {
      if (!validateField(field, formData[field])) {
        allValid = false;
      }
    });

    if (!allValid) {
      return;
    }

    try {
      await register({
        name: formData.name,
        email: formData.email,
        whatsapp: formData.whatsapp.replace(/\D/g, ''),
        password: formData.password,
        role: formData.userType,
        address: {
          cep: formData.cep.replace(/\D/g, ''),
          logradouro: formData.logradouro,
          numero: formData.numero,
          complemento: formData.complemento,
          bairro: formData.bairro,
          cidade: formData.cidade,
          uf: formData.uf,
        },
        services: formData.userType === 'prestador' ? formData.services : [],
      });

      setAlert({ type: 'success', message: 'Cadastro realizado com sucesso!' });
      
      // Redirecionar baseado no tipo de usuário
      setTimeout(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
          // Buscar informações do usuário para determinar redirecionamento
          fetch(`${apiUrl}/auth/me`, {
            headers: { 'Authorization': `Bearer ${storedToken}` }
          })
            .then(res => res.json())
            .then(userData => {
              switch (userData.role) {
                case 'ADMIN':
                  navigate('/admin');
                  break;
                case 'PRESTADOR':
                  localStorage.setItem('providerId', userData.id);
                  navigate('/home/providers');
                  break;
                case 'CONTRATANTE':
                  navigate('/home/clients');
                  break;
                default:
                  navigate('/');
              }
            })
            .catch(() => navigate('/login'));
        } else {
          navigate('/login');
        }
      }, 1500);
    } catch (error: any) {
      setAlert({
        type: 'error',
        message: error.message || 'Erro ao realizar cadastro. Tente novamente.',
      });
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card register-card">
        <div className="auth-header register-header">
          <h1>Criar Conta</h1>
          <p>Preencha os dados para se cadastrar na plataforma</p>
        </div>

        <div className="user-type-selector">
          <button
            type="button"
            className={`type-btn ${formData.userType === 'contratante' ? 'active' : ''}`}
            onClick={() => {
              setFormData((prev) => ({ ...prev, userType: 'contratante' }));
              setErrors((prev) => ({ ...prev, servicos: '' }));
            }}
          >
            <span className="type-icon">👤</span>
            <span className="type-text">Contratante</span>
          </button>
          <button
            type="button"
            className={`type-btn ${formData.userType === 'prestador' ? 'active' : ''}`}
            onClick={() => setFormData((prev) => ({ ...prev, userType: 'prestador' }))}
          >
            <span className="type-icon">🔧</span>
            <span className="type-text">Prestador</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form register-form">
          <div className="form-section">
            <h3 className="section-title">Dados Pessoais</h3>

            <div className="form-group">
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                onBlur={() => handleBlur('name')}
                className={errors.name && touched.name ? 'border-red-500' : ''}
                placeholder="Seu nome completo"
              />
              {errors.name && touched.name && (
                <span className="error-message show">{errors.name}</span>
              )}
            </div>

            <div className="form-row">
              <div className="form-group flex-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                  className={errors.email && touched.email ? 'border-red-500' : ''}
                  placeholder="seu@email.com"
                />
                {errors.email && touched.email && (
                  <span className="error-message show">{errors.email}</span>
                )}
              </div>

              <div className="form-group flex-1">
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input
                  id="whatsapp"
                  type="tel"
                  value={formData.whatsapp}
                  onChange={(e) => handleChange('whatsapp', e.target.value)}
                  onBlur={() => handleBlur('whatsapp')}
                  className={errors.whatsapp && touched.whatsapp ? 'border-red-500' : ''}
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                />
                {errors.whatsapp && touched.whatsapp && (
                  <span className="error-message show">{errors.whatsapp}</span>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group flex-1">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  onBlur={() => handleBlur('password')}
                  className={errors.password && touched.password ? 'border-red-500' : ''}
                  placeholder="••••••••"
                />
                {errors.password && touched.password && (
                  <span className="error-message show">{errors.password}</span>
                )}
              </div>

              <div className="form-group flex-1">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  onBlur={() => handleBlur('confirmPassword')}
                  className={
                    errors.confirmPassword && touched.confirmPassword ? 'border-red-500' : ''
                  }
                  placeholder="••••••••"
                />
                {errors.confirmPassword && touched.confirmPassword && (
                  <span className="error-message show">{errors.confirmPassword}</span>
                )}
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">Endereço</h3>

            <div className="form-row">
              <div className="form-group flex-1">
                <Label htmlFor="cep">CEP</Label>
                <Input
                  id="cep"
                  type="text"
                  value={formData.cep}
                  onChange={(e) => handleChange('cep', e.target.value)}
                  onBlur={handleCepBlur}
                  className={errors.cep && touched.cep ? 'border-red-500' : ''}
                  placeholder="00000-000"
                  maxLength={9}
                />
                {errors.cep && touched.cep && (
                  <span className="error-message show">{errors.cep}</span>
                )}
              </div>

              <div className="form-group flex-2">
                <Label htmlFor="logradouro">Logradouro</Label>
                <Input
                  id="logradouro"
                  type="text"
                  value={formData.logradouro}
                  onChange={(e) => handleChange('logradouro', e.target.value)}
                  placeholder="Rua, Avenida, etc."
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group flex-1">
                <Label htmlFor="numero">Número</Label>
                <Input
                  id="numero"
                  type="text"
                  value={formData.numero}
                  onChange={(e) => handleChange('numero', e.target.value)}
                  placeholder="123"
                />
              </div>

              <div className="form-group flex-1">
                <Label htmlFor="complemento">Complemento</Label>
                <Input
                  id="complemento"
                  type="text"
                  value={formData.complemento}
                  onChange={(e) => handleChange('complemento', e.target.value)}
                  placeholder="Apto, Bloco, etc."
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group flex-2">
                <Label htmlFor="bairro">Bairro</Label>
                <Input
                  id="bairro"
                  type="text"
                  value={formData.bairro}
                  onChange={(e) => handleChange('bairro', e.target.value)}
                  placeholder="Bairro"
                />
              </div>

              <div className="form-group flex-2">
                <Label htmlFor="cidade">Cidade</Label>
                <Input
                  id="cidade"
                  type="text"
                  value={formData.cidade}
                  onChange={(e) => handleChange('cidade', e.target.value)}
                  placeholder="Cidade"
                />
              </div>

              <div className="form-group flex-1">
                <Label htmlFor="uf">UF</Label>
                <Input
                  id="uf"
                  type="text"
                  value={formData.uf}
                  onChange={(e) => handleChange('uf', e.target.value)}
                  placeholder="SP"
                  maxLength={2}
                />
              </div>
            </div>
          </div>

          {formData.userType === 'prestador' && (
            <div className="form-section" id="prestadorSection">
              <h3 className="section-title">Informações Profissionais</h3>

              <div className="space-y-2">
                <Label>Serviços Oferecidos</Label>
                <div className={`border rounded-md p-4 max-h-48 overflow-y-auto space-y-2 ${errors.servicos && touched.servicos ? 'border-red-500' : ''}`}>
                  {availableServices.length === 0 ? (
                    <p className="text-sm text-gray-500">Carregando serviços...</p>
                  ) : (
                    availableServices.map((service) => (
                      <div key={service.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`service-${service.id}`}
                          checked={formData.services.includes(service.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                services: [...formData.services, service.id]
                              });
                            } else {
                              setFormData({
                                ...formData,
                                services: formData.services.filter(id => id !== service.id)
                              });
                            }
                            // Limpa o erro quando seleciona um serviço
                            if (e.target.checked && errors.servicos) {
                              setErrors((prev) => ({ ...prev, servicos: '' }));
                            }
                          }}
                          className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                        />
                        <Label
                          htmlFor={`service-${service.id}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {service.name}
                        </Label>
                      </div>
                    ))
                  )}
                </div>
                {errors.servicos && touched.servicos && (
                  <span className="error-message show">{errors.servicos}</span>
                )}
                <p className="text-xs text-gray-500">
                  Selecione os serviços que você oferece como prestador
                </p>
              </div>
            </div>
          )}

          {alert && (
            <Alert className={`alert ${alert.type}`}>
              <AlertDescription className="alert-text">{alert.message}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="auth-btn register-btn" disabled={isLoading}>
            {isLoading ? 'Cadastrando...' : 'Cadastrar'}
          </Button>

          <div className="form-footer">
            <p>
              Já tem uma conta?{' '}
              <Link to="/login" className="login-link">
                Faça login
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
