import Header from "@/components/Header";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Services from "@/components/Services";
import Appointment from "@/components/Appointment";
import Blog from "@/components/Blog";
import PatientArea from "@/components/PatientArea";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <About />
        <Services />
        <Appointment />
        <Blog />
        <PatientArea />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
