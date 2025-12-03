import { useState, useEffect } from "react";
import { apiUrl } from "@/config/api";
import {
  Search,
  Star,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  MessageSquare,
  User as UserIcon,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
import { adminLogger } from "@/lib/adminLogger";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface Order {
  id: number;
  status: string;
  created_at: string;
  provider?: User;
  customer?: User;
}

interface Review {
  id: number;
  rating: number;
  comment: string | null;
  is_active: boolean;
  created_at: string;
  author: User;
  target: User;
  order: Order;
}

interface PendingReview {
  order: Order;
  provider_review: Review | null;
  customer_review: Review | null;
  missing_provider_review: boolean;
  missing_customer_review: boolean;
}

const toggleReviewStatus = async (id: number): Promise<Review> => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${apiUrl}/reviews/${id}/toggle`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Erro ao alterar status da avaliação");
  }

  const data = await response.json();
  return data.review;
};

const AdminAvaliacoes = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [pendingReviews, setPendingReviews] = useState<PendingReview[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"completed" | "pending">("completed");
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    action: "activate" | "deactivate" | null;
  }>({
    open: false,
    action: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
    fetchPendingReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${apiUrl}/reviews/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erro ao buscar avaliações");
      }

      const data = await response.json();
      setReviews(data);
    } catch (err) {
      console.error("Erro ao buscar avaliações:", err);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingReviews = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${apiUrl}/reviews/pending`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erro ao buscar avaliações pendentes");
      }

      const data = await response.json();
      setPendingReviews(data);
    } catch (err) {
      console.error("Erro ao buscar avaliações pendentes:", err);
      setPendingReviews([]);
    }
  };

  const handleStatusChange = async (
    reviewId: number,
    newStatus: "active" | "inactive"
  ) => {
    try {
      const updatedReview = await toggleReviewStatus(reviewId);

      setReviews(
        reviews.map((review) =>
          review.id === reviewId ? updatedReview : review
        )
      );

      if (updatedReview.is_active) {
        await adminLogger.activated(
          "reviews",
          reviewId,
          `Avaliação de ${updatedReview.author.name} para ${updatedReview.target.name} - Nota: ${updatedReview.rating}/5`
        );
      } else {
        await adminLogger.deactivated(
          "reviews",
          reviewId,
          `Avaliação de ${updatedReview.author.name} para ${updatedReview.target.name} - Nota: ${updatedReview.rating}/5`
        );
      }

      setActionDialog({ open: false, action: null });
      setSelectedReview(null);
    } catch (error) {
      console.error("Erro ao alterar status:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Erro ao alterar status da avaliação"
      );
    }
  };

  const groupedReviews = reviews.reduce((acc, review) => {
    const orderId = review.order.id;
    if (!acc[orderId]) {
      acc[orderId] = [];
    }
    acc[orderId].push(review);
    return acc;
  }, {} as Record<number, Review[]>);

  const filteredGroups = Object.entries(groupedReviews).filter(([orderId, reviewGroup]) => {
    const matchesSearch = reviewGroup.some((review) =>
      review.author.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.target.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.author.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.target.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (review.comment &&
        review.comment.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Verifica se alguma avaliação do grupo corresponde ao filtro de status
    let matchesStatus = false;
    if (statusFilter === "all") {
      matchesStatus = true;
    } else if (statusFilter === "active") {
      matchesStatus = reviewGroup.some((review) => review.is_active === true);
    } else if (statusFilter === "inactive") {
      matchesStatus = reviewGroup.some((review) => review.is_active === false);
    }

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (is_active: boolean) => {
    return is_active ? (
      <Badge className="bg-green-500">Ativa</Badge>
    ) : (
      <Badge className="bg-red-600">Inativa</Badge>
    );
  };

  const getRoleBadge = (role: string) => {
    const roleMap: { [key: string]: { label: string; color: string } } = {
      PRESTADOR: { label: "Prestador", color: "bg-blue-500" },
      CONTRATANTE: { label: "Contratante", color: "bg-purple-500" },
      ADMIN: { label: "Admin", color: "bg-orange-500" },
    };

    const roleInfo = roleMap[role] || { label: role, color: "bg-gray-500" };

    return (
      <Badge className={`${roleInfo.color} text-white text-xs`}>
        {roleInfo.label}
      </Badge>
    );
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
        <span className="ml-1 text-sm font-medium">{rating}/5</span>
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Carregando avaliações...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Avaliações
          </h1>
          <p className="text-muted-foreground">
            Gerencie as avaliações da plataforma
          </p>
        </div>
      </div>

      {/* View Mode Toggle */}
      <Card className="card-shadow">
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Button
              variant={viewMode === "completed" ? "default" : "outline"}
              onClick={() => setViewMode("completed")}
              className="flex-1"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Avaliações Concluídas ({reviews.length})
            </Button>
            <Button
              variant={viewMode === "pending" ? "default" : "outline"}
              onClick={() => setViewMode("pending")}
              className="flex-1"
            >
              <AlertCircle className="w-4 h-4 mr-2" />
              Avaliações Pendentes ({pendingReviews.length})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filters - Only show for completed reviews */}
      {viewMode === "completed" && (
        <Card className="card-shadow">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome, email ou comentário..."
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
                  Todas ({reviews.length})
                </Button>
                <Button
                  variant={statusFilter === "active" ? "default" : "outline"}
                  onClick={() => setStatusFilter("active")}
                  size="sm"
                >
                  Ativas ({reviews.filter((r) => r.is_active === true).length})
                </Button>
                <Button
                  variant={statusFilter === "inactive" ? "default" : "outline"}
                  onClick={() => setStatusFilter("inactive")}
                  size="sm"
                >
                  Inativas ({reviews.filter((r) => r.is_active === false).length})
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Completed Reviews List - Agrupadas por Pedido */}
      {viewMode === "completed" && (
        <div className="grid gap-6">
          {filteredGroups.map(([orderId, reviewGroup]) => (
          <Card
            key={orderId}
            className="card-shadow hover:shadow-lg transition-shadow"
          >
            <CardContent className="p-6">
              {/* Header do Grupo */}
              <div className="flex items-center justify-between mb-4 pb-4 border-b">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 text-primary px-3 py-1 rounded-full font-semibold text-sm">
                    Pedido #{orderId}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(reviewGroup[0].created_at)}</span>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {reviewGroup.length} {reviewGroup.length === 1 ? "avaliação" : "avaliações"}
                </Badge>
              </div>

              {/* Avaliações do Grupo */}
              <div className="space-y-6">
                {reviewGroup.map((review) => (
                  <div
                    key={review.id}
                    className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Status da Avaliação Individual */}
                        <div className="flex items-center gap-3 mb-4">
                          {getStatusBadge(review.is_active)}
                        </div>

                        {/* Avaliador e Avaliado */}
                        <div className="grid md:grid-cols-2 gap-6 mb-4">
                          {/* Quem avaliou */}
                          <div className="flex items-start gap-3">
                            <Avatar className="w-12 h-12">
                              <AvatarFallback className="bg-blue-100 text-blue-600">
                                {review.author.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <UserIcon className="w-3 h-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">
                                  Avaliador
                                </span>
                              </div>
                              <h4 className="font-semibold text-foreground">
                                {review.author.name}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {review.author.email}
                              </p>
                              <div className="mt-1">
                                {getRoleBadge(review.author.role)}
                              </div>
                            </div>
                          </div>

                          {/* Quem foi avaliado */}
                          <div className="flex items-start gap-3">
                            <Avatar className="w-12 h-12">
                              <AvatarFallback className="bg-purple-100 text-purple-600">
                                {review.target.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <UserIcon className="w-3 h-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">
                                  Avaliado
                                </span>
                              </div>
                              <h4 className="font-semibold text-foreground">
                                {review.target.name}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {review.target.email}
                              </p>
                              <div className="mt-1">
                                {getRoleBadge(review.target.role)}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Avaliação */}
                        <div className="border-t pt-4">
                          <div className="mb-3">{renderStars(review.rating)}</div>

                          {review.comment && (
                            <div className="bg-white rounded-lg p-4">
                              <div className="flex items-start gap-2 mb-2">
                                <MessageSquare className="w-4 h-4 text-muted-foreground mt-0.5" />
                                <span className="text-sm font-medium text-foreground">
                                  Comentário:
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground ml-6">
                                {review.comment}
                              </p>
                            </div>
                          )}

                          {!review.comment && (
                            <p className="text-sm text-muted-foreground italic">
                              Sem comentário
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Actions Menu */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {review.is_active ? (
                            <DropdownMenuItem
                              className="text-error"
                              onClick={() => {
                                setSelectedReview(review);
                                setActionDialog({ open: true, action: "deactivate" });
                              }}
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Desativar Avaliação
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              className="text-success"
                              onClick={() => {
                                setSelectedReview(review);
                                setActionDialog({ open: true, action: "activate" });
                              }}
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Ativar Avaliação
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          ))}
        </div>
      )}

      {viewMode === "completed" && filteredGroups.length === 0 && (
        <Card className="card-shadow">
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">
              Nenhuma avaliação encontrada com os filtros aplicados.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Pending Reviews List */}
      {viewMode === "pending" && (
        <div className="grid gap-6">
          {pendingReviews.map((pending) => (
            <Card
              key={pending.order.id}
              className="card-shadow hover:shadow-lg transition-shadow border-l-4 border-l-orange-500"
            >
              <CardContent className="p-6">
                {/* Header do Pedido */}
                <div className="flex items-center justify-between mb-4 pb-4 border-b">
                  <div className="flex items-center gap-3">
                    <div className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full font-semibold text-sm">
                      Pedido #{pending.order.id}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(pending.order.created_at)}</span>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-orange-600 border-orange-600">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Avaliação Incompleta
                  </Badge>
                </div>

                {/* Participantes e Status das Avaliações */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Prestador */}
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          {pending.order.provider?.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <UserIcon className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            Prestador
                          </span>
                        </div>
                        <h4 className="font-semibold text-foreground">
                          {pending.order.provider?.name}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {pending.order.provider?.email}
                        </p>
                      </div>
                    </div>

                    {/* Status da avaliação do prestador */}
                    {pending.missing_provider_review ? (
                      <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <XCircle className="w-4 h-4 text-red-600" />
                        <span className="text-sm text-red-700 font-medium">
                          Ainda não avaliou
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-green-700 font-medium">
                            Avaliação concluída
                          </span>
                        </div>
                        {pending.provider_review && (
                          <div className="p-3 bg-white rounded-lg border">
                            {renderStars(pending.provider_review.rating)}
                            {pending.provider_review.comment && (
                              <p className="text-sm text-muted-foreground mt-2">
                                "{pending.provider_review.comment}"
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Contratante */}
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-purple-100 text-purple-600">
                          {pending.order.customer?.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <UserIcon className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            Contratante
                          </span>
                        </div>
                        <h4 className="font-semibold text-foreground">
                          {pending.order.customer?.name}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {pending.order.customer?.email}
                        </p>
                      </div>
                    </div>

                    {/* Status da avaliação do contratante */}
                    {pending.missing_customer_review ? (
                      <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <XCircle className="w-4 h-4 text-red-600" />
                        <span className="text-sm text-red-700 font-medium">
                          Ainda não avaliou
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-green-700 font-medium">
                            Avaliação concluída
                          </span>
                        </div>
                        {pending.customer_review && (
                          <div className="p-3 bg-white rounded-lg border">
                            {renderStars(pending.customer_review.rating)}
                            {pending.customer_review.comment && (
                              <p className="text-sm text-muted-foreground mt-2">
                                "{pending.customer_review.comment}"
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {viewMode === "pending" && pendingReviews.length === 0 && (
        <Card className="card-shadow">
          <CardContent className="p-12 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <p className="text-muted-foreground">
              Não há avaliações pendentes. Todos os pedidos concluídos foram avaliados por ambas as partes!
            </p>
          </CardContent>
        </Card>
      )}

      {/* Action Dialog */}
      {actionDialog.open && selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">
                {actionDialog.action === "activate"
                  ? "Ativar"
                  : "Desativar"}{" "}
                Avaliação
              </h2>
              <p className="text-gray-600">
                {actionDialog.action === "activate"
                  ? `Tem certeza que deseja ativar esta avaliação? Ela voltará a aparecer publicamente.`
                  : `Tem certeza que deseja desativar esta avaliação? Ela será ocultada da visualização pública.`}
              </p>
              <div className="mt-4 p-3 bg-gray-50 rounded">
                <p className="text-sm">
                  <strong>De:</strong> {selectedReview.author.name}
                </p>
                <p className="text-sm">
                  <strong>Para:</strong> {selectedReview.target.name}
                </p>
                <p className="text-sm">
                  <strong>Nota:</strong> {selectedReview.rating}/5
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setActionDialog({ open: false, action: null });
                  setSelectedReview(null);
                }}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                variant={
                  actionDialog.action === "activate" ? "default" : "destructive"
                }
                onClick={() => {
                  handleStatusChange(
                    selectedReview.id,
                    actionDialog.action === "activate" ? "active" : "inactive"
                  );
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
};

export default AdminAvaliacoes;