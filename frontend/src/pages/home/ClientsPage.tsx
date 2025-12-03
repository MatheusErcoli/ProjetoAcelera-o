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
  Clock,
  MessageSquare,
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
  is_active?: boolean;
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
  reviewCount?: number;
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
  const [providerReviews, setProviderReviews] = useState<any[]>([]);
  const [loadingProviderReviews, setLoadingProviderReviews] = useState(false);
  const [reviewedOrders, setReviewedOrders] = useState<Set<number>>(new Set());
  const [myReviews, setMyReviews] = useState<any[]>([]);
  const [showMyReviewsSheet, setShowMyReviewsSheet] = useState(false);
  const [loadingMyReviews, setLoadingMyReviews] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<any>(null);

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
      // Filtrar apenas serviços ativos
      setServices(data.filter((s: Service) => s && s.is_active !== false));
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
    loadProviderReviews(provider.id);
  };

  const loadProviderReviews = async (providerId: number) => {
    setLoadingProviderReviews(true);
    try {
      const headers: any = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch(`${apiUrl}/reviews?providerId=${providerId}`, {
        headers,
      });
      if (!res.ok) {
        console.error("Erro ao carregar avaliações", res.status);
        setProviderReviews([]);
        return;
      }
      const data = await res.json();
      setProviderReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erro ao carregar avaliações", err);
      setProviderReviews([]);
    } finally {
      setLoadingProviderReviews(false);
    }
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

  const translateStatus = (status: string) => {
    const s = (status || "").toUpperCase();
    if (s === "REQUESTED") return "Solicitado";
    if (s === "PENDENTE") return "Pendente";
    if (s === "CONFIRMED") return "Confirmado";
    if (s === "CONFIRMADO") return "Confirmado";
    if (s === "DONE") return "Concluído";
    if (s === "CONCLUIDO") return "Concluído";
    if (s === "CONCLUDED") return "Concluído";
    if (s === "CANCELLED") return "Cancelado";
    if (s === "CANCELADO") return "Cancelado";
    return status;
  };

  const getStatusColor = (status: string) => {
    const s = (status || "").toUpperCase();
    if (s === "REQUESTED" || s === "PENDENTE") return "bg-yellow-500";
    if (s === "CONFIRMED" || s === "CONFIRMADO") return "bg-blue-500";
    if (s === "DONE" || s === "CONCLUIDO" || s === "CONCLUDED") return "bg-green-500";
    if (s === "CANCELLED" || s === "CANCELADO") return "bg-red-500";
    return "bg-gray-500";
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
      
      // Check which orders have been reviewed by this user
      await checkReviewedOrders(data);
    } catch (err) {
      console.error("Erro ao buscar pedidos do cliente", err);
    }
  };

  const checkReviewedOrders = async (ordersList: any[]) => {
    if (!user) return;
    
    const reviewed = new Set<number>();
    
    for (const order of ordersList) {
      try {
        const res = await fetch(`${apiUrl}/reviews?orderId=${order.id}`, {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        });
        
        if (res.ok) {
          const reviews = await res.json();
          const hasUserReviewed = reviews.some(
            (review: any) => review.author_id === user.id
          );
          
          if (hasUserReviewed) {
            reviewed.add(order.id);
          }
        }
      } catch (err) {
        console.error(`Erro ao verificar avaliação do pedido ${order.id}`, err);
      }
    }
    
    setReviewedOrders(reviewed);
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
      
      // Mark this order as reviewed
      if (selectedOrderDetails) {
        setReviewedOrders(prev => new Set(prev).add(selectedOrderDetails.id));
      }
      
      await fetchClientOrders();
    } catch (err: any) {
      toast({
        title: "Erro",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const updateOrderStatus = async (orderId: number, status: string) => {
    try {
      const res = await fetch(`${apiUrl}/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || `Erro: ${res.status}`);
      }

      toast({ title: "Sucesso", description: "Status atualizado com sucesso" });
      await fetchClientOrders();
      setShowOrderDetailsDialog(false);
    } catch (err: any) {
      toast({
        title: "Erro",
        description: err.message || "Erro ao atualizar status",
        variant: "destructive",
      });
    }
  };

  const formatWhatsApp = (whatsapp: string) => {
    return whatsapp.replace(/\D/g, "");
  };

  const fetchMyReviews = async () => {
    if (!user) return;
    setLoadingMyReviews(true);
    try {
      const res = await fetch(`${apiUrl}/reviews?targetId=${user.id}`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
      
      if (res.ok) {
        const data = await res.json();
        setMyReviews(Array.isArray(data) ? data : []);
      } else {
        setMyReviews([]);
      }
    } catch (err) {
      console.error("Erro ao carregar minhas avaliações", err);
      setMyReviews([]);
    } finally {
      setLoadingMyReviews(false);
    }
  };

  const calculateAverageRating = () => {
    if (myReviews.length === 0) return "0.0";
    const sum = myReviews.reduce((acc, review) => acc + (review.rating || 0), 0);
    return (sum / myReviews.length).toFixed(1);
  };

  const openCancelDialog = (order: any) => {
    setOrderToCancel(order);
    setShowCancelDialog(true);
  };

  const handleCancelOrder = async () => {
    if (!orderToCancel) return;
    
    try {
      const res = await fetch(`${apiUrl}/orders/${orderToCancel.id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ status: "CANCELLED" }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || `Erro: ${res.status}`);
      }

      toast({ 
        title: "Sucesso", 
        description: "Pedido cancelado com sucesso" 
      });
      
      setShowCancelDialog(false);
      setOrderToCancel(null);
      await fetchClientOrders();
    } catch (err: any) {
      toast({
        title: "Erro",
        description: err.message || "Erro ao cancelar pedido",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary">PrestadoresClimber</h1>
              <p className="text-xs text-gray-500 mt-1">Área do Cliente</p>
            </div>
            <div className="flex items-center gap-3">
              {user && (
                <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-lg">
                  <User className="h-4 w-4 text-primary" />
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">Cliente</p>
                  </div>
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowOrdersSheet(true)}
                className="hidden md:flex items-center gap-2"
              >
                <Calendar className="h-4 w-4" />
                <span>Meus Pedidos</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowMyReviewsSheet(true);
                  fetchMyReviews();
                }}
                className="hidden md:flex items-center gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Minhas Avaliações</span>
              </Button>
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
                    {user && (
                      <div className="p-3 bg-primary/10 rounded-lg mb-4">
                        <div className="flex items-center gap-2">
                          <User className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium text-gray-900">{user.name}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    <Button
                      className="w-full justify-start"
                      onClick={() => setShowOrdersSheet(true)}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      Meus Pedidos
                    </Button>
                    <Button
                      className="w-full justify-start"
                      variant="outline"
                      onClick={() => {
                        setShowMyReviewsSheet(true);
                        fetchMyReviews();
                      }}
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Minhas Avaliações
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
      <div className="bg-white border-b py-6 shadow-sm">
        <div className="container mx-auto px-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Filtros de Busca</h3>
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
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16 border-2 border-primary/20">
                      <AvatarImage
                        src={provider.photo_url}
                        alt={provider.name}
                      />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {provider.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">{provider.name}</CardTitle>
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3 text-gray-500 flex-shrink-0" />
                        <span className="text-sm text-gray-600 truncate">
                          {provider.address?.cidade}, {provider.address?.uf}
                        </span>
                      </div>
                      <div className="mt-2">
                        <div className="flex items-center gap-2 bg-yellow-50 px-2 py-1 rounded-lg w-fit">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold text-gray-800">
                            {provider.averageRating?.toFixed(1) || "0.0"}
                          </span>
                          <span className="text-xs text-gray-500">/ 5.0</span>
                        </div>
                        {provider.reviewCount !== undefined && (
                          <p className="text-xs text-gray-500 mt-1">
                            {provider.reviewCount === 0 
                              ? "Sem avaliações" 
                              : `Média de ${provider.reviewCount} ${provider.reviewCount === 1 ? 'avaliação' : 'avaliações'}`}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 pt-3">
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-2">Serviços Oferecidos:</p>
                    <div className="flex flex-wrap gap-2">
                      {provider.services?.slice(0, 3).map((service) => (
                        <Badge key={service.id} variant="secondary" className="text-xs">
                          {service.name}
                        </Badge>
                      ))}
                      {provider.services?.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{provider.services.length - 3} mais
                        </Badge>
                      )}
                    </div>
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
                  <p className="text-gray-600">{selectedProvider.whatsapp}</p>
                </div>
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
                      {[...selectedProvider.availability]
                        .sort((a, b) => {
                          // Ordenar por dia da semana primeiro (Segunda=1, Domingo=0 vai pro final)
                          const weekdayA = a.weekday === 0 ? 7 : a.weekday;
                          const weekdayB = b.weekday === 0 ? 7 : b.weekday;
                          if (weekdayA !== weekdayB) {
                            return weekdayA - weekdayB;
                          }
                          // Se for o mesmo dia, ordenar por horário de início
                          return a.start_time.localeCompare(b.start_time);
                        })
                        .map((avail, index) => (
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
              <div>
                <h4 className="font-semibold mb-2">Avaliações</h4>
                {loadingProviderReviews ? (
                  <div className="text-sm text-gray-600">
                    Carregando avaliações...
                  </div>
                ) : providerReviews.length === 0 ? (
                  <div className="text-sm text-gray-600">
                    Sem avaliações públicas
                  </div>
                ) : (
                  <div className="space-y-4">
                    {providerReviews.map((r) => (
                      <div
                        key={r.id}
                        className="p-3 bg-white border rounded shadow-sm"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                {r.author?.name
                                  ? r.author.name.substring(0, 2).toUpperCase()
                                  : "--"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">
                                {r.author?.name || "Usuário"}
                              </div>
                              <div className="text-xs text-gray-500">
                                {formatDateTime(r.created_at)}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((n) => (
                              <Star
                                key={n}
                                className={
                                  n <= (r.rating || 0)
                                    ? "h-4 w-4 text-yellow-400"
                                    : "h-4 w-4 text-gray-300"
                                }
                              />
                            ))}
                          </div>
                        </div>
                        {r.comment && (
                          <div className="mt-2 text-sm text-gray-700">
                            {r.comment}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
            // Atualizar lista de pedidos imediatamente
            fetchClientOrders();
            // opcional: fechar detalhes
            setShowDetailsDialog(false);
          }}
        />
      )}

      {/* Meus Pedidos Sheet (cliente) */}
      <Sheet open={showOrdersSheet} onOpenChange={setShowOrdersSheet}>
        <SheetContent className="w-full sm:max-w-lg flex flex-col">
          <SheetHeader className="space-y-3 flex-shrink-0">
            <SheetTitle className="text-xl font-bold">Meus Pedidos</SheetTitle>
            <SheetDescription className="text-base">
              Acompanhe seus pedidos em andamento e concluídos
            </SheetDescription>
            {user && (
              <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg mt-2">
                <User className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>
            )}
          </SheetHeader>
          <div className="space-y-3 mt-4 overflow-y-auto flex-1 pr-2">
            {orders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p>Nenhum pedido ainda</p>
              </div>
            ) : (
              orders.map((o) => (
                <Card key={o.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1 flex-1">
                          <div className="font-semibold text-base">Pedido #{o.id}</div>
                          {o.provider?.name && (
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <User className="h-3 w-3" />
                              <span>{o.provider.name}</span>
                            </div>
                          )}
                          {o.scheduled_at && (
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Clock className="h-3 w-3" />
                              <span>{formatDateTime(o.scheduled_at)}</span>
                            </div>
                          )}
                          {((o.status || "").toUpperCase() === "REQUESTED" ||
                            (o.status || "").toUpperCase() === "PENDENTE") && (
                            <div className="flex items-center gap-1 text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded mt-1 w-fit">
                              <Clock className="h-3 w-3" />
                              <span className="font-medium">Aguardando resposta do prestador</span>
                            </div>
                          )}
                        </div>
                        <Badge className={`${getStatusColor(o.status)} text-white flex-shrink-0`}>
                          {translateStatus(o.status)}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => openOrderDetails(o)}
                        >
                          Ver Detalhes
                        </Button>
                        
                        {((o.status || "").toUpperCase() === "REQUESTED" ||
                          (o.status || "").toUpperCase() === "PENDENTE") && (
                          <Button
                            size="sm"
                            variant="destructive"
                            className="flex-1"
                            onClick={() => openCancelDialog(o)}
                          >
                            Cancelar
                          </Button>
                        )}
                        
                        {((o.status || "").toUpperCase() === "DONE" ||
                          (o.status || "").toUpperCase() === "CONCLUIDO" ||
                          (o.status || "").toUpperCase() === "CONCLUDED") && (
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={() => openReviewForOrder(o)}
                            disabled={reviewedOrders.has(o.id)}
                            variant={reviewedOrders.has(o.id) ? "secondary" : "default"}
                          >
                            <Star className="h-3 w-3 mr-1" />
                            {reviewedOrders.has(o.id) ? "Avaliado" : "Avaliar"}
                          </Button>
                        )}
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
        <DialogContent className="max-w-xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Detalhes do Pedido</DialogTitle>
          </DialogHeader>
          {selectedOrderDetails ? (
            <div className="space-y-6">
              <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-lg">
                    Pedido #{selectedOrderDetails.id}
                  </span>
                  <Badge className={`${getStatusColor(selectedOrderDetails.status)} text-white`}>
                    {translateStatus(selectedOrderDetails.status)}
                  </Badge>
                </div>
                {selectedOrderDetails.provider && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="h-4 w-4" />
                    <span><strong>Prestador:</strong> {selectedOrderDetails.provider.name}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span><strong>Criado em:</strong> {formatDateTime(selectedOrderDetails.created_at)}</span>
                </div>
                {selectedOrderDetails.scheduled_at && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span><strong>Agendado para:</strong> {formatDateTime(selectedOrderDetails.scheduled_at)}</span>
                  </div>
                )}
              </div>
              <div>
                <div className="font-semibold text-gray-800 mb-3">Serviços Solicitados</div>
                <div className="space-y-3">
                  {(selectedOrderDetails.services || []).map(
                    (s: any, i: number) => (
                      <div key={i} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="font-medium text-blue-900">
                          {s && s.name ? s.name : String(s)}
                        </div>
                        {s && s.OrderService && s.OrderService.quantidade ? (
                          <div className="text-sm text-blue-700 mt-1">
                            Quantidade: {s.OrderService.quantidade}
                          </div>
                        ) : null}
                        {s && s.OrderService && s.OrderService.scheduled_at ? (
                          <div className="text-sm text-blue-700 mt-1 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Agendado: {formatDateTime(s.OrderService.scheduled_at)}
                          </div>
                        ) : null}
                        {s && s.OrderService && s.OrderService.observacoes ? (
                          <div className="mt-2 p-2 bg-white rounded border border-blue-200">
                            <div className="text-xs font-semibold text-blue-800 mb-1">Suas observações:</div>
                            <div className="text-sm text-gray-700 whitespace-pre-wrap">
                              {s.OrderService.observacoes}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    )
                  )}
                </div>
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
            <DialogTitle className="text-xl font-bold">Avaliar Prestador</DialogTitle>
            <DialogDescription>
              Sua opinião é muito importante para ajudar outros clientes
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5">
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="text-sm text-blue-900 font-medium">
                Pedido #{selectedOrderDetails?.id}
              </div>
              {selectedOrderDetails?.provider && (
                <div className="text-sm text-blue-700 mt-1">
                  Prestador: {selectedOrderDetails.provider.name}
                </div>
              )}
            </div>
            <div>
              <Label className="text-base font-semibold">Avaliação</Label>
              <p className="text-xs text-gray-500 mb-3">Clique nas estrelas para avaliar</p>
              <div className="flex gap-2 justify-center py-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setReviewRating(n)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        n <= reviewRating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-center text-sm font-medium text-gray-700 mt-2">
                {reviewRating === 5 && "Excelente!"}
                {reviewRating === 4 && "Muito Bom!"}
                {reviewRating === 3 && "Bom"}
                {reviewRating === 2 && "Regular"}
                {reviewRating === 1 && "Ruim"}
              </p>
            </div>
            <div>
              <Label className="text-base font-semibold">Comentário (opcional)</Label>
              <Textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Conte-nos sobre sua experiência..."
                className="mt-2 min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowReviewDialog(false)}
            >
              Cancelar
            </Button>
            <Button onClick={submitReview} disabled={reviewRating === 0}>
              <Star className="h-4 w-4 mr-2" />
              Enviar Avaliação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Minhas Avaliações Sheet */}
      <Sheet open={showMyReviewsSheet} onOpenChange={setShowMyReviewsSheet}>
        <SheetContent className="w-full sm:max-w-lg">
          <SheetHeader className="space-y-3">
            <SheetTitle className="text-xl font-bold">Minhas Avaliações</SheetTitle>
            <SheetDescription className="text-base">
              Veja as avaliações que você recebeu de prestadores
            </SheetDescription>
            {user && (
              <div className="p-3 bg-primary/10 rounded-lg mt-2">
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-primary/20">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-lg font-bold text-gray-800">
                      {calculateAverageRating()}
                    </span>
                    <span className="text-xs text-gray-500">/ 5.0</span>
                  </div>
                  <span className="text-xs text-gray-600 font-medium">
                    {myReviews.length} {myReviews.length === 1 ? 'avaliação' : 'avaliações'}
                  </span>
                </div>
              </div>
            )}
          </SheetHeader>
          <div className="space-y-3 mt-4">
            {loadingMyReviews ? (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p>Carregando avaliações...</p>
              </div>
            ) : myReviews.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p>Você ainda não recebeu avaliações</p>
              </div>
            ) : (
              myReviews.map((review) => (
                <Card key={review.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {review.author?.name
                                ? review.author.name.substring(0, 2).toUpperCase()
                                : "??"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-base">
                              {review.author?.name || "Prestador"}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {formatDateTime(review.created_at)}
                            </div>
                            <div className="flex items-center gap-1 mt-2">
                              {[1, 2, 3, 4, 5].map((n) => (
                                <Star
                                  key={n}
                                  className={`h-4 w-4 ${
                                    n <= (review.rating || 0)
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                              <span className="text-sm font-medium text-gray-700 ml-2">
                                {review.rating || 0}/5
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      {review.comment && (
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">
                            {review.comment}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Cancel Order Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Cancelar Pedido</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja cancelar este pedido?
            </DialogDescription>
          </DialogHeader>
          {orderToCancel && (
            <div className="p-4 bg-gray-50 rounded-lg space-y-2">
              <div className="font-semibold text-base">Pedido #{orderToCancel.id}</div>
              {orderToCancel.provider?.name && (
                <div className="text-sm text-gray-600">
                  <strong>Prestador:</strong> {orderToCancel.provider.name}
                </div>
              )}
              {orderToCancel.scheduled_at && (
                <div className="text-sm text-gray-600">
                  <strong>Agendado para:</strong> {formatDateTime(orderToCancel.scheduled_at)}
                </div>
              )}
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowCancelDialog(false)}
            >
              Voltar
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelOrder}
            >
              Confirmar Cancelamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientsPage;
