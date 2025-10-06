import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { FileText, LogOut, Calendar, Download, Printer, Filter } from "lucide-react";

interface PatientReport {
  id: string;
  title: string;
  content: string;
  report_date: string;
  created_at: string;
  report_format?: string;
}

const Patient = () => {
  const { user, isPatient, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState<PatientReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<PatientReport[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedReport, setSelectedReport] = useState<PatientReport | null>(null);
  const [periodFilter, setPeriodFilter] = useState<string>("all");

  useEffect(() => {
    if (!loading && (!user || !isPatient)) {
      navigate("/auth");
    }
  }, [user, isPatient, loading, navigate]);

  useEffect(() => {
    if (user && isPatient) {
      fetchReports();
    }
  }, [user, isPatient]);

  useEffect(() => {
    filterReports();
  }, [reports, periodFilter]);

  const fetchReports = async () => {
    setLoadingData(true);
    try {
      const { data, error } = await supabase
        .from("patient_reports")
        .select("*")
        .eq("patient_id", user!.id)
        .order("report_date", { ascending: false });

      if (error) throw error;
      setReports(data || []);
      if (data && data.length > 0) {
        setSelectedReport(data[0]);
      }
    } catch (error: any) {
      toast.error("Erro ao carregar relatórios");
    } finally {
      setLoadingData(false);
    }
  };

  const filterReports = () => {
    const now = new Date();
    let filtered = [...reports];

    switch (periodFilter) {
      case "month":
        const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
        filtered = reports.filter(r => new Date(r.report_date) >= monthAgo);
        break;
      case "3months":
        const threeMonthsAgo = new Date(now.setMonth(now.getMonth() - 3));
        filtered = reports.filter(r => new Date(r.report_date) >= threeMonthsAgo);
        break;
      case "6months":
        const sixMonthsAgo = new Date(now.setMonth(now.getMonth() - 6));
        filtered = reports.filter(r => new Date(r.report_date) >= sixMonthsAgo);
        break;
      case "year":
        const yearAgo = new Date(now.setFullYear(now.getFullYear() - 1));
        filtered = reports.filter(r => new Date(r.report_date) >= yearAgo);
        break;
      default:
        filtered = reports;
    }

    setFilteredReports(filtered);
  };

  const handlePrint = () => {
    if (!selectedReport) return;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${selectedReport.title}</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                padding: 40px; 
                line-height: 1.6; 
                max-width: 800px;
                margin: 0 auto;
              }
              h1 { 
                color: #333; 
                border-bottom: 2px solid #4a90e2;
                padding-bottom: 10px;
              }
              .meta { 
                color: #666; 
                margin: 20px 0;
                padding: 15px;
                background: #f5f5f5;
                border-radius: 5px;
              }
              .content { 
                white-space: pre-wrap;
                margin-top: 20px;
                line-height: 1.8;
              }
              @media print {
                body { padding: 20px; }
              }
            </style>
          </head>
          <body>
            <h1>${selectedReport.title}</h1>
            <div class="meta">
              <p><strong>Data do Relatório:</strong> ${new Date(selectedReport.report_date).toLocaleDateString("pt-BR", {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</p>
              <p><strong>Criado em:</strong> ${new Date(selectedReport.created_at).toLocaleDateString("pt-BR")}</p>
            </div>
            <div class="content">${selectedReport.content}</div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleDownloadPDF = () => {
    if (!selectedReport) return;
    
    // Use browser print to save as PDF
    handlePrint();
    toast.success("Use a opção 'Salvar como PDF' na janela de impressão");
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando relatórios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="section-container py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Meus Relatórios</h1>
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

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Reports List */}
          <div className="lg:col-span-1 card-service">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Relatórios
              </h2>
              <span className="text-sm text-muted-foreground">
                {filteredReports.length} {filteredReports.length === 1 ? 'relatório' : 'relatórios'}
              </span>
            </div>

            {/* Filter */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filtrar por período</span>
              </div>
              <Select value={periodFilter} onValueChange={setPeriodFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os relatórios</SelectItem>
                  <SelectItem value="month">Último mês</SelectItem>
                  <SelectItem value="3months">Últimos 3 meses</SelectItem>
                  <SelectItem value="6months">Últimos 6 meses</SelectItem>
                  <SelectItem value="year">Último ano</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {filteredReports.length === 0 ? (
                <p className="text-muted-foreground text-center py-8 text-sm">
                  {reports.length === 0 
                    ? "Você ainda não possui relatórios"
                    : "Nenhum relatório encontrado neste período"
                  }
                </p>
              ) : (
                filteredReports.map((report) => (
                  <button
                    key={report.id}
                    onClick={() => setSelectedReport(report)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      selectedReport?.id === report.id
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border hover:border-primary/50 hover:bg-accent/5"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm mb-1 line-clamp-2">{report.title}</h3>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(report.report_date).toLocaleDateString("pt-BR", {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                      {report.report_format === "pdf" && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                          PDF
                        </span>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Report Details */}
          <div className="lg:col-span-2 card-service">
            {selectedReport ? (
              <>
                <div className="mb-6 pb-6 border-b">
                  <h2 className="text-2xl font-bold mb-3">{selectedReport.title}</h2>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <p className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Data: {new Date(selectedReport.report_date).toLocaleDateString("pt-BR", {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}</span>
                    </p>
                    <p>
                      Criado em: {new Date(selectedReport.created_at).toLocaleDateString("pt-BR")}
                    </p>
                    {selectedReport.report_format && (
                      <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">
                        {selectedReport.report_format === "pdf" ? "Formato PDF" : "Formato Texto"}
                      </span>
                    )}
                  </div>
                </div>

                <div className="prose max-w-none mb-6">
                  <div className="bg-muted/30 rounded-lg p-6">
                    <p className="whitespace-pre-wrap leading-relaxed">{selectedReport.content}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handlePrint}
                    className="btn-hero flex-1"
                  >
                    <Printer className="mr-2 h-4 w-4" />
                    Imprimir
                  </Button>
                  <Button
                    onClick={handleDownloadPDF}
                    variant="outline"
                    className="flex-1"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Baixar PDF
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-center text-muted-foreground min-h-[400px]">
                <div>
                  <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Selecione um relatório para visualizar</p>
                  <p className="text-sm mt-2">
                    {reports.length === 0 
                      ? "Entre em contato com seu fisioterapeuta para solicitar relatórios"
                      : "Escolha um relatório da lista ao lado"
                    }
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Patient;