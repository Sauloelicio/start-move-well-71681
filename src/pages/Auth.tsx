import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  const { user, isAdmin, isPatient, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Só redireciona após verificar as roles (loading = false)
    if (!loading && user) {
      if (isAdmin) {
        console.log("Redirecionando para /admin");
        navigate("/admin", { replace: true });
      } else if (isPatient) {
        console.log("Redirecionando para /patient");
        navigate("/patient", { replace: true });
      } else {
        console.log("Redirecionando para /");
        navigate("/", { replace: true });
      }
    }
  }, [user, isAdmin, isPatient, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    setFormLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast.error("Email ou senha incorretos");
        } else {
          toast.error(error.message);
        }
        setFormLoading(false);
        return;
      }

      toast.success("Login realizado com sucesso!");
    } catch (error) {
      toast.error("Erro ao processar solicitação");
      setFormLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 px-4">
      <div className="w-full max-w-md">
        <div className="card-service">
          <h1 className="text-3xl font-bold text-center mb-2">
            Acesso ao Sistema
          </h1>
          <p className="text-muted-foreground text-center mb-8">
            Digite seu nome de usuário para acessar
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                autoFocus
              />
            </div>

            <div>
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sua senha"
                required
              />
            </div>

            <Button type="submit" className="w-full btn-hero" disabled={formLoading}>
              {formLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="text-primary hover:underline block w-full"
            >
              Não tem cadastro? Cadastre-se aqui
            </button>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="text-muted-foreground hover:text-foreground block w-full"
            >
              ← Voltar ao site
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
