import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Users, 
  Search, 
  Edit, 
  Trash2, 
  UserPlus,
  Filter,
  MapPin,
  Phone,
  Mail,
  Plus
} from "lucide-react";
import { apiUrl } from "@/config/api";

interface Address {
  id: number;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cep: string;
  cidade: string;
  uf: string;
}

interface Contratante {
  id: number;
  name: string;
  email: string;
  whatsapp: string;
  photo_url: string;
  role: string;
  is_active: boolean;
  created_at: string;
  createdAt: string;
  date_created: string;
  updated_at: string;
  address?: Address;
}

// Funções de API
const createContratante = async (contratanteData: Partial<Contratante>): Promise<Contratante> => {
  const response = await fetch(`${apiUrl}/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...contratanteData,
      role: 'CONTRATANTE',
    }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Erro ao criar contratante');
  }
  
  const data = await response.json();
  return data;
};

const updateContratante = async (id: number, contratanteData: Partial<Contratante>): Promise<Contratante> => {
  const response = await fetch(`${apiUrl}/users/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(contratanteData),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Erro ao atualizar contratante');
  }
  
  const data = await response.json();
  return data;
};

const toggleContratanteStatus = async (id: number, isActive: boolean): Promise<Contratante> => {
  const response = await fetch(`${apiUrl}/users/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ is_active: isActive }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Erro ao alterar status do contratante');
  }
  
  const data = await response.json();
  return data;
};

// Componente para formulário de criação/edição de contratante
interface ContratanteFormProps {
  initialData?: Contratante;
  onSubmit: (data: Partial<Contratante>) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}

function ContratanteForm({ initialData, onSubmit, onCancel, loading }: ContratanteFormProps) {
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
      alert('Senha é obrigatória para novos contratantes');
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

const AdminContratantes = () => {
  const [contratantes, setContratantes] = useState<Contratante[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredContratantes, setFilteredContratantes] = useState<Contratante[]>([]);
  const [selectedContratante, setSelectedContratante] = useState<Contratante | null>(null);
  
  // Estados para modais
  const [createDialog, setCreateDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchContratantes();
  }, []);

  useEffect(() => {
    filterContratantes();
  }, [contratantes, searchTerm]);

  const fetchContratantes = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiUrl}/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Erro ao buscar contratantes');
      }
      
      const data = await response.json();
      console.log('Dados do backend:', data); // Debug temporário
      // Filtrar apenas contratantes (role = CLIENTE)
      const contratantesData = data.filter((user: Contratante) => 
        user.role === 'CONTRATANTE'
      );
      console.log('Contratantes filtrados:', contratantesData); // Debug temporário
      setContratantes(contratantesData);
    } catch (error) {
      console.error('Erro ao buscar contratantes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterContratantes = () => {
    if (!searchTerm.trim()) {
      setFilteredContratantes(contratantes);
      return;
    }

    const filtered = contratantes.filter(contratante =>
      contratante.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contratante.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contratante.whatsapp.includes(searchTerm) ||
      (contratante.address?.cidade?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (contratante.address?.bairro?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredContratantes(filtered);
  };

  const toggleUserStatus = async (id: number, currentStatus: boolean) => {
    try {
      setActionLoading(true);
      const newStatus = !currentStatus;
      await toggleContratanteStatus(id, newStatus);
      
      // Atualizar o estado local
      setContratantes(contratantes.map(contratante =>
        contratante.id === id 
          ? { ...contratante, is_active: newStatus }
          : contratante
      ));
    } catch (error) {
      console.error('Erro ao alterar status do contratante:', error);
      alert(error instanceof Error ? error.message : 'Erro ao alterar status do contratante');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateContratante = async (data: Partial<Contratante>) => {
    try {
      setActionLoading(true);
      const newContratante = await createContratante(data);
      setContratantes([...contratantes, newContratante]);
      setCreateDialog(false);
    } catch (error) {
      console.error('Erro ao criar contratante:', error);
      alert(error instanceof Error ? error.message : 'Erro ao criar contratante');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditContratante = async (data: Partial<Contratante>) => {
    if (!selectedContratante) return;
    
    try {
      setActionLoading(true);
      const updatedContratante = await updateContratante(selectedContratante.id, data);
      setContratantes(contratantes.map(contratante =>
        contratante.id === selectedContratante.id ? updatedContratante : contratante
      ));
      setEditDialog(false);
      setSelectedContratante(null);
    } catch (error) {
      console.error('Erro ao atualizar contratante:', error);
      alert(error instanceof Error ? error.message : 'Erro ao atualizar contratante');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Data não informada";
    
    try {
      // Tentar diferentes formatos de data
      const date = new Date(dateString);
      
      // Verificar se a data é válida
      if (isNaN(date.getTime())) {
        return "Data inválida";
      }
      
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return "Data inválida";
    }
  };

  const formatAddress = (address?: Address) => {
    if (!address) return "Não informado";
    return `${address.logradouro}, ${address.numero} - ${address.bairro}, ${address.cidade}/${address.uf}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Carregando contratantes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Users className="w-8 h-8 text-primary" />
            Contratantes
          </h1>
          <p className="text-muted-foreground">
            Gerencie os usuários contratantes da plataforma
          </p>
        </div>
        <Button 
          onClick={() => setCreateDialog(true)}
          className="bg-primary hover:bg-primary/90"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Novo Contratante
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <div className="flex gap-1 items-center">
                <p className="text-2xl font-bold">{contratantes.length}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div className="flex gap-1 items-center">
                <p className="text-2xl font-bold">
                  {contratantes.filter(c => c.is_active).length}
                </p>
                <p className="text-sm text-muted-foreground">Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="flex gap-1 items-center">
                <p className="text-2xl font-bold">
                  {contratantes.filter(c => !c.is_active).length}
                </p>
                <p className="text-sm text-muted-foreground">Inativos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar por nome, email, telefone ou cidade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Contratantes ({filteredContratantes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contratante</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Endereço</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Cadastro</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContratantes.map((contratante) => (
                <TableRow key={contratante.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img
                        src={contratante.photo_url}
                        alt={contratante.name}
                        className="w-10 h-10 rounded-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder-avatar.png";
                        }}
                      />
                      <div>
                        <p className="font-medium">{contratante.name}</p>
                        <p className="text-sm text-muted-foreground">ID: {contratante.id}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-3 h-3 text-muted-foreground" />
                        <span>{contratante.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-3 h-3 text-muted-foreground" />
                        <span>{contratante.whatsapp}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-3 h-3 text-muted-foreground" />
                      <span className="max-w-48 truncate">
                        {formatAddress(contratante.address)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={contratante.is_active ? "default" : "destructive"}
                      className="cursor-pointer"
                      onClick={() => toggleUserStatus(contratante.id, contratante.is_active)}
                    >
                      {contratante.is_active ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {contratante.created_at || 
                       contratante.createdAt || 
                       contratante.created_at || 
                       contratante.date_created || 
                       "Data não disponível"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => {
                          setSelectedContratante(contratante);
                          setEditDialog(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredContratantes.length === 0 && (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? "Nenhum contratante encontrado com os filtros aplicados" : "Nenhum contratante cadastrado"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Contratante Dialog */}
      {createDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Criar Novo Contratante</h2>
              <p className="text-gray-600">
                Preencha os dados para cadastrar um novo contratante.
              </p>
            </div>
            <ContratanteForm 
              onSubmit={handleCreateContratante}
              loading={actionLoading}
              onCancel={() => setCreateDialog(false)}
            />
          </div>
        </div>
      )}

      {/* Edit Contratante Dialog */}
      {editDialog && selectedContratante && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Editar Contratante</h2>
              <p className="text-gray-600">
                Atualize os dados do contratante {selectedContratante.name}.
              </p>
            </div>
            <ContratanteForm 
              initialData={selectedContratante}
              onSubmit={handleEditContratante}
              loading={actionLoading}
              onCancel={() => {
                setEditDialog(false);
                setSelectedContratante(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminContratantes;