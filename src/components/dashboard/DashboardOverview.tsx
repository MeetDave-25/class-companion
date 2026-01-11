import { motion } from "framer-motion";
import { 
  Users, 
  BookOpen, 
  QrCode, 
  Calendar, 
  TrendingUp, 
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import StatsCard from "./StatsCard";
import { Student, Subject, TestMark } from "@/types";

interface DashboardOverviewProps {
  students: Student[];
  subjects: Subject[];
  marks: TestMark[];
  attendanceData: Record<string, Record<string, boolean>>;
}

const DashboardOverview = ({
  students,
  subjects,
  marks,
  attendanceData,
}: DashboardOverviewProps) => {
  // Calculate stats
  const totalAttendance = Object.values(attendanceData).reduce(
    (acc, record) => acc + Object.values(record).filter(Boolean).length,
    0
  );
  const totalPossibleAttendance = students.length * subjects.length;
  const attendanceRate = totalPossibleAttendance
    ? Math.round((totalAttendance / totalPossibleAttendance) * 100)
    : 0;

  const averageMarks = marks.length
    ? Math.round(
        marks.reduce((acc, m) => acc + (m.obtainedMarks / m.maxMarks) * 100, 0) /
          marks.length
      )
    : 0;

  const recentActivities = [
    {
      id: 1,
      type: "attendance",
      message: "QR attendance session completed",
      subject: "Data Structures",
      time: "2 hours ago",
      icon: QrCode,
      color: "text-primary",
    },
    {
      id: 2,
      type: "marks",
      message: "Test marks updated",
      subject: "Algorithms",
      time: "5 hours ago",
      icon: CheckCircle2,
      color: "text-success",
    },
    {
      id: 3,
      type: "alert",
      message: "Low attendance warning",
      subject: "5 students below 75%",
      time: "1 day ago",
      icon: AlertCircle,
      color: "text-warning",
    },
    {
      id: 4,
      type: "timetable",
      message: "Timetable generated",
      subject: "Year 2, Semester 1",
      time: "2 days ago",
      icon: Calendar,
      color: "text-accent",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="gradient-hero p-8 rounded-2xl text-primary-foreground"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back, Professor!</h1>
            <p className="opacity-90">
              Manage your classes, track attendance, and monitor student performance all in one place.
            </p>
          </div>
          <div className="flex items-center gap-3 text-sm opacity-80">
            <Clock className="w-4 h-4" />
            <span>Last updated: Just now</span>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Students"
          value={students.length}
          subtitle="Across all years"
          icon={Users}
          variant="primary"
        />
        <StatsCard
          title="Active Subjects"
          value={subjects.length}
          subtitle="This semester"
          icon={BookOpen}
          variant="accent"
        />
        <StatsCard
          title="Attendance Rate"
          value={`${attendanceRate}%`}
          subtitle="Overall average"
          icon={QrCode}
          trend={{ value: 5, isPositive: true }}
        />
        <StatsCard
          title="Average Score"
          value={`${averageMarks}%`}
          subtitle="All tests combined"
          icon={TrendingUp}
          trend={{ value: 3, isPositive: true }}
        />
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card p-6 rounded-2xl shadow-card"
        >
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Recent Activity
          </h3>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => {
              const Icon = activity.icon;
              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex items-start gap-4 p-3 rounded-xl hover:bg-secondary/50 transition-colors"
                >
                  <div className={`p-2 rounded-lg bg-secondary ${activity.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{activity.message}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {activity.subject}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {activity.time}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Quick Stats by Year */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card p-6 rounded-2xl shadow-card"
        >
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Students by Year
          </h3>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((year) => {
              const yearStudents = students.filter((s) => s.year === year);
              const percentage =
                students.length > 0
                  ? Math.round((yearStudents.length / students.length) * 100)
                  : 0;

              return (
                <div key={year} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Year {year}</span>
                    <span className="text-sm text-muted-foreground">
                      {yearStudents.length} students
                    </span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.8, delay: 0.4 + year * 0.1 }}
                      className="h-full gradient-primary rounded-full"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Low Attendance Alert */}
      {students.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-warning/10 border border-warning/20 p-6 rounded-2xl"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-warning/20">
              <AlertCircle className="w-6 h-6 text-warning" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-warning mb-1">
                Attendance Monitoring Active
              </h3>
              <p className="text-sm text-muted-foreground">
                Students with attendance below 75% will be automatically flagged.
                Currently monitoring {students.length} students across {subjects.length} subjects.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default DashboardOverview;
