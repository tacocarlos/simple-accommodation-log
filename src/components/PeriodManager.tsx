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
import { SixWeekPeriod } from "@/lib/types";
import {
  getSixWeekPeriods,
  createSixWeekPeriod,
  updateSixWeekPeriod,
  deleteSixWeekPeriod,
} from "@/lib/database";

export function PeriodManager() {
  const [periods, setPeriods] = useState<SixWeekPeriod[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<SixWeekPeriod | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    start_date: "",
    end_date: "",
    year: "",
  });

  useEffect(() => {
    loadPeriods();
  }, []);

  async function loadPeriods() {
    const data = await getSixWeekPeriods();
    setPeriods(data);
  }

  function openDialog(period?: SixWeekPeriod) {
    if (period) {
      setEditingPeriod(period);
      setFormData({
        name: period.name,
        start_date: period.start_date,
        end_date: period.end_date,
        year: period.year,
      });
    } else {
      setEditingPeriod(null);
      setFormData({ name: "", start_date: "", end_date: "", year: "" });
    }
    setIsDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (editingPeriod?.id) {
      await updateSixWeekPeriod(editingPeriod.id, formData);
    } else {
      await createSixWeekPeriod(formData);
    }

    setIsDialogOpen(false);
    loadPeriods();
  }

  async function handleDelete(id: number) {
    if (confirm("Are you sure you want to delete this period?")) {
      await deleteSixWeekPeriod(id);
      loadPeriods();
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Six-Week Periods</h2>
        <Button onClick={() => openDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Add Period
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead>School Year</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {periods.map((period) => (
            <TableRow key={period.id}>
              <TableCell className="font-medium">{period.name}</TableCell>
              <TableCell>{new Date(period.start_date).toLocaleDateString()}</TableCell>
              <TableCell>{new Date(period.end_date).toLocaleDateString()}</TableCell>
              <TableCell>{period.year}</TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openDialog(period)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(period.id!)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {periods.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                No periods defined yet. Click "Add Period" to create one.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingPeriod ? "Edit Period" : "Add New Six-Week Period"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Period Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., First Six Weeks, Period 1"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) =>
                    setFormData({ ...formData, start_date: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) =>
                    setFormData({ ...formData, end_date: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="year">School Year</Label>
                <Input
                  id="year"
                  value={formData.year}
                  onChange={(e) =>
                    setFormData({ ...formData, year: e.target.value })
                  }
                  placeholder="e.g., 2024-2025"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">
                {editingPeriod ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
