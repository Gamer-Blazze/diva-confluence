import { motion } from "framer-motion";
import { Video, MessageSquare, Users, Sparkles, ArrowRight, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";

export default function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, user } = useAuth();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      navigate("/auth");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A]">
      {/* Navbar */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-[#0F172A]/80 border-b border-white/10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
              <div className="w-10 h-10 bg-gradient-to-br from-[#7C3AED] to-[#F59E0B] rounded-lg flex items-center justify-center">
                <Video className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Diva Conference</span>
            </div>
            <div className="flex items-center gap-4">
              {!isLoading && isAuthenticated && user?.role === "admin" && (
                <Badge className="bg-gradient-to-r from-[#3B82F6] to-[#60A5FA] text-white border-0 hidden sm:flex">
                  <Shield className="w-3 h-3 mr-1" />
                  Admin
                </Badge>
              )}
              {!isLoading && (
                <Button
                  onClick={handleGetStarted}
                  className="bg-gradient-to-r from-[#7C3AED] to-[#F59E0B] hover:opacity-90 text-white"
                >
                  {isAuthenticated ? "Dashboard" : "Get Started"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#7C3AED]/20 border border-[#7C3AED]/50 rounded-full mb-6"
            >
              <Sparkles className="w-4 h-4 text-[#F59E0B]" />
              <span className="text-sm text-[#E6EEF8]">Premium Video Conferencing</span>
            </motion.div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight">
              Connect, Collaborate,
              <br />
              <span className="bg-gradient-to-r from-[#7C3AED] to-[#F59E0B] bg-clip-text text-transparent">
                Conquer Together
              </span>
            </h1>

            <p className="text-xl text-[#E6EEF8]/80 mb-10 max-w-2xl mx-auto">
              Experience crystal-clear video calls and real-time chat with optional login.
              Start as a guest or create your premium account.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={handleGetStarted}
                size="lg"
                className="bg-gradient-to-r from-[#7C3AED] to-[#F59E0B] hover:opacity-90 text-white text-lg px-8 py-6"
              >
                {isAuthenticated ? "Go to Dashboard" : "Start Free"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                onClick={() => navigate("/auth")}
                size="lg"
                variant="outline"
                className="border-[#7C3AED] text-[#E6EEF8] hover:bg-[#7C3AED]/10 text-lg px-8 py-6"
              >
                Continue as Guest
              </Button>
            </div>
          </motion.div>

          {/* Mock Video Tiles */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto"
          >
            {[1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.6 + i * 0.1 }}
                className="aspect-video bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-lg border border-white/10 flex items-center justify-center"
              >
                <Users className="w-8 h-8 text-[#7C3AED]/50" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 px-4 sm:px-6 lg:px-8 bg-[#0F172A]/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Everything You Need
            </h2>
            <p className="text-[#E6EEF8]/80 text-lg">
              Powerful features for seamless collaboration
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Video,
                title: "HD Video Calls",
                description: "Crystal-clear video with WebRTC technology for reliable connections",
                color: "#7C3AED",
              },
              {
                icon: MessageSquare,
                title: "Real-time Chat",
                description: "Instant messaging with typing indicators and online status",
                color: "#F59E0B",
              },
              {
                icon: Shield,
                title: "Secure & Private",
                description: "End-to-end encryption and secure guest tokens for privacy",
                color: "#7C3AED",
              },
              {
                icon: Users,
                title: "Group Rooms",
                description: "Create rooms for teams with up to 50 participants on premium",
                color: "#F59E0B",
              },
              {
                icon: Zap,
                title: "Lightning Fast",
                description: "Low-latency connections with optimized signaling",
                color: "#7C3AED",
              },
              {
                icon: Sparkles,
                title: "Premium Features",
                description: "Upgrade for higher quality, priority support, and more",
                color: "#F59E0B",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] p-8 rounded-xl border border-white/10 hover:border-[#7C3AED]/50 transition-all duration-300"
              >
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${feature.color}20` }}
                >
                  <feature.icon className="w-6 h-6" style={{ color: feature.color }} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-[#E6EEF8]/70">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center bg-gradient-to-r from-[#7C3AED] to-[#F59E0B] p-12 rounded-2xl"
        >
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-white/90 text-lg mb-8">
            Join thousands of users already collaborating on Diva Conference
          </p>
          <Button
            onClick={handleGetStarted}
            size="lg"
            className="bg-white text-[#7C3AED] hover:bg-white/90 text-lg px-8 py-6"
          >
            {isAuthenticated ? "Go to Dashboard" : "Start Now - It's Free"}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center text-[#E6EEF8]/60">
          <p>© 2024 Diva Conference. Built with ❤️ by vly.ai</p>
        </div>
      </footer>
    </div>
  );
}