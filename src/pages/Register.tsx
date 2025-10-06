import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

// Strong password validation schema
const passwordSchema = z
  .string()
  .min(12, "A senha deve ter no mínimo 12 caracteres")
  .regex(/[A-Z]/, "A senha deve conter pelo menos uma letra maiúscula")
  .regex(/[a-z]/, "A senha deve conter pelo menos uma letra minúscula")
  .regex(/[0-9]/, "A senha deve conter pelo menos um número")
  .regex(/[^A-Za-z0-9]/, "A senha deve conter pelo menos um caractere especial");

const emailSchema = z.string().email("Email inválido").max(255, "Email muito longo");
const nameSchema = z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(100, "Nome muito longo");

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate inputs with strong validation
      const emailResult = emailSchema.safeParse(email.trim());
      if (!emailResult.success) {
        toast.error(emailResult.error.errors[0].message);
        setLoading(false);
        return;
      }

      const nameResult = nameSchema.safeParse(fullName.trim());
      if (!nameResult.success) {
        toast.error(nameResult.error.errors[0].message);
        setLoading(false);
        return;
      }

      const passwordResult = passwordSchema.safeParse(password);
      if (!passwordResult.success) {
        toast.error(passwordResult.error.errors[0].message);
        setLoading(false);
        return;
      }

      // Create auth user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: emailResult.data,
        password: passwordResult.data,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: nameResult.data,
          }
        }
      });

      if (signUpError) throw signUpError;

      if (!authData.user) {
        toast.error("Erro ao criar usuário");
        setLoading(false);
        return;
      }

      // Note: Profile is automatically created by the handle_new_user() trigger
      // Note: Patient role is automatically assigned by the assign_default_role() trigger
      
      toast.success("Cadastro realizado com sucesso! Você será redirecionado para o login.");
      
      setTimeout(() => {
        navigate("/auth");
      }, 1000);
    } catch (error: any) {
      if (error.message?.includes("User already registered")) {
        toast.error("Este email já está cadastrado");
      } else {
        toast.error("Erro ao processar cadastro");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 px-4">
      <div className="w-full max-w-md">
        <div className="card-service">
          <h1 className="text-3xl font-bold text-center mb-2">
            Cadastro de Usuário
          </h1>
          <p className="text-muted-foreground text-center mb-8">
            Preencha os dados para criar sua conta
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="fullName">Nome Completo</Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Digite seu nome completo"
                required
                maxLength={100}
                autoFocus
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
              />
            </div>

            <div>
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Senha forte"
                required
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Mínimo 12 caracteres, com maiúsculas, minúsculas, números e caracteres especiais
              </p>
            </div>

            <Button type="submit" className="w-full btn-hero" disabled={loading}>
              {loading ? "Cadastrando..." : "Cadastrar"}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <button
              type="button"
              onClick={() => navigate("/auth")}
              className="text-primary hover:underline block w-full"
            >
              Já tem cadastro? Fazer login
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

export default Register;
