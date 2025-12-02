import React, { useState } from "react";
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
import { apiUrl } from "@/config/api";
import { useAuthContext } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

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
  const [scheduledAt, setScheduledAt] = useState("");
  const [selectedServices, setSelectedServices] = useState<
    { service_id: number; quantidade: number; observacoes?: string }[]
  >([]);
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async () => {
    if (!provider) return;
    if (!scheduledAt)
      return toast({
        title: "Erro",
        description: "Escolha data e hora",
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
      const payload = {
        provider_id: provider.id,
        scheduled_at: new Date(scheduledAt).toISOString(),
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
      setScheduledAt("");
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
          <div>
            <Label>Data e hora</Label>
            <Input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
            />
          </div>

          <div>
            <Label>Serviços</Label>
            <div className="space-y-2 mt-2">
              {provider?.services?.map((s) => {
                const sel = selectedServices.find((x) => x.service_id === s.id);
                return (
                  <div key={s.id} className="flex items-center gap-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={!!sel}
                        onChange={() => toggleService(s.id)}
                      />
                      <span>{s.name}</span>
                    </label>
                    {sel && (
                      <div className="flex items-center gap-2 ml-4">
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
