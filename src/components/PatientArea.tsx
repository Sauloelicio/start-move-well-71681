import { Button } from "@/components/ui/button";
import { Lock, FileText, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const PatientArea = () => {
  const navigate = useNavigate();
  const { user, isPatient } = useAuth();

  const handleLoginClick = () => {
    if (user) {
      if (isPatient) {
        navigate("/patient");
      }
    } else {
      navigate("/auth");
    }
  };

  return (
    <section id="paciente" className="section-padding">
      <div className="section-container">
        <div className="max-w-4xl mx-auto">
          <div className="card-service text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary mx-auto mb-6 flex items-center justify-center">
              <Lock className="h-10 w-10 text-white" />
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Área do Paciente</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Acesse sua área restrita para visualizar e baixar seus relatórios de evolução, 
              resultados de exames e orientações personalizadas.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <span>Relatórios Online</span>
              </div>
              <div className="flex items-center gap-2">
                <Download className="h-5 w-5 text-primary" />
                <span>Download de PDFs</span>
              </div>
            </div>

            <Button className="btn-hero text-lg" onClick={handleLoginClick}>
              {user && isPatient ? "Acessar Meus Relatórios" : "Fazer Login"}
            </Button>
            
            <p className="text-sm text-muted-foreground mt-4">
              Caso ainda não tenha suas credenciais de acesso, entre em contato conosco.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PatientArea;
