import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuthContext } from '@/contexts/AuthContext';
import { apiUrl } from '@/config/api';
import { validateEmail, validatePassword } from './validations';
import './styles.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthContext();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });

  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });

  const handleBlur = (field: 'email' | 'password') => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field, formData[field]);
  };

  const handleChange = (field: 'email' | 'password', value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      validateField(field, value);
    }
  };

  const validateField = (field: 'email' | 'password', value: string) => {
    let error = '';

    if (field === 'email') {
      if (!value.trim()) {
        error = 'Email é obrigatório';
      } else if (!validateEmail(value)) {
        error = 'Email inválido';
      }
    }

    if (field === 'password') {
      if (!value) {
        error = 'Senha é obrigatória';
      } else if (!validatePassword(value)) {
        error = 'Senha deve ter pelo menos 6 caracteres';
      }
    }

    setErrors((prev) => ({ ...prev, [field]: error }));
    return error === '';
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setAlert(null);

    // Mark all fields as touched
    setTouched({ email: true, password: true });

    // Validate all fields
    const emailValid = validateField('email', formData.email);
    const passwordValid = validateField('password', formData.password);

    if (!emailValid || !passwordValid) {
      return;
    }

    try {
      await login(formData.email, formData.password);
      setAlert({ type: 'success', message: 'Login realizado com sucesso!' });
      
      // Aguardar um pouco para o estado ser atualizado
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
            .catch(() => navigate('/'));
        }
      }, 1000);
    } catch (error: any) {
      setAlert({
        type: 'error',
        message: error.message || 'Erro ao realizar login. Verifique suas credenciais.',
      });
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card login-card">
        <div className="auth-header login-header">
          <h1>Bem-vindo de volta</h1>
          <p>Entre com suas credenciais para acessar sua conta</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form login-form">
          <div className="form-group">
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

          <div className="form-group">
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

          <div className="form-options">
            <div className="checkbox-container flex items-center space-x-2">
              <Checkbox
                id="rememberMe"
                checked={formData.rememberMe}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, rememberMe: checked as boolean }))
                }
              />
              <label
                htmlFor="rememberMe"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Lembrar-me
              </label>
            </div>
            <Link to="/forgot-password" className="forgot-password">
              Esqueceu a senha?
            </Link>
          </div>

          {alert && (
            <Alert className={`alert ${alert.type}`}>
              <AlertDescription className="alert-text">{alert.message}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="auth-btn login-btn" disabled={isLoading}>
            {isLoading ? 'Entrando...' : 'Entrar'}
          </Button>

          <div className="form-footer">
            <p>
              Não tem uma conta?{' '}
              <Link to="/register" className="register-link">
                Cadastre-se
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
