import { MapPin, Phone, Clock, Instagram } from "lucide-react";

const Contact = () => {
  return (
    <section id="contato" className="section-padding bg-accent">
      <div className="section-container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">Entre em Contato</h2>
          <p className="text-lg text-muted-foreground">
            Estamos prontos para atendê-lo. Visite-nos ou entre em contato pelos nossos canais.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-8">
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-xl mb-2">Endereço</h3>
                <p className="text-muted-foreground">
                  Av. Pedro Paes de Azevedo, R. Ananias Azevedo, 753<br />
                  Salgado Filho, Aracaju - SE<br />
                  CEP: 49020-450
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Phone className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-xl mb-2">Telefone / WhatsApp</h3>
                <p className="text-muted-foreground">
                  <a href="tel:+5579999917265" className="hover:text-primary transition-colors">
                    (79) 99991-7265
                  </a>
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-xl mb-2">Horário de Funcionamento</h3>
                <p className="text-muted-foreground">
                  Segunda a Sexta: 8h às 18h<br />
                  Sábado: 8h às 12h
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Instagram className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-xl mb-2">Redes Sociais</h3>
                <p className="text-muted-foreground">
                  <a 
                    href="https://instagram.com/start.fisioterapia" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-colors"
                  >
                    @start.fisioterapia
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="rounded-2xl overflow-hidden shadow-[var(--shadow-elevated)] h-[500px]">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3916.5234!2d-37.0543!3d-10.9474!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTDCsDU2JzUwLjYiUyAzN8KwMDMnMTUuNSJX!5e0!3m2!1spt-BR!2sbr!4v1234567890"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Localização START Fisioterapia"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
