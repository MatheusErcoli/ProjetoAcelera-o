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
  const { logout, user } = useAuthContext();
  const navigate = useNavigate();
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
    fetchProviders();
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
      if (selectedService) url += `serviceId=${selectedService}&`;
      if (selectedCity) url += `cidade=${selectedCity}&`;
      if (selectedUf) url += `uf=${selectedUf}&`;

      const response = await fetch(url);
      if (!response.ok) throw new Error("Erro ao carregar prestadores");
      const data = await response.json();
      setProviders(data);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os prestadores",
        variant: "destructive",
      });
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
                    <Button variant="outline" className="w-full justify-start">
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
    </div>
  );
};

export default ClientsPage;
