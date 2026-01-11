import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, BookOpen, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Subject } from "@/types";
import { cn } from "@/lib/utils";

interface SubjectManagerProps {
  subjects: Subject[];
  onAddSubject: (subject: Omit<Subject, "id">) => void;
  onUpdateSubject: (id: string, subject: Partial<Subject>) => void;
  onDeleteSubject: (id: string) => void;
}

const SubjectManager = ({
  subjects,
  onAddSubject,
  onUpdateSubject,
  onDeleteSubject,
}: SubjectManagerProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newSubject, setNewSubject] = useState({
    name: "",
    code: "",
    year: 1,
    semester: 1,
  });

  const handleSubmit = () => {
    if (!newSubject.name || !newSubject.code) return;

    if (editingId) {
      onUpdateSubject(editingId, newSubject);
      setEditingId(null);
    } else {
      onAddSubject(newSubject);
    }

    setNewSubject({ name: "", code: "", year: 1, semester: 1 });
    setIsDialogOpen(false);
  };

  const handleEdit = (subject: Subject) => {
    setEditingId(subject.id);
    setNewSubject({
      name: subject.name,
      code: subject.code,
      year: subject.year,
      semester: subject.semester,
    });
    setIsDialogOpen(true);
  };

  const subjectsByYear = subjects.reduce((acc, subject) => {
    if (!acc[subject.year]) acc[subject.year] = [];
    acc[subject.year].push(subject);
    return acc;
  }, {} as Record<number, Subject[]>);

  const getSubjectColor = (index: number) => {
    const colors = [
      "border-l-primary",
      "border-l-accent",
      "border-l-success",
      "border-l-warning",
      "border-l-destructive",
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card p-6 rounded-2xl shadow-card"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl gradient-primary">
              <BookOpen className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Subject Management</h2>
              <p className="text-sm text-muted-foreground">
                Add and manage subjects for each year
              </p>
            </div>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="gradient-primary border-0"
                onClick={() => {
                  setEditingId(null);
                  setNewSubject({ name: "", code: "", year: 1, semester: 1 });
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Subject
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "Edit Subject" : "Add New Subject"}
                </DialogTitle>
                <DialogDescription>
                  {editingId
                    ? "Update the subject details"
                    : "Enter the details for the new subject"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Subject Name</Label>
                  <Input
                    placeholder="e.g., Data Structures"
                    value={newSubject.name}
                    onChange={(e) =>
                      setNewSubject({ ...newSubject, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Subject Code</Label>
                  <Input
                    placeholder="e.g., CS201"
                    value={newSubject.code}
                    onChange={(e) =>
                      setNewSubject({ ...newSubject, code: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Year</Label>
                    <Select
                      value={newSubject.year.toString()}
                      onValueChange={(value) =>
                        setNewSubject({ ...newSubject, year: Number(value) })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Year 1</SelectItem>
                        <SelectItem value="2">Year 2</SelectItem>
                        <SelectItem value="3">Year 3</SelectItem>
                        <SelectItem value="4">Year 4</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Semester</Label>
                    <Select
                      value={newSubject.semester.toString()}
                      onValueChange={(value) =>
                        setNewSubject({ ...newSubject, semester: Number(value) })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Semester 1</SelectItem>
                        <SelectItem value="2">Semester 2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSubmit} className="gradient-primary border-0">
                  <Save className="w-4 h-4 mr-2" />
                  {editingId ? "Update" : "Add"} Subject
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {/* Subjects by Year */}
      <div className="grid gap-6 md:grid-cols-2">
        {[1, 2, 3, 4].map((year) => (
          <motion.div
            key={year}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: year * 0.1 }}
            className="bg-card rounded-2xl shadow-card overflow-hidden"
          >
            <div className="p-4 border-b border-border bg-secondary/50">
              <h3 className="font-semibold">Year {year}</h3>
              <p className="text-sm text-muted-foreground">
                {subjectsByYear[year]?.length || 0} subjects
              </p>
            </div>

            <div className="p-4 space-y-3">
              {subjectsByYear[year]?.map((subject, index) => (
                <motion.div
                  key={subject.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "p-4 rounded-xl bg-secondary/50 border-l-4 flex items-center justify-between",
                    getSubjectColor(index)
                  )}
                >
                  <div>
                    <p className="font-medium">{subject.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {subject.code} • Semester {subject.semester}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(subject)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDeleteSubject(subject.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              )) || (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="w-8 h-8 mx-auto opacity-50 mb-2" />
                  <p className="text-sm">No subjects added</p>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default SubjectManager;
