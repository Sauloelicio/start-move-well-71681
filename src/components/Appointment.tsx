import { Button } from "@/components/ui/button";
import { Calendar, Clock, Phone } from "lucide-react";

const Appointment = () => {
  return (
    <section className="section-padding bg-gradient-to-br from-primary to-primary-hover text-white">
      <div className="section-container">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">Agende Seu Atendimento</h2>
          <p className="text-xl mb-8 opacity-90">
            Escolha seu melhor horário e agende facilmente sua consulta pelo WhatsApp. 
            Nossa equipe está pronta para atendê-lo!
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-10">
            <div className="flex items-center gap-3">
              <Calendar className="h-6 w-6" />
              <span className="text-lg">Segunda a Sexta</span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-6 w-6" />
              <span className="text-lg">8h às 18h</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-6 w-6" />
              <span className="text-lg">(79) 99991-7265</span>
            </div>
          </div>

          <a href="https://wa.me/5579999917265" target="_blank" rel="noopener noreferrer">
            <Button 
              size="lg" 
              className="bg-white text-primary hover:bg-white/90 font-bold text-lg px-10 py-6 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
            >
              <Phone className="mr-2 h-5 w-5" />
              Agendar pelo WhatsApp
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
};

export default Appointment;
