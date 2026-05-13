import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home as HomeIcon,
  Search,
  Star,
  ArrowRight,
  Menu,
  X,
  ArrowUp,
  ShieldCheck,
  Handshake,
  HousePlus,
  UserRound,
} from "lucide-react";
import img4 from "../assets/img4.jpg";

const Home = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);

      const sectionIds = ["home", "features", "cta", "contact"];
      let currentSection = "home";

      sectionIds.forEach((sectionId) => {
        const section = document.getElementById(sectionId);
        if (section && section.offsetTop <= window.scrollY + 140) {
          currentSection = sectionId;
        }
      });

      setActiveSection(currentSection);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const features = [
    {
      icon: <Search size={28} />,
      title: "Smart Search",
      description:
        "Find your perfect property with advanced filters for location, price, and amenities",
    },
    {
      icon: <Star size={28} />,
      title: "Verified Listings",
      description:
        "All properties are verified by our team to ensure authenticity and safety",
    },
    {
      icon: <HomeIcon size={28} />,
      title: "Direct Connect",
      description:
        "Chat directly with property owners without any middlemen or brokers",
    },
    {
      icon: <ArrowRight size={28} />,
      title: "No Brokerage",
      description:
        "Save thousands by connecting directly with owners - zero brokerage fees",
    },
  ];

  const trustHighlights = [
    {
      icon: <ShieldCheck size={40} strokeWidth={1.8} />,
      titleHi: "\u0935\u093f\u0936\u094d\u0935\u093e\u0938",
      title: "Trust",
      note: "100% Transparent Deals",
    },
    {
      icon: <Handshake size={42} strokeWidth={1.8} />,
      titleHi: "\u0938\u0939\u092d\u093e\u0917",
      title: "Partnership",
      note: "Direct Owner Connect",
    },
    {
      icon: <HousePlus size={42} strokeWidth={1.8} />,
      titleHi: "\u0938\u0941\u0930\u0915\u094d\u0937\u093f\u0924 \u0935\u094d\u092f\u0935\u0939\u093e\u0930",
      title: "Secure Deals",
      note: "Verified & Safe Listings",
    },
    {
      icon: <UserRound size={42} strokeWidth={1.8} />,
      titleHi: "\u0928\u0947\u0939\u092e\u0940 \u0924\u0941\u092e\u091a\u094d\u092f\u093e \u0938\u094b\u092c\u0924",
      title: "Always With You",
      note: "Support at Every Step",
    },
  ];

  const navItems = [
    { id: "home", label: "Home", href: "#home" },
    { id: "features", label: "Features", href: "#features" },
    { id: "cta", label: "Get Started", href: "#cta" },
    { id: "contact", label: "Contact", href: "#contact" },
  ];

  const navLinkClass = (sectionId) =>
    `relative font-bold transition-colors ${
      activeSection === sectionId
        ? "text-[#ff7438] after:absolute after:left-1/2 after:-translate-x-1/2 after:-bottom-2 after:h-0.5 after:w-8 after:bg-[#ff7438] after:rounded-full"
        : "text-white hover:text-[#ff7438]"
    }`;

  const mobileNavLinkClass = (sectionId) =>
    `block py-2 font-semibold transition-colors ${
      activeSection === sectionId
        ? "text-[#ff7438]"
        : "text-white hover:text-[#ff7438]"
    }`;

  return (
    <div className="min-h-screen bg-white font-[Poppins] scroll-smooth">
      {/* Navigation */}
      <nav className="fixed top-3 left-1/2 -translate-x-1/2 w-[calc(100%-20px)] max-w-[1510px] bg-black/90 backdrop-blur-md z-50 border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.3)] rounded-t-[18px]">
        <div className="px-5 md:px-9 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-[#ff7438] rounded-xl flex items-center justify-center shadow-sm">
              <HomeIcon size={21} className="text-white" />
            </div>
            <span className="text-xl md:text-2xl font-black text-white font-serif">
              Caryanam <span className="text-[#ff7438]">Broker</span>
            </span>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-14 flex-grow justify-center text-[13px]">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={item.href}
                onClick={() => setActiveSection(item.id)}
                className={navLinkClass(item.id)}
              >
                {item.label}
              </a>
            ))}
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-4">
              <button
                onClick={() => navigate("/login")}
                className="px-4 py-2 text-white text-[13px] font-bold hover:text-[#ff7438] transition-colors"
              >
                Login
              </button>
              <button
                onClick={() => navigate("/login")}
                className="px-7 py-3 bg-[#ff7438] text-white text-[13px] font-bold rounded-xl hover:bg-[#f05f24] hover:shadow-lg hover:shadow-[#ff7438]/25 transition-all duration-300"
              >
                Get Started
              </button>
            </div>
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-white hover:text-[#ff7438] transition-colors"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-black/95 border-t border-white/10 overflow-hidden rounded-b-[18px]"
            >
              <div className="px-4 py-4 space-y-4">
                {navItems.map((item) => (
                  <a
                    key={item.id}
                    href={item.href}
                    onClick={() => {
                      setActiveSection(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={mobileNavLinkClass(item.id)}
                  >
                    {item.label}
                  </a>
                ))}
                <div className="pt-4 border-t border-slate-200 space-y-3">
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      navigate("/login");
                    }}
                    className="w-full px-6 py-2.5 text-white font-semibold hover:text-[#ff7438] transition-colors border border-white/20 rounded-xl"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      navigate("/login");
                    }}
                    className="w-full px-6 py-2.5 bg-[#ff7438] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-[#ff7438]/30 transition-all duration-300"
                  >
                    Get Started
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section
        id="home"
        className="relative overflow-hidden bg-[#e9ded0] px-2.5 pt-2.5 pb-10 md:pb-16"
      >
        <div className="relative mx-auto min-h-[720px] max-w-[1510px] overflow-hidden rounded-[20px] border-[6px] border-[#d8b88c] bg-[#f6eadc] shadow-[0_24px_70px_rgba(89,63,32,0.20)] md:min-h-[760px]">
          <div className="absolute inset-0">
            <img
              src={img4}
              alt="Luxury property"
              className="h-full w-full object-cover object-[70%_center] opacity-90"
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,246,235,0.98)_0%,rgba(255,246,235,0.92)_31%,rgba(255,246,235,0.54)_48%,rgba(255,246,235,0.08)_72%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_22%,rgba(255,184,103,0.38),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.34),rgba(255,239,216,0.16))]" />
            <div className="absolute -left-20 top-24 h-[560px] w-36 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(54,89,57,0.23),transparent_68%)] blur-sm" />
            <div className="absolute right-0 top-0 h-full w-[16%] bg-[linear-gradient(110deg,transparent,rgba(124,73,24,0.15))]" />
          </div>

          <div className="relative z-10 mx-auto flex min-h-[720px] max-w-[1300px] items-center px-6 pb-40 pt-28 md:min-h-[760px] md:px-10 md:pb-36 lg:px-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-[610px]"
            >
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#ffc49d] bg-white/58 px-3 py-1.5 text-[12px] font-bold text-[#ff7438] shadow-sm backdrop-blur-sm">
                <Star size={14} fill="currentColor" />
                No Brokerage Platform
              </div>
              <h1 className="mb-4 font-serif text-[42px] font-black leading-[1.08] tracking-[0] text-[#122231] sm:text-[56px] md:text-[64px] lg:text-[70px]">
                Find Your Dream{" "}
                <span className="text-[#ff7438]">Home</span>
                <br />
                Without Brokers
              </h1>
              <p className="mb-1 text-[17px] font-extrabold text-[#f06d31] md:text-[19px]">
                {"\u0924\u0941\u092e\u091a\u094d\u092f\u093e \u092a\u094d\u0930\u0924\u094d\u092f\u0947\u0915 \u092a\u094d\u0930\u0949\u092a\u0930\u094d\u091f\u0940 \u0921\u0940\u0932\u092e\u0927\u094d\u092f\u0947 \u0935\u093f\u0936\u094d\u0935\u093e\u0938\u093e\u091a\u0940 \u0938\u093e\u0925."}
              </p>
              <p className="mb-6 text-[17px] font-extrabold text-[#f06d31] md:text-[19px]">
                Your Trusted Partner In Every Property Deal.
              </p>
              <p className="mb-8 max-w-[590px] font-serif text-[16px] leading-relaxed text-[#1e2f3c] md:text-[18px]">
                Connect directly with property owners. Save thousands on brokerage fees.
                Browse verified listings across Pune and PCMC.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <button
                  onClick={() => navigate("/login")}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#ff7438] px-8 py-4 text-[14px] font-extrabold text-white shadow-[0_10px_22px_rgba(255,116,56,0.25)] hover:bg-[#f05f24] transition-all duration-300"
                >
                  Browse Properties
                  <ArrowRight size={18} />
                </button>
                <button
                  onClick={() => navigate("/login")}
                  className="rounded-xl border border-[#cbbcae] bg-white/74 px-8 py-4 text-[14px] font-extrabold text-[#172333] shadow-sm backdrop-blur-sm hover:border-[#ff7438] hover:text-[#ff7438] transition-all duration-300"
                >
                  List Your Property
                </button>
              </div>
            </motion.div>
          </div>

          <div className="absolute bottom-7 left-1/2 z-20 grid w-[calc(100%-64px)] max-w-[1280px] -translate-x-1/2 grid-cols-1 overflow-hidden rounded-2xl bg-white/82 shadow-[0_18px_38px_rgba(85,58,32,0.22)] backdrop-blur-md sm:grid-cols-2 lg:grid-cols-4">
            {trustHighlights.map((item) => (
              <div
                key={item.title}
                className="flex items-center gap-5 border-[#d7c7b5] px-8 py-7 text-[#ff7438] lg:border-r last:border-r-0 transition-transform duration-300 ease-out hover:scale-110 cursor-pointer"
              >
                <div className="shrink-0">{item.icon}</div>
                <div className="min-w-0">
                  <p className="text-[14px] font-black leading-tight text-[#27313c]">
                    {item.titleHi}
                  </p>
                  <p className="text-[15px] font-extrabold leading-tight text-[#ff7438]">
                    {item.title}
                  </p>
                  <p className="mt-2 text-[11px] font-semibold leading-tight text-[#25313d]">
                    {item.note}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 md:px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
              Why Choose Caryanam?
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              We make property hunting simple, transparent, and brokerage-free
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-slate-50 border border-slate-200 rounded-[24px] p-8 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-[#ff7f50] to-[#ff9f80] rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta" className="py-20 px-4 md:px-6 bg-gradient-to-br from-[#ff7f50] to-[#ff9f80]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
            Ready to Find Your Perfect Home?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of happy users who found their dream property without
            paying brokerage
          </p>
          <button
            onClick={() => navigate("/login")}
            className="px-10 py-5 bg-white text-[#ff7f50] font-bold text-lg rounded-2xl hover:shadow-2xl transition-all duration-300 inline-flex items-center gap-2"
          >
            Get Started Free
            <ArrowRight size={20} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-slate-900 text-white py-12 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-[#ff7f50] to-[#ff9f80] rounded-xl flex items-center justify-center">
                  <HomeIcon size={24} />
                </div>
                <span className="text-2xl font-black">Caryanam</span>
              </div>
              <p className="text-slate-400 text-sm">
                India's first no-brokerage platform connecting property owners
                directly with tenants.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li>
                  <button
                    onClick={() => navigate("/login")}
                    className="hover:text-[#ff7438] transition-colors"
                  >
                    Browse Properties
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate("/login")}
                    className="hover:text-[#ff7438] transition-colors"
                  >
                    List Your Property
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate("/login")}
                    className="hover:text-[#ff7438] transition-colors"
                  >
                    About Us
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Locations</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li>Pune</li>
                <li>PCMC</li>
                <li>Mumbai</li>
                <li>Coming Soon</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Contact</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li>support@caryanam.com</li>
                <li>+91 98765 43210</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-slate-400 text-sm">
            <p>© 2024 Caryanam. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 w-12 h-12 bg-slate-800 text-white rounded-full shadow-lg hover:shadow-xl hover:shadow-slate-800/40 flex items-center justify-center z-50 transition-all duration-300 hover:scale-110"
          >
            <ArrowUp size={20} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;
