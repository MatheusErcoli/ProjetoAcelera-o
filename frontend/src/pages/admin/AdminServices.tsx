import React, { useState, useEffect } from "react";
import { adminLogger } from "@/lib/adminLogger";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Briefcase,
  Search,
  Edit,
  Plus,
  Filter,
  Calendar,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { apiUrl } from "@/config/api";

interface Service {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const createService = async (serviceData: Partial<Service>): Promise<Service> => {
  const response = await fetch(`${apiUrl}/services`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(serviceData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Erro ao criar serviço");
  }

  const data = await response.json();
  return data;
};

const updateService = async (
  id: number,
  serviceData: Partial<Service>
): Promise<Service> => {
  const response = await fetch(`${apiUrl}/services/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(serviceData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Erro ao atualizar serviço");
  }

  const data = await response.json();
  return data;
};

const toggleServiceStatus = async (
  id: number,
  isActive: boolean
): Promise<Service> => {
  const response = await fetch(`${apiUrl}/services/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ is_active: isActive }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Erro ao alterar status do serviço");
  }

  const data = await response.json();
  return data;
};

interface ServiceFormProps {
  initialData?: Service;
  onSubmit: (data: Partial<Service>) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}

function ServiceForm({
  initialData,
  onSubmit,
  onCancel,
  loading,
}: ServiceFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Nome do serviço é obrigatório");
      return;
    }

    if (!formData.description.trim()) {
      alert("Descrição do serviço é obrigatória");
      return;
    }

    const submitData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
    };

    await onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome do Serviço *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Ex: Limpeza Residencial"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="Descreva detalhadamente o serviço oferecido..."
          rows={4}
          required
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Salvando..." : initialData ? "Atualizar" : "Criar"}
        </Button>
      </div>
    </form>
  );
}

const AdminServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">(
    "all"
  );

  // Estados para modais
  const [createDialog, setCreateDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    filterServices();
  }, [services, searchTerm, statusFilter]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiUrl}/services`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Erro ao buscar serviços");
      }

      const data = await response.json();
      setServices(data);
    } catch (error) {
      console.error("Erro ao buscar serviços:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterServices = () => {
    let filtered = services;

    // Filtrar por status
    if (statusFilter === "active") {
      filtered = filtered.filter((service) => service.is_active);
    } else if (statusFilter === "inactive") {
      filtered = filtered.filter((service) => !service.is_active);
    }

    // Filtrar por busca
    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (service) =>
          service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          service.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredServices(filtered);
  };

  const toggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      setActionLoading(true);
      const newStatus = !currentStatus;
      const serviceName = services.find(s => s.id === id)?.name || "";
      
      // Confirmar desativação se houver prestadores usando o serviço
      if (!newStatus) {
        const confirmMessage = `Atenção: Ao desativar o serviço "${serviceName}", ele será automaticamente removido de todos os prestadores que o oferecem. Deseja continuar?`;
        if (!confirm(confirmMessage)) {
          setActionLoading(false);
          return;
        }
      }
      
      const updatedService = await toggleServiceStatus(id, newStatus);

      // Atualizar o estado local
      setServices(
        services.map((service) =>
          service.id === id ? { ...service, is_active: newStatus } : service
        )
      );

      // Log ativação/desativação no backend
      if (newStatus) {
        await adminLogger.activated(
          "services",
          id,
          `${updatedService.name} - Serviço ativado`
        );
      } else {
        await adminLogger.deactivated(
          "services",
          id,
          `${updatedService.name} - Serviço desativado e removido de todos os prestadores`
        );
      }
    } catch (error) {
      console.error("Erro ao alterar status do serviço:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Erro ao alterar status do serviço"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateService = async (data: Partial<Service>) => {
    try {
      setActionLoading(true);
      const newService = await createService(data);
      setServices([...services, newService]);

      // Log criação no backend
      await adminLogger.created(
        "services",
        newService.id,
        `Novo serviço: ${newService.name}`
      );

      setCreateDialog(false);
    } catch (error) {
      console.error("Erro ao criar serviço:", error);
      alert(
        error instanceof Error ? error.message : "Erro ao criar serviço"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditService = async (data: Partial<Service>) => {
    if (!selectedService) return;

    try {
      setActionLoading(true);
      const updatedService = await updateService(selectedService.id, data);
      setServices(
        services.map((service) =>
          service.id === selectedService.id ? updatedService : service
        )
      );

      // Log atualização no backend
      await adminLogger.updated(
        "services",
        updatedService.id,
        `${updatedService.name} - Serviço atualizado`
      );

      setEditDialog(false);
      setSelectedService(null);
    } catch (error) {
      console.error("Erro ao atualizar serviço:", error);
      alert(
        error instanceof Error ? error.message : "Erro ao atualizar serviço"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Data não informada";

    try {
      const date = new Date(dateString);

      if (isNaN(date.getTime())) {
        return "Data inválida";
      }

      return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.error("Erro ao formatar data:", error);
      return "Data inválida";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Carregando serviços...</p>
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
            <Briefcase className="w-8 h-8 text-primary" />
            Serviços
          </h1>
          <p className="text-muted-foreground">
            Gerencie os serviços oferecidos na plataforma
          </p>
        </div>
        <Button
          onClick={() => setCreateDialog(true)}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Serviço
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-primary" />
              <div className="flex gap-1 items-center">
                <p className="text-2xl font-bold">{services.length}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div className="flex gap-1 items-center">
                <p className="text-2xl font-bold">
                  {services.filter((s) => s.is_active).length}
                </p>
                <p className="text-sm text-muted-foreground">Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" />
              <div className="flex gap-1 items-center">
                <p className="text-2xl font-bold">
                  {services.filter((s) => !s.is_active).length}
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
                placeholder="Buscar por nome ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === "all" ? "default" : "outline"}
                onClick={() => setStatusFilter("all")}
                size="sm"
              >
                Todos
              </Button>
              <Button
                variant={statusFilter === "active" ? "default" : "outline"}
                onClick={() => setStatusFilter("active")}
                size="sm"
              >
                Ativos
              </Button>
              <Button
                variant={statusFilter === "inactive" ? "default" : "outline"}
                onClick={() => setStatusFilter("inactive")}
                size="sm"
              >
                Inativos
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Lista de Serviços ({filteredServices.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nome do Serviço</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Cadastro</TableHead>
                <TableHead>Última Atualização</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredServices.map((service) => (
                <TableRow key={service.id}>
                  <TableCell>
                    <span className="font-mono text-sm">#{service.id}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-primary" />
                      <span className="font-medium">{service.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-muted-foreground max-w-md truncate">
                      {service.description}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={`${
                        service.is_active
                          ? "hover:bg-green-700 bg-green-600"
                          : "hover:bg-red-700 bg-red-600"
                      } cursor-pointer`}
                      onClick={() =>
                        toggleStatus(service.id, service.is_active)
                      }
                    >
                      {service.is_active ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(service.created_at)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(service.updated_at)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSelectedService(service);
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

          {filteredServices.length === 0 && (
            <div className="text-center py-8">
              <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== "all"
                  ? "Nenhum serviço encontrado com os filtros aplicados"
                  : "Nenhum serviço cadastrado"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Service Dialog */}
      {createDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">
                Criar Novo Serviço
              </h2>
              <p className="text-gray-600">
                Preencha os dados para cadastrar um novo serviço.
              </p>
            </div>
            <ServiceForm
              onSubmit={handleCreateService}
              loading={actionLoading}
              onCancel={() => setCreateDialog(false)}
            />
          </div>
        </div>
      )}

      {/* Edit Service Dialog */}
      {editDialog && selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Editar Serviço</h2>
              <p className="text-gray-600">
                Atualize os dados do serviço "{selectedService.name}".
              </p>
            </div>
            <ServiceForm
              initialData={selectedService}
              onSubmit={handleEditService}
              loading={actionLoading}
              onCancel={() => {
                setEditDialog(false);
                setSelectedService(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminServices;