import { Activity, Heart, Stethoscope, Users, Dumbbell, HandMetal } from "lucide-react";

const Services = () => {
  const services = [
    {
      icon: Activity,
      title: "Fisioterapia Ortopédica",
      description: "Tratamento de lesões músculo-esqueléticas, dores articulares e problemas posturais.",
    },
    {
      icon: Heart,
      title: "Fisioterapia Esportiva",
      description: "Prevenção e reabilitação de lesões esportivas para atletas de todos os níveis.",
    },
    {
      icon: Stethoscope,
      title: "Reabilitação Pós-Cirúrgica",
      description: "Recuperação funcional após cirurgias ortopédicas, com protocolos personalizados.",
    },
    {
      icon: Dumbbell,
      title: "Pilates Terapêutico",
      description: "Método de fortalecimento e alongamento para reabilitação e condicionamento físico.",
    },
    {
      icon: HandMetal,
      title: "Terapias Manuais",
      description: "Técnicas especializadas de manipulação para alívio de dores e tensões musculares.",
    },
    {
      icon: Users,
      title: "Fisioterapia Geriátrica",
      description: "Cuidados especializados para promover mobilidade e independência na terceira idade.",
    },
  ];

  return (
    <section id="servicos" className="section-padding">
      <div className="section-container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">Nossos Serviços</h2>
          <p className="text-lg text-muted-foreground">
            Oferecemos uma ampla gama de tratamentos fisioterapêuticos, personalizados para atender às suas necessidades específicas.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div key={index} className="card-service group">
              <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <service.icon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{service.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
