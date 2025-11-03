import Database from "@tauri-apps/plugin-sql";
import {
  Class,
  Student,
  Accommodation,
  StudentWithAccommodations,
  ClassSummary,
  SixWeekPeriod,
  AccommodationServiceLog,
  AccommodationWithTracking,
  StudentWithAccommodationsTracking,
} from "./types";

let db: Database | null = null;

export async function getDatabase() {
  if (!db) {
    db = await Database.load("sqlite:accommodations.db");
  }
  return db;
}

// Classes
export async function createClass(
  classData: Omit<Class, "id">,
): Promise<number> {
  const db = await getDatabase();
  const result = await db.execute(
    "INSERT INTO classes (name, subject, period, year) VALUES ($1, $2, $3, $4)",
    [classData.name, classData.subject, classData.period, classData.year],
  );
  return result.lastInsertId!;
}

export async function getClasses(): Promise<Class[]> {
  const db = await getDatabase();
  return await db.select<Class[]>(
    "SELECT * FROM classes ORDER BY period, name",
  );
}

export async function getClass(id: number): Promise<Class | null> {
  const db = await getDatabase();
  const results = await db.select<Class[]>(
    "SELECT * FROM classes WHERE id = $1",
    [id],
  );
  return results.length > 0 ? results[0] : null;
}

export async function updateClass(
  id: number,
  classData: Omit<Class, "id">,
): Promise<void> {
  const db = await getDatabase();
  await db.execute(
    "UPDATE classes SET name = $1, subject = $2, period = $3, year = $4 WHERE id = $5",
    [classData.name, classData.subject, classData.period, classData.year, id],
  );
}

export async function deleteClass(id: number): Promise<void> {
  const db = await getDatabase();
  await db.execute("DELETE FROM classes WHERE id = $1", [id]);
}

// Students
export async function createStudent(
  student: Omit<Student, "id">,
): Promise<number> {
  const db = await getDatabase();
  const result = await db.execute(
    "INSERT INTO students (first_name, last_name, student_id, plan_type) VALUES ($1, $2, $3, $4)",
    [
      student.first_name,
      student.last_name,
      student.student_id,
      student.plan_type,
    ],
  );
  return result.lastInsertId!;
}

export async function getStudents(): Promise<Student[]> {
  const db = await getDatabase();
  return await db.select<Student[]>(
    "SELECT * FROM students ORDER BY last_name, first_name",
  );
}

export async function getStudent(id: number): Promise<Student | null> {
  const db = await getDatabase();
  const results = await db.select<Student[]>(
    "SELECT * FROM students WHERE id = $1",
    [id],
  );
  return results.length > 0 ? results[0] : null;
}

export async function updateStudent(
  id: number,
  student: Omit<Student, "id">,
): Promise<void> {
  const db = await getDatabase();
  await db.execute(
    "UPDATE students SET first_name = $1, last_name = $2, student_id = $3, plan_type = $4 WHERE id = $5",
    [
      student.first_name,
      student.last_name,
      student.student_id,
      student.plan_type,
      id,
    ],
  );
}

export async function deleteStudent(id: number): Promise<void> {
  const db = await getDatabase();
  await db.execute("DELETE FROM students WHERE id = $1", [id]);
}

// Accommodations
export async function createAccommodation(
  accommodation: Omit<Accommodation, "id">,
): Promise<number> {
  const db = await getDatabase();
  const result = await db.execute(
    "INSERT INTO accommodations (student_id, description, category) VALUES ($1, $2, $3)",
    [
      accommodation.student_id,
      accommodation.description,
      accommodation.category,
    ],
  );
  return result.lastInsertId!;
}

export async function getAccommodations(
  studentId: number,
): Promise<Accommodation[]> {
  const db = await getDatabase();
  return await db.select<Accommodation[]>(
    "SELECT * FROM accommodations WHERE student_id = $1 ORDER BY category, description",
    [studentId],
  );
}

export async function updateAccommodation(
  id: number,
  accommodation: Omit<Accommodation, "id">,
): Promise<void> {
  const db = await getDatabase();
  await db.execute(
    "UPDATE accommodations SET student_id = $1, description = $2, category = $3 WHERE id = $4",
    [
      accommodation.student_id,
      accommodation.description,
      accommodation.category,
      id,
    ],
  );
}

export async function deleteAccommodation(id: number): Promise<void> {
  const db = await getDatabase();
  await db.execute("DELETE FROM accommodations WHERE id = $1", [id]);
}

// Class Students
export async function addStudentToClass(
  classId: number,
  studentId: number,
): Promise<number> {
  const db = await getDatabase();
  const result = await db.execute(
    "INSERT INTO class_students (class_id, student_id) VALUES ($1, $2)",
    [classId, studentId],
  );
  return result.lastInsertId!;
}

export async function removeStudentFromClass(
  classId: number,
  studentId: number,
): Promise<void> {
  const db = await getDatabase();
  await db.execute(
    "DELETE FROM class_students WHERE class_id = $1 AND student_id = $2",
    [classId, studentId],
  );
}

export async function getClassStudents(classId: number): Promise<Student[]> {
  const db = await getDatabase();
  return await db.select<Student[]>(
    `SELECT s.* FROM students s
     INNER JOIN class_students cs ON s.id = cs.student_id
     WHERE cs.class_id = $1
     ORDER BY s.last_name, s.first_name`,
    [classId],
  );
}

export async function getStudentWithAccommodations(
  studentId: number,
): Promise<StudentWithAccommodations | null> {
  const student = await getStudent(studentId);
  if (!student) return null;

  const accommodations = await getAccommodations(studentId);
  return {
    ...student,
    accommodations,
  };
}

export async function getClassSummary(
  classId: number,
): Promise<ClassSummary | null> {
  const classData = await getClass(classId);
  if (!classData) return null;

  const students = await getClassStudents(classId);
  const studentsWithAccommodations = await Promise.all(
    students.map(async (student) => {
      const accommodations = await getAccommodations(student.id!);
      return {
        ...student,
        accommodations,
      };
    }),
  );

  return {
    ...classData,
    students: studentsWithAccommodations,
  };
}

// Six Week Periods
export async function createSixWeekPeriod(
  period: Omit<SixWeekPeriod, "id">,
): Promise<number> {
  const db = await getDatabase();
  const result = await db.execute(
    "INSERT INTO six_week_periods (name, start_date, end_date, year) VALUES ($1, $2, $3, $4)",
    [period.name, period.start_date, period.end_date, period.year],
  );
  return result.lastInsertId!;
}

export async function getSixWeekPeriods(
  year?: string,
): Promise<SixWeekPeriod[]> {
  const db = await getDatabase();
  if (year) {
    return await db.select<SixWeekPeriod[]>(
      "SELECT * FROM six_week_periods WHERE year = $1 ORDER BY start_date",
      [year],
    );
  }
  return await db.select<SixWeekPeriod[]>(
    "SELECT * FROM six_week_periods ORDER BY start_date DESC",
  );
}

export async function updateSixWeekPeriod(
  id: number,
  period: Omit<SixWeekPeriod, "id">,
): Promise<void> {
  const db = await getDatabase();
  await db.execute(
    "UPDATE six_week_periods SET name = $1, start_date = $2, end_date = $3, year = $4 WHERE id = $5",
    [period.name, period.start_date, period.end_date, period.year, id],
  );
}

export async function deleteSixWeekPeriod(id: number): Promise<void> {
  const db = await getDatabase();
  await db.execute("DELETE FROM six_week_periods WHERE id = $1", [id]);
}

// Accommodation Service Logs (per-accommodation tracking)
export async function toggleAccommodationServiceLog(
  classId: number,
  accommodationId: number,
  date: string,
): Promise<void> {
  const db = await getDatabase();

  // Check if log exists
  const existing = await db.select<AccommodationServiceLog[]>(
    "SELECT * FROM accommodation_service_logs WHERE class_id = $1 AND accommodation_id = $2 AND service_date = $3",
    [classId, accommodationId, date],
  );

  if (existing.length > 0) {
    // Toggle the value
    await db.execute(
      "UPDATE accommodation_service_logs SET provided = NOT provided WHERE class_id = $1 AND accommodation_id = $2 AND service_date = $3",
      [classId, accommodationId, date],
    );
  } else {
    // Create new log with provided = true
    await db.execute(
      "INSERT INTO accommodation_service_logs (class_id, accommodation_id, service_date, provided) VALUES ($1, $2, $3, 1)",
      [classId, accommodationId, date],
    );
  }
}

export async function getAccommodationServiceLogs(
  classId: number,
  startDate: string,
  endDate: string,
): Promise<AccommodationServiceLog[]> {
  const db = await getDatabase();
  const logs = await db.select<
    Array<{
      id: number;
      class_id: number;
      accommodation_id: number;
      service_date: string;
      provided: number;
    }>
  >(
    "SELECT * FROM accommodation_service_logs WHERE class_id = $1 AND service_date >= $2 AND service_date <= $3",
    [classId, startDate, endDate],
  );

  // Convert SQLite integer to boolean
  return logs.map((log) => ({
    ...log,
    provided: log.provided === 1,
  }));
}

export async function getAccommodationServiceLogsForAccommodation(
  classId: number,
  accommodationId: number,
  startDate: string,
  endDate: string,
): Promise<AccommodationServiceLog[]> {
  const db = await getDatabase();
  const logs = await db.select<
    Array<{
      id: number;
      class_id: number;
      accommodation_id: number;
      service_date: string;
      provided: number;
    }>
  >(
    "SELECT * FROM accommodation_service_logs WHERE class_id = $1 AND accommodation_id = $2 AND service_date >= $3 AND service_date <= $4",
    [classId, accommodationId, startDate, endDate],
  );

  // Convert SQLite integer to boolean
  return logs.map((log) => ({
    ...log,
    provided: log.provided === 1,
  }));
}

// Get students with accommodations and tracking data
export async function getClassStudentsWithTracking(
  classId: number,
  startDate: string,
  endDate: string,
): Promise<StudentWithAccommodationsTracking[]> {
  const students = await getClassStudents(classId);
  const serviceLogs = await getAccommodationServiceLogs(
    classId,
    startDate,
    endDate,
  );

  return Promise.all(
    students.map(async (student) => {
      const accommodations = await getAccommodations(student.id!);

      const accommodationsWithTracking: AccommodationWithTracking[] =
        accommodations.map((acc) => {
          const logsMap = new Map<string, boolean>();

          serviceLogs
            .filter((log) => log.accommodation_id === acc.id)
            .forEach((log) => {
              logsMap.set(log.service_date, log.provided);
            });

          return {
            ...acc,
            serviceLogs: logsMap,
          };
        });

      return {
        ...student,
        accommodations: accommodationsWithTracking,
      };
    }),
  );
}

// Export to CSV
export function exportToCSV(data: ClassSummary): string {
  const headers = [
    "Student ID",
    "Last Name",
    "First Name",
    "Plan Type",
    "Accommodation Category",
    "Accommodation Description",
  ];
  const rows = [headers.join(",")];

  data.students.forEach((student) => {
    if (student.accommodations.length === 0) {
      rows.push(
        [
          student.student_id,
          `"${student.last_name}"`,
          `"${student.first_name}"`,
          student.plan_type,
          "",
          "",
        ].join(","),
      );
    } else {
      student.accommodations.forEach((accommodation) => {
        rows.push(
          [
            student.student_id,
            `"${student.last_name}"`,
            `"${student.first_name}"`,
            student.plan_type,
            `"${accommodation.category}"`,
            `"${accommodation.description.replace(/"/g, '""')}"`, // Escape quotes
          ].join(","),
        );
      });
    }
  });

  return rows.join("\n");
}

// Export tracking data to CSV
export function exportTrackingToCSV(
  students: StudentWithAccommodationsTracking[],
  dates: Date[],
): string {
  const headers = [
    "Student ID",
    "Last Name",
    "First Name",
    "Plan Type",
    "Accommodation Category",
    "Accommodation Description",
    ...dates.map((d) => formatDate(d)),
  ];
  const rows = [headers.join(",")];

  students.forEach((student) => {
    student.accommodations.forEach((accommodation) => {
      const dateValues = dates.map((date) => {
        const dateStr = formatDate(date);
        return accommodation.serviceLogs.get(dateStr) ? "✓" : "";
      });

      rows.push(
        [
          student.student_id,
          `"${student.last_name}"`,
          `"${student.first_name}"`,
          student.plan_type,
          `"${accommodation.category}"`,
          `"${accommodation.description.replace(/"/g, '""')}"`,
          ...dateValues,
        ].join(","),
      );
    });
  });

  return rows.join("\n");
}

// Helper function to get dates in a range
export function getDatesInRange(startDate: Date, endDate: Date): Date[] {
  const dates: Date[] = [];
  const current = new Date(startDate);

  while (current <= endDate) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

// Helper function to format date as YYYY-MM-DD
export function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}
