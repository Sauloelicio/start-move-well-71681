import { Target, Eye, Heart } from "lucide-react";
import teamImage from "@/assets/team.jpg";

const About = () => {
  const values = [
    {
      icon: Target,
      title: "Missão",
      description: "Proporcionar tratamentos fisioterapêuticos de excelência, personalizados e humanizados, promovendo a recuperação e o bem-estar de nossos pacientes.",
    },
    {
      icon: Eye,
      title: "Visão",
      description: "Ser referência em fisioterapia na região, reconhecida pela qualidade técnica, inovação e compromisso com resultados efetivos.",
    },
    {
      icon: Heart,
      title: "Valores",
      description: "Ética, respeito, excelência profissional, atendimento humanizado e dedicação ao desenvolvimento contínuo da equipe.",
    },
  ];

  return (
    <section id="sobre" className="section-padding bg-accent">
      <div className="section-container">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div>
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">Sobre Nós</h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              A <strong>START – FISIOTERAPIA</strong> nasceu para oferecer tratamentos modernos e personalizados, 
              focados em saúde, reabilitação e qualidade de vida. Nossa equipe altamente qualificada utiliza 
              técnicas avançadas para garantir os melhores resultados para cada paciente.
            </p>

            {/* Mission, Vision, Values */}
            <div className="space-y-6">
              {values.map((item, index) => (
                <div key={index} className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-xl mb-2">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Image */}
          <div className="relative">
            <div className="rounded-2xl overflow-hidden shadow-[var(--shadow-elevated)]">
              <img
                src={teamImage}
                alt="Equipe START Fisioterapia"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 w-64 h-64 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
