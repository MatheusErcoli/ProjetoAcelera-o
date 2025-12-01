import { Users, UserCheck, Star, Settings, TrendingUp, AlertCircle } from "lucide-react";
import { StatCard } from "@/components/admin/StatCard";
import { useEffect, useState } from "react";
import { apiUrl } from "@/config/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getActivities, subscribeActivity, ActivityEntry } from "@/lib/activityLog";

const recentActivities = [];

const pendingReviews = [
  {
    id: 1,
    provider: "João Encanador",
    client: "Maria Silva",
    service: "Reparo de vazamento",
    date: "15/01/2024"
  },
  {
    id: 2,
    provider: "Carlos Eletricista", 
    client: "Pedro Santos",
    service: "Instalação elétrica",
    date: "14/01/2024"
  },
  {
    id: 3,
    provider: "Ana Pintora",
    client: "José Costa",
    service: "Pintura residencial", 
    date: "13/01/2024"
  }
];

export default function AdminDashboard() {
  const [providersCount, setProvidersCount] = useState<number | null>(null);
  const [clientsCount, setClientsCount] = useState<number | null>(null);
  const [servicesCount, setServicesCount] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchCounts() {
      try {
        const base = apiUrl || "";

        const providersPromise = fetch(`${base}/providers`);
        const usersPromise = fetch(`${base}/users`);
        const servicesPromise = fetch(`${base}/services`);

        const [provRes, usersRes, servicesRes] = await Promise.all([providersPromise, usersPromise, servicesPromise]);

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
      } catch (err) {
        console.error("Error fetching admin counts:", err);
      }
    }

    fetchCounts();

    return () => { mounted = false; };
  }, []);

  // Recent activities state (hydrated from localStorage via getActivities)
  const [recentActivitiesState, setRecentActivitiesState] = useState<ActivityEntry[]>(() => {
    try {
      const stored = getActivities();
      if (stored.length) return stored;
      // convert static fallback to ActivityEntry shape
      return recentActivities.map((r) => ({ ...r, createdAt: new Date().toISOString() }));
    } catch (e) {
      return recentActivities.map((r) => ({ ...r, createdAt: new Date().toISOString() }));
    }
  });

  useEffect(() => {
    const unsubscribe = subscribeActivity((entry) => {
      setRecentActivitiesState((prev) => [entry, ...prev].slice(0, 10));
    });
    return unsubscribe;
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral do ServicesClimber
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
          value={23}
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
              {recentActivitiesState.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-accent/30">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm text-foreground">{activity.message}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
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
              {pendingReviews.map((review) => (
                <div key={review.id} className="flex items-center justify-between p-3 rounded-lg bg-accent/30">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {review.provider} ← {review.client}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {review.service} • {review.date}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="text-xs">
                      Revisar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-4 text-sm">
              Ver todas as avaliações
            </Button>
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