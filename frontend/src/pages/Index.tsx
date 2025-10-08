import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Users, UserCheck, Star, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center admin-gradient py-20">

      <div>
        <div className="">
          <div className="container mx-auto px-6 text-center">
            <h1 className="text-5xl font-bold text-dark-blue mb-6">
              PrestadoresClimber
            </h1>
            <p className="text-xl text-dark-blue/80 mb-8 max-w-2xl mx-auto">
              Conectando você aos melhores prestadores de serviços de Campo Mourão e região
            </p>
          
          </div>
        </div>

        {/* Admin Access */}
        <div className="">
          <div className="container mx-auto px-6 text-center">
            <Card className="max-w-md mx-auto card-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 justify-center">
                  <UserCheck className="w-5 h-5 text-primary" />
                  Área Administrativa
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Acesse o painel de controle para gerenciar prestadores, contratantes e avaliações
                </p>
                <Link to="/admin">
                  <Button className="w-full">
                    Acessar Dashboard
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default Index;
