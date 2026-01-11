import { useState } from "react";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    Calendar,
    Clock,
    MapPin,
    Users,
    Search,
    Download,
    CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { AttendanceSession, SessionAttendance } from "@/types";

interface SessionDetailsProps {
    session: AttendanceSession;
    onBack: () => void;
}

const SessionDetails = ({ session, onBack }: SessionDetailsProps) => {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredStudents = (session.studentsPresent || []).filter((student) =>
        student.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.rollNumber.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
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

    const duration = session.endTime
        ? Math.round((new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 60000)
        : null;

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
        >
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={onBack}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div className="flex-1">
                    <h2 className="text-2xl font-bold">{session.subjectName}</h2>
                    <p className="text-muted-foreground">{session.subjectCode}</p>
                </div>
                <Button variant="outline" className="gap-2">
                    <Download className="w-4 h-4" />
                    Export
                </Button>
            </div>

            {/* Session Info Card */}
            <div className="bg-card rounded-2xl shadow-card p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Date</p>
                            <p className="font-semibold">{formatDate(session.date)}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl gradient-accent flex items-center justify-center">
                            <Clock className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Time</p>
                            <p className="font-semibold">
                                {formatTime(session.startTime)}
                                {session.endTime && ` - ${formatTime(session.endTime)}`}
                            </p>
                            {duration && (
                                <p className="text-xs text-muted-foreground">{duration} minutes</p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center">
                            <Users className="w-6 h-6 text-success" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Students Present</p>
                            <p className="font-semibold text-2xl text-success">
                                {session.studentsPresent?.length || 0}
                            </p>
                        </div>
                    </div>

                    {session.location && (
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                                <MapPin className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Geofencing</p>
                                <p className="font-semibold">{session.location.radius}m radius</p>
                                <p className="text-xs text-muted-foreground">Location verified</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Students List */}
            <div className="bg-card rounded-2xl shadow-card overflow-hidden">
                <div className="p-6 border-b border-border">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold">Students Present</h3>
                            <p className="text-sm text-muted-foreground">
                                {filteredStudents.length} student{filteredStudents.length !== 1 ? "s" : ""} marked attendance
                            </p>
                        </div>
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search students..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-16">#</TableHead>
                                <TableHead>Student Name</TableHead>
                                <TableHead>Roll Number</TableHead>
                                <TableHead className="text-center">Year</TableHead>
                                <TableHead>Marked At</TableHead>
                                <TableHead className="text-center">Location</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredStudents.map((student, index) => (
                                <TableRow key={student.studentId}>
                                    <TableCell className="font-medium text-muted-foreground">
                                        {index + 1}
                                    </TableCell>
                                    <TableCell className="font-medium">{student.studentName}</TableCell>
                                    <TableCell className="text-muted-foreground">{student.rollNumber}</TableCell>
                                    <TableCell className="text-center">{student.year}</TableCell>
                                    <TableCell>{formatTime(student.markedAt)}</TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <CheckCircle2 className="w-4 h-4 text-success" />
                                            <span className="text-xs text-muted-foreground">
                                                ±{Math.round(student.location.accuracy)}m
                                            </span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {filteredStudents.length === 0 && (
                    <div className="p-12 text-center">
                        <p className="text-muted-foreground">
                            {searchQuery ? "No students found matching your search" : "No students marked attendance yet"}
                        </p>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default SessionDetails;
