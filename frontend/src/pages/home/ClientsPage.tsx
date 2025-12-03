import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiUrl } from "@/config/api";
import {
  Search,
  Star,
  MapPin,
  Phone,
  Calendar,
  LogOut,
  User,
  Menu,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/contexts/AuthContext";
import BookServiceModal from "@/components/booking/BookServiceModal";
import { useNavigate } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface Service {
  id: number;
  name: string;
  description: string;
}

interface Address {
  logradouro: string;
  numero: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
}

interface Availability {
  weekday: number;
  start_time: string;
  end_time: string;
}

interface Provider {
  id: number;
  name: string;
  email: string;
  whatsapp: string;
  photo_url: string;
  address: Address;
  services: Service[];
  availability: Availability[];
  averageRating?: number;
}

const weekdays = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
];

const ClientsPage = () => {
  const { toast } = useToast();
  const { logout, user, token } = useAuthContext();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [showOrdersSheet, setShowOrdersSheet] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<any>(null);
  const [showOrderDetailsDialog, setShowOrderDetailsDialog] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState("");
  const [providers, setProviders] = useState<Provider[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);

  const [searchName, setSearchName] = useState("");
  const [selectedService, setSelectedService] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedUf, setSelectedUf] = useState("");

  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(
    null
  );
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    // fetch client orders on mount
    fetchClientOrders();
  }, []);

  // Carregar prestadores ao iniciar ou quando filtros mudarem (com debounce)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchProviders();
    }, 500); // Aguarda 500ms após parar de digitar

    return () => clearTimeout(timeoutId);
  }, [selectedService, selectedCity, selectedUf]);

  const fetchServices = async () => {
    try {
      const response = await fetch(`${apiUrl}/services`);
      if (!response.ok) throw new Error("Erro ao carregar serviços");
      const data = await response.json();
      setServices(data.filter((s: Service) => s));
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os serviços",
        variant: "destructive",
      });
    }
  };

  const fetchProviders = async () => {
    setLoading(true);
    try {
      let url = `${apiUrl}/providers?`;

      if (selectedService && selectedService.trim() !== "")
        url += `serviceId=${selectedService}&`;
      if (selectedCity && selectedCity.trim() !== "")
        url += `cidade=${selectedCity}&`;
      if (selectedUf && selectedUf.trim() !== "") url += `uf=${selectedUf}&`;
      const response = await fetch(url);
      if (!response.ok) {
        // Apenas loga erro sem mostrar toast
        console.error("Erro ao buscar prestadores:", response.status);
        setProviders([]);
        return;
      }
      const data = await response.json();
      setProviders(Array.isArray(data) ? data : []);
    } catch (error) {
      // Apenas erros de rede críticos
      console.error("Erro de rede:", error);
      setProviders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const filteredProviders = providers.filter((provider) =>
    provider.name.toLowerCase().includes(searchName.toLowerCase())
  );

  const openProviderDetails = (provider: Provider) => {
    setSelectedProvider(provider);
    setShowDetailsDialog(true);
  };

  const formatDateTime = (iso?: string) => {
    if (!iso) return "";
    try {
      return new Date(iso).toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return iso;
    }
  };

  const fetchClientOrders = async () => {
    try {
      const res = await fetch(`${apiUrl}/orders`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
      if (!res.ok) return;
      const data = await res.json();
      // filter only customer orders (server usually returns based on token)
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erro ao buscar pedidos do cliente", err);
    }
  };

  const openOrderDetails = (order: any) => {
    setSelectedOrderDetails(order);
    setShowOrderDetailsDialog(true);
  };

  const openReviewForOrder = (order: any) => {
    setSelectedOrderDetails(order);
    setReviewRating(5);
    setReviewComment("");
    setShowReviewDialog(true);
  };

  const submitReview = async () => {
    if (!selectedOrderDetails) return;
    try {
      const body: any = {
        rating: reviewRating,
        comment: reviewComment,
        order_id: selectedOrderDetails.id,
      };
      // if provider info available, set target
      if (selectedOrderDetails.provider && selectedOrderDetails.provider.id)
        body.target_id = selectedOrderDetails.provider.id;

      const res = await fetch(`${apiUrl}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || `Erro: ${res.status}`);
      }
      toast({ title: "Sucesso", description: "Avaliação enviada" });
      setShowReviewDialog(false);
      await fetchClientOrders();
    } catch (err: any) {
      toast({
        title: "Erro",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const formatWhatsApp = (whatsapp: string) => {
    return whatsapp.replace(/\D/g, "");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-primary">ServicesClimber</h1>
            <div className="flex items-center gap-4">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Minha Conta</SheetTitle>
                    <SheetDescription>Área do Contratante</SheetDescription>
                  </SheetHeader>
                  <div className="mt-6 space-y-4">
                    <Button variant="outline" className="w-full justify-start">
                      <User className="mr-2 h-4 w-4" />
                      Meu Perfil
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => setShowOrdersSheet(true)}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      Meus Pedidos
                    </Button>
                    <Button
                      variant="destructive"
                      className="w-full justify-start"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sair
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Filtros */}
      <div className="bg-white border-b py-6">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome..."
                className="pl-10"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
              />
            </div>

            <Select value={selectedService} onValueChange={setSelectedService}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo de Serviço" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=" ">Todos os Serviços</SelectItem>
                {services.map((service) => (
                  <SelectItem key={service.id} value={service.id.toString()}>
                    {service.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              placeholder="Cidade"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
            />

            <Input
              placeholder="Estado (UF)"
              value={selectedUf}
              onChange={(e) => setSelectedUf(e.target.value.toUpperCase())}
              maxLength={2}
            />
          </div>
        </div>
      </div>

      {/* Lista de Prestadores */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            Prestadores de Serviço
          </h2>
          <p className="text-gray-600 mt-1">
            {filteredProviders.length} prestador(es) encontrado(s)
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Carregando prestadores...</p>
          </div>
        ) : filteredProviders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">
              Nenhum prestador encontrado com os filtros selecionados.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProviders.map((provider) => (
              <Card
                key={provider.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage
                        src={provider.photo_url}
                        alt={provider.name}
                      />
                      <AvatarFallback>
                        {provider.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{provider.name}</CardTitle>
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {provider.address?.cidade}, {provider.address?.uf}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {provider.services?.slice(0, 3).map((service) => (
                      <Badge key={service.id} variant="secondary">
                        {service.name}
                      </Badge>
                    ))}
                    {provider.services?.length > 3 && (
                      <Badge variant="outline">
                        +{provider.services.length - 3}
                      </Badge>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => openProviderDetails(provider)}
                  >
                    Ver Detalhes
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() =>
                      window.open(
                        `https://wa.me/55${formatWhatsApp(provider.whatsapp)}`,
                        "_blank"
                      )
                    }
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    WhatsApp
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Dialog de Detalhes do Prestador */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Prestador</DialogTitle>
          </DialogHeader>
          {selectedProvider && (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage
                    src={selectedProvider.photo_url}
                    alt={selectedProvider.name}
                  />
                  <AvatarFallback>
                    {selectedProvider.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">
                    {selectedProvider.name}
                  </h3>
                  <p className="text-gray-600">{selectedProvider.email}</p>
                  <p className="text-gray-600">{selectedProvider.whatsapp}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Endereço</h4>
                <p className="text-gray-600">
                  {selectedProvider.address?.logradouro},{" "}
                  {selectedProvider.address?.numero}
                  {selectedProvider.address?.bairro &&
                    ` - ${selectedProvider.address.bairro}`}
                </p>
                <p className="text-gray-600">
                  {selectedProvider.address?.cidade} -{" "}
                  {selectedProvider.address?.uf}
                </p>
                <p className="text-gray-600">
                  CEP: {selectedProvider.address?.cep}
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Serviços Prestados</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedProvider.services?.map((service) => (
                    <Badge key={service.id} variant="secondary">
                      {service.name}
                    </Badge>
                  ))}
                </div>
              </div>

              {selectedProvider.availability &&
                selectedProvider.availability.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">
                      Horários de Atendimento
                    </h4>
                    <div className="space-y-2">
                      {selectedProvider.availability.map((avail, index) => (
                        <div
                          key={index}
                          className="flex justify-between text-sm p-2 bg-gray-50 rounded"
                        >
                          <span className="font-medium">
                            {weekdays[avail.weekday]}
                          </span>
                          <span className="text-gray-600">
                            {avail.start_time} - {avail.end_time}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          )}
          <DialogFooter>
            <Button
              onClick={() =>
                selectedProvider &&
                window.open(
                  `https://wa.me/55${formatWhatsApp(
                    selectedProvider.whatsapp
                  )}`,
                  "_blank"
                )
              }
            >
              <Phone className="h-4 w-4 mr-2" />
              Entrar em Contato
            </Button>
            <Button
              onClick={() => {
                if (!selectedProvider) return;
                setShowBookingModal(true);
              }}
            >
              Agendar pelo site
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Booking modal */}
      {selectedProvider && (
        <BookServiceModal
          open={showBookingModal}
          onOpenChange={setShowBookingModal}
          provider={selectedProvider}
          onBooked={() => {
            toast({
              title: "Pedido",
              description: "Pedido enviado com sucesso",
            });
            // opcional: fechar detalhes
            setShowDetailsDialog(false);
          }}
        />
      )}

      {/* Meus Pedidos Sheet (cliente) */}
      <Sheet open={showOrdersSheet} onOpenChange={setShowOrdersSheet}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Meus Pedidos</SheetTitle>
            <SheetDescription>
              Pedidos em andamento e concluídos
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-4 mt-4">
            {orders.length === 0 ? (
              <div className="text-sm text-gray-600">Nenhum pedido</div>
            ) : (
              orders.map((o) => (
                <Card key={o.id} className="mb-2">
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">Pedido #{o.id}</div>
                        <div className="text-sm text-gray-600">
                          {o.provider?.name || "—"}
                        </div>
                        <div className="text-sm text-gray-600">
                          Agendado: {formatDateTime(o.scheduled_at)}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge>{o.status}</Badge>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openOrderDetails(o)}
                          >
                            Ver
                          </Button>
                          {((o.status || "").toUpperCase() === "DONE" ||
                            (o.status || "").toUpperCase() === "CONCLUIDO") && (
                            <Button
                              size="sm"
                              onClick={() => openReviewForOrder(o)}
                            >
                              Avaliar
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Order Details Dialog (from Meus Pedidos) */}
      <Dialog
        open={showOrderDetailsDialog}
        onOpenChange={setShowOrderDetailsDialog}
      >
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Pedido</DialogTitle>
          </DialogHeader>
          {selectedOrderDetails ? (
            <div className="space-y-4">
              <div className="font-medium">
                Pedido #{selectedOrderDetails.id}
              </div>
              <div className="text-sm text-gray-600">
                Cliente: {selectedOrderDetails.customer?.name || user?.name}
              </div>
              <div className="text-sm text-gray-600">
                Criado: {formatDateTime(selectedOrderDetails.created_at)}
              </div>
              {selectedOrderDetails.scheduled_at && (
                <div className="text-sm text-gray-600">
                  Agendado para:{" "}
                  {formatDateTime(selectedOrderDetails.scheduled_at)}
                </div>
              )}
              <div>
                <div className="font-medium">Serviços</div>
                <ul className="list-disc list-inside">
                  {(selectedOrderDetails.services || []).map(
                    (s: any, i: number) => (
                      <li key={i}>
                        {s && s.name ? s.name : String(s)}
                        {s && s.OrderService && s.OrderService.quantidade ? (
                          <span className="text-sm text-gray-500">
                            {" "}
                            — qty: {s.OrderService.quantidade}
                          </span>
                        ) : null}
                        {s && s.OrderService && s.OrderService.scheduled_at ? (
                          <div className="text-sm text-gray-600">
                            Agendado para:{" "}
                            {formatDateTime(s.OrderService.scheduled_at)}
                          </div>
                        ) : null}
                      </li>
                    )
                  )}
                </ul>
              </div>
            </div>
          ) : (
            <div>Carregando...</div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowOrderDetailsDialog(false)}
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Avaliar Prestador</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              Pedido #{selectedOrderDetails?.id}
            </div>
            <div>
              <Label>Nota</Label>
              <div className="flex gap-2 mt-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Button
                    key={n}
                    variant={n <= reviewRating ? "default" : "ghost"}
                    onClick={() => setReviewRating(n)}
                  >
                    {n}★
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <Label>Comentário</Label>
              <Textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowReviewDialog(false)}
            >
              Cancelar
            </Button>
            <Button onClick={submitReview}>Enviar Avaliação</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientsPage;
