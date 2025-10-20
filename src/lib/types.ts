export interface Class {
  id?: number;
  name: string;
  subject: string;
  period: string;
  year: string;
}

export interface Student {
  id?: number;
  first_name: string;
  last_name: string;
  student_id: string;
  plan_type: "504" | "IEP";
}

export interface Accommodation {
  id?: number;
  student_id: number;
  description: string;
  category: string;
}

export interface ClassStudent {
  id?: number;
  class_id: number;
  student_id: number;
}

export interface SixWeekPeriod {
  id?: number;
  name: string;
  start_date: string;
  end_date: string;
  year: string;
}

export interface AccommodationServiceLog {
  id?: number;
  class_id: number;
  accommodation_id: number;
  service_date: string;
  provided: boolean;
}

export interface AccommodationWithTracking extends Accommodation {
  serviceLogs: Map<string, boolean>;
}

export interface StudentWithAccommodations extends Student {
  accommodations: Accommodation[];
}

export interface StudentWithAccommodationsTracking extends Student {
  accommodations: AccommodationWithTracking[];
}

export interface ClassSummary extends Class {
  students: StudentWithAccommodations[];
}
