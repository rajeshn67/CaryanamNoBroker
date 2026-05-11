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
} from "lucide-react";
import img1 from "../assets/img1.jpg";
import img2 from "../assets/img2.jpg";
import img3 from "../assets/img3.jpg";
import img4 from "../assets/img4.jpg";

const backgroundImages = [img1, img2, img3, img4];

const Home = () => {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % backgroundImages.length);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

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

  return (
    <div className="min-h-screen bg-white font-inter scroll-smooth">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-lg z-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-[#ff7f50] to-[#ff9f80] rounded-xl flex items-center justify-center">
              <HomeIcon size={24} className="text-white" />
            </div>
            <span className="text-2xl font-black text-slate-900">
              Caryanam Broker
            </span>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-12 flex-grow justify-center">
            <a
              href="#home"
              className="text-slate-700 font-semibold hover:text-[#ff7f50] transition-colors"
            >
              Home
            </a>
            <a
              href="#features"
              className="text-slate-700 font-semibold hover:text-[#ff7f50] transition-colors"
            >
              Features
            </a>
            <a
              href="#cta"
              className="text-slate-700 font-semibold hover:text-[#ff7f50] transition-colors"
            >
              Get Started
            </a>
            <a
              href="#contact"
              className="text-slate-700 font-semibold hover:text-[#ff7f50] transition-colors"
            >
              Contact
            </a>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-4">
              <button
                onClick={() => navigate("/login")}
                className="px-6 py-2.5 text-slate-700 font-semibold hover:text-slate-900 transition-colors"
              >
                Login
              </button>
              <button
                onClick={() => navigate("/login")}
                className="px-6 py-2.5 bg-gradient-to-r from-[#ff7f50] to-[#ff9f80] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-[#ff7f50]/30 transition-all duration-300"
              >
                Get Started
              </button>
            </div>
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-slate-700 hover:text-[#ff7f50] transition-colors"
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
              className="md:hidden bg-white border-b border-slate-100 overflow-hidden"
            >
              <div className="px-4 py-4 space-y-4">
                <a
                  href="#home"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-slate-700 font-semibold hover:text-[#ff7f50] transition-colors py-2"
                >
                  Home
                </a>
                <a
                  href="#features"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-slate-700 font-semibold hover:text-[#ff7f50] transition-colors py-2"
                >
                  Features
                </a>
                <a
                  href="#cta"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-slate-700 font-semibold hover:text-[#ff7f50] transition-colors py-2"
                >
                  Get Started
                </a>
                <a
                  href="#contact"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-slate-700 font-semibold hover:text-[#ff7f50] transition-colors py-2"
                >
                  Contact
                </a>
                <div className="pt-4 border-t border-slate-200 space-y-3">
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      navigate("/login");
                    }}
                    className="w-full px-6 py-2.5 text-slate-700 font-semibold hover:text-slate-900 transition-colors border border-slate-200 rounded-xl"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      navigate("/login");
                    }}
                    className="w-full px-6 py-2.5 bg-gradient-to-r from-[#ff7f50] to-[#ff9f80] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-[#ff7f50]/30 transition-all duration-300"
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
      <section id="home" className="pt-32 pb-60 px-4 md:px-6 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#1c1c1c] via-[#2a2a2a] to-[#3a2b2b] z-0" />
        
        {/* Animated Background Lines */}
        {Array.from({ length: 4 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-[2px] bg-[#ff7f50]/20 rounded-full z-0"
            initial={{
              width: `${180 + i * 90}px`,
              x: i % 2 === 0 ? -300 : 1600,
              y: Math.random() * 800,
              rotate: Math.random() * 360,
              opacity: 0,
            }}
            animate={{
              x: i % 2 === 0 ? 1600 : -300,
              y: Math.random() * 800,
              rotate: Math.random() * 360,
              opacity: [0, 0.4, 0],
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Background Image Slideshow */}
        <div className="absolute inset-0 z-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentImageIndex}
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-100%", opacity: 0 }}
              transition={{ duration: 1, ease: "easeInOut" }}
              className="absolute inset-0 w-full h-full"
            >
              <img
                src={backgroundImages[currentImageIndex]}
                alt="Background"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40" />
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col items-center justify-center text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 bg-[#ff7f50]/20 backdrop-blur-sm text-[#ff7f50] px-4 py-2 rounded-full text-sm font-semibold mb-6">
                <Star size={16} fill="currentColor" />
                No Brokerage Platform
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-white leading-tight mb-4">
                Find Your Dream
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff7f50] to-[#ff9f80]">
                  {" "}
                  Home
                </span>
                <br />
                Without Brokers
              </h1>
              <p className="text-2xl text-[#ff7f50] font-semibold mb-2">
                Save money, live better - zero brokerage guaranteed
              </p>
              <p className="text-xl text-[#ff7f50] font-semibold mb-6">
                (पैसे वाचवा, उत्तम जगा - शून्य ब्रोकरेजची हमी)
              </p>
              <p className="text-xl text-white/90 mb-8 leading-relaxed">
                Connect directly with property owners. Save thousands on brokerage
                fees. Browse verified listings across Pune and PCMC.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate("/login")}
                  className="px-8 py-4 bg-gradient-to-r from-[#ff7f50] to-[#ff9f80] text-white font-bold text-lg rounded-2xl hover:shadow-xl hover:shadow-[#ff7f50]/30 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  Browse Properties
                  <ArrowRight size={20} />
                </button>
                <button
                  onClick={() => navigate("/login")}
                  className="px-8 py-4 bg-white text-slate-900 font-bold text-lg rounded-2xl border-2 border-slate-200 hover:border-slate-300 transition-all duration-300"
                >
                  List Your Property
                </button>
              </div>

            </motion.div>
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
                    className="hover:text-white transition-colors"
                  >
                    Browse Properties
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate("/login")}
                    className="hover:text-white transition-colors"
                  >
                    List Your Property
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate("/login")}
                    className="hover:text-white transition-colors"
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
