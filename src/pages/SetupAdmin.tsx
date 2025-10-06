import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const SetupAdmin = () => {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("Configurando admin...");
  const navigate = useNavigate();

  const email = "fisioterapia@startfisio.com.br";
  const password = "startfisio";
  const fullName = "fisioterapia";

  useEffect(() => {
    const setupAdmin = async () => {
      try {
        console.log("🧹 Limpando usuários duplicados...");
        setStatus("Limpando usuários duplicados...");
        
        // Primeiro, limpar duplicados
        const { data: cleanupData, error: cleanupError } = await supabase.functions.invoke("cleanup-duplicate-users");
        
        if (cleanupError) {
          console.error("⚠️ Erro na limpeza:", cleanupError);
        } else {
          console.log("✅ Limpeza concluída:", cleanupData);
        }

        console.log("🔧 Configurando admin...");
        setStatus("Configurando usuário admin...");
        
        const { data, error } = await supabase.functions.invoke("setup-admin", {
          body: { email, password, fullName }
        });

        if (error) {
          console.error("❌ Erro:", error);
          setStatus("Erro ao configurar admin");
          toast.error("Erro ao configurar admin: " + error.message);
          setLoading(false);
          return;
        }

        if (data?.error) {
          console.error("❌ Erro:", data.error);
          setStatus("Erro ao configurar admin");
          toast.error("Erro ao configurar admin: " + data.error);
          setLoading(false);
          return;
        }

        console.log("✅ Admin configurado:", data);
        setStatus("Admin configurado! Fazendo login...");
        toast.success("Admin configurado com sucesso!");
        
        // Fazer login automático
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (signInError) {
          console.error("❌ Erro no login:", signInError);
          setStatus("Erro no login");
          toast.error("Admin criado, mas erro no login: " + signInError.message);
          setTimeout(() => navigate("/auth"), 2000);
        } else {
          setStatus("Login realizado! Redirecionando...");
          toast.success("Login realizado com sucesso!");
          setTimeout(() => navigate("/admin"), 1500);
        }
      } catch (error: any) {
        console.error("❌ Erro:", error);
        setStatus("Erro ao configurar admin");
        toast.error("Erro ao configurar admin: " + error.message);
        setLoading(false);
      }
    };

    setupAdmin();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Configurando Admin</CardTitle>
          <CardDescription>
            Configurando usuário fisioterapia@startfisio.com.br
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center space-y-4">
            {loading && (
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            )}
            <p className="text-center text-muted-foreground">{status}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SetupAdmin;
