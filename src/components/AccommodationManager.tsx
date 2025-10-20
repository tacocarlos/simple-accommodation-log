import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Student, Accommodation } from "@/lib/types";
import {
  getStudents,
  getAccommodations,
  createAccommodation,
  updateAccommodation,
  deleteAccommodation,
} from "@/lib/database";

export function AccommodationManager() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAccommodation, setEditingAccommodation] = useState<Accommodation | null>(null);
  const [formData, setFormData] = useState({
    description: "",
    category: "",
  });

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    if (selectedStudent?.id) {
      loadAccommodations(selectedStudent.id);
    }
  }, [selectedStudent]);

  async function loadStudents() {
    const data = await getStudents();
    setStudents(data);
    if (data.length > 0 && !selectedStudent) {
      setSelectedStudent(data[0]);
    }
  }

  async function loadAccommodations(studentId: number) {
    const data = await getAccommodations(studentId);
    setAccommodations(data);
  }

  function openDialog(accommodation?: Accommodation) {
    if (accommodation) {
      setEditingAccommodation(accommodation);
      setFormData({
        description: accommodation.description,
        category: accommodation.category,
      });
    } else {
      setEditingAccommodation(null);
      setFormData({ description: "", category: "" });
    }
    setIsDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!selectedStudent?.id) return;

    if (editingAccommodation?.id) {
      await updateAccommodation(editingAccommodation.id, {
        ...formData,
        student_id: selectedStudent.id,
      });
    } else {
      await createAccommodation({
        ...formData,
        student_id: selectedStudent.id,
      });
    }

    setIsDialogOpen(false);
    loadAccommodations(selectedStudent.id);
  }

  async function handleDelete(id: number) {
    if (confirm("Are you sure you want to delete this accommodation?")) {
      await deleteAccommodation(id);
      if (selectedStudent?.id) {
        loadAccommodations(selectedStudent.id);
      }
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Accommodations</h2>
      </div>

      <div className="mb-6">
        <Label htmlFor="student-select">Select Student</Label>
        <select
          id="student-select"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 mt-2"
          value={selectedStudent?.id || ""}
          onChange={(e) => {
            const student = students.find((s) => s.id === Number(e.target.value));
            setSelectedStudent(student || null);
          }}
        >
          {students.map((student) => (
            <option key={student.id} value={student.id}>
              {student.last_name}, {student.first_name} ({student.student_id}) - {student.plan_type}
            </option>
          ))}
        </select>
      </div>

      {selectedStudent && (
        <>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              Accommodations for {selectedStudent.first_name} {selectedStudent.last_name}
            </h3>
            <Button onClick={() => openDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Accommodation
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accommodations.map((accommodation) => (
                <TableRow key={accommodation.id}>
                  <TableCell className="font-medium">{accommodation.category}</TableCell>
                  <TableCell>{accommodation.description}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openDialog(accommodation)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(accommodation.id!)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {accommodations.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    No accommodations yet. Click "Add Accommodation" to create one.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingAccommodation ? "Edit Accommodation" : "Add New Accommodation"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  placeholder="e.g., Testing, Classroom, Assignment"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Describe the accommodation in detail..."
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">
                {editingAccommodation ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
