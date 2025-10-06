import { BookOpen, TrendingUp, Activity } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Blog = () => {
  const articles = [
    {
      icon: Activity,
      title: "5 Exercícios para Aliviar Dores nas Costas",
      description: "Descubra exercícios simples que você pode fazer em casa para reduzir dores lombares e melhorar sua postura.",
      date: "15 Jan 2025",
    },
    {
      icon: TrendingUp,
      title: "A Importância da Fisioterapia Preventiva",
      description: "Entenda como a fisioterapia preventiva pode evitar lesões futuras e melhorar sua qualidade de vida.",
      date: "10 Jan 2025",
    },
    {
      icon: BookOpen,
      title: "Pilates: Benefícios para Corpo e Mente",
      description: "Conheça os múltiplos benefícios do pilates terapêutico na reabilitação e no fortalecimento muscular.",
      date: "05 Jan 2025",
    },
  ];

  return (
    <section id="blog" className="section-padding bg-muted/30">
      <div className="section-container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">Blog & Dicas de Saúde</h2>
          <p className="text-lg text-muted-foreground">
            Artigos e informações sobre bem-estar, prevenção de dores, exercícios e saúde física.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article, index) => (
            <Card key={index} className="hover:shadow-[var(--shadow-elevated)] transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <article.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{article.title}</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">{article.date}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{article.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Blog;
