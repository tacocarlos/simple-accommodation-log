use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Class {
    pub id: Option<i64>,
    pub name: String,
    pub subject: String,
    pub period: String,
    pub year: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Student {
    pub id: Option<i64>,
    pub first_name: String,
    pub last_name: String,
    pub student_id: String,
    pub plan_type: String, // "504" or "IEP"
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Accommodation {
    pub id: Option<i64>,
    pub student_id: i64,
    pub description: String,
    pub category: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ClassStudent {
    pub id: Option<i64>,
    pub class_id: i64,
    pub student_id: i64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SixWeekPeriod {
    pub id: Option<i64>,
    pub name: String,
    pub start_date: String,
    pub end_date: String,
    pub year: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AccommodationServiceLog {
    pub id: Option<i64>,
    pub class_id: i64,
    pub accommodation_id: i64,
    pub service_date: String,
    pub provided: i64, // SQLite boolean (0 or 1)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations(
                    "sqlite:accommodations.db",
                    vec![
                        // Migration 1: Create initial tables
                        tauri_plugin_sql::Migration {
                            version: 1,
                            description: "create_initial_tables",
                            sql: "
                                CREATE TABLE IF NOT EXISTS classes (
                                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                                    name TEXT NOT NULL,
                                    subject TEXT NOT NULL,
                                    period TEXT NOT NULL,
                                    year TEXT NOT NULL
                                );

                                CREATE TABLE IF NOT EXISTS students (
                                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                                    first_name TEXT NOT NULL,
                                    last_name TEXT NOT NULL,
                                    student_id TEXT NOT NULL UNIQUE,
                                    plan_type TEXT NOT NULL CHECK(plan_type IN ('504', 'IEP'))
                                );

                                CREATE TABLE IF NOT EXISTS accommodations (
                                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                                    student_id INTEGER NOT NULL,
                                    description TEXT NOT NULL,
                                    category TEXT NOT NULL,
                                    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
                                );

                                CREATE TABLE IF NOT EXISTS class_students (
                                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                                    class_id INTEGER NOT NULL,
                                    student_id INTEGER NOT NULL,
                                    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
                                    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
                                    UNIQUE(class_id, student_id)
                                );

                                CREATE INDEX IF NOT EXISTS idx_accommodations_student_id ON accommodations(student_id);
                                CREATE INDEX IF NOT EXISTS idx_class_students_class_id ON class_students(class_id);
                                CREATE INDEX IF NOT EXISTS idx_class_students_student_id ON class_students(student_id);
                            ",
                            kind: tauri_plugin_sql::MigrationKind::Up,
                        },
                        // Migration 2: Add six-week periods and service logs
                        tauri_plugin_sql::Migration {
                            version: 2,
                            description: "add_periods_and_service_logs",
                            sql: "
                                CREATE TABLE IF NOT EXISTS six_week_periods (
                                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                                    name TEXT NOT NULL,
                                    start_date TEXT NOT NULL,
                                    end_date TEXT NOT NULL,
                                    year TEXT NOT NULL
                                );

                                CREATE TABLE IF NOT EXISTS service_logs (
                                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                                    class_id INTEGER NOT NULL,
                                    student_id INTEGER NOT NULL,
                                    service_date TEXT NOT NULL,
                                    provided INTEGER NOT NULL DEFAULT 0,
                                    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
                                    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
                                    UNIQUE(class_id, student_id, service_date)
                                );

                                CREATE INDEX IF NOT EXISTS idx_service_logs_class_id ON service_logs(class_id);
                                CREATE INDEX IF NOT EXISTS idx_service_logs_student_id ON service_logs(student_id);
                                CREATE INDEX IF NOT EXISTS idx_service_logs_date ON service_logs(service_date);
                            ",
                            kind: tauri_plugin_sql::MigrationKind::Up,
                        },
                        // Migration 3: Replace service_logs with accommodation_service_logs
                        tauri_plugin_sql::Migration {
                            version: 3,
                            description: "per_accommodation_tracking",
                            sql: "
                                -- Drop old service_logs table if exists
                                DROP TABLE IF EXISTS service_logs;

                                -- Create new accommodation-based service logs
                                CREATE TABLE IF NOT EXISTS accommodation_service_logs (
                                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                                    class_id INTEGER NOT NULL,
                                    accommodation_id INTEGER NOT NULL,
                                    service_date TEXT NOT NULL,
                                    provided INTEGER NOT NULL DEFAULT 0,
                                    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
                                    FOREIGN KEY (accommodation_id) REFERENCES accommodations(id) ON DELETE CASCADE,
                                    UNIQUE(class_id, accommodation_id, service_date)
                                );

                                CREATE INDEX IF NOT EXISTS idx_accommodation_service_logs_class_id ON accommodation_service_logs(class_id);
                                CREATE INDEX IF NOT EXISTS idx_accommodation_service_logs_accommodation_id ON accommodation_service_logs(accommodation_id);
                                CREATE INDEX IF NOT EXISTS idx_accommodation_service_logs_date ON accommodation_service_logs(service_date);
                            ",
                            kind: tauri_plugin_sql::MigrationKind::Up,
                        },
                    ],
                )
                .build(),
        )
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
