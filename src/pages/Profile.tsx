import { motion } from "framer-motion";
import { Video, ArrowLeft, Crown, Sparkles, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

export default function Profile() {
  const navigate = useNavigate();
  const { isLoading, isAuthenticated, user } = useAuth();
  const upgradeToPremium = useMutation(api.users.upgradeToPremium);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isLoading, isAuthenticated, navigate]);

  const handleUpgrade = async () => {
    try {
      await upgradeToPremium({});
      toast.success("Upgraded to Premium for 1 Month! 🎉");
    } catch (error) {
      toast.error("Failed to upgrade");
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#7C3AED]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A]">
      {/* Navbar */}
      <nav className="backdrop-blur-lg bg-[#0F172A]/80 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
              <div className="w-10 h-10 bg-gradient-to-br from-[#7C3AED] to-[#F59E0B] rounded-lg flex items-center justify-center">
                <Video className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Diva Conference</span>
            </div>
            <Button
              onClick={() => navigate("/dashboard")}
              variant="ghost"
              className="text-[#E6EEF8] hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Your Profile</h1>
            <p className="text-[#E6EEF8]/70">Manage your account and preferences</p>
          </div>

          {/* Premium VISA-Style Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            whileHover={{ 
              scale: 1.02, 
              rotateY: 3,
              transition: { duration: 0.3 }
            }}
            className="relative w-full max-w-md mx-auto"
            style={{ perspective: "1000px" }}
          >
            <div
              className={`relative w-full h-52 rounded-2xl p-6 shadow-2xl overflow-hidden ${
                user?.role === "admin"
                  ? "bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#334155]"
                  : user?.isPremium
                  ? "bg-gradient-to-br from-[#7C3AED] via-[#9333EA] to-[#F59E0B]"
                  : "bg-gradient-to-br from-[#1E293B] to-[#0F172A]"
              }`}
              style={{
                transformStyle: "preserve-3d",
              }}
            >
              {/* Shimmer Effect */}
              {(user?.isPremium || user?.role === "admin") && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{
                    x: ["-100%", "200%"],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
              )}

              {/* Gold Stripe for Premium, Blue for Admin */}
              {user?.role === "admin" ? (
                <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-r from-[#3B82F6] to-[#60A5FA] opacity-30" />
              ) : user?.isPremium ? (
                <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] opacity-30" />
              ) : null}

              {/* Card Content */}
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-white/80 text-sm mb-1">
                      {user?.role === "admin" ? "Administrator" : "Member"}
                    </p>
                    <h3 className="text-white text-xl font-bold">
                      {user?.displayName || user?.name || "User"}
                    </h3>
                  </div>
                  <div className="flex gap-2">
                    {user?.role === "admin" && (
                      <Badge className="bg-gradient-to-r from-[#3B82F6] to-[#60A5FA] text-white border-0">
                        <Shield className="w-3 h-3 mr-1" />
                        ADMIN
                      </Badge>
                    )}
                    {user?.isPremium ? (
                      <motion.div
                        animate={{
                          boxShadow: [
                            "0 0 10px rgba(245, 158, 11, 0.5)",
                            "0 0 20px rgba(245, 158, 11, 0.8)",
                            "0 0 10px rgba(245, 158, 11, 0.5)",
                          ],
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="bg-[#F59E0B] text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"
                      >
                        <Crown className="w-3 h-3" />
                        PREMIUM
                      </motion.div>
                    ) : (
                      !user?.role && (
                        <div className="bg-white/10 text-white px-3 py-1 rounded-full text-xs">
                          FREE
                        </div>
                      )
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <Video className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-white/90 text-sm">Diva Conference</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="flex items-center gap-4 text-white/70 text-xs font-mono">
                      <span>•••• •••• •••• {user?._id.slice(-4)}</span>
                    </div>
                    {user?.isPremium && user?.premiumExpiresAt && (
                      <div className="text-right">
                        <p className="text-[10px] text-white/60 uppercase tracking-wider">Expires</p>
                        <p className="text-xs text-white font-medium">
                          {new Date(user.premiumExpiresAt).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Account Info */}
          <Card className="bg-[#1E293B] border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Account Information</CardTitle>
              <CardDescription className="text-[#E6EEF8]/70">
                Your account details and status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-white/10">
                <span className="text-[#E6EEF8]/70">Display Name</span>
                <span className="text-white font-medium">
                  {user?.displayName || user?.name || "Not set"}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-white/10">
                <span className="text-[#E6EEF8]/70">Email</span>
                <span className="text-white font-medium">
                  {user?.email || "Not set"}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-white/10">
                <span className="text-[#E6EEF8]/70">Account Type</span>
                <span className="text-white font-medium">
                  {user?.isGuest ? "Guest" : "Registered"}
                </span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-[#E6EEF8]/70">Membership</span>
                <div className="text-right">
                  <span className="text-white font-medium block">
                    {user?.isPremium ? "Premium" : "Free"}
                  </span>
                  {user?.isPremium && user?.premiumExpiresAt && (
                    <span className="text-xs text-[#F59E0B]">
                      Expires: {new Date(user.premiumExpiresAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upgrade Section */}
          {!user?.isPremium && (
            <Card className="bg-gradient-to-br from-[#7C3AED]/20 to-[#F59E0B]/20 border-[#7C3AED]/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#F59E0B]" />
                  Upgrade to Premium
                </CardTitle>
                <CardDescription className="text-[#E6EEF8]/70">
                  Unlock exclusive features and benefits for 1 month
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-[#E6EEF8]/90">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
                    Host rooms with up to 100 participants
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
                    Higher video quality and priority connections
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
                    Premium badge and profile card
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
                    Priority customer support
                  </li>
                </ul>
                <Button
                  onClick={handleUpgrade}
                  className="w-full bg-gradient-to-r from-[#7C3AED] to-[#F59E0B] hover:opacity-90 text-white"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade Now (1 Month)
                </Button>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
}