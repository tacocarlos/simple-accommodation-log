# 504 & IEP Accommodation Tracker

A desktop application for tracking 504 and IEP accommodations for students across multiple classes with per-accommodation daily service tracking and PDF report generation. Built with Tauri, React, TypeScript, Tailwind CSS, and SQLite.

## Features

- **Per-Accommodation Service Tracking**: Check off individual accommodations as they are provided each day with an intuitive spreadsheet-style interface
- **Six-Week Period PDF Reports**: Generate professional PDF reports for each student covering the entire six-week period
- **Six-Week Period Management**: Organize tracking by six-week grading periods with automatic week constraints
- **Week Navigation**: Navigate through weeks within the selected period to track services over time
- **Class Management**: Create and manage classes with period, subject, and year information
- **Student Management**: Track students with their 504 or IEP plans
- **Accommodation Tracking**: Add detailed accommodations for each student organized by category
- **Class Summary**: View all students in a class with their accommodations
- **SQLite Database**: All data is stored locally in a SQLite database

## Installation

### Prerequisites

- [Bun](https://bun.sh/) or [Node.js](https://nodejs.org/) (v18+)
- [Rust](https://www.rust-lang.org/tools/install)
- [Tauri Prerequisites](https://tauri.app/v2/guides/getting-started/prerequisites/)

### Setup

1. Clone this repository
2. Install dependencies:
   ```bash
   bun install
   ```

3. Run in development mode:
   ```bash
   bun run tauri dev
   ```

4. Build for production:
   ```bash
   bun run tauri build
   ```

## Usage

### 1. SetSetSetSet Up Six-Week PeriodsUp Six-Week PeriodsUp Six-Week PeriodsUp Six-Week Periods

Navigate to the "Six-Week Periods" tab:
- Click "Add Period" to create grading periods
- Enter a name (e.g., "First Six Weeks", "Period 1")
- Set start and end dates
- Specify the school year

### 2. Create Classes

Go to the "Classes" tab and add your classes:
Navigate to the "Six-Week Periods" tab:
- Click "Add Period" to create grading periods
- Enter a name (e.g., "First Six Weeks", "Period 1")
- Set start and end dates
- Specify the school year

### 2. Create Classes

Go to the "Classes" tab and add your classes:
Navigate to the "Six-Week Periods" tab:
- Click "Add Period" to create grading periods
- Enter a name (e.g., "First Six Weeks", "Period 1")
- Set start and end dates
- Specify the school year

### 2. Create Classes

Go to the "Classes" tab and add your classes:
Navigate to the "Six-Week Periods" tab:
- Click "Add Period" to create grading periods
- Enter a name (e.g., "First Six Weeks", "Period 1")
- Set start and end dates
- Specify the school year

### 2. Create Classes

Go to the "Classes" tab and add your classes:
- Class name (e.g., "English 101")
- Subject (e.g., "English")
- Period (e.g., "1", "2A")
- School year (e.g., "2024-2025")

### 3333. Add Students

InInInIn the "Students" tab,,,, add students with:
- Student ID
- First and last name
- Plan type (504 or IEP)

### 4444. Add Accommodations

In the "Accommodations" tab:
- Select a student from the dropdown
- Add accommodations with a category and description
- Categories can include: Testing, Classroom, Assignment, Behavioral, etc.
- **Each accommodation will get its own row in the tracking view and column in PDF reports**

### 5. Track Daily Services

In the "Service Tracking" tab:
- Select a class and six-week period
- View all enrolled students with checkboxes for each day of the week (Monday-Friday)
- Click checkboxes to mark when accommodations were provided
- Navigate between weeks using the arrow buttons
- Click "Today" to jump to the current week
- View each student's accommodations listed below the tracking table

### 6. View Class Summary
### 5. Track Daily Services (Per Accommodation)

In the "Service Tracking" tab:
- Select a class and six-week period
- View all enrolled students with **each accommodation on a separate row**
- Each accommodation has checkboxes for each day of the week (Monday-Friday)
- Click checkboxes to mark when that specific accommodation was provided
- Navigate between weeks using the arrow buttons (constrained to the selected period)
- Click "Current Week" to jump to the current week in the period

**Key Feature**: Each accommodation is tracked individually, so you can mark:
- Extended time on tests ✓ (provided Monday and Wednesday)
- Preferential seating ✓ (provided all 5 days)
- Note-taking assistance (not provided this week)

### 6. Generate Six-Week Period PDF Reports

From the Service Tracking view:
- **Select a six-week period** (required for export)
- Click "Export Period PDFs" to generate individual PDF reports for each student
- Select a directory where the PDFs will be saved
- One PDF file is created per student covering **all weekdays in the entire six-week period**
- Filename format: `LastName_FirstName_PeriodName.pdf`

**Each PDF contains**:
- Student information (name, ID, plan type)
- Class and period information
- **A table with ALL weekday dates** from the six-week period as rows
- One column per accommodation
- Checkmarks (✓) showing when each accommodation was provided each day
- A signature line at the bottom for teacher verification

**PDF Table Example**:
```
Date              | Testing: Extended time | Classroom: Pref seating | Assignment: Extra time
-------------------------------------------------------------------------------------------
Mon, 1/8/2024     |           ✓            |            ✓            |
Tue, 1/9/2024     |                        |            ✓            |            ✓
Wed, 1/10/2024    |           ✓            |            ✓            |            ✓
...
Fri, 2/16/2024    |           ✓            |            ✓            |

_______________________________________________________________________________
Teacher Signature                                              Date: 2/18/2024
```

### 7. View Class Summary
### 5. Track Daily Services (Per Accommodation)

In the "Service Tracking" tab:
- Select a class and six-week period
- View all enrolled students with **each accommodation on a separate row**
- Each accommodation has checkboxes for each day of the week (Monday-Friday)
- Click checkboxes to mark when that specific accommodation was provided
- Navigate between weeks using the arrow buttons (constrained to the selected period)
- Click "Current Week" to jump to the current week in the period

**Key Feature**: Each accommodation is tracked individually, so you can mark:
- Extended time on tests ✓ (provided Monday and Wednesday)
- Preferential seating ✓ (provided all 5 days)
- Note-taking assistance (not provided this week)

### 6. Generate PDF Reports

From the Service Tracking view:
- Click "Export PDFs" to generate individual PDF reports for each student
- Select a directory where the PDFs will be saved
- One PDF file is created per student with the format: `LastName_FirstName_Date.pdf`
- Each PDF contains:
  - Student information (name, ID, plan type)
  - Class and period information
  - A table with dates as rows and accommodations as columns
  - Checkmarks (✓) showing when each accommodation was provided
  - A signature line at the bottom for teacher verification

**PDF Report Features**:
- Professional layout with clear headers
- Table format with alternating row colors for readability
- Green checkmarks (✓) for services provided
- Automatic page breaks for students with many accommodations or date ranges
- Signature line with current date
- Ready to print or email to parents/administrators

### 7. View Class Summary
### 5. Track Daily Services (Per Accommodation)

In the "Service Tracking" tab:
- Select a class and six-week period
- View all enrolled students with **each accommodation on a separate row**
- Each accommodation has checkboxes for each day of the week (Monday-Friday)
- Click checkboxes to mark when that specific accommodation was provided
- Navigate between weeks using the arrow buttons
- Click "Today" to jump to the current week

**Key Feature**: Each accommodation is tracked individually, so you can mark:
- Extended time on tests ✓ (provided Monday and Wednesday)
- Preferential seating ✓ (provided all 5 days)
- Note-taking assistance (not provided this week)

### 6. View Class Summary

In the "Class Summary" tab:
- Select a class from the dropdown
- Click "Add Student to Class" to enroll students
- View all students and their accommodations in one place
- See a detailed list of all accommodations
- SeeSee a detaileddetailed listlist ofof date with checkmarks showing whenaccommodations were provided

## Database

The application uses SQLite with the following schema:

- **classes**: Stores class information
- **students**: Stores student information and plan type
- **accommodations**: Stores detailed accommodations linked to students
- **class_students**: Junction table linking students to classes
- **six_week_periods**: Stores grading period definitions
- **accommodation_service_logs**: Tracks daily provision of **individual accommodations** per class

The database file (`accommodations.db`) is created automatically in the app data directory.

## Technology Stack

- **Tauri 2.0**: Desktop application framework
- **React 19**: UI framework
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: High-quality UI components
- **SQLite**: Local database with automatic migrations
- **pdf-lib**: PDF generation library
- **Vite**: Build tool and dev server

## Development

The project structure:

```
accommodation-chart/
├── src/
│   ├── components/
│   │   ├── ui/                          # shadcn/ui components
│   │   ├── ClassManager.tsx             # Manage classes
│   │   ├── StudentManager.tsx           # Manage students
│   │   ├── AccommodationManager.tsx     # Manage accommodations
│   │   ├── ClassSummary.tsx             # View class summary
│   │   ├── ClassSummaryWithTracking.tsx # Per-accommodation tracking
│   │   └── PeriodManager.tsx            # Manage six-week periods
│   │   ├── ui/                          # shadcn/ui components
│   │   ├── ClassManager.tsx             # Manage classes
│   │   ├── StudentManager.tsx           # Manage students
│   │   ├── AccommodationManager.tsx     # Manage accommodations
│   │   ├── ClassSummary.tsx             # View class summary
│   │   ├── ClassSummaryWithTracking.tsx # Per-accommodation tracking
│   │   └── PeriodManager.tsx            # Manage six-week periods
│   │   ├── ui/                          # shadcn/ui components
│   │   ├── ClassManager.tsx             # Manage classes
│   │   ├── StudentManager.tsx           # Manage students
│   │   ├── AccommodationManager.tsx     # Manage accommodations
│   │   ├── ClassSummary.tsx             # View class summary
│   │   ├── ClassSummaryWithTracking.tsx # Per-accommodation tracking
│   │   └── PeriodManager.tsx            # Manage six-week periods
│   ├── lib/
│   │   ├── database.ts                                                                        # Database utilities
│   │   ├── types.ts                                                                                    # TypeScript types
│   │   ├├── utils.ts                                                                                    # Utility functions
│   │   └── pdfGenerator.ts              # PDF generation utilities
│   ├── App.tsx                                                                                                        # Main app component
│   └── main.tsx                                                                                                    # Entry point
├── src-tauri/
│   ├── src/
│   │   └── lib.rs                                                                                            # Rust backend with SQL migrations
│   └── Cargo.toml                                                                                            # Rust dependencies
└── package.json                                                                                                    # Node dependencies
```

## Key Features Explained

### Per-Accommodation Service Tracking
The service tracking view provides a **granular, accommodation-level** interface where you can:
- See each accommodation as a separate row in the table
- Check boxes for individual accommodations on specific days
- Track exactly which accommodations were provided when
- View students grouped with all their accommodations listed below them

**Example**: A student with 3 accommodations will have 3 rows in the tracking table:
```
John Doe | 504 | Testing      | Extended time on tests      | [✓][ ][✓][✓][ ]
         |     | Classroom    | Preferential seating        | [✓][✓][✓][✓][✓]
         |     | Assignment   | Extra time for assignments  | [ ][ ][✓][ ][ ]
```

### Six-Week Period PDF Reports
Generate comprehensive compliance documentation:
- One PDF per student covering the **entire six-week period**
- Includes all weekday dates (Monday-Friday) from the period
- Table format: dates in rows, accommodations in columns
- Visual checkmarks (✓) show service provision for each accommodation on each day
- Includes signature line for teacher verification
- Perfect for IEP meetings, 504 plan reviews, and compliance audits
- Filename: `LastName_FirstName_PeriodName.pdf` (e.g., `Smith_John_First_Six_Weeks.pdf`)

**Example**: For a 6-week period with 30 school days, the PDF will show all 30 dates with checkmarks for each accommodation on each day.

### Six-Week Period Management with Week Constraints
Define your school's grading periods:
- Week navigation automatically constrained to the selected period
- Cannot navigate to weeks outside the period dates
- Shows "Week X of Period Name" to track position
- "Current Week" button jumps to today (or first week if period is in past/future)
- PDF export requires a period selection to ensure complete documentation

### Data Persistence
All checkboxes and data are automatically saved to the SQLite database as you interact with the application. No need to manually save your work!

## Benefits of Per-Accommodation Tracking with Period PDF Reports

1. **Complete Documentation**: PDFs include the entire six-week period, not just one week
2. **Compliance Ready**: Generate proof of which specific accommodations were provided on which days across the entire grading period
3. **Accountability**: Track implementation of each accommodation separately with printable records
4. **Data-Driven Decisions**: Identify patterns of accommodation provision over time
5. **IEP/504 Meeting Prep**: Generate detailed PDF reports showing six weeks of accommodation implementation
6. **Legal Protection**: Maintain detailed records of services provided with signature verification
7. **Parent Communication**: Email or print comprehensive period reports for parent conferences
8. **Administrator Review**: Provide complete six-week documentation for compliance audits
9. **Historical Records**: Archive period reports for each student throughout the school year

## Typical Workflow

1. **Start of Period**: Create a new six-week period with start/end dates
2. **Daily Tracking**: Throughout the period, check off accommodations as provided each day
3. **End of Period**: Click "Export Period PDFs" to generate complete six-week reports for all students
4. **Sign & File**: Print, sign, and file the PDFs for compliance records
5. **Meetings**: Use the PDFs at parent conferences or IEP/504 meetings to demonstrate implementation

## License

MIT

## Support

For issues or questions, please open an issue on the GitHub repository.
