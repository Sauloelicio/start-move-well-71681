import { Instagram, Phone, MapPin } from "lucide-react";
import logo from "@/assets/logo.png";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background py-12">
      <div className="section-container">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Logo & Description */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <img src={logo} alt="START Fisioterapia" className="h-16 w-16" />
              <span className="font-bold text-xl">START FISIOTERAPIA</span>
            </div>
            <p className="text-background/80 mb-4">
              Clínica especializada em fisioterapia, reabilitação e qualidade de vida. 
              Cuidando da sua saúde com excelência e dedicação.
            </p>
            <a 
              href="https://instagram.com/start.fisioterapia" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-background/80 hover:text-secondary transition-colors"
            >
              <Instagram className="h-5 w-5" />
              @start.fisioterapia
            </a>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Links Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <a href="#inicio" className="text-background/80 hover:text-secondary transition-colors">
                  Início
                </a>
              </li>
              <li>
                <a href="#sobre" className="text-background/80 hover:text-secondary transition-colors">
                  Sobre Nós
                </a>
              </li>
              <li>
                <a href="#servicos" className="text-background/80 hover:text-secondary transition-colors">
                  Serviços
                </a>
              </li>
              <li>
                <a href="#blog" className="text-background/80 hover:text-secondary transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="#paciente" className="text-background/80 hover:text-secondary transition-colors">
                  Área do Paciente
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Contato</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-background/80">
                <MapPin className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <span className="text-sm">
                  R. Ananias Azevedo, 753<br />
                  Salgado Filho, Aracaju - SE
                </span>
              </li>
              <li className="flex items-center gap-2 text-background/80">
                <Phone className="h-5 w-5 flex-shrink-0" />
                <a href="tel:+5579999917265" className="hover:text-secondary transition-colors">
                  (79) 99991-7265
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-background/20 pt-8 text-center text-background/60 text-sm">
          <p>© {new Date().getFullYear()} START – FISIOTERAPIA. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
