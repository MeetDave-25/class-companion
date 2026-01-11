import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { GraduationCap, LogIn, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authAPI } from "@/lib/api";
import { toast } from "sonner";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            toast.error("Please enter both email and password");
            return;
        }

        setLoading(true);
        try {
            const response = await authAPI.login(email, password);
            const user = response.data.user;

            toast.success(`Welcome back, ${user.email}!`);

            // Redirect based on role
            if (user.role === 'teacher') {
                navigate('/');
            } else if (user.role === 'student') {
                navigate('/student');
            }
        } catch (error: any) {
            toast.error(error.message || "Invalid email or password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                {/* Logo and Title */}
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", damping: 10 }}
                        className="w-20 h-20 mx-auto mb-4 rounded-2xl gradient-primary flex items-center justify-center"
                    >
                        <GraduationCap className="w-10 h-10 text-primary-foreground" />
                    </motion.div>
                    <h1 className="text-3xl font-bold mb-2">AttendEasy</h1>
                    <p className="text-muted-foreground">Smart College Attendance Management</p>
                </div>

                {/* Login Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="bg-card rounded-2xl shadow-card p-8"
                >
                    <h2 className="text-2xl font-bold mb-6">Sign In</h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="your@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loading}
                                autoComplete="email"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading}
                                autoComplete="current-password"
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full gradient-primary border-0"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    <LogIn className="w-4 h-4 mr-2" />
                                    Sign In
                                </>
                            )}
                        </Button>
                    </form>

                    {/* Demo Credentials */}
                    <div className="mt-6 p-4 rounded-lg bg-secondary/50 border border-border">
                        <p className="text-sm font-medium mb-2">Demo Credentials:</p>
                        <div className="text-xs space-y-1 text-muted-foreground">
                            <p><strong>Teacher:</strong> teacher@attend.com / password123</p>
                            <p><strong>Student:</strong> stu@gmail.com / password123</p>
                        </div>
                    </div>
                </motion.div>

                {/* Footer */}
                <p className="text-center text-sm text-muted-foreground mt-6">
                    © 2026 AttendEasy. All rights reserved.
                </p>
            </motion.div>
        </div>
    );
};

export default Login;
