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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiUrl } from "@/config/api";
import { useAuthContext } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Star,
  Users,
  Settings,
  LogOut,
  User,
  Image as ImageIcon,
  Clock,
  Briefcase,
  Plus,
  Edit,
  Trash2,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface Service {
  id: number;
  name: string;
  description: string;
  is_active?: boolean;
}

interface Availability {
  id?: number;
  weekday: number;
  start_time: string;
  end_time: string;
}

interface Order {
  id: number;
  status: string;
  created_at: string;
  scheduled_at?: string;
  customer_id: number;
  provider_id: number;
  customer: {
    id: number;
    name: string;
    email: string;
  };
  provider: {
    id: number;
    name: string;
    email: string;
  };
  services: any[];
}

interface Review {
  id: number;
  rating: number;
  comment: string;
  created_at: string;
  author?: {
    id: number;
    name: string;
  };
}

interface GalleryImage {
  id: number;
  url: string;
  description: string;
}

interface ProviderProfile {
  id: number;
  name: string;
  email: string;
  whatsapp: string;
  photo_url: string;
  address: {
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    uf: string;
    cep: string;
  };
  services: Service[];
  availability: Availability[];
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

const ProvidersPage = () => {
  const { toast } = useToast();
  const { logout, user, token } = useAuthContext();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProviderProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados para modais
  const [showServicesDialog, setShowServicesDialog] = useState(false);
  const [showAvailabilityDialog, setShowAvailabilityDialog] = useState(false);
  const [showGalleryDialog, setShowGalleryDialog] = useState(false);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewRating, setReviewRating] = useState<number>(0);
  const [reviewComment, setReviewComment] = useState<string>("");
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [selectedOrderReviews, setSelectedOrderReviews] = useState<Review[]>(
    []
  );

  React.useEffect(() => {
    if (selectedOrder) console.debug("selectedOrder opened:", selectedOrder);
  }, [selectedOrder]);

  // load reviews when an order is selected
  useEffect(() => {
    if (selectedOrder) {
      loadOrderReviews(selectedOrder.id);
    }
  }, [selectedOrder]);

  // clear selection when the order dialog is closed
  useEffect(() => {
    if (!showOrderDialog) {
      setSelectedOrder(null);
      setSelectedOrderReviews([]);
    }
  }, [showOrderDialog]);

  const [editingAvailability, setEditingAvailability] =
    useState<Availability | null>(null);
  const [newAvailability, setNewAvailability] = useState<Availability>({
    weekday: 1,
    start_time: "08:00",
    end_time: "18:00",
  });

  const [newImageUrl, setNewImageUrl] = useState("");
  const [newImageDescription, setNewImageDescription] = useState("");

  useEffect(() => {
    fetchProviderData();
    fetchAllServices();
  }, []);

  const fetchProviderData = async () => {
    setLoading(true);
    try {
      const providerId = localStorage.getItem("providerId") || "1";

      const [profileRes, ordersRes, reviewsRes, galleryRes] = await Promise.all(
        [
          fetch(`${apiUrl}/providers/${providerId}`),
          fetch(`${apiUrl}/orders`, {
            headers: { Authorization: token ? `Bearer ${token}` : "" },
          }),
          fetch(`${apiUrl}/reviews?providerId=${providerId}`),
          fetch(`${apiUrl}/gallery?providerId=${providerId}`),
        ]
      );

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setProfile(profileData);
      }

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        console.debug("GET /orders response:", ordersData);
        setOrders(ordersData);
      }

      if (reviewsRes.ok) {
        const reviewsData = await reviewsRes.json();
        setReviews(reviewsData);
      }

      if (galleryRes.ok) {
        const galleryData = await galleryRes.json();
        setGallery(galleryData);
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAllServices = async () => {
    try {
      const response = await fetch(`${apiUrl}/services`);
      if (response.ok) {
        const data = await response.json();
        // Filtrar apenas serviços ativos
        setAllServices(data.filter((s: Service) => s.is_active !== false));
      }
    } catch (error) {
      console.error("Erro ao carregar serviços:", error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleAddAvailability = async () => {
    try {
      const isEditing = editingAvailability?.id !== undefined;
      const url = isEditing
        ? `${apiUrl}/availability/${editingAvailability.id}`
        : `${apiUrl}/availability`;
      const method = isEditing ? "PUT" : "POST";
      
      // Garantir que os dados estão corretos
      let dataToSend;
      if (isEditing) {
        dataToSend = {
          weekday: editingAvailability.weekday,
          start_time: editingAvailability.start_time,
          end_time: editingAvailability.end_time,
        };
      } else {
        dataToSend = {
          weekday: newAvailability.weekday,
          start_time: newAvailability.start_time,
          end_time: newAvailability.end_time,
        };
      }

      console.log("Enviando dados:", dataToSend);

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: isEditing
            ? "Horário atualizado com sucesso"
            : "Horário adicionado com sucesso",
        });
        fetchProviderData();
        setShowAvailabilityDialog(false);
        setEditingAvailability(null);
        setNewAvailability({
          weekday: 1,
          start_time: "08:00",
          end_time: "18:00",
        });
      } else {
        const data = await response.json().catch(() => ({}));
        console.error("Erro do servidor:", data);
        throw new Error(
          data.message ||
            (isEditing ? "Erro ao atualizar horário" : "Erro ao adicionar horário")
        );
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description:
          error.message ||
          (editingAvailability?.id
            ? "Não foi possível atualizar o horário"
            : "Não foi possível adicionar o horário"),
        variant: "destructive",
      });
    }
  };

  const handleDeleteAvailability = async (id: number) => {
    try {
      const response = await fetch(`${apiUrl}/availability/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: "Horário removido com sucesso",
        });
        fetchProviderData();
      } else {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Erro ao remover horário");
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível remover o horário",
        variant: "destructive",
      });
    }
  };

  const handleAddImage = async () => {
    try {
      const response = await fetch(`${apiUrl}/gallery`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          url: newImageUrl,
          description: newImageDescription,
        }),
      });

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: "Imagem adicionada com sucesso",
        });
        fetchProviderData();
        setShowGalleryDialog(false);
        setNewImageUrl("");
        setNewImageDescription("");
      } else {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Erro ao adicionar imagem");
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível adicionar a imagem",
        variant: "destructive",
      });
    }
  };

  const handleDeleteImage = async (id: number) => {
    try {
      const response = await fetch(`${apiUrl}/gallery/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: "Imagem removida com sucesso",
        });
        fetchProviderData();
      } else {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Erro ao remover imagem");
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível remover a imagem",
        variant: "destructive",
      });
    }
  };

  const handleToggleService = async (serviceId: number) => {
    if (!profile) return;

    try {
      const currentServices = profile.services || [];
      const isServiceSelected = currentServices.some((s) => s.id === serviceId);

      let newServices: number[];
      if (isServiceSelected) {
        // Remover serviço
        newServices = currentServices
          .filter((s) => s.id !== serviceId)
          .map((s) => s.id);
      } else {
        // Adicionar serviço
        newServices = [...currentServices.map((s) => s.id), serviceId];
      }

      const response = await fetch(`${apiUrl}/providers/${profile.id}/services`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ services: newServices }),
      });

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: isServiceSelected
            ? "Serviço removido com sucesso"
            : "Serviço adicionado com sucesso",
        });
        await fetchProviderData();
      } else {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Erro ao atualizar serviços");
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível atualizar os serviços",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    const s = (status || "").toUpperCase();
    if (s === "REQUESTED" || s === "PENDENTE") return "bg-yellow-500";
    if (s === "CONFIRMED" || s === "CONFIRMADO") return "bg-blue-500";
    if (s === "DONE" || s === "CONCLUIDO" || s === "CONCLUDED") return "bg-green-500";
    if (s === "CANCELLED" || s === "CANCELADO") return "bg-red-500";
    return "bg-gray-500";
  };

  const refreshOrders = async () => {
    try {
      const res = await fetch(`${apiUrl}/orders`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
      if (res.ok) {
        const data = await res.json();
        console.debug("refreshOrders response:", data);
        setOrders(data);
      }
    } catch (err) {
      console.error("Erro ao atualizar pedidos", err);
    }
  };

  const formatDate = (iso?: string) => {
    if (!iso) return "";
    try {
      return new Date(iso).toLocaleDateString("pt-BR");
    } catch (e) {
      return iso;
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

      toast({ title: "Sucesso", description: "Status atualizado" });
      await refreshOrders();
    } catch (err: any) {
      toast({
        title: "Erro",
        description: err.message || "Erro ao atualizar status",
        variant: "destructive",
      });
    }
  };

  const submitProviderReview = async () => {
    if (!selectedOrder) return;
    try {
      const payload = {
        rating: reviewRating,
        comment: reviewComment,
        order_id: selectedOrder.id,
        target_id: (selectedOrder as any).customer_id,
      };

      const res = await fetch(`${apiUrl}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || `Erro: ${res.status}`);
      }

      toast({ title: "Sucesso", description: "Avaliação enviada" });
      setShowReviewDialog(false);
      setReviewComment("");
      setReviewRating(0);
      // refresh data
      await fetchProviderData();
      await refreshOrders();
    } catch (err: any) {
      toast({
        title: "Erro",
        description: err.message || "Erro ao enviar avaliação",
        variant: "destructive",
      });
    }
  };

  const loadOrderReviews = async (orderId: number) => {
    try {
      const res = await fetch(`${apiUrl}/reviews?orderId=${orderId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedOrderReviews(data || []);
      } else {
        setSelectedOrderReviews([]);
      }
    } catch (e) {
      console.error("Erro ao carregar avaliações do pedido", e);
      setSelectedOrderReviews([]);
    }
  };

  const hasUserReviewedSelectedOrder = () => {
    if (!user || !selectedOrder) return false;
    return selectedOrderReviews.some(
      (r) => r && (r as any).author && (r as any).author.id === user.id
    );
  };

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, review) => sum + review.rating, 0) /
          reviews.length
        ).toFixed(1)
      : "0.0";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary">
                PrestadoresClimber
              </h1>
              <p className="text-xs text-gray-500 mt-1">Área do Prestador</p>
            </div>
            <div className="flex items-center gap-3">
              {user && (
                <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-lg">
                  <User className="h-4 w-4 text-primary" />
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">Prestador</p>
                  </div>
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowServicesDialog(true)}
                className="hidden md:flex items-center gap-2"
              >
                <Briefcase className="h-4 w-4" />
                <span>Meus Serviços</span>
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
                    <SheetDescription>Área do Prestador</SheetDescription>
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
                      onClick={() => setShowServicesDialog(true)}
                    >
                      <Briefcase className="mr-2 h-4 w-4" />
                      Meus Serviços
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

      {/* Perfil e Estatísticas */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profile?.photo_url} alt={profile?.name} />
              <AvatarFallback>
                {profile?.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{profile?.name}</h2>
              <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  {profile?.email}
                </div>
                <div className="flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  {profile?.whatsapp}
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {profile?.address?.cidade}, {profile?.address?.uf}
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              <Card className="text-center min-w-[100px] bg-blue-50 border-blue-200">
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold text-blue-700">{orders.length}</div>
                  <div className="text-sm text-blue-600">Pedidos</div>
                </CardContent>
              </Card>
              <Card className="text-center min-w-[120px] bg-yellow-50 border-yellow-200">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-center gap-1">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="text-2xl font-bold text-yellow-700">{averageRating}</span>
                    <span className="text-sm text-yellow-600">/5.0</span>
                  </div>
                  <div className="text-sm text-yellow-600 font-medium">
                    Média de {reviews.length} {reviews.length === 1 ? 'avaliação' : 'avaliações'}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="orders">Pedidos</TabsTrigger>
            <TabsTrigger value="availability">Disponibilidade</TabsTrigger>
            <TabsTrigger value="gallery">Galeria</TabsTrigger>
            <TabsTrigger value="reviews">Avaliações</TabsTrigger>
          </TabsList>

          {/* Aba de Pedidos */}
          <TabsContent value="orders" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">Meus Pedidos</h3>
            </div>
            {orders.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-gray-500">
                  Você ainda não tem pedidos
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {orders.map((order) => (
                  <Card key={order.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            Pedido #{order.id}
                          </CardTitle>
                          <CardDescription>
                            Cliente: {order.customer?.name || "N/A"}
                          </CardDescription>
                        </div>
                        <Badge className={`${getStatusColor(order.status)} text-white`}>
                          {translateStatus(order.status)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div>
                          <span className="font-medium">Serviços:</span>{" "}
                          {(order.services || [])
                            .map((s: any) => (s && s.name ? s.name : String(s)))
                            .join(", ")}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>Criado: {formatDate(order.created_at)}</span>
                        </div>
                        {order.scheduled_at && (
                          <div className="flex items-center gap-2 text-sm text-blue-700 bg-blue-50 px-2 py-1 rounded w-fit">
                            <Clock className="h-4 w-4" />
                            <span className="font-medium">
                              Agendado para: {formatDateTime(order.scheduled_at)}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedOrder(order);
                          loadOrderReviews(order.id);
                          setShowOrderDialog(true);
                        }}
                      >
                        Ver Detalhes
                      </Button>
                      {(order.status || "").toUpperCase() === "REQUESTED" ||
                      (order.status || "").toUpperCase() === "PENDENTE" ? (
                        <>
                          <Button
                            size="sm"
                            onClick={() =>
                              updateOrderStatus(order.id, "CONFIRMED")
                            }
                          >
                            Aceitar
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() =>
                              updateOrderStatus(order.id, "CANCELLED")
                            }
                          >
                            Recusar
                          </Button>
                        </>
                      ) : null}
                      {((order.status || "").toUpperCase() === "CONFIRMED" ||
                        (order.status || "").toUpperCase() ===
                          "CONFIRMADO") && (
                        <Button
                          size="sm"
                          onClick={() => updateOrderStatus(order.id, "CONCLUDED")}
                        >
                          Marcar como Concluído
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Aba de Disponibilidade */}
          <TabsContent value="availability" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">Horários de Atendimento</h3>
              <Button onClick={() => setShowAvailabilityDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Horário
              </Button>
            </div>
            {profile?.availability && profile.availability.length > 0 ? (
              <div className="grid gap-4">
                {[...profile.availability]
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
                  <Card key={index}>
                    <CardContent className="flex justify-between items-center pt-6">
                      <div className="flex items-center gap-4">
                        <Clock className="h-5 w-5 text-gray-500" />
                        <div>
                          <div className="font-medium">
                            {weekdays[avail.weekday]}
                          </div>
                          <div className="text-sm text-gray-600">
                            {avail.start_time} - {avail.end_time}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingAvailability(avail);
                            setShowAvailabilityDialog(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() =>
                            avail.id && handleDeleteAvailability(avail.id)
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center text-gray-500">
                  Nenhum horário cadastrado
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Aba de Galeria */}
          <TabsContent value="gallery" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">Galeria de Fotos</h3>
              <Button onClick={() => setShowGalleryDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Foto
              </Button>
            </div>
            {gallery.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {gallery.map((image) => (
                  <Card key={image.id} className="overflow-hidden">
                    <div className="aspect-square relative">
                      <img
                        src={image.url}
                        alt={image.description}
                        className="w-full h-full object-cover"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => handleDeleteImage(image.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    {image.description && (
                      <CardContent className="pt-4">
                        <p className="text-sm text-gray-600">
                          {image.description}
                        </p>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center text-gray-500">
                  Nenhuma foto na galeria
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Aba de Avaliações */}
          <TabsContent value="reviews" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">Avaliações de Clientes</h3>
              {reviews.length > 0 && (
                <div className="flex items-center gap-3 bg-yellow-50 px-4 py-2 rounded-lg border border-yellow-200">
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="text-lg font-bold text-yellow-700">{averageRating}</span>
                    <span className="text-sm text-yellow-600">/5.0</span>
                  </div>
                  <div className="h-6 w-px bg-yellow-300"></div>
                  <span className="text-sm text-yellow-700 font-medium">
                    {reviews.length} {reviews.length === 1 ? 'avaliação' : 'avaliações'}
                  </span>
                </div>
              )}
            </div>
            {reviews.length > 0 ? (
              <div className="grid gap-4">
                {reviews.map((review) => (
                  <Card key={review.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            {review.author?.name || "Cliente"}
                          </CardTitle>
                          <CardDescription>
                            {formatDate(review.created_at)}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700">{review.comment}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center text-gray-500">
                  Você ainda não tem avaliações
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Dialog de detalhes do pedido */}
      <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
        <DialogContent className="max-w-xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Detalhes do Pedido</DialogTitle>
          </DialogHeader>
          {selectedOrder ? (
            <div className="space-y-6">
              <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-lg">Pedido #{selectedOrder.id}</span>
                  <Badge className={`${getStatusColor(selectedOrder.status)} text-white`}>
                    {translateStatus(selectedOrder.status)}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span><strong>Cliente:</strong> {selectedOrder.customer?.name || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span><strong>Criado em:</strong> {formatDateTime(selectedOrder.created_at)}</span>
                </div>
                {selectedOrder.scheduled_at && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span><strong>Agendado para:</strong> {formatDateTime(selectedOrder.scheduled_at)}</span>
                  </div>
                )}
              </div>
              <div>
                <div className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Serviços Solicitados
                </div>
                <div className="space-y-3">
                  {(selectedOrder.services || []).map((s: any, i: number) => (
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
                          <div className="text-xs font-semibold text-blue-800 mb-1">Observações do cliente:</div>
                          <div className="text-sm text-gray-700 whitespace-pre-wrap">
                            {s.OrderService.observacoes}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div>Carregando...</div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowOrderDialog(false)}>
              Fechar
            </Button>
            {selectedOrder &&
              ((selectedOrder.status || "").toUpperCase() === "REQUESTED" ||
                (selectedOrder.status || "").toUpperCase() === "PENDENTE") && (
                <>
                  <Button
                    onClick={() => {
                      updateOrderStatus(selectedOrder.id, "CONFIRMED");
                      setShowOrderDialog(false);
                    }}
                  >
                    Aceitar
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      updateOrderStatus(selectedOrder.id, "CANCELLED");
                      setShowOrderDialog(false);
                    }}
                  >
                    Recusar
                  </Button>
                </>
              )}
            {selectedOrder &&
              ((selectedOrder.status || "").toUpperCase() === "CONFIRMED" ||
                (selectedOrder.status || "").toUpperCase() ===
                  "CONFIRMADO") && (
                <Button
                  onClick={() => {
                    updateOrderStatus(selectedOrder.id, "CONCLUDED");
                    setShowOrderDialog(false);
                  }}
                >
                  Marcar como Concluído
                </Button>
              )}
            {selectedOrder &&
              ((selectedOrder.status || "").toUpperCase() === "DONE" ||
                (selectedOrder.status || "").toUpperCase() === "CONCLUIDO" ||
                (selectedOrder.status || "").toUpperCase() === "CONCLUDED") &&
              user?.id === profile?.id && (
                <Button
                  onClick={() => setShowReviewDialog(true)}
                  disabled={hasUserReviewedSelectedOrder()}
                  variant={hasUserReviewedSelectedOrder() ? "secondary" : "default"}
                >
                  <Star className="h-4 w-4 mr-2" />
                  {hasUserReviewedSelectedOrder()
                    ? "Avaliado"
                    : "Avaliar Cliente"}
                </Button>
              )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para avaliar cliente (prestador -> cliente) */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Avaliar Cliente</DialogTitle>
            <DialogDescription>
              Avalie o cliente após a conclusão do serviço
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5">
            {selectedOrder && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-sm text-blue-900 font-medium">
                  Pedido #{selectedOrder.id}
                </div>
                {selectedOrder.customer && (
                  <div className="text-sm text-blue-700 mt-1">
                    Cliente: {selectedOrder.customer.name}
                  </div>
                )}
              </div>
            )}
            <div>
              <Label className="text-base font-semibold">Avaliação</Label>
              <p className="text-xs text-gray-500 mb-3">Clique nas estrelas para avaliar</p>
              <div className="flex items-center gap-2 justify-center py-2">
                {[1, 2, 3, 4, 5].map((n) => {
                  const filled = (hoverRating ?? reviewRating) >= n;
                  return (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setReviewRating(n)}
                      onMouseEnter={() => setHoverRating(n)}
                      onMouseLeave={() => setHoverRating(null)}
                      aria-label={`Dar ${n} estrelas`}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`h-8 w-8 ${
                          filled ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                        }`}
                      />
                    </button>
                  );
                })}
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
                placeholder="Escreva um comentário sobre o cliente..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
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
            <Button
              onClick={submitProviderReview}
              disabled={hasUserReviewedSelectedOrder() || reviewRating === 0}
            >
              <Star className="h-4 w-4 mr-2" />
              {hasUserReviewedSelectedOrder()
                ? "Já Avaliado"
                : "Enviar Avaliação"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para adicionar/editar disponibilidade */}
      <Dialog
        open={showAvailabilityDialog}
        onOpenChange={(open) => {
          setShowAvailabilityDialog(open);
          if (!open) {
            setEditingAvailability(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingAvailability?.id
                ? "Editar Horário de Atendimento"
                : "Adicionar Horário de Atendimento"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Dia da Semana</Label>
              <Select
                value={
                  editingAvailability?.id
                    ? editingAvailability.weekday.toString()
                    : newAvailability.weekday.toString()
                }
                onValueChange={(value) => {
                  const weekday = parseInt(value);
                  if (editingAvailability?.id) {
                    setEditingAvailability({
                      ...editingAvailability,
                      weekday,
                    });
                  } else {
                    setNewAvailability({
                      ...newAvailability,
                      weekday,
                    });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {weekdays.map((day, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Horário de Início</Label>
              <Input
                type="time"
                value={
                  editingAvailability?.id
                    ? editingAvailability.start_time
                    : newAvailability.start_time
                }
                onChange={(e) => {
                  if (editingAvailability?.id) {
                    setEditingAvailability({
                      ...editingAvailability,
                      start_time: e.target.value,
                    });
                  } else {
                    setNewAvailability({
                      ...newAvailability,
                      start_time: e.target.value,
                    });
                  }
                }}
              />
            </div>
            <div>
              <Label>Horário de Término</Label>
              <Input
                type="time"
                value={
                  editingAvailability?.id
                    ? editingAvailability.end_time
                    : newAvailability.end_time
                }
                onChange={(e) => {
                  if (editingAvailability?.id) {
                    setEditingAvailability({
                      ...editingAvailability,
                      end_time: e.target.value,
                    });
                  } else {
                    setNewAvailability({
                      ...newAvailability,
                      end_time: e.target.value,
                    });
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAvailabilityDialog(false);
                setEditingAvailability(null);
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleAddAvailability}>
              {editingAvailability?.id ? "Salvar" : "Adicionar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para adicionar foto */}
      <Dialog open={showGalleryDialog} onOpenChange={setShowGalleryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Foto à Galeria</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>URL da Imagem</Label>
              <Input
                placeholder="https://exemplo.com/imagem.jpg"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
              />
            </div>
            <div>
              <Label>Descrição (opcional)</Label>
              <Textarea
                placeholder="Descreva a imagem..."
                value={newImageDescription}
                onChange={(e) => setNewImageDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowGalleryDialog(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleAddImage}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para gerenciar serviços */}
      <Dialog open={showServicesDialog} onOpenChange={setShowServicesDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Gerenciar Serviços</DialogTitle>
            <DialogDescription>
              Selecione os serviços que você presta
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {allServices.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Nenhum serviço disponível</p>
              </div>
            ) : (
              allServices.map((service) => {
                const isSelected = profile?.services?.some((s) => s.id === service.id);
                return (
                  <div
                    key={service.id}
                    className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
                      isSelected ? "bg-primary/5 border-primary" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{service.name}</div>
                      {service.description && (
                        <div className="text-sm text-gray-600 mt-1">
                          {service.description}
                        </div>
                      )}
                    </div>
                    <Switch
                      checked={isSelected}
                      onCheckedChange={() => handleToggleService(service.id)}
                    />
                  </div>
                );
              })
            )}
          </div>
          <DialogFooter>
            <div className="text-sm text-gray-500">
              {profile?.services?.length || 0} serviço(s) selecionado(s)
            </div>
            <Button onClick={() => setShowServicesDialog(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProvidersPage;
