import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Users, Clock, MapPin, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatDistance } from "@/lib/geolocation";
import { AttendanceSession } from "@/types";

interface SessionListProps {
    sessions: AttendanceSession[];
    onSessionClick: (session: AttendanceSession) => void;
}

const SessionList = ({ sessions, onSessionClick }: SessionListProps) => {
    // Group sessions by subject
    const sessionsBySubject = sessions.reduce((acc, session) => {
        if (!acc[session.subjectId]) {
            acc[session.subjectId] = {
                subjectName: session.subjectName,
                subjectCode: session.subjectCode,
                sessions: [],
            };
        }
        acc[session.subjectId].sessions.push(session);
        return acc;
    }, {} as Record<string, { subjectName: string; subjectCode: string; sessions: AttendanceSession[] }>);

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    const formatTime = (date: Date) => {
        return new Date(date).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Attendance Sessions</h2>
                    <p className="text-muted-foreground">View attendance history by subject</p>
                </div>
            </div>

            {Object.entries(sessionsBySubject).map(([subjectId, { subjectName, subjectCode, sessions: subjectSessions }]) => (
                <motion.div
                    key={subjectId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card rounded-2xl shadow-card overflow-hidden"
                >
                    {/* Subject Header */}
                    <div className="p-6 border-b border-border gradient-primary">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                                <Calendar className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">{subjectName}</h3>
                                <p className="text-sm text-white/80">{subjectCode}</p>
                            </div>
                            <div className="ml-auto text-right">
                                <p className="text-2xl font-bold text-white">{subjectSessions.length}</p>
                                <p className="text-sm text-white/80">Sessions</p>
                            </div>
                        </div>
                    </div>

                    {/* Sessions List */}
                    <div className="divide-y divide-border">
                        {subjectSessions
                            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                            .slice(0, 5)
                            .map((session) => (
                                <button
                                    key={session.id}
                                    onClick={() => onSessionClick(session)}
                                    className="w-full p-4 hover:bg-secondary/50 transition-colors text-left"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Clock className="w-4 h-4 text-muted-foreground" />
                                                <span className="font-medium">{formatDate(session.date)}</span>
                                                <span className="text-muted-foreground">•</span>
                                                <span className="text-sm text-muted-foreground">
                                                    {formatTime(session.startTime)}
                                                    {session.endTime && ` - ${formatTime(session.endTime)}`}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <Users className="w-4 h-4" />
                                                    <span>{session.studentsPresent.length} students present</span>
                                                </div>
                                                {session.location && (
                                                    <div className="flex items-center gap-1">
                                                        <MapPin className="w-4 h-4" />
                                                        <span>Geofencing: {session.location.radius}m</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                                    </div>
                                </button>
                            ))}
                    </div>

                    {subjectSessions.length > 5 && (
                        <div className="p-4 text-center border-t border-border">
                            <Button variant="ghost" size="sm">
                                View all {subjectSessions.length} sessions
                            </Button>
                        </div>
                    )}
                </motion.div>
            ))}

            {sessions.length === 0 && (
                <div className="text-center py-12">
                    <Calendar className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No sessions yet</h3>
                    <p className="text-muted-foreground">
                        Start a QR attendance session to see it here
                    </p>
                </div>
            )}
        </div>
    );
};

export default SessionList;
