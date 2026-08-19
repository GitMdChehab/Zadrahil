export type NavTab = 
  | 'dashboard'
  | 'persons'
  | 'academic'
  | 'schedule'
  | 'activities'
  | 'donations'
  | 'financials'
  | 'reference_tables'
  | 'announcements'
  | 'settings'
  | 'profile';

export type StudentStatus = 'منتظم' | 'متميز' | 'تأخير متكرر' | 'منقطع';

export type CenterBranch = 
  | 'مصيلح'
  | 'مصيلح ومفرق الحجة ومفرق النجارية'
  | 'النجارية'
  | 'مصيلح الرادار';

export type SupportedCurrency = 'USD' | 'LBP';

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  type: 'donation' | 'student' | 'announcement' | 'financial' | 'activity' | 'system';
  targetTab?: NavTab;
  date: string;
  timestamp: number;
  unread: boolean;
  isUrgent?: boolean;
  senderName?: string;
  senderRole?: string;
  dataUrl?: string;
}

export interface PushNotificationPreferences {
  enabled: boolean;
  soundEnabled: boolean;
  notifyOnDonations: boolean;
  notifyOnStudentAlerts: boolean;
  notifyOnAnnouncements: boolean;
  notifyOnFinancials: boolean;
}

export interface Student {
  id: string;
  nationalId: string;
  name: string;
  age?: number | string;
  grade?: string;
  joinYear: string;
  level: string;
  branch: CenterBranch;
  circleId: string;
  circleNumber?: number;
  circleName: string;
  teacherName?: string;
  gender: 'بنات' | 'صبيان' | 'نساء';
  status: StudentStatus;
  avatarLetter?: string;
  avatarUrl?: string;
  phone?: string;
  guardianName?: string;
  guardianPhone?: string;
  notes?: string;
  memorizedParts?: number;
}

export interface Teacher {
  id: string;
  name: string;
  branch: CenterBranch;
  specialization: string;
  phone: string;
  email: string;
  circlesCount: number;
  salaryUSD?: number;
  salaryLBP?: number;
  avatarUrl?: string;
}

export interface AcademicCircle {
  id: string;
  number: number;
  name: string;
  type: 'حفظ ومراجعة' | 'تلقين' | 'تجويد متقدم' | 'علوم شرعية' | 'حلقة نساء';
  branch: CenterBranch;
  teacherName: string;
  gender: 'بنات' | 'صبيان' | 'نساء' | 'مشترك';
  days: string;
  timeSlot: string;
  room: string;
  studentsCount: number;
  maxStudents: number;
  period: 'صباحي' | 'مسائي';
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  type: 'مدفوع' | 'مجاني';
  price?: number;
  priceUSD?: number;
  priceLBP?: number;
  dateRange: string;
  timeSlot: string;
  location: string;
  registeredCount: number;
  capacity: number | 'مفتوح';
  paymentCollectedPercent?: number;
  status: 'active' | 'upcoming' | 'past' | 'draft';
  imageUrl?: string;
}

export interface Donation {
  id: string;
  donorName: string;
  amountUSD: number;
  amountLBP?: number;
  amount?: number;
  currency: SupportedCurrency;
  category: 'تبرع عام' | 'كفالة حلقة' | 'كفالة طالب' | 'صندوق المعلمين' | 'وقف قرآني';
  date: string;
  paymentMethod: string;
  status: 'مكتمل' | 'قيد المراجعة' | 'ملغي';
  receiptNumber: string;
  notes?: string;
}

export interface FinancialTransaction {
  id: string;
  date: string;
  description: string;
  category: 'إيرادات تعليمية' | 'مصروفات تشغيلية' | 'تبرعات' | 'مشتريات' | 'رواتب وأجور';
  amountUSD: number;
  amountLBP?: number;
  amount?: number;
  currency: SupportedCurrency;
  status: 'مكتمل' | 'قيد المراجعة' | 'معلق';
  type: 'income' | 'expense';
}

export interface ScheduleClass {
  id: string;
  dayIndex: number;
  title: string;
  teacher: string;
  room: string;
  startTime: string;
  endTime: string;
  topPercent: number;
  heightPercent: number;
  variant: 'primary' | 'secondary' | 'tertiary' | 'cancelled' | 'highlight';
  statusNote?: string;
  cancelled?: boolean;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  author: string;
  target: 'الكل' | 'أولياء الأمور' | 'الطلاب' | 'المعلمون';
  pinned?: boolean;
  isUrgent?: boolean;
}

export interface AdminUser {
  name: string;
  title: string;
  role: string;
  department: string;
  joinDateHijri: string;
  email: string;
  phone: string;
  location: string;
  lastLogin: string;
  twoFactorEnabled: boolean;
  avatarUrl: string;
}

export type UserRole =
  | 'مدير عام'
  | 'مشرف تعليمي'
  | 'أمين صندوق'
  | 'معلم حلقة'
  | 'مشرف فرع'
  | 'موظف استقبال';

export interface UserAccount {
  id: string;
  username: string;
  password: string;
  name: string;
  role: UserRole;
  branch: CenterBranch | 'جميع الفروع';
  phone?: string;
  email?: string;
  active: boolean;
  lastLogin?: string;
  createdAt?: string;
  avatarUrl?: string;
  permissions?: string[];
}

// Reference Tables Models
export interface BranchRef {
  id: string;
  name: CenterBranch;
  supervisor: string;
  phone: string;
  location: string;
  circlesCount: number;
  studentsCount: number;
  capacity: number;
  notes?: string;
}

export interface GradeRef {
  id: string;
  name: string;
  stage: 'روضة' | 'ابتدائي' | 'متوسط' | 'ثانوي' | 'جامعي' | 'أمهات';
  targetAge: string;
  studentsCount: number;
}

export interface CurriculumTrackRef {
  id: string;
  title: string;
  category: string;
  levelsCount: number;
  partsRequired: string;
  description: string;
  certificate: string;
}

export interface DonationCategoryRef {
  id: string;
  name: string;
  targetUSD: number;
  targetLBP: number;
  description: string;
  isRecurring: boolean;
}

export interface ExpenseItemRef {
  id: string;
  name: string;
  category: string;
  estMonthlyUSD: number;
  estMonthlyLBP: number;
  notes: string;
}

export interface ExchangeRateConfig {
  usdToLbp: number;
  lastUpdated: string;
  source: string;
}

export interface DatabaseSchema {
  meta: {
    name: string;
    version: string;
    totalStudents: number;
    totalTeachers: number;
    totalCircles: number;
    lastUpdated: string;
  };
  adminUser: AdminUser;
  exchangeRate: ExchangeRateConfig;
  branches: CenterBranch[];
  branchesRef: BranchRef[];
  gradesRef: GradeRef[];
  curriculumTracksRef: CurriculumTrackRef[];
  donationCategoriesRef: DonationCategoryRef[];
  expenseItemsRef: ExpenseItemRef[];
  students: Student[];
  teachers: Teacher[];
  circles: AcademicCircle[];
  activities: Activity[];
  donations: Donation[];
  transactions: FinancialTransaction[];
  scheduleClasses: ScheduleClass[];
  announcements: Announcement[];
  users?: UserAccount[];
  notifications?: NotificationItem[];
}
