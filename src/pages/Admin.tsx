import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Trash2, Edit, Plus, LogOut, UserPlus, Users, FileText, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { z } from "zod";

interface PatientReport {
  id: string;
  title: string;
  content: string;
  report_date: string;
  patient_id: string;
  report_format?: string;
  profiles?: { full_name: string };
}

interface Patient {
  id: string;
  full_name: string;
  role?: "admin" | "patient";
}

// Validation schemas
const reportSchema = z.object({
  title: z.string().trim().min(3, "Título deve ter no mínimo 3 caracteres").max(200, "Título muito longo"),
  content: z.string().trim().min(10, "Conteúdo deve ter no mínimo 10 caracteres"),
  patient_id: z.string().uuid("Selecione um paciente"),
  report_format: z.enum(["text", "pdf"], { required_error: "Selecione um formato" }),
});

const userSchema = z.object({
  email: z.string().trim().email("Email inválido").max(255, "Email muito longo"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres").max(72, "Senha muito longa"),
  full_name: z.string().trim().min(2, "Nome deve ter no mínimo 2 caracteres").max(100, "Nome muito longo"),
  role: z.enum(["admin", "patient"], { required_error: "Selecione uma função" }),
});

const Admin = () => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState<PatientReport[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [reportDate, setReportDate] = useState(new Date().toISOString().split("T")[0]);
  const [reportFormat, setReportFormat] = useState<"text" | "pdf">("text");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loadingReports, setLoadingReports] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Estados para gerenciamento de usuários
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [newUserRole, setNewUserRole] = useState<"patient" | "admin">("patient");
  const [allUsers, setAllUsers] = useState<Patient[]>([]);
  const [creatingUser, setCreatingUser] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate("/auth");
    }
  }, [user, isAdmin, loading, navigate]);

  useEffect(() => {
    if (user && isAdmin) {
      fetchPatients();
      fetchReports();
      fetchAllUsers();
    }
  }, [user, isAdmin]);

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name")
        .neq("full_name", "fisioterapia");

      if (error) throw error;
      setPatients(data || []);
    } catch (error: any) {
      toast.error("Erro ao carregar pacientes");
    }
  };

  const fetchAllUsers = async () => {
    setLoadingUsers(true);
    try {
      console.log("🔍 Buscando usuários cadastrados...");
      
      // Buscar profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name")
        .order("full_name");

      if (profilesError) throw profilesError;

      // Buscar roles
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (rolesError) throw rolesError;

      // Combinar dados
      const usersWithRoles = (profiles || []).map((profile: any) => {
        const userRole = roles?.find((r: any) => r.user_id === profile.id);
        return {
          id: profile.id,
          full_name: profile.full_name,
          role: userRole?.role as "admin" | "patient" | undefined,
        };
      });

      console.log("✅ Usuários processados:", usersWithRoles);
      setAllUsers(usersWithRoles);
    } catch (error: any) {
      console.error("❌ Erro ao buscar usuários:", error);
      toast.error(`Erro ao carregar usuários: ${error.message}`);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchReports = async () => {
    setLoadingReports(true);
    try {
      const { data, error } = await supabase
        .from("patient_reports")
        .select("*, profiles(full_name)")
        .order("report_date", { ascending: false });

      if (error) throw error;
      setReports(data as any || []);
    } catch (error: any) {
      toast.error("Erro ao carregar relatórios");
    } finally {
      setLoadingReports(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});
    
    const formData = {
      title: title.trim(),
      content: content.trim(),
      patient_id: selectedPatient,
      report_format: reportFormat,
    };

    try {
      reportSchema.parse(formData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            errors[err.path[0] as string] = err.message;
          }
        });
        setValidationErrors(errors);
        toast.error("Por favor, corrija os erros no formulário");
        return;
      }
    }

    setSubmitting(true);

    try {
      if (editingId) {
        const { error } = await supabase
          .from("patient_reports")
          .update({
            patient_id: formData.patient_id,
            title: formData.title,
            content: formData.content,
            report_date: reportDate,
            report_format: formData.report_format,
          })
          .eq("id", editingId);

        if (error) throw error;
        toast.success("Relatório atualizado!");
      } else {
        const { error } = await supabase
          .from("patient_reports")
          .insert({
            patient_id: formData.patient_id,
            title: formData.title,
            content: formData.content,
            report_date: reportDate,
            created_by: user!.id,
            report_format: formData.report_format,
          });

        if (error) throw error;
        toast.success("Relatório criado!");
      }

      resetForm();
      fetchReports();
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar relatório");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (report: PatientReport) => {
    setEditingId(report.id);
    setSelectedPatient(report.patient_id);
    setTitle(report.title);
    setContent(report.content);
    setReportDate(report.report_date);
    setReportFormat((report.report_format as "text" | "pdf") || "text");
    setValidationErrors({});
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deseja realmente excluir este relatório?")) return;

    try {
      const { error } = await supabase
        .from("patient_reports")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Relatório excluído!");
      fetchReports();
    } catch (error: any) {
      toast.error("Erro ao excluir relatório");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setSelectedPatient("");
    setTitle("");
    setContent("");
    setReportDate(new Date().toISOString().split("T")[0]);
    setReportFormat("text");
    setValidationErrors({});
  };

  const handleDeleteAllPatients = async () => {
    const patientUsers = allUsers.filter(user => 
      user.role === "patient" && user.full_name !== "fisioterapia"
    );

    if (patientUsers.length === 0) {
      toast.info("Não há pacientes para excluir");
      return;
    }

    const confirm = window.confirm(
      `Tem certeza que deseja excluir TODOS os ${patientUsers.length} usuários pacientes? Esta ação não pode ser desfeita.`
    );

    if (!confirm) return;

    setLoadingUsers(true);
    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (const user of patientUsers) {
      try {
        console.log(`Deletando usuário: ${user.full_name} (${user.id})`);
        const { data, error } = await supabase.functions.invoke("delete-user", {
          body: { userId: user.id },
        });

        if (error) {
          console.error(`Erro ao deletar ${user.full_name}:`, error);
          errorCount++;
          errors.push(`${user.full_name}: ${error.message}`);
        } else if (data?.error) {
          console.error(`Erro ao deletar ${user.full_name}:`, data.error);
          errorCount++;
          errors.push(`${user.full_name}: ${data.error}`);
        } else {
          console.log(`✅ ${user.full_name} deletado com sucesso`);
          successCount++;
        }
      } catch (error: any) {
        console.error(`Erro ao deletar ${user.full_name}:`, error);
        errorCount++;
        errors.push(`${user.full_name}: ${error.message || 'Erro desconhecido'}`);
      }
    }

    if (successCount > 0) {
      toast.success(`${successCount} paciente(s) excluído(s) com sucesso`);
    }
    if (errorCount > 0) {
      console.error("Erros durante exclusão:", errors);
      toast.error(`Erro ao excluir ${errorCount} paciente(s). Verifique o console para detalhes.`);
    }

    await fetchAllUsers();
    setLoadingUsers(false);
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});

    const userData = {
      email: newUserEmail.trim(),
      password: newUserPassword.trim(),
      full_name: newUserName.trim(),
      role: newUserRole,
    };

    try {
      userSchema.parse(userData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            errors[err.path[0] as string] = err.message;
          }
        });
        setValidationErrors(errors);
        toast.error("Por favor, corrija os erros no formulário");
        return;
      }
    }

    setCreatingUser(true);

    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: userData.full_name,
          }
        }
      });

      if (signUpError) throw signUpError;

      if (!authData.user) {
        toast.error("Erro ao criar usuário");
        return;
      }

      const { error: roleError } = await supabase
        .from("user_roles")
        .insert([
          {
            user_id: authData.user.id,
            role: userData.role,
          }
        ]);

      if (roleError) throw roleError;

      const userType = userData.role === "admin" ? "Administrador" : "Paciente";
      toast.success(`Usuário ${userType} cadastrado com sucesso!`);
      setNewUserName("");
      setNewUserEmail("");
      setNewUserPassword("");
      setNewUserRole("patient");
      fetchPatients();
      fetchAllUsers();
    } catch (error: any) {
      if (error.message?.includes("User already registered") || error.message?.includes("already exists")) {
        toast.error("Este email já está cadastrado");
      } else {
        toast.error("Erro ao cadastrar usuário");
      }
    } finally {
      setCreatingUser(false);
    }
  };

  const handleDeleteUser = async (userId: string, userRole?: "admin" | "patient") => {
    if (userRole === "admin") {
      toast.error("Não é possível excluir usuários administradores");
      return;
    }

    if (!confirm(`Deseja realmente excluir este usuário?`)) return;

    try {
      const { data, error } = await supabase.functions.invoke('delete-user', {
        body: { userId }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success("Usuário excluído!");
      fetchPatients();
      fetchAllUsers();
    } catch (error: any) {
      toast.error(error.message || "Erro ao excluir usuário");
    }
  };

  const handleChangeRole = async (userId: string, currentRole: "admin" | "patient" | undefined) => {
    const newRole = currentRole === "admin" ? "patient" : "admin";
    
    if (!confirm(`Deseja alterar este usuário para ${newRole === "admin" ? "Administrador" : "Paciente"}?`)) return;

    try {
      const { data: existingRole } = await supabase
        .from("user_roles")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      if (existingRole) {
        const { error } = await supabase
          .from("user_roles")
          .update({ role: newRole })
          .eq("user_id", userId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("user_roles")
          .insert([
            {
              user_id: userId,
              role: newRole,
            }
          ]);

        if (error) throw error;
      }

      toast.success(`Função alterada para ${newRole === "admin" ? "Administrador" : "Paciente"}!`);
      fetchAllUsers();
    } catch (error: any) {
      toast.error("Erro ao alterar função");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="section-container py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Área Administrativa</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/")}>
              ← Voltar
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>

        <Tabs defaultValue="reports" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="reports">Relatórios</TabsTrigger>
            <TabsTrigger value="users">Usuários</TabsTrigger>
          </TabsList>

          <TabsContent value="reports" className="mt-6">
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="card-service">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Plus className="h-6 w-6" />
                  {editingId ? "Editar Relatório" : "Novo Relatório"}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="patient">Paciente *</Label>
                    <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o paciente" />
                      </SelectTrigger>
                      <SelectContent>
                        {patients.map((patient) => (
                          <SelectItem key={patient.id} value={patient.id}>
                            {patient.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {validationErrors.patient_id && (
                      <p className="text-sm text-destructive mt-1">{validationErrors.patient_id}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="title">Título *</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Ex: Avaliação Inicial"
                      maxLength={200}
                    />
                    {validationErrors.title && (
                      <p className="text-sm text-destructive mt-1">{validationErrors.title}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="reportDate">Data *</Label>
                      <Input
                        id="reportDate"
                        type="date"
                        value={reportDate}
                        onChange={(e) => setReportDate(e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="reportFormat">Formato *</Label>
                      <Select value={reportFormat} onValueChange={(value: "text" | "pdf") => setReportFormat(value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Texto</SelectItem>
                          <SelectItem value="pdf">PDF</SelectItem>
                        </SelectContent>
                      </Select>
                      {validationErrors.report_format && (
                        <p className="text-sm text-destructive mt-1">{validationErrors.report_format}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="content">Conteúdo *</Label>
                    <Textarea
                      id="content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Descreva o relatório detalhadamente..."
                      rows={8}
                      maxLength={5000}
                    />
                    {validationErrors.content && (
                      <p className="text-sm text-destructive mt-1">{validationErrors.content}</p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" className="btn-hero flex-1" disabled={submitting}>
                      {submitting ? "Salvando..." : editingId ? "Atualizar" : "Criar"} Relatório
                    </Button>
                    {editingId && (
                      <Button type="button" variant="outline" onClick={resetForm}>
                        Cancelar
                      </Button>
                    )}
                  </div>
                </form>
              </div>

              <div className="card-service">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <FileText className="h-6 w-6" />
                  Relatórios Cadastrados
                </h2>
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {loadingReports ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : reports.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      Nenhum relatório cadastrado
                    </p>
                  ) : (
                    reports.map((report) => (
                      <div
                        key={report.id}
                        className="border rounded-lg p-4 hover:border-primary transition-colors"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h3 className="font-bold">{report.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {new Date(report.report_date).toLocaleDateString('pt-BR')}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-sm font-medium">Paciente: {report.profiles?.full_name}</p>
                              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                {report.report_format === "pdf" ? "PDF" : "Texto"}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(report)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(report.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="card-service">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <UserPlus className="h-6 w-6" />
                  Cadastrar Novo Usuário
                </h2>

                <form onSubmit={handleCreateUser} className="space-y-4">
                  <div>
                    <Label htmlFor="newUserEmail">Email *</Label>
                    <Input
                      id="newUserEmail"
                      type="email"
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      placeholder="email@exemplo.com"
                    />
                    {validationErrors.email && (
                      <p className="text-sm text-destructive mt-1">{validationErrors.email}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="newUserPassword">Senha *</Label>
                    <Input
                      id="newUserPassword"
                      type="password"
                      value={newUserPassword}
                      onChange={(e) => setNewUserPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                    />
                    {validationErrors.password && (
                      <p className="text-sm text-destructive mt-1">{validationErrors.password}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="newUserName">Nome Completo *</Label>
                    <Input
                      id="newUserName"
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      placeholder="Nome do usuário"
                    />
                    {validationErrors.full_name && (
                      <p className="text-sm text-destructive mt-1">{validationErrors.full_name}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="newUserRole">Função *</Label>
                    <Select value={newUserRole} onValueChange={(value: "admin" | "patient") => setNewUserRole(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a função" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="patient">Paciente</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                    {validationErrors.role && (
                      <p className="text-sm text-destructive mt-1">{validationErrors.role}</p>
                    )}
                  </div>

                  <Button type="submit" className="btn-hero w-full" disabled={creatingUser}>
                    {creatingUser ? "Criando..." : "Criar Usuário"}
                  </Button>
                </form>
              </div>

              <div className="card-service">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Users className="h-6 w-6" />
                    Usuários Cadastrados
                  </h2>
                  <Button
                    onClick={handleDeleteAllPatients}
                    variant="destructive"
                    size="sm"
                    disabled={loadingUsers}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir Todos Pacientes
                  </Button>
                </div>
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {loadingUsers ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    allUsers.map((user) => (
                    <div
                      key={user.id}
                      className="border rounded-lg p-4 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-semibold">{user.full_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {user.role === "admin" ? "Administrador" : user.role === "patient" ? "Paciente" : "Sem função"}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleChangeRole(user.id, user.role)}
                            disabled={user.full_name === "fisioterapia"}
                          >
                            Alterar Função
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteUser(user.id, user.role)}
                            disabled={user.full_name === "fisioterapia"}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                       </div>
                     </div>
                   ))
                  )}
                 </div>
               </div>
             </div>
           </TabsContent>
         </Tabs>
       </div>
     </div>
   );
 };
 
 export default Admin;