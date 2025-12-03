import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiUrl } from "@/config/api";
import { useAuthContext } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ServiceItem {
  id: number;
  name: string;
}

interface Provider {
  id: number;
  name: string;
  services?: ServiceItem[];
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  provider: Provider | null;
  onBooked?: () => void;
}

export default function BookServiceModal({
  open,
  onOpenChange,
  provider,
  onBooked,
}: Props) {
  const { token } = useAuthContext();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [availableSlots, setAvailableSlots] = useState<
    { time: string; available: boolean }[]
  >([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedServices, setSelectedServices] = useState<
    { service_id: number; quantidade: number; observacoes?: string }[]
  >([]);
  const [loading, setLoading] = useState(false);

  // Carregar horários disponíveis quando a data mudar
  useEffect(() => {
    if (selectedDate && provider) {
      setSelectedTime(""); // Resetar horário selecionado ao mudar a data
      fetchAvailableSlots();
    } else {
      setAvailableSlots([]);
      setSelectedTime("");
    }
  }, [selectedDate, provider]);

  const fetchAvailableSlots = async () => {
    if (!provider || !selectedDate) return;

    setLoadingSlots(true);
    try {
      const response = await fetch(
        `${apiUrl}/availability/${provider.id}/available-slots?date=${selectedDate}`
      );

      if (response.ok) {
        const data = await response.json();
        setAvailableSlots(data.slots || []);
      } else {
        setAvailableSlots([]);
      }
    } catch (error) {
      console.error("Erro ao carregar horários:", error);
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const toggleService = (serviceId: number) => {
    const exists = selectedServices.find((s) => s.service_id === serviceId);
    if (exists) {
      setSelectedServices(
        selectedServices.filter((s) => s.service_id !== serviceId)
      );
    } else {
      setSelectedServices([
        ...selectedServices,
        { service_id: serviceId, quantidade: 1 },
      ]);
    }
  };

  const setQuantidade = (serviceId: number, quantidade: number) => {
    setSelectedServices(
      selectedServices.map((s) =>
        s.service_id === serviceId ? { ...s, quantidade } : s
      )
    );
  };

  const setObservacoes = (serviceId: number, observacoes: string) => {
    setSelectedServices(
      selectedServices.map((s) =>
        s.service_id === serviceId ? { ...s, observacoes } : s
      )
    );
  };

  const handleSubmit = async () => {
    if (!provider) return;
    if (!selectedDate || !selectedTime)
      return toast({
        title: "Erro",
        description: "Escolha data e horário",
        variant: "destructive",
      });
    if (selectedServices.length === 0)
      return toast({
        title: "Erro",
        description: "Selecione pelo menos um serviço",
        variant: "destructive",
      });

    setLoading(true);
    try {
      // Combinar data e hora selecionadas
      const scheduledDateTime = new Date(`${selectedDate}T${selectedTime}:00`);
      
      const payload = {
        provider_id: provider.id,
        scheduled_at: scheduledDateTime.toISOString(),
        services: selectedServices,
      };

      const res = await fetch(`${apiUrl}/orders`, {
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

      toast({ title: "Sucesso", description: "Pedido enviado ao prestador" });
      onOpenChange(false);
      setSelectedServices([]);
      setSelectedDate("");
      setSelectedTime("");
      setAvailableSlots([]);
      onBooked && onBooked();
    } catch (err: any) {
      toast({
        title: "Erro",
        description: err.message || "Erro ao enviar pedido",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Agendar com {provider?.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="space-y-4">
            <div>
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Escolha a Data
              </Label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="mt-2"
              />
            </div>

            {selectedDate && (
              <div>
                <Label className="flex items-center gap-2 mb-3">
                  <Clock className="h-4 w-4" />
                  Escolha o Horário Disponível
                </Label>
                {loadingSlots ? (
                  <div className="flex items-center justify-center p-6 bg-gray-50 rounded-lg border">
                    <div className="text-center">
                      <Clock className="h-8 w-8 mx-auto mb-2 text-gray-400 animate-pulse" />
                      <p className="text-sm text-gray-500">Carregando horários disponíveis...</p>
                    </div>
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="flex items-center justify-center p-6 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="text-center">
                      <Clock className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                      <p className="text-sm font-medium text-yellow-800">
                        Prestador não disponível nesta data
                      </p>
                      <p className="text-xs text-yellow-700 mt-1">
                        Tente selecionar outra data
                      </p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs text-gray-600 mb-3">
                      Selecione um dos horários disponíveis abaixo:
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                      {availableSlots.map((slot) => (
                        <Button
                          key={slot.time}
                          type="button"
                          variant={selectedTime === slot.time ? "default" : "outline"}
                          className="h-auto py-3 font-semibold"
                          onClick={() => setSelectedTime(slot.time)}
                        >
                          {slot.time}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {selectedDate && selectedTime && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 text-sm text-blue-900">
                  <Calendar className="h-4 w-4" />
                  <span className="font-medium">
                    Agendamento: {new Date(selectedDate).toLocaleDateString("pt-BR")} às {selectedTime}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div>
            <Label className="text-base font-semibold">Serviços</Label>
            <div className="space-y-4 mt-3">
              {provider?.services?.map((s) => {
                const sel = selectedServices.find((x) => x.service_id === s.id);
                return (
                  <div key={s.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!sel}
                          onChange={() => toggleService(s.id)}
                          className="w-4 h-4"
                        />
                        <span className="font-medium">{s.name}</span>
                      </label>
                      {sel && (
                        <div className="flex items-center gap-2">
                          <Label className="text-sm text-gray-600">Quantidade:</Label>
                          <Input
                            type="number"
                            min={1}
                            value={sel.quantidade}
                            onChange={(e) =>
                              setQuantidade(
                                s.id,
                                Math.max(1, Number(e.target.value))
                              )
                            }
                            className="w-20"
                          />
                        </div>
                      )}
                    </div>
                    {sel && (
                      <div className="space-y-2">
                        <Label className="text-sm">
                          Observações / Descrição do serviço
                          <span className="text-gray-500 font-normal ml-1">(opcional)</span>
                        </Label>
                        <Textarea
                          placeholder="Descreva os detalhes do que você precisa, especificações, ou qualquer observação importante..."
                          value={sel.observacoes || ""}
                          onChange={(e) => setObservacoes(s.id, e.target.value)}
                          className="min-h-[80px] resize-none"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Enviando..." : "Confirmar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
