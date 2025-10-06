import { useState, useEffect } from "react";
import { Menu, X, LogIn, LogOut, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAdmin, isPatient, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const menuItems = [
    { label: "Início", href: "#inicio" },
    { label: "Sobre Nós", href: "#sobre" },
    { label: "Serviços", href: "#servicos" },
    { label: "Blog", href: "#blog" },
    { label: "Contato", href: "#contato" },
  ];

  const handleAuthClick = () => {
    if (user) {
      if (isAdmin) {
        navigate("/admin");
      } else if (isPatient) {
        navigate("/patient");
      }
    } else {
      navigate("/auth");
    }
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
    setIsMobileMenuOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-background/95 backdrop-blur-md shadow-md" : "bg-transparent"
      }`}
    >
      <nav className="section-container">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <a href="#inicio" className="flex items-center space-x-3">
            <img src={logo} alt="START Fisioterapia" className="h-16 w-16" />
            <span className="font-bold text-xl hidden sm:block">START FISIOTERAPIA</span>
          </a>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-8">
            {menuItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-foreground/80 hover:text-primary font-medium transition-colors"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden lg:flex items-center gap-2">
            {user ? (
              <>
                <Button onClick={handleAuthClick} variant="outline" className="flex items-center gap-2">
                  <UserCircle className="h-4 w-4" />
                  {isAdmin ? "Admin" : isPatient ? "Meus Relatórios" : "Perfil"}
                </Button>
                <Button onClick={handleLogout} variant="ghost" size="icon">
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Button onClick={handleAuthClick} variant="outline" className="flex items-center gap-2">
                <LogIn className="h-4 w-4" />
                Login
              </Button>
            )}
            <a href="https://wa.me/5579999917265" target="_blank" rel="noopener noreferrer">
              <Button className="btn-secondary-hero">Agende sua consulta</Button>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-background/98 backdrop-blur-md shadow-lg py-6 px-4 space-y-4 animate-fade-in border-t">
            {menuItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="block text-foreground/80 hover:text-primary font-medium py-3 text-center"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
            
            {user ? (
              <>
                <Button onClick={handleAuthClick} variant="outline" className="w-full flex items-center justify-center gap-2">
                  <UserCircle className="h-4 w-4" />
                  {isAdmin ? "Área Admin" : isPatient ? "Meus Relatórios" : "Perfil"}
                </Button>
                <Button onClick={handleLogout} variant="destructive" className="w-full flex items-center justify-center gap-2">
                  <LogOut className="h-4 w-4" />
                  Sair
                </Button>
              </>
            ) : (
              <Button onClick={handleAuthClick} variant="outline" className="w-full flex items-center justify-center gap-2">
                <LogIn className="h-4 w-4" />
                Login
              </Button>
            )}
            
            <a href="https://wa.me/5579999917265" target="_blank" rel="noopener noreferrer">
              <Button className="btn-secondary-hero w-full">Agende sua consulta</Button>
            </a>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
