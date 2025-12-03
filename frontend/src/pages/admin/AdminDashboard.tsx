import { Users, UserCheck, Star, Settings, TrendingUp, AlertCircle } from "lucide-react";
import { StatCard } from "@/components/admin/StatCard";
import { useEffect, useState } from "react";
import { apiUrl } from "@/config/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AdminLog {
  id: number;
  admin_id: number | null;
  action: string;
  target_table: string;
  target_id: number;
  details: string | null;
  created_at: string;
  admin: {
    id: number;
    name: string;
    email: string;
  } | null;
}

interface PendingReview {
  order: {
    id: number;
    status: string;
    created_at: string;
    provider: { id: number; name: string; email: string; role: string };
    customer: { id: number; name: string; email: string; role: string };
  };
  provider_review: any | null;
  customer_review: any | null;
  missing_provider_review: boolean;
  missing_customer_review: boolean;
}

export default function AdminDashboard() {
  const [providersCount, setProvidersCount] = useState<number | null>(null);
  const [clientsCount, setClientsCount] = useState<number | null>(null);
  const [servicesCount, setServicesCount] = useState<number | null>(null);
  const [pendingReviews, setPendingReviews] = useState<PendingReview[]>([]);
  const [pendingReviewsCount, setPendingReviewsCount] = useState<number>(0);
  const [recentLogs, setRecentLogs] = useState<AdminLog[]>([]);

  useEffect(() => {
    let mounted = true;

    async function fetchCounts() {
      try {
        const base = apiUrl || "";
        const token = localStorage.getItem("token");

        const providersPromise = fetch(`${base}/providers`);
        const usersPromise = fetch(`${base}/users`);
        const servicesPromise = fetch(`${base}/services`);
        const pendingReviewsPromise = fetch(`${base}/reviews/pending`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        const logsPromise = fetch(`${base}/admin/logs/recent`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        const [provRes, usersRes, servicesRes, pendingRes, logsRes] = await Promise.all([
          providersPromise, 
          usersPromise, 
          servicesPromise,
          pendingReviewsPromise,
          logsPromise
        ]);

        if (!provRes.ok) throw new Error(`Providers fetch failed: ${provRes.status}`);
        if (!usersRes.ok) throw new Error(`Users fetch failed: ${usersRes.status}`);
        if (!servicesRes.ok) throw new Error(`Services fetch failed: ${servicesRes.status}`);

        const providers = await provRes.json();
        const users = await usersRes.json();
        const services = await servicesRes.json();
        
        if (!mounted) return;

        setProvidersCount(Array.isArray(providers) ? providers.length : 0);
        setClientsCount(Array.isArray(users) ? users.filter((u: any) => u.role === "CONTRATANTE").length : 0);
        setServicesCount(Array.isArray(services) ? services.length : 0);

        if (pendingRes.ok) {
          const pending = await pendingRes.json();
          if (Array.isArray(pending)) {
            setPendingReviews(pending);
            setPendingReviewsCount(pending.length);
          }
        }

        if (logsRes.ok) {
          const logs = await logsRes.json();
          if (Array.isArray(logs)) {
            setRecentLogs(logs);
          }
        }
      } catch (err) {
        console.error("Error fetching admin counts:", err);
      }
    }

    fetchCounts();

    return () => { mounted = false; };
  }, []);

  const formatLogMessage = (log: AdminLog) => {
    const actionMap: Record<string, string> = {
      CREATE: "criou",
      UPDATE: "atualizou",
      DELETE: "excluiu",
      APPROVE: "aprovou",
      REJECT: "rejeitou",
      ACTIVATE: "ativou",
      DEACTIVATE: "desativou",
    };

    const tableMap: Record<string, string> = {
      users: "usuário",
      services: "serviço",
      orders: "ordem",
      reviews: "avaliação",
      providers: "prestador",
    };

    const action = actionMap[log.action] || log.action.toLowerCase();
    const table = tableMap[log.target_table] || log.target_table;
    const adminName = log.admin?.name || "Admin";

    return `${adminName} ${action} ${table} #${log.target_id}`;
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Agora mesmo";
    if (diffMins < 60) return `Há ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
    if (diffHours < 24) return `Há ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    if (diffDays < 7) return `Há ${diffDays} dia${diffDays > 1 ? 's' : ''}`;
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral do PrestadoresClimber
          </p>
        </div>
        {/* <Button className="bg-primary hover:bg-primary/90">
          Relatório Completo
        </Button> */}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total de Prestadores"
          value={providersCount ?? '—'}
          description="Prestadores ativos"
          icon={UserCheck}
        />
        <StatCard
          title="Total de Contratantes"
          value={clientsCount ?? '—'}
          description="Usuários ativos"
          icon={Users}
        />
        <StatCard
          title="Avaliações Pendentes"
          value={pendingReviewsCount}
          description="Precisam de moderação"
          icon={Star}
        />
        <StatCard
          title="Serviços Cadastrados"
          value={servicesCount ?? '—'}
          description="Categorias ativas"
          icon={Settings}
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Atividade Recente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentLogs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma atividade recente
                </p>
              ) : (
                recentLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg bg-accent/30">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm text-foreground">{formatLogMessage(log)}</p>
                      <p className="text-xs text-muted-foreground">{formatRelativeTime(log.created_at)}</p>
                      {log.details && (
                        <p className="text-xs text-muted-foreground mt-1">{log.details}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pending Reviews */}
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-destructive" />
              Avaliações Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingReviews.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Não há avaliações pendentes no momento
                </p>
              ) : (
                pendingReviews.slice(0, 5).map((review) => {
                  const date = new Date(review.order.created_at).toLocaleDateString('pt-BR');
                  return (
                    <div key={review.order.id} className="flex items-center justify-between p-3 rounded-lg bg-accent/30">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">
                          {review.order.provider.name} ← {review.order.customer.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Ordem #{review.order.id} • {date}
                        </p>
                        <div className="flex gap-2 mt-1">
                          {review.missing_provider_review && (
                            <Badge variant="outline" className="text-xs">
                              Falta avaliação do prestador
                            </Badge>
                          )}
                          {review.missing_customer_review && (
                            <Badge variant="outline" className="text-xs">
                              Falta avaliação do cliente
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            {pendingReviews.length > 5 && (
              <Button variant="ghost" className="w-full mt-4 text-sm">
                Ver todas as {pendingReviews.length} avaliações pendentes
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions
      <Card className="card-shadow">
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button className="flex flex-col items-center gap-2 h-auto py-6">
              <UserCheck className="w-6 h-6" />
              <span>Aprovar Prestadores</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center gap-2 h-auto py-6">
              <Star className="w-6 h-6" />
              <span>Moderar Avaliações</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center gap-2 h-auto py-6">
              <Settings className="w-6 h-6" />
              <span>Adicionar Serviço</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center gap-2 h-auto py-6">
              <TrendingUp className="w-6 h-6" />
              <span>Ver Relatórios</span>
            </Button>
          </div>
        </CardContent>
      </Card> */}
    </div>
  );
}