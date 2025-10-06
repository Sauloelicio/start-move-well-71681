import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

const Hero = () => {
  return (
    <section id="inicio" className="relative min-h-screen flex items-center pt-20">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Fisioterapia START"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/40" />
      </div>

      {/* Content */}
      <div className="section-container relative z-10">
        <div className="max-w-3xl">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight animate-fade-in">
            Recupere seu movimento.{" "}
            <span className="text-primary">Viva sem dor.</span>
          </h1>
          
          <p className="text-xl sm:text-2xl text-muted-foreground mb-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            Tratamentos personalizados em ortopedia, reabilitação, pilates terapêutico e muito mais.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <a href="https://wa.me/5579999917265" target="_blank" rel="noopener noreferrer">
              <Button className="btn-secondary-hero text-lg">
                Agendar agora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </a>
            <a href="#servicos">
              <Button variant="outline" size="lg" className="text-lg border-2 hover:bg-accent">
                Conheça nossos serviços
              </Button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
