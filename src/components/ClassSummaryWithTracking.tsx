import { useState, useEffect } from "react";
import { Plus, X, ChevronLeft, ChevronRight, FileText } from "lucide-react";
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
import {
  Class,
  Student,
  SixWeekPeriod,
  StudentWithAccommodationsTracking,
} from "@/lib/types";
import {
  getClasses,
  getStudents,
  addStudentToClass,
  removeStudentFromClass,
  getSixWeekPeriods,
  getClassStudentsWithTracking,
  toggleAccommodationServiceLog,
  formatDate,
  getDatesInRange,
} from "@/lib/database";
import { generateStudentAccommodationPDF } from "@/lib/pdfGenerator";
import { save } from "@tauri-apps/plugin-dialog";
import { exists, mkdir, writeFile } from "@tauri-apps/plugin-fs";

export function ClassSummaryWithTracking() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [students, setStudents] = useState<StudentWithAccommodationsTracking[]>(
    [],
  );
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [isAddStudentDialogOpen, setIsAddStudentDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Period and date management
  const [periods, setPeriods] = useState<SixWeekPeriod[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<SixWeekPeriod | null>(
    null,
  );
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(
    getMonday(new Date()),
  );
  const [weekDates, setWeekDates] = useState<Date[]>([]);

  useEffect(() => {
    loadClasses();
    loadAllStudents();
    loadPeriods();
    if (selectedClass?.id) {
      loadStudentsWithTracking(selectedClass.id);
    }
  }, []);

  useEffect(() => {
    // When period changes, set to first week of that period
    if (selectedPeriod) {
      const periodStart = new Date(selectedPeriod.start_date);
      setCurrentWeekStart(getMonday(periodStart));
    }
    if (selectedClass?.id) {
      loadStudentsWithTracking(selectedClass.id);
    }
  }, [selectedPeriod]);

  useEffect(() => {
    if (selectedClass?.id) {
      loadStudentsWithTracking(selectedClass.id);
    }
  }, [selectedClass, currentWeekStart]);

  useEffect(() => {
    // Generate week dates (Monday-Thurs)
    const dates: Date[] = [];
    for (let i = 0; i < 4; i++) {
      const date = new Date(currentWeekStart);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    setWeekDates(dates);
  }, [currentWeekStart]);

  function getMonday(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }

  function isWeekInPeriod(weekStart: Date): boolean {
    if (!selectedPeriod) return true;

    const periodStart = new Date(selectedPeriod.start_date);
    const periodEnd = new Date(selectedPeriod.end_date);

    // Get the Friday of this week
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 3);

    // Week is valid if it starts on or after period start and ends on or before period end
    return weekStart >= periodStart && weekEnd <= periodEnd;
  }

  function canNavigatePrev(): boolean {
    if (!selectedPeriod) return true;

    const prevWeek = new Date(currentWeekStart);
    prevWeek.setDate(prevWeek.getDate() - 7);

    return isWeekInPeriod(prevWeek);
  }

  function canNavigateNext(): boolean {
    if (!selectedPeriod) return true;

    const nextWeek = new Date(currentWeekStart);
    nextWeek.setDate(nextWeek.getDate() + 7);

    return isWeekInPeriod(nextWeek);
  }

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

  async function loadPeriods() {
    const data = await getSixWeekPeriods();
    setPeriods(data);
    if (data.length > 0 && !selectedPeriod) {
      setSelectedPeriod(data[0]);
    }
  }

  async function loadStudentsWithTracking(classId: number) {
    if (weekDates.length === 0) return;

    const startDate = formatDate(weekDates[0]);
    const endDate = formatDate(weekDates[weekDates.length - 1]);
    const data = await getClassStudentsWithTracking(
      classId,
      startDate,
      endDate,
    );
    setStudents(data);
  }

  async function handleToggleService(accommodationId: number, date: Date) {
    if (!selectedClass?.id) return;

    const dateStr = formatDate(date);
    await toggleAccommodationServiceLog(
      selectedClass.id,
      accommodationId,
      dateStr,
    );

    // Reload students with tracking
    loadStudentsWithTracking(selectedClass.id);
  }

  function navigateWeek(direction: "prev" | "next") {
    if (direction === "prev" && !canNavigatePrev()) return;
    if (direction === "next" && !canNavigateNext()) return;

    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
    setCurrentWeekStart(getMonday(newDate));
  }

  function goToCurrentWeekInPeriod() {
    if (!selectedPeriod) {
      setCurrentWeekStart(getMonday(new Date()));
      return;
    }

    const today = new Date();
    const periodStart = new Date(selectedPeriod.start_date);
    const periodEnd = new Date(selectedPeriod.end_date);

    // If today is within the period, go to current week
    if (today >= periodStart && today <= periodEnd) {
      setCurrentWeekStart(getMonday(today));
    } else {
      // Otherwise go to first week of period
      setCurrentWeekStart(getMonday(periodStart));
    }
  }

  async function handleExportPDFs() {
    if (!selectedClass || !selectedPeriod) {
      alert("Please select a class and six-week period to export.");
      return;
    }

    setIsExporting(true);

    try {
      // Get all dates in the period (weekdays only)
      const periodStart = new Date(selectedPeriod.start_date);
      const periodEnd = new Date(selectedPeriod.end_date);
      const allDates = getDatesInRange(periodStart, periodEnd);

      // Filter to only weekdays (Monday-Friday)
      const weekdayDates = allDates.filter((date) => {
        const day = date.getDay();
        return day >= 1 && day <= 5; // 1=Monday, 5=Friday
      });

      // Load students with tracking data for the entire period
      const startDate = formatDate(weekdayDates[0]);
      const endDate = formatDate(weekdayDates[weekdayDates.length - 1]);
      const studentsWithFullTracking = await getClassStudentsWithTracking(
        selectedClass.id!,
        startDate,
        endDate,
      );

      if (studentsWithFullTracking.length === 0) {
        alert("No students to export.");
        setIsExporting(false);
        return;
      }

      // Ask user to select a directory
      const dirPath = await save({
        defaultPath: `${selectedClass.name}_${selectedPeriod.name}_Reports`,
        filters: [],
        title: "Select directory to save PDFs",
      });

      if (!dirPath) {
        setIsExporting(false);
        return;
      }

      if ((await exists(dirPath)) === false) {
        mkdir(dirPath);
      }

      let successCount = 0;
      let errorCount = 0;

      // Generate a PDF for each student with all period dates
      for (const student of studentsWithFullTracking) {
        try {
          const pdfBytes = await generateStudentAccommodationPDF(
            student,
            selectedClass,
            selectedPeriod,
            weekdayDates,
          );

          // Create filename
          const fileName = `${student.last_name}_${student.first_name}_${selectedPeriod.name.replace(/\s+/g, "_")}.pdf`;
          const filePath =
            dirPath.replace(/\\/g, "/") +
            (dirPath.endsWith("/") ? "" : "/") +
            fileName;

          // Write the PDF file
          await writeFile(filePath, pdfBytes);
          successCount++;
        } catch (error) {
          console.error(
            `Error generating PDF for ${student.first_name} ${student.last_name}:`,
            error,
          );
          errorCount++;
        }
      }

      alert(
        `PDF export complete!\n\nSuccessfully exported: ${successCount}\nErrors: ${errorCount}\n\nPDFs contain all weekday dates from ${selectedPeriod.name}.`,
      );
    } catch (error) {
      console.error("Error exporting PDFs:", error);
      alert("Error exporting PDFs. Please try again.");
    } finally {
      setIsExporting(false);
    }
  }

  async function handleAddStudent(studentId: number) {
    if (!selectedClass?.id) return;

    try {
      await addStudentToClass(selectedClass.id, studentId);
      setIsAddStudentDialogOpen(false);
      loadStudentsWithTracking(selectedClass.id);
      loadAllStudents();
    } catch (error) {
      alert("Error adding student to class. They may already be enrolled.");
    }
  }

  async function handleRemoveStudent(studentId: number) {
    if (!selectedClass?.id) return;

    if (confirm("Remove this student from the class?")) {
      await removeStudentFromClass(selectedClass.id, studentId);
      loadStudentsWithTracking(selectedClass.id);
    }
  }

  const availableStudents = allStudents.filter(
    (student) => !students.some((s) => s.id === student.id),
  );

  // Get week number within the period
  function getWeekNumberInPeriod(): string {
    if (!selectedPeriod) return "";

    const periodStart = new Date(selectedPeriod.start_date);
    const periodStartMonday = getMonday(periodStart);

    const daysDiff = Math.floor(
      (currentWeekStart.getTime() - periodStartMonday.getTime()) /
        (1000 * 60 * 60 * 24),
    );
    const weekNum = Math.floor(daysDiff / 7) + 1;

    return ` (Week ${weekNum} of ${selectedPeriod.name})`;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Accommodation Service Tracking</h2>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
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
                Period {classItem.period} - {classItem.name} (
                {classItem.subject})
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="period-select">Six-Week Period</Label>
          <select
            id="period-select"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 mt-2"
            value={selectedPeriod?.id || ""}
            onChange={(e) => {
              const period = periods.find(
                (p) => p.id === Number(e.target.value),
              );
              setSelectedPeriod(period || null);
            }}
          >
            {periods.map((period) => (
              <option key={period.id} value={period.id}>
                {period.name} ({period.year}) -{" "}
                {new Date(period.start_date).toLocaleDateString()} to{" "}
                {new Date(period.end_date).toLocaleDateString()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedClass && (
        <>
          <div className="mb-4 p-4 border rounded-lg bg-card">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">
                  {selectedClass.name} - {selectedClass.subject}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Period {selectedClass.period} | {selectedClass.year} |{" "}
                  {students.length} student
                  {students.length !== 1 ? "s" : ""} enrolled
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setIsAddStudentDialogOpen(true)}
                  variant="outline"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Student
                </Button>
                <Button
                  onClick={handleExportPDFs}
                  variant="outline"
                  disabled={isExporting || !selectedPeriod}
                  title={
                    !selectedPeriod
                      ? "Please select a six-week period to export"
                      : "Export PDFs for entire period"
                  }
                >
                  <FileText className="mr-2 h-4 w-4" />
                  {isExporting ? "Exporting..." : "Export Period PDFs"}
                </Button>
              </div>
            </div>
            <div className="mt-2">
              <Button
                className="bg-blue-600"
                onClick={() => {
                  if (selectedClass === null) {
                    return;
                  } else {
                    loadStudentsWithTracking(selectedClass.id!);
                  }
                }}
              >
                Retrieve Student Data
              </Button>
            </div>
          </div>

          {/* Week Navigation */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateWeek("prev")}
                disabled={!canNavigatePrev()}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium px-4">
                Week of {weekDates[0]?.toLocaleDateString()} -{" "}
                {weekDates[weekDates.length - 1]?.toLocaleDateString()}
                {getWeekNumberInPeriod()}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateWeek("next")}
                disabled={!canNavigateNext()}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={goToCurrentWeekInPeriod}>
                {selectedPeriod ? "Current Week" : "Today"}
              </Button>
            </div>
            {selectedPeriod && (
              <div className="text-sm text-muted-foreground">
                Period:{" "}
                {new Date(selectedPeriod.start_date).toLocaleDateString()} -{" "}
                {new Date(selectedPeriod.end_date).toLocaleDateString()}
              </div>
            )}
          </div>

          {/* Per-Accommodation Tracking Table */}
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px] sticky left-0 bg-background z-10">
                    Student
                  </TableHead>
                  <TableHead className="w-[60px]">Plan</TableHead>
                  <TableHead className="w-[120px]">Category</TableHead>
                  <TableHead className="min-w-[250px]">Accommodation</TableHead>
                  {weekDates.map((date) => (
                    <TableHead
                      key={date.toISOString()}
                      className="text-center w-[80px]"
                    >
                      <div className="text-xs">
                        {date.toLocaleDateString("en-US", { weekday: "short" })}
                      </div>
                      <div className="text-xs font-normal">
                        {date.toLocaleDateString("en-US", {
                          month: "numeric",
                          day: "numeric",
                        })}
                      </div>
                    </TableHead>
                  ))}
                  <TableHead className="text-right w-[60px] sticky right-0 bg-background z-10">
                    Remove
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <>
                    {student.accommodations.map((accommodation, accIndex) => (
                      <TableRow key={`${student.id}-${accommodation.id}`}>
                        {accIndex === 0 && (
                          <>
                            <TableCell
                              rowSpan={student.accommodations.length || 1}
                              className="font-medium sticky left-0 bg-background z-10 border-r"
                            >
                              <div className="text-sm">
                                {student.last_name}, {student.first_name}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {student.student_id}
                              </div>
                            </TableCell>
                            <TableCell
                              rowSpan={student.accommodations.length || 1}
                            >
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
                          </>
                        )}
                        <TableCell className="text-sm font-medium">
                          {accommodation.category}
                        </TableCell>
                        <TableCell className="text-sm">
                          {accommodation.description}
                        </TableCell>
                        {weekDates.map((date) => (
                          <TableCell
                            key={date.toISOString()}
                            className="text-center"
                          >
                            <input
                              type="checkbox"
                              checked={
                                accommodation.serviceLogs.get(
                                  formatDate(date),
                                ) || false
                              }
                              onChange={() =>
                                handleToggleService(accommodation.id!, date)
                              }
                              className="w-5 h-5 cursor-pointer"
                            />
                          </TableCell>
                        ))}
                        {accIndex === 0 && (
                          <TableCell
                            rowSpan={student.accommodations.length || 1}
                            className="text-right sticky right-0 bg-background z-10 border-l"
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveStudent(student.id!)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                    {student.accommodations.length === 0 && (
                      <TableRow>
                        <TableCell className="font-medium sticky left-0 bg-background z-10">
                          {student.last_name}, {student.first_name}
                        </TableCell>
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
                        <TableCell
                          colSpan={3 + weekDates.length}
                          className="text-sm text-muted-foreground"
                        >
                          No accommodations defined
                        </TableCell>
                        <TableCell className="text-right sticky right-0 bg-background z-10">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveStudent(student.id!)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
                {students.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={9 + weekDates.length}
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
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
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
