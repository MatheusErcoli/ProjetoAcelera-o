import { Users, UserCheck, Star, Settings, TrendingUp, AlertCircle } from "lucide-react";
import { StatCard } from "@/components/admin/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const recentActivities = [
  {
    id: 1,
    type: "new_provider",
    message: "Novo prestador cadastrado: João da Silva (Encanador)",
    time: "há 2 horas",
    status: "pending"
  },
  {
    id: 2, 
    type: "new_review",
    message: "Nova avaliação: Maria Santos avaliou Carlos Eletricista",
    time: "há 4 horas",
    status: "active"
  },
  {
    id: 3,
    type: "service_request",
    message: "Solicitação de novo serviço: 'Instalação de Split'",
    time: "há 6 horas", 
    status: "pending"
  },
  {
    id: 4,
    type: "provider_update",
    message: "Prestador Pedro Pedreiro atualizou perfil",
    time: "há 1 dia",
    status: "active"
  }
];

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
          value={156}
          description="12 aguardando aprovação"
          icon={UserCheck}
          trend={{ value: 8.2, isPositive: true }}
        />
        <StatCard
          title="Total de Contratantes"
          value={423}
          description="Usuários ativos"
          icon={Users}
          trend={{ value: 12.5, isPositive: true }}
        />
        <StatCard
          title="Avaliações Pendentes"
          value={23}
          description="Precisam de moderação"
          icon={Star}
          trend={{ value: -5.1, isPositive: false }}
        />
        <StatCard
          title="Serviços Cadastrados"
          value={89}
          description="Categorias ativas"
          icon={Settings}
          trend={{ value: 3.2, isPositive: true }}
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
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-accent/30">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm text-foreground">{activity.message}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                  <Badge 
                    variant={activity.status === 'pending' ? 'destructive' : 'default'}
                    className="text-xs"
                  >
                    {activity.status === 'pending' ? 'Pendente' : 'Ativo'}
                  </Badge>
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