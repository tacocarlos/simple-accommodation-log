import { useState, useEffect } from "react";
import { Download, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Class, Student, ClassSummary as ClassSummaryType } from "@/lib/types";
import {
  getClasses,
  getClassSummary,
  exportToCSV,
  getStudents,
  addStudentToClass,
  removeStudentFromClass,
} from "@/lib/database";
import { writeText } from "@tauri-apps/plugin-clipboard-manager";
import { save } from "@tauri-apps/plugin-dialog";
import { writeTextFile } from "@tauri-apps/plugin-fs";

export function ClassSummary() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [summary, setSummary] = useState<ClassSummaryType | null>(null);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [isAddStudentDialogOpen, setIsAddStudentDialogOpen] = useState(false);

  useEffect(() => {
    loadClasses();
    loadAllStudents();
  }, []);

  useEffect(() => {
    if (selectedClass?.id) {
      loadSummary(selectedClass.id);
    }
  }, [selectedClass]);

  async function loadClasses() {
    const data = await getClasses();
    setClasses(data);
    if (data.length > 0 && !selectedClass) {
      setSelectedClass(data[0]);
    }
  }

  async function loadAllStudents() {
    const data = await getStudents();
    setAllStudents(data);
  }

  async function loadSummary(classId: number) {
    const data = await getClassSummary(classId);
    setSummary(data);
  }

  async function handleExportCSV() {
    if (!summary) return;

    const csv = exportToCSV(summary);
    const fileName = `${summary.name}_accommodations.csv`;

    try {
      const filePath = await save({
        defaultPath: fileName,
        filters: [
          {
            name: "CSV",
            extensions: ["csv"],
          },
        ],
      });

      if (filePath) {
        await writeTextFile(filePath, csv);
        alert("CSV file saved successfully!");
      }
    } catch (error) {
      console.error("Error saving file:", error);
      // Fallback: copy to clipboard
      try {
        await writeText(csv);
        alert("Could not save file. CSV data copied to clipboard instead!");
      } catch (clipError) {
        alert("Error exporting CSV");
      }
    }
  }

  async function handleAddStudent(studentId: number) {
    if (!selectedClass?.id) return;

    try {
      await addStudentToClass(selectedClass.id, studentId);
      setIsAddStudentDialogOpen(false);
      loadSummary(selectedClass.id);
    } catch (error) {
      alert("Error adding student to class. They may already be enrolled.");
    }
  }

  async function handleRemoveStudent(studentId: number) {
    if (!selectedClass?.id) return;

    if (confirm("Remove this student from the class?")) {
      await removeStudentFromClass(selectedClass.id, studentId);
      loadSummary(selectedClass.id);
    }
  }

  const availableStudents = allStudents.filter(
    (student) => !summary?.students.some((s) => s.id === student.id),
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Class Summary</h2>
      </div>

      <div className="mb-6">
        <Label htmlFor="class-select">Select Class</Label>
        <select
          id="class-select"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 mt-2"
          value={selectedClass?.id || ""}
          onChange={(e) => {
            const classItem = classes.find(
              (c) => c.id === Number(e.target.value),
            );
            setSelectedClass(classItem || null);
          }}
        >
          {classes.map((classItem) => (
            <option key={classItem.id} value={classItem.id}>
              Period {classItem.period} - {classItem.name} ({classItem.subject})
            </option>
          ))}
        </select>
      </div>

      {summary && (
        <>
          <div className="mb-4 p-4 border rounded-lg bg-card">
            <h3 className="text-lg font-semibold mb-2">
              {summary.name} - {summary.subject}
            </h3>
            <p className="text-sm text-muted-foreground">
              Period {summary.period} | {summary.year}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {summary.students.length} student
              {summary.students.length !== 1 ? "s" : ""} enrolled
            </p>
          </div>

          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Students & Accommodations</h3>
            <div className="flex gap-2">
              <Button onClick={() => setIsAddStudentDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Student to Class
              </Button>
              <Button onClick={handleExportCSV} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Accommodations</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summary.students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">
                      {student.last_name}, {student.first_name}
                    </TableCell>
                    <TableCell>{student.student_id}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          student.plan_type === "IEP"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {student.plan_type}
                      </span>
                    </TableCell>
                    <TableCell>
                      {student.accommodations.length > 0 ? (
                        <ul className="space-y-1">
                          {student.accommodations.map((acc) => (
                            <li key={acc.id} className="text-sm">
                              <span className="font-semibold">
                                {acc.category}:
                              </span>{" "}
                              {acc.description}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          No accommodations
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveStudent(student.id!)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {summary.students.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-muted-foreground"
                    >
                      No students enrolled in this class yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      <Dialog
        open={isAddStudentDialogOpen}
        onOpenChange={setIsAddStudentDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Student to Class</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {availableStudents.length > 0 ? (
              <div className="space-y-2">
                {availableStudents.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer"
                    onClick={() => handleAddStudent(student.id!)}
                  >
                    <div>
                      <p className="font-medium">
                        {student.last_name}, {student.first_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        ID: {student.student_id} | {student.plan_type}
                      </p>
                    </div>
                    <Plus className="h-4 w-4" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground">
                All students are already enrolled in this class.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
