import React, { useState, useEffect } from 'react';
import {
  AdminUser,
  Announcement,
  AcademicCircle,
  Activity,
  DatabaseSchema,
  Donation,
  FinancialTransaction,
  NavTab,
  Student,
  UserAccount,
} from './types';
import {
  FULL_INITIAL_DATABASE,
  INITIAL_ADMIN_USER,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_CIRCLES,
  INITIAL_ACTIVITIES,
  INITIAL_DONATIONS,
  INITIAL_SCHEDULE,
  INITIAL_STUDENTS,
  INITIAL_TEACHERS,
  INITIAL_TRANSACTIONS,
  INITIAL_USERS,
} from './data/dbData';
import { api } from './services/api';
import { Sidebar } from './components/Sidebar';
import { TopAppBar } from './components/TopAppBar';
import { DashboardView } from './components/views/DashboardView';
import { PersonsView } from './components/views/PersonsView';
import { AcademicView } from './components/views/AcademicView';
import { ScheduleView } from './components/views/ScheduleView';
import { ActivitiesView } from './components/views/ActivitiesView';
import { DonationsView } from './components/views/DonationsView';
import { FinancialsView } from './components/views/FinancialsView';
import { ReferenceTablesView } from './components/views/ReferenceTablesView';
import { AnnouncementsView } from './components/views/AnnouncementsView';
import { SettingsView } from './components/views/SettingsView';
import { ProfileView } from './components/views/ProfileView';
import { LoginView } from './components/views/LoginView';
import { NewRegistrationModal } from './components/modals/NewRegistrationModal';
import { AddDonationModal } from './components/modals/AddDonationModal';
import { AddCircleModal } from './components/modals/AddCircleModal';
import { AddActivityModal } from './components/modals/AddActivityModal';
import { AddTransactionModal } from './components/modals/AddTransactionModal';
import { StudentProfileModal } from './components/modals/StudentProfileModal';
import { HelpModal } from './components/modals/HelpModal';
import { NotificationsDrawer } from './components/modals/NotificationsDrawer';
import { PrintCenterModal } from './components/modals/PrintCenterModal';

export function App() {
  // Authentication state
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const savedUser = localStorage.getItem('zad_current_user');
      if (savedUser) {
        return JSON.parse(savedUser);
      }
    } catch (e) {
      console.error('Error parsing stored user:', e);
    }
    return INITIAL_USERS[0];
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    const storedAuth = localStorage.getItem('zad_is_logged_in');
    return storedAuth !== 'false';
  });

  // Navigation tab
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');

  // Mobile sidebar state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // Global search query
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Database schema state
  const [database, setDatabase] = useState<DatabaseSchema>(FULL_INITIAL_DATABASE);
  const [isLoadingDb, setIsLoadingDb] = useState<boolean>(true);

  // Print Center state
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);
  const [printModalConfig, setPrintModalConfig] = useState<{
    docType: string;
    customData?: any;
  }>({
    docType: 'student_roster',
  });

  const handleOpenPrintModal = (docType = 'student_roster', customData?: any) => {
    setPrintModalConfig({ docType, customData });
    setIsPrintModalOpen(true);
  };

  // Derived entities from database
  const adminUser = database.adminUser || INITIAL_ADMIN_USER;
  const students = database.students || INITIAL_STUDENTS;
  const circles = database.circles || INITIAL_CIRCLES;
  const teachers = database.teachers || INITIAL_TEACHERS;
  const activities = database.activities || INITIAL_ACTIVITIES;
  const donations = database.donations || INITIAL_DONATIONS;
  const transactions = database.transactions || INITIAL_TRANSACTIONS;
  const scheduleClasses = database.scheduleClasses || INITIAL_SCHEDULE;
  const announcements = database.announcements || INITIAL_ANNOUNCEMENTS;
  const currentExchangeRate = database.exchangeRate?.usdToLbp || 89500;

  // Initial load from backend API (reading db.json)
  useEffect(() => {
    async function loadData() {
      setIsLoadingDb(true);
      try {
        const loaded = await api.getDatabase();
        if (loaded && loaded.students && loaded.students.length > 0) {
          const merged: DatabaseSchema = {
            ...FULL_INITIAL_DATABASE,
            ...loaded,
            users: (loaded.users && loaded.users.length > 0) ? loaded.users : FULL_INITIAL_DATABASE.users,
            exchangeRate: loaded.exchangeRate || FULL_INITIAL_DATABASE.exchangeRate,
            branchesRef: loaded.branchesRef || FULL_INITIAL_DATABASE.branchesRef,
            gradesRef: loaded.gradesRef || FULL_INITIAL_DATABASE.gradesRef,
            curriculumTracksRef: loaded.curriculumTracksRef || FULL_INITIAL_DATABASE.curriculumTracksRef,
            donationCategoriesRef: loaded.donationCategoriesRef || FULL_INITIAL_DATABASE.donationCategoriesRef,
            expenseItemsRef: loaded.expenseItemsRef || FULL_INITIAL_DATABASE.expenseItemsRef,
          };
          setDatabase(merged);
        }
      } catch (err) {
        console.error('Failed to load database from db.json API:', err);
      } finally {
        setIsLoadingDb(false);
      }
    }
    loadData();
  }, []);

  // Modals visibility
  const [isNewRegOpen, setIsNewRegOpen] = useState(false);
  const [isAddDonationOpen, setIsAddDonationOpen] = useState(false);
  const [isAddCircleOpen, setIsAddCircleOpen] = useState(false);
  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false);
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [selectedStudentForProfile, setSelectedStudentForProfile] = useState<Student | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Sync to API and state
  const updateAndSaveDatabase = (updater: (prev: DatabaseSchema) => DatabaseSchema) => {
    setDatabase((prev) => {
      const next = updater(prev);
      api.saveDatabase(next);
      return next;
    });
  };

  // Auth Handlers
  const handleLoginSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    localStorage.setItem('zad_is_logged_in', 'true');
    localStorage.setItem('zad_current_user', JSON.stringify(user));
    showToast(`مرحباً بك، ${user.name} (${user.role})`);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.setItem('zad_is_logged_in', 'false');
    showToast('تم تسجيل الخروج بنجاح');
  };

  const handleUpdateCurrentUser = (updated: UserAccount) => {
    setCurrentUser(updated);
    localStorage.setItem('zad_current_user', JSON.stringify(updated));
    updateAndSaveDatabase((prev) => ({
      ...prev,
      users: (prev.users || INITIAL_USERS).map((u) => (u.id === updated.id ? updated : u)),
    }));
  };

  // Student & Academic Handlers
  const handleAddStudent = async (newStudent: Omit<Student, 'id'>) => {
    const created: Student = {
      ...newStudent,
      id: `st-${Date.now()}`,
    };

    updateAndSaveDatabase((prev) => ({
      ...prev,
      students: [created, ...prev.students],
      circles: prev.circles.map((c) =>
        c.id === created.circleId ? { ...c, studentsCount: c.studentsCount + 1 } : c
      ),
    }));

    api.addStudent(created);
    showToast(`تمت إضافة الطالب "${created.name}" بنجاح وحفظه في db.json`);
  };

  const handleDeleteStudent = (studentId: string) => {
    updateAndSaveDatabase((prev) => ({
      ...prev,
      students: prev.students.filter((s) => s.id !== studentId),
    }));
    api.deleteStudent(studentId);
    showToast('تم حذف قيد الطالب بنجاح من db.json');
  };

  const handleUpdateStudent = (studentId: string, updates: Partial<Student>) => {
    updateAndSaveDatabase((prev) => ({
      ...prev,
      students: prev.students.map((s) => (s.id === studentId ? { ...s, ...updates } : s)),
    }));
    api.updateStudent(studentId, updates);
    showToast('تم تحديث بيانات الطالب وحفظها في db.json');
  };

  const handleUpdateStudentStatus = (
    studentId: string,
    status: 'منتظم' | 'متميز' | 'تأخير متكرر' | 'منقطع'
  ) => {
    handleUpdateStudent(studentId, { status });
  };

  const handleAddDonation = (newDonation: Omit<Donation, 'id'>) => {
    const created: Donation = {
      ...newDonation,
      id: `don-${Date.now()}`,
    };

    updateAndSaveDatabase((prev) => ({
      ...prev,
      donations: [created, ...prev.donations],
    }));
    api.addDonation(created);
    showToast(`تم توثيق التبرع بقيمة $${created.amountUSD} وسند ${created.receiptNumber}`);
  };

  const handleAddTransaction = (newTx: Omit<FinancialTransaction, 'id'>) => {
    const created: FinancialTransaction = {
      ...newTx,
      id: `tx-${Date.now()}`,
    };

    updateAndSaveDatabase((prev) => ({
      ...prev,
      transactions: [created, ...prev.transactions],
    }));
    api.addTransaction(created);
    showToast(`تم تسجيل المعاملة المالية (${created.description})`);
  };

  const handleAddCircle = (newCircle: Omit<AcademicCircle, 'id'>) => {
    const created: AcademicCircle = {
      ...newCircle,
      id: `cir-${Date.now()}`,
    };

    updateAndSaveDatabase((prev) => ({
      ...prev,
      circles: [created, ...prev.circles],
    }));
    api.addCircle(created);
    showToast(`تم إنشاء حلقة "${created.name}" بنجاح في db.json`);
  };

  const handleAddActivity = (newActivity: Omit<Activity, 'id'>) => {
    const created: Activity = {
      ...newActivity,
      id: `act-${Date.now()}`,
    };

    updateAndSaveDatabase((prev) => ({
      ...prev,
      activities: [created, ...prev.activities],
    }));
    api.addActivity(created);
    showToast(`تمت جدولة النشاط "${created.title}" بنجاح`);
  };

  const handleAddAnnouncement = (newAnn: Omit<Announcement, 'id'>) => {
    const created: Announcement = {
      ...newAnn,
      id: `ann-${Date.now()}`,
    };

    updateAndSaveDatabase((prev) => ({
      ...prev,
      announcements: [created, ...prev.announcements],
    }));
    api.addAnnouncement(created);
    showToast('تم نشر التعميم الإداري في db.json');
  };

  const handleDeleteAnnouncement = (annId: string) => {
    updateAndSaveDatabase((prev) => ({
      ...prev,
      announcements: prev.announcements.filter((a) => a.id !== annId),
    }));
    api.deleteAnnouncement(annId);
    showToast('تم حذف التعميم بنجاح');
  };

  const handleUpdateAdminUser = (updatedUser: AdminUser) => {
    updateAndSaveDatabase((prev) => ({
      ...prev,
      adminUser: updatedUser,
    }));
  };

  // If user is logged out, show full-featured login screen
  if (!isLoggedIn) {
    return (
      <LoginView
        users={database.users || INITIAL_USERS}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#191c1e] flex flex-col font-sans" dir="rtl">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 bg-[#191c1e] text-white px-5 py-3 rounded-2xl shadow-xl border border-white/10 flex items-center gap-3 animate-in slide-in-from-bottom-5">
          <span className="material-symbols-outlined text-[#fea619] text-[20px]">database</span>
          <span className="text-xs font-semibold">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-white/60 hover:text-white mr-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewRegistration={() => setIsNewRegOpen(true)}
        onLogout={handleLogout}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        currentUser={currentUser}
      />

      {/* Main Content Layout with RTL Margin for Desktop Sidebar */}
      <div className="flex-1 flex flex-col md:mr-[280px] transition-all duration-300">
        {/* Sticky Top App Bar */}
        <TopAppBar
          adminUser={adminUser}
          currentUser={currentUser}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onOpenHelp={() => setIsHelpOpen(true)}
          onOpenPrintModal={() => handleOpenPrintModal('student_roster')}
          onLogout={handleLogout}
          unreadCount={3}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {/* Dynamic Main View */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              students={students}
              circles={circles}
              donations={donations}
              onNavigateTab={setActiveTab}
              onOpenNewRegistration={() => setIsNewRegOpen(true)}
              onOpenAddDonation={() => setIsAddDonationOpen(true)}
            />
          )}

          {activeTab === 'persons' && (
            <PersonsView
              students={students}
              circles={circles}
              teachers={teachers}
              onOpenNewRegistration={() => setIsNewRegOpen(true)}
              onSelectStudent={(st) => setSelectedStudentForProfile(st)}
              onDeleteStudent={handleDeleteStudent}
              onUpdateStatus={handleUpdateStudentStatus}
            />
          )}

          {activeTab === 'academic' && (
            <AcademicView
              circles={circles}
              students={students}
              onOpenAddCircle={() => setIsAddCircleOpen(true)}
            />
          )}

          {activeTab === 'schedule' && (
            <ScheduleView
              scheduleClasses={scheduleClasses}
              circles={circles}
              students={students}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'activities' && (
            <ActivitiesView
              activities={activities}
              onOpenAddActivity={() => setIsAddActivityOpen(true)}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'donations' && (
            <DonationsView
              donations={donations}
              exchangeRate={currentExchangeRate}
              onOpenAddDonation={() => setIsAddDonationOpen(true)}
              onOpenPrintModal={handleOpenPrintModal}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'financials' && (
            <FinancialsView
              transactions={transactions}
              exchangeRate={currentExchangeRate}
              onOpenAddTransaction={() => setIsAddTxOpen(true)}
              onOpenPrintModal={handleOpenPrintModal}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'reference_tables' && (
            <ReferenceTablesView
              db={database}
              onUpdateDb={updateAndSaveDatabase}
              onOpenPrintModal={handleOpenPrintModal}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'announcements' && (
            <AnnouncementsView
              announcements={announcements}
              onAddAnnouncement={handleAddAnnouncement}
              onDeleteAnnouncement={handleDeleteAnnouncement}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              database={database}
              onDatabaseReload={(newDb) => {
                setDatabase(newDb);
              }}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileView
              adminUser={adminUser}
              currentUser={currentUser}
              onUpdateAdminUser={handleUpdateAdminUser}
              onUpdateCurrentUser={handleUpdateCurrentUser}
              onShowToast={showToast}
            />
          )}
        </main>
      </div>

      {/* Global Application Modals */}
      <NewRegistrationModal
        isOpen={isNewRegOpen}
        onClose={() => setIsNewRegOpen(false)}
        circles={circles}
        onAddStudent={handleAddStudent}
        onShowToast={showToast}
      />

      <AddDonationModal
        isOpen={isAddDonationOpen}
        onClose={() => setIsAddDonationOpen(false)}
        exchangeRate={currentExchangeRate}
        onAddDonation={handleAddDonation}
        onShowToast={showToast}
      />

      <AddCircleModal
        isOpen={isAddCircleOpen}
        onClose={() => setIsAddCircleOpen(false)}
        onAddCircle={handleAddCircle}
        onShowToast={showToast}
      />

      <AddActivityModal
        isOpen={isAddActivityOpen}
        onClose={() => setIsAddActivityOpen(false)}
        onAddActivity={handleAddActivity}
        onShowToast={showToast}
      />

      <AddTransactionModal
        isOpen={isAddTxOpen}
        onClose={() => setIsAddTxOpen(false)}
        exchangeRate={currentExchangeRate}
        onAddTransaction={handleAddTransaction}
        onShowToast={showToast}
      />

      <StudentProfileModal
        student={selectedStudentForProfile}
        circles={circles}
        onClose={() => setSelectedStudentForProfile(null)}
        onUpdateStatus={(id, status) => {
          handleUpdateStudentStatus(id, status);
          if (selectedStudentForProfile) {
            setSelectedStudentForProfile({ ...selectedStudentForProfile, status });
          }
        }}
        onUpdateStudent={(id, updates) => {
          handleUpdateStudent(id, updates);
          if (selectedStudentForProfile) {
            setSelectedStudentForProfile({ ...selectedStudentForProfile, ...updates });
          }
        }}
        onDeleteStudent={handleDeleteStudent}
      />

      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onNavigateToTab={setActiveTab}
      />

      {/* Print Center Modal */}
      <PrintCenterModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        db={database}
        defaultDocType={printModalConfig.docType}
        customData={printModalConfig.customData}
      />
    </div>
  );
}

export default App;
