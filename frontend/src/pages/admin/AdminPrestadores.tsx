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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Provider {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  services: string[];
  status: "active" | "inactive" | "pending";
  rating: number;
  totalJobs: number;
  joinDate: string;
  avatar?: string;
}

// Os dados agora serão buscados do backend

export default function AdminPrestadores() {
  const [providers, setProviders] = useState<Provider[]>([]);
  useEffect(() => {
    fetch(`${apiUrl}/providers`)
      .then((res) => res.json())
      .then((data) => setProviders(data))
      .catch((err) => {
        console.error("Erro ao buscar prestadores:", err);
        setProviders([]); // ou setProviders(mockProviders) para fallback
      });
  }, []);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(
    null
  );
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    action: "activate" | "deactivate" | null;
  }>({
    open: false,
    action: null,
  });

  const filteredProviders = providers.filter((provider) => {
    const matchesSearch =
      provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.services.some((service: any) =>
        typeof service === "object"
          ? service.name.toLowerCase().includes(searchTerm.toLowerCase())
          : service.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesStatus =
      statusFilter === "all" || provider.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (
    providerId: number,
    newStatus: "active" | "inactive"
  ) => {
    setProviders(
      providers.map((provider) =>
        provider.id === providerId
          ? { ...provider, status: newStatus }
          : provider
      )
    );
    setActionDialog({ open: false, action: null });
    setSelectedProvider(null);
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
                Ativos ({providers.filter((p) => p.status === "active").length})
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
                {providers.filter((p) => p.status === "inactive").length})
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
                        <span>
                          {typeof provider.address === "object" &&
                          provider.address !== null
                            ? `${provider.address.logradouro || ""}, ${
                                provider.address.numero || ""
                              }${
                                provider.address.complemento
                                  ? " - " + provider.address.complemento
                                  : ""
                              }, ${provider.address.bairro || ""}, ${
                                provider.address.cidade || ""
                              }-${provider.address.uf || ""}`
                            : provider.address}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-3">
                      {provider.services.map((service: any) => (
                        <Badge
                          key={service.id || service}
                          variant="outline"
                          className="text-xs"
                        >
                          {typeof service === "object" && service !== null
                            ? service.name
                            : service}
                        </Badge>
                      ))}
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
                    <DropdownMenuItem>Ver Perfil Completo</DropdownMenuItem>
                    <DropdownMenuItem>Ver Avaliações</DropdownMenuItem>
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

      {/* Action Dialog */}
      <Dialog
        open={actionDialog.open}
        onOpenChange={(open) => setActionDialog({ open, action: null })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionDialog.action === "activate" ? "Ativar" : "Desativar"}{" "}
              Prestador
            </DialogTitle>
            <DialogDescription>
              {actionDialog.action === "activate"
                ? `Tem certeza que deseja ativar o prestador ${selectedProvider?.name}? Ele poderá receber novos trabalhos.`
                : `Tem certeza que deseja desativar o prestador ${selectedProvider?.name}? Ele não aparecerá mais nas buscas.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setActionDialog({ open: false, action: null })}
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
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
