import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { KeyRound, ArrowLeft } from "lucide-react";

const AdminPasswordReset = () => {
  const [email, setEmail] = useState("fisioterapia@startfisio.com.br");
  const [newPassword, setNewPassword] = useState("startfisio");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !newPassword) {
      toast.error("Preencha todos os campos");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("A senha deve ter no mínimo 6 caracteres");
      return;
    }

    setLoading(true);

    try {
      console.log("🔐 Iniciando reset de senha...");
      
      const { data, error } = await supabase.functions.invoke('reset-admin-password', {
        body: { email, newPassword }
      });

      if (error) {
        console.error("❌ Erro na função:", error);
        toast.error("Erro ao resetar senha: " + error.message);
        return;
      }

      if (data.error) {
        console.error("❌ Erro retornado:", data.error);
        toast.error(data.error);
        return;
      }

      console.log("✅ Senha resetada com sucesso!");
      toast.success("Senha resetada com sucesso! Redirecionando para login...");
      
      setTimeout(() => {
        navigate("/auth");
      }, 2000);

    } catch (error: any) {
      console.error("❌ Erro ao resetar senha:", error);
      toast.error("Erro ao resetar senha: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <KeyRound className="h-6 w-6 text-primary" />
            <CardTitle className="text-2xl font-bold">Reset de Senha Admin</CardTitle>
          </div>
          <CardDescription>
            Use esta página temporária para resetar a senha do administrador
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleReset} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email do Administrador</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@exemplo.com"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Nova Senha</Label>
              <Input
                id="password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Digite a nova senha"
                disabled={loading}
                minLength={6}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="submit"
                className="flex-1"
                disabled={loading}
              >
                {loading ? "Resetando..." : "Resetar Senha"}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/auth")}
                disabled={loading}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </div>
          </form>

          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-md">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              ⚠️ <strong>Importante:</strong> Esta página é temporária e deve ser removida após o uso por questões de segurança.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPasswordReset;