import { useState, useEffect } from "react";
import { apiUrl } from "@/config/api";
import {
  Search,
  Filter,
  MoreHorizontal,
  MapPin,
  Phone,
  CheckCircle,
  XCircle,
  Plus,
  Edit,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Address {
  id?: number;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cep?: string;
  cidade?: string;
  uf?: string;
}

interface Service {
  id: number;
  name: string;
  is_active: boolean;
}

interface Provider {
  id: number;
  name: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  photo_url?: string;
  role: string;
  is_active: boolean;
  address?: Address;
  services?: Service[];
  status?: "active" | "inactive" | "pending"; // Campo computado baseado em is_active
  rating?: number;
  totalJobs?: number;
  joinDate?: string;
  avatar?: string;
}

// Os dados agora serão buscados do backend

// Funções de API
const createProvider = async (providerData: Partial<Provider>): Promise<Provider> => {
  const response = await fetch(`${apiUrl}/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...providerData,
      role: 'PRESTADOR',
    }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Erro ao criar prestador');
  }
  
  const data = await response.json();
  return mapProviderStatus(data);
};

const updateProvider = async (id: number, providerData: Partial<Provider>): Promise<Provider> => {
  const response = await fetch(`${apiUrl}/users/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(providerData),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Erro ao atualizar prestador');
  }
  
  const data = await response.json();
  return mapProviderStatus(data);
};

const toggleProviderStatus = async (id: number, isActive: boolean): Promise<Provider> => {
  const response = await fetch(`${apiUrl}/users/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ is_active: isActive }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Erro ao alterar status do prestador');
  }
  
  const data = await response.json();
  return mapProviderStatus(data);
};

const formatAddress = (address?: Address): string => {
  if (!address) {
    return "Endereço não informado";
  }

  const parts = [
    address.logradouro,
    address.numero,
    address.complemento,
    address.bairro,
    address.cidade,
    address.uf
  ].filter(part => part && part.trim());

  return parts.length > 0 
    ? parts.join(", ").replace(/,\s*,/g, ",") 
    : "Endereço não informado";
};

// Função para mapear dados do backend para o frontend
const mapProviderStatus = (provider: any): Provider => {
  return {
    ...provider,
    status: provider.is_active ? "active" : "inactive",
    avatar: provider.photo_url,
    phone: provider.phone || provider.whatsapp,
    services: provider.services || [],
    rating: provider.rating || 0,
    totalJobs: provider.totalJobs || 0,
    joinDate: provider.createdAt ? new Date(provider.createdAt).toLocaleDateString() : "N/A"
  };
};

// Componente para formulário de criação/edição de prestador
interface ProviderFormProps {
  initialData?: Provider;
  onSubmit: (data: Partial<Provider>) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}

function ProviderForm({ initialData, onSubmit, onCancel, loading }: ProviderFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    email: initialData?.email || "",
    whatsapp: initialData?.whatsapp || "",
    photo_url: initialData?.photo_url || "",
    password: "",
    address: {
      logradouro: initialData?.address?.logradouro || "",
      numero: initialData?.address?.numero || "",
      complemento: initialData?.address?.complemento || "",
      bairro: initialData?.address?.bairro || "",
      cep: initialData?.address?.cep || "",
      cidade: initialData?.address?.cidade || "",
      uf: initialData?.address?.uf || "",
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações básicas
    if (!formData.name.trim() || !formData.email.trim() || !formData.whatsapp.trim()) {
      alert('Nome, email e WhatsApp são obrigatórios');
      return;
    }

    if (!initialData && !formData.password.trim()) {
      alert('Senha é obrigatória para novos prestadores');
      return;
    }

    const submitData: any = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      whatsapp: formData.whatsapp.trim(),
      photo_url: formData.photo_url.trim() || null,
      address: formData.address
    };

    if (!initialData && formData.password.trim()) {
      submitData.password = formData.password;
    }

    await onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Nome completo"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="email@exemplo.com"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="whatsapp">WhatsApp *</Label>
          <Input
            id="whatsapp"
            value={formData.whatsapp}
            onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
            placeholder="(44) 99999-9999"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="photo_url">URL da Foto</Label>
          <Input
            id="photo_url"
            value={formData.photo_url}
            onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
            placeholder="https://exemplo.com/foto.jpg"
          />
        </div>
      </div>

      {!initialData && (
        <div className="space-y-2">
          <Label htmlFor="password">Senha *</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Senha para acesso"
            required
          />
        </div>
      )}

      <div className="space-y-3">
        <Label>Endereço</Label>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="logradouro">Logradouro</Label>
            <Input
              id="logradouro"
              value={formData.address.logradouro}
              onChange={(e) => setFormData({ 
                ...formData, 
                address: { ...formData.address, logradouro: e.target.value }
              })}
              placeholder="Rua, Avenida, etc."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="numero">Número</Label>
            <Input
              id="numero"
              value={formData.address.numero}
              onChange={(e) => setFormData({ 
                ...formData, 
                address: { ...formData.address, numero: e.target.value }
              })}
              placeholder="123"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="complemento">Complemento</Label>
            <Input
              id="complemento"
              value={formData.address.complemento}
              onChange={(e) => setFormData({ 
                ...formData, 
                address: { ...formData.address, complemento: e.target.value }
              })}
              placeholder="Apt, Casa, etc."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bairro">Bairro</Label>
            <Input
              id="bairro"
              value={formData.address.bairro}
              onChange={(e) => setFormData({ 
                ...formData, 
                address: { ...formData.address, bairro: e.target.value }
              })}
              placeholder="Centro"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="cep">CEP</Label>
            <Input
              id="cep"
              value={formData.address.cep}
              onChange={(e) => setFormData({ 
                ...formData, 
                address: { ...formData.address, cep: e.target.value }
              })}
              placeholder="87300-000"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cidade">Cidade</Label>
            <Input
              id="cidade"
              value={formData.address.cidade}
              onChange={(e) => setFormData({ 
                ...formData, 
                address: { ...formData.address, cidade: e.target.value }
              })}
              placeholder="Campo Mourão"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="uf">UF</Label>
            <Input
              id="uf"
              value={formData.address.uf}
              onChange={(e) => setFormData({ 
                ...formData, 
                address: { ...formData.address, uf: e.target.value }
              })}
              placeholder="PR"
              maxLength={2}
            />
          </div>
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Salvando..." : (initialData ? "Atualizar" : "Criar")}
        </Button>
      </div>
    </form>
  );
}

export default function AdminPrestadores() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    action: "activate" | "deactivate" | null;
  }>({
    open: false,
    action: null,
  });
  
  // Novos estados para os modais de criação e edição
  const [createDialog, setCreateDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    fetch(`${apiUrl}/users`)
      .then((res) => res.json())
      .then((data) => {
        const mappedProviders = data
          .filter((user: any) => user.role === "PRESTADOR")
          .map(mapProviderStatus);
        setProviders(mappedProviders);
      })
      .catch((err) => {
        console.error("Erro ao buscar prestadores:", err);
        setProviders([]);
      });
  }, []);

  const filteredProviders = providers.filter((provider) => {
    const matchesSearch =
      provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.services?.some((service: any) =>
        typeof service === "object"
          ? service.name.toLowerCase().includes(searchTerm.toLowerCase())
          : service.toLowerCase().includes(searchTerm.toLowerCase())
      );

    // Filtrar por status baseado no is_active
    let matchesStatus = false;
    if (statusFilter === "all") {
      matchesStatus = true;
    } else if (statusFilter === "active") {
      matchesStatus = provider.is_active === true;
    } else if (statusFilter === "inactive") {
      matchesStatus = provider.is_active === false;
    } else if (statusFilter === "pending") {
      // Aqui você pode definir a lógica para pendente se necessário
      matchesStatus = provider.status === "pending";
    }

    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (
    providerId: number,
    newStatus: "active" | "inactive"
  ) => {
    try {
      const isActive = newStatus === "active";
      await toggleProviderStatus(providerId, isActive);
      
      // Atualizar o estado local
      setProviders(
        providers.map((provider) =>
          provider.id === providerId
            ? { ...provider, status: newStatus, is_active: isActive }
            : provider
        )
      );
      
      setActionDialog({ open: false, action: null });
      setSelectedProvider(null);
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      // Aqui você pode adicionar uma notificação de erro
      alert(error instanceof Error ? error.message : 'Erro ao alterar status do prestador');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="status-active">Ativo</Badge>;
      case "inactive":
        return <Badge className="status-inactive">Inativo</Badge>;
      case "pending":
        return <Badge variant="secondary">Pendente</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Prestadores de Serviço
          </h1>
          <p className="text-muted-foreground">
            Gerencie os prestadores cadastrados na plataforma
          </p>
        </div>
        <Button 
          onClick={() => setCreateDialog(true)}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Prestador
        </Button>
      </div>

      {/* Filters */}
      <Card className="card-shadow">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, email ou serviço..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant={statusFilter === "all" ? "default" : "outline"}
                onClick={() => setStatusFilter("all")}
                size="sm"
              >
                Todos ({providers.length})
              </Button>
              <Button
                variant={statusFilter === "active" ? "default" : "outline"}
                onClick={() => setStatusFilter("active")}
                size="sm"
              >
                Ativos ({providers.filter((p) => p.is_active === true).length})
              </Button>
              <Button
                variant={statusFilter === "pending" ? "default" : "outline"}
                onClick={() => setStatusFilter("pending")}
                size="sm"
              >
                Pendentes (
                {providers.filter((p) => p.status === "pending").length})
              </Button>
              <Button
                variant={statusFilter === "inactive" ? "default" : "outline"}
                onClick={() => setStatusFilter("inactive")}
                size="sm"
              >
                Inativos (
                {providers.filter((p) => p.is_active === false).length})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Providers List */}
      <div className="grid gap-4">
        {filteredProviders.map((provider) => (
          <Card
            key={provider.id}
            className="card-shadow hover:shadow-lg transition-shadow"
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={provider.avatar} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                      {provider.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-foreground">
                        {provider.name}
                      </h3>
                      {getStatusBadge(provider.status)}
                    </div>

                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>{provider.email}</p>
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        <span>
                          {provider.phone ||
                            provider.whatsapp ||
                            "Não informado"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{formatAddress(provider.address)}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-3">
                      {provider.services?.map((service) => (
                        <Badge
                          key={service.id}
                          variant="outline"
                          className="text-xs"
                        >
                          {service.name}
                        </Badge>
                      ))}
                      {(!provider.services || provider.services.length === 0) && (
                        <Badge variant="outline" className="text-xs text-muted-foreground">
                          Nenhum serviço cadastrado
                        </Badge>
                      )}
                    </div>

                    {provider.status === "active" && (
                      <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                        <span>⭐ {provider.rating}/5.0</span>
                        <span>• {provider.totalJobs} trabalhos</span>
                        <span>• Desde {provider.joinDate}</span>
                      </div>
                    )}
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => {
                        setSelectedProvider(provider);
                        setEditDialog(true);
                      }}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Editar Prestador
                    </DropdownMenuItem>
                    {provider.status === "active" ? (
                      <DropdownMenuItem
                        className="text-error"
                        onClick={() => {
                          setSelectedProvider(provider);
                          setActionDialog({ open: true, action: "deactivate" });
                        }}
                      >
                        Desativar Prestador
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem
                        className="text-success"
                        onClick={() => {
                          setSelectedProvider(provider);
                          setActionDialog({ open: true, action: "activate" });
                        }}
                      >
                        Ativar Prestador
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProviders.length === 0 && (
        <Card className="card-shadow">
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">
              Nenhum prestador encontrado com os filtros aplicados.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Create Provider Section */}
      {createDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Criar Novo Prestador</h2>
              <p className="text-gray-600">
                Preencha os dados para cadastrar um novo prestador de serviços.
              </p>
            </div>
            <ProviderForm 
              onSubmit={async (data) => {
                try {
                  setLoading(true);
                  const newProvider = await createProvider(data);
                  setProviders([...providers, newProvider]);
                  setCreateDialog(false);
                } catch (error) {
                  console.error('Erro ao criar prestador:', error);
                  alert(error instanceof Error ? error.message : 'Erro ao criar prestador');
                } finally {
                  setLoading(false);
                }
              }}
              loading={loading}
              onCancel={() => setCreateDialog(false)}
            />
          </div>
        </div>
      )}

      {/* Edit Provider Section */}
      {editDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Editar Prestador</h2>
              <p className="text-gray-600">
                Atualize os dados do prestador {selectedProvider?.name}.
              </p>
            </div>
            {selectedProvider && (
              <ProviderForm 
                initialData={selectedProvider}
                onSubmit={async (data) => {
                  try {
                    setLoading(true);
                    const updatedProvider = await updateProvider(selectedProvider.id, data);
                    setProviders(providers.map(p => p.id === selectedProvider.id ? updatedProvider : p));
                    setEditDialog(false);
                    setSelectedProvider(null);
                  } catch (error) {
                    console.error('Erro ao atualizar prestador:', error);
                    alert(error instanceof Error ? error.message : 'Erro ao atualizar prestador');
                  } finally {
                    setLoading(false);
                  }
                }}
                loading={loading}
                onCancel={() => {
                  setEditDialog(false);
                  setSelectedProvider(null);
                }}
              />
            )}
          </div>
        </div>
      )}

      {/* Action Section */}
      {actionDialog.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">
                {actionDialog.action === "activate" ? "Ativar" : "Desativar"} Prestador
              </h2>
              <p className="text-gray-600">
                {actionDialog.action === "activate"
                  ? `Tem certeza que deseja ativar o prestador ${selectedProvider?.name}? Ele poderá receber novos trabalhos.`
                  : `Tem certeza que deseja desativar o prestador ${selectedProvider?.name}? Ele não aparecerá mais nas buscas.`}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setActionDialog({ open: false, action: null })}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                variant={
                  actionDialog.action === "activate" ? "default" : "destructive"
                }
                onClick={() => {
                  if (selectedProvider && actionDialog.action) {
                    handleStatusChange(
                      selectedProvider.id,
                      actionDialog.action === "activate" ? "active" : "inactive"
                    );
                  }
                }}
                className="flex-1"
              >
                {actionDialog.action === "activate" ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Ativar
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 mr-2" />
                    Desativar
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
