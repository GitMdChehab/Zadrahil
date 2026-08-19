import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, testFirestoreConnection } from './firebase';
import {
  AcademicCircle,
  Activity,
  AdminUser,
  Announcement,
  DatabaseSchema,
  Donation,
  FinancialTransaction,
  NotificationItem,
  ScheduleClass,
  Student,
  Teacher,
  UserAccount,
} from '../types';
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
} from '../data/dbData';

const LOCAL_STORAGE_KEY = 'zad_al_raheel_db_v2';

// Test connection on module load
testFirestoreConnection().catch((err) => console.warn('Firebase connection test:', err));

export const api = {
  // 1. Fetch complete database from Firestore (or fallback to cache)
  async getDatabase(): Promise<DatabaseSchema> {
    try {
      // Check if students collection has documents
      const studentsSnap = await getDocs(collection(db, 'students'));

      if (studentsSnap.empty) {
        console.log('⚡ Firestore is empty. Initializing and seeding Firestore with complete database...');
        await this.seedInitialDatabase();
        return FULL_INITIAL_DATABASE;
      }

      // Fetch all collections in parallel from Firestore
      const [
        circlesSnap,
        teachersSnap,
        donationsSnap,
        txSnap,
        scheduleSnap,
        announcementsSnap,
        activitiesSnap,
        usersSnap,
        notificationsSnap,
        metaDocSnap,
      ] = await Promise.all([
        getDocs(collection(db, 'circles')),
        getDocs(collection(db, 'teachers')),
        getDocs(collection(db, 'donations')),
        getDocs(collection(db, 'transactions')),
        getDocs(collection(db, 'schedule')),
        getDocs(collection(db, 'announcements')),
        getDocs(collection(db, 'activities')),
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'notifications')),
        getDoc(doc(db, 'meta', 'settings')),
      ]);

      const students: Student[] = studentsSnap.docs.map((d) => ({ ...(d.data() as Student), id: d.id }));
      const circles: AcademicCircle[] = circlesSnap.docs.map((d) => ({ ...(d.data() as AcademicCircle), id: d.id }));
      const teachers: Teacher[] = teachersSnap.docs.map((d) => ({ ...(d.data() as Teacher), id: d.id }));
      const donations: Donation[] = donationsSnap.docs.map((d) => ({ ...(d.data() as Donation), id: d.id }));
      const transactions: FinancialTransaction[] = txSnap.docs.map((d) => ({ ...(d.data() as FinancialTransaction), id: d.id }));
      const scheduleClasses: ScheduleClass[] = scheduleSnap.docs.map((d) => ({ ...(d.data() as ScheduleClass), id: d.id }));
      const announcements: Announcement[] = announcementsSnap.docs.map((d) => ({ ...(d.data() as Announcement), id: d.id }));
      const activities: Activity[] = activitiesSnap.docs.map((d) => ({ ...(d.data() as Activity), id: d.id }));
      const users: UserAccount[] = usersSnap.docs.map((d) => ({ ...(d.data() as UserAccount), id: d.id }));
      const notifications = notificationsSnap.docs.map((d) => ({ ...(d.data() as any), id: d.id }));
      const metaData = metaDocSnap.exists() ? metaDocSnap.data() : {};

      const fullDb: DatabaseSchema = {
        ...FULL_INITIAL_DATABASE,
        meta: metaData.meta || {
          name: 'مركز زاد الرحيل',
          version: '2.0.0',
          totalStudents: students.length,
          totalTeachers: teachers.length,
          totalCircles: circles.length,
          lastUpdated: new Date().toISOString(),
        },
        branches: FULL_INITIAL_DATABASE.branches,
        adminUser: (metaData.adminUser as AdminUser) || INITIAL_ADMIN_USER,
        users: users.length > 0 ? users : INITIAL_USERS,
        students: students.length > 0 ? students : INITIAL_STUDENTS,
        circles: circles.length > 0 ? circles : INITIAL_CIRCLES,
        teachers: teachers.length > 0 ? teachers : INITIAL_TEACHERS,
        donations: donations.length > 0 ? donations : INITIAL_DONATIONS,
        transactions: transactions.length > 0 ? transactions : INITIAL_TRANSACTIONS,
        scheduleClasses: scheduleClasses.length > 0 ? scheduleClasses : INITIAL_SCHEDULE,
        announcements: announcements.length > 0 ? announcements : INITIAL_ANNOUNCEMENTS,
        activities: activities.length > 0 ? activities : INITIAL_ACTIVITIES,
        notifications: notifications.length > 0 ? notifications : (FULL_INITIAL_DATABASE.notifications || []),
        exchangeRate: metaData.exchangeRate || FULL_INITIAL_DATABASE.exchangeRate,
        branchesRef: metaData.branchesRef || FULL_INITIAL_DATABASE.branchesRef,
        gradesRef: metaData.gradesRef || FULL_INITIAL_DATABASE.gradesRef,
        curriculumTracksRef: metaData.curriculumTracksRef || FULL_INITIAL_DATABASE.curriculumTracksRef,
        donationCategoriesRef: metaData.donationCategoriesRef || FULL_INITIAL_DATABASE.donationCategoriesRef,
        expenseItemsRef: metaData.expenseItemsRef || FULL_INITIAL_DATABASE.expenseItemsRef,
      };

      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(fullDb));
      return fullDb;
    } catch (error) {
      console.warn('Could not read from Firestore, using local cache:', error);
      try {
        const local = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (local) {
          const parsed = JSON.parse(local);
          if (parsed.students && parsed.students.length > 0) {
            return parsed;
          }
        }
      } catch (e) {
        console.error('Failed to parse local storage cache:', e);
      }
      return FULL_INITIAL_DATABASE;
    }
  },

  // 2. Real-time Subscription to Firestore Collections
  subscribeToDatabase(onUpdate: (db: DatabaseSchema) => void): () => void {
    const unsubscribes: (() => void)[] = [];

    let currentDb: DatabaseSchema = { ...FULL_INITIAL_DATABASE };

    const notify = () => {
      onUpdate({ ...currentDb });
    };

    try {
      // Students Listener
      const unsubStudents = onSnapshot(
        collection(db, 'students'),
        (snapshot) => {
          if (!snapshot.empty) {
            currentDb.students = snapshot.docs.map((d) => ({ ...(d.data() as Student), id: d.id }));
            notify();
          }
        },
        (error) => handleFirestoreError(error, OperationType.GET, 'students')
      );
      unsubscribes.push(unsubStudents);

      // Circles Listener
      const unsubCircles = onSnapshot(
        collection(db, 'circles'),
        (snapshot) => {
          if (!snapshot.empty) {
            currentDb.circles = snapshot.docs.map((d) => ({ ...(d.data() as AcademicCircle), id: d.id }));
            notify();
          }
        },
        (error) => handleFirestoreError(error, OperationType.GET, 'circles')
      );
      unsubscribes.push(unsubCircles);

      // Teachers Listener
      const unsubTeachers = onSnapshot(
        collection(db, 'teachers'),
        (snapshot) => {
          if (!snapshot.empty) {
            currentDb.teachers = snapshot.docs.map((d) => ({ ...(d.data() as Teacher), id: d.id }));
            notify();
          }
        },
        (error) => handleFirestoreError(error, OperationType.GET, 'teachers')
      );
      unsubscribes.push(unsubTeachers);

      // Donations Listener
      const unsubDonations = onSnapshot(
        collection(db, 'donations'),
        (snapshot) => {
          if (!snapshot.empty) {
            currentDb.donations = snapshot.docs.map((d) => ({ ...(d.data() as Donation), id: d.id }));
            notify();
          }
        },
        (error) => handleFirestoreError(error, OperationType.GET, 'donations')
      );
      unsubscribes.push(unsubDonations);

      // Transactions Listener
      const unsubTx = onSnapshot(
        collection(db, 'transactions'),
        (snapshot) => {
          if (!snapshot.empty) {
            currentDb.transactions = snapshot.docs.map((d) => ({ ...(d.data() as FinancialTransaction), id: d.id }));
            notify();
          }
        },
        (error) => handleFirestoreError(error, OperationType.GET, 'transactions')
      );
      unsubscribes.push(unsubTx);

      // Users Listener
      const unsubUsers = onSnapshot(
        collection(db, 'users'),
        (snapshot) => {
          if (!snapshot.empty) {
            currentDb.users = snapshot.docs.map((d) => ({ ...(d.data() as UserAccount), id: d.id }));
            notify();
          }
        },
        (error) => handleFirestoreError(error, OperationType.GET, 'users')
      );
      unsubscribes.push(unsubUsers);

      // Notifications Listener
      const unsubNotifs = onSnapshot(
        collection(db, 'notifications'),
        (snapshot) => {
          if (!snapshot.empty) {
            currentDb.notifications = snapshot.docs.map((d) => ({ ...(d.data() as any), id: d.id }));
            notify();
          }
        },
        (error) => handleFirestoreError(error, OperationType.GET, 'notifications')
      );
      unsubscribes.push(unsubNotifs);

      // Meta Settings Listener
      const unsubMeta = onSnapshot(
        doc(db, 'meta', 'settings'),
        (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            if (data.adminUser) currentDb.adminUser = data.adminUser;
            if (data.exchangeRate) currentDb.exchangeRate = data.exchangeRate;
            if (data.branchesRef) currentDb.branchesRef = data.branchesRef;
            if (data.gradesRef) currentDb.gradesRef = data.gradesRef;
            if (data.curriculumTracksRef) currentDb.curriculumTracksRef = data.curriculumTracksRef;
            if (data.donationCategoriesRef) currentDb.donationCategoriesRef = data.donationCategoriesRef;
            if (data.expenseItemsRef) currentDb.expenseItemsRef = data.expenseItemsRef;
            notify();
          }
        },
        (error) => handleFirestoreError(error, OperationType.GET, 'meta/settings')
      );
      unsubscribes.push(unsubMeta);
    } catch (e) {
      console.warn('Real-time listeners setup encountered an issue:', e);
    }

    return () => {
      unsubscribes.forEach((unsub) => {
        try {
          unsub();
        } catch (e) {}
      });
    };
  },

  // 3. Seed initial database to Firestore
  async seedInitialDatabase(): Promise<void> {
    try {
      // Chunk writes in batches of max 450 docs (Firestore limit is 500 per batch)
      const batch1 = writeBatch(db);

      // Add meta
      batch1.set(doc(db, 'meta', 'settings'), {
        adminUser: FULL_INITIAL_DATABASE.adminUser,
        exchangeRate: FULL_INITIAL_DATABASE.exchangeRate,
        branchesRef: FULL_INITIAL_DATABASE.branchesRef,
        gradesRef: FULL_INITIAL_DATABASE.gradesRef,
        curriculumTracksRef: FULL_INITIAL_DATABASE.curriculumTracksRef,
        donationCategoriesRef: FULL_INITIAL_DATABASE.donationCategoriesRef,
        expenseItemsRef: FULL_INITIAL_DATABASE.expenseItemsRef,
      });

      // Add Users
      FULL_INITIAL_DATABASE.users.forEach((user) => {
        batch1.set(doc(db, 'users', user.id), user);
      });

      // Add Circles
      FULL_INITIAL_DATABASE.circles.forEach((circle) => {
        batch1.set(doc(db, 'circles', circle.id), circle);
      });

      // Add Teachers
      FULL_INITIAL_DATABASE.teachers.forEach((teacher) => {
        batch1.set(doc(db, 'teachers', teacher.id), teacher);
      });

      // Add Donations
      FULL_INITIAL_DATABASE.donations.forEach((donation) => {
        batch1.set(doc(db, 'donations', donation.id), donation);
      });

      // Add Transactions
      FULL_INITIAL_DATABASE.transactions.forEach((tx) => {
        batch1.set(doc(db, 'transactions', tx.id), tx);
      });

      // Add Schedule
      FULL_INITIAL_DATABASE.scheduleClasses.forEach((sc) => {
        batch1.set(doc(db, 'schedule', sc.id), sc);
      });

      // Add Announcements
      FULL_INITIAL_DATABASE.announcements.forEach((ann) => {
        batch1.set(doc(db, 'announcements', ann.id), ann);
      });

      // Add Activities
      FULL_INITIAL_DATABASE.activities.forEach((act) => {
        batch1.set(doc(db, 'activities', act.id), act);
      });

      // Add Initial Notifications
      if (FULL_INITIAL_DATABASE.notifications) {
        FULL_INITIAL_DATABASE.notifications.forEach((notif) => {
          batch1.set(doc(db, 'notifications', notif.id), notif);
        });
      }

      // Add Students in batch chunks
      const studentChunks: Student[][] = [];
      const chunkSize = 250;
      for (let i = 0; i < FULL_INITIAL_DATABASE.students.length; i += chunkSize) {
        studentChunks.push(FULL_INITIAL_DATABASE.students.slice(i, i + chunkSize));
      }

      // Add first batch with meta and initial students
      if (studentChunks.length > 0) {
        studentChunks[0].forEach((st) => {
          batch1.set(doc(db, 'students', st.id), st);
        });
      }

      await batch1.commit();

      // Commit subsequent student chunks
      for (let i = 1; i < studentChunks.length; i++) {
        const studentBatch = writeBatch(db);
        studentChunks[i].forEach((st) => {
          studentBatch.set(doc(db, 'students', st.id), st);
        });
        await studentBatch.commit();
      }

      console.log('✓ Successfully seeded complete Firestore database with all collections and students');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'seedDatabase');
    }
  },

  // 4. Save entire database state (Meta & references sync)
  async saveDatabase(schema: DatabaseSchema): Promise<boolean> {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(schema));
    try {
      await setDoc(
        doc(db, 'meta', 'settings'),
        {
          adminUser: schema.adminUser,
          exchangeRate: schema.exchangeRate,
          branchesRef: schema.branchesRef,
          gradesRef: schema.gradesRef,
          curriculumTracksRef: schema.curriculumTracksRef,
          donationCategoriesRef: schema.donationCategoriesRef,
          expenseItemsRef: schema.expenseItemsRef,
        },
        { merge: true }
      );
      return true;
    } catch (err) {
      console.warn('Could not save meta to Firestore:', err);
      return false;
    }
  },

  // 5. Student CRUD on Firebase Firestore
  async addStudent(student: Student): Promise<Student> {
    try {
      await setDoc(doc(db, 'students', student.id), student);
      return student;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `students/${student.id}`);
    }
  },

  async updateStudent(id: string, updates: Partial<Student>): Promise<void> {
    try {
      await updateDoc(doc(db, 'students', id), updates);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `students/${id}`);
    }
  },

  async deleteStudent(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'students', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `students/${id}`);
    }
  },

  // 6. Circle CRUD on Firebase Firestore
  async addCircle(circle: AcademicCircle): Promise<AcademicCircle> {
    try {
      await setDoc(doc(db, 'circles', circle.id), circle);
      return circle;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `circles/${circle.id}`);
    }
  },

  async updateCircle(id: string, updates: Partial<AcademicCircle>): Promise<void> {
    try {
      await updateDoc(doc(db, 'circles', id), updates);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `circles/${id}`);
    }
  },

  async deleteCircle(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'circles', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `circles/${id}`);
    }
  },

  // 7. Teacher CRUD on Firebase Firestore
  async addTeacher(teacher: Teacher): Promise<Teacher> {
    try {
      await setDoc(doc(db, 'teachers', teacher.id), teacher);
      return teacher;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `teachers/${teacher.id}`);
    }
  },

  async updateTeacher(id: string, updates: Partial<Teacher>): Promise<void> {
    try {
      await updateDoc(doc(db, 'teachers', id), updates);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `teachers/${id}`);
    }
  },

  async deleteTeacher(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'teachers', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `teachers/${id}`);
    }
  },

  // 8. Donation CRUD on Firebase Firestore
  async addDonation(donation: Donation): Promise<Donation> {
    try {
      await setDoc(doc(db, 'donations', donation.id), donation);
      return donation;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `donations/${donation.id}`);
    }
  },

  async updateDonation(id: string, updates: Partial<Donation>): Promise<void> {
    try {
      await updateDoc(doc(db, 'donations', id), updates);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `donations/${id}`);
    }
  },

  async deleteDonation(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'donations', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `donations/${id}`);
    }
  },

  // 9. Financial Transaction CRUD on Firebase Firestore
  async addTransaction(tx: FinancialTransaction): Promise<FinancialTransaction> {
    try {
      await setDoc(doc(db, 'transactions', tx.id), tx);
      return tx;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `transactions/${tx.id}`);
    }
  },

  async updateTransaction(id: string, updates: Partial<FinancialTransaction>): Promise<void> {
    try {
      await updateDoc(doc(db, 'transactions', id), updates);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `transactions/${id}`);
    }
  },

  async deleteTransaction(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'transactions', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `transactions/${id}`);
    }
  },

  // 10. Announcements CRUD on Firebase Firestore
  async addAnnouncement(ann: Announcement): Promise<Announcement> {
    try {
      await setDoc(doc(db, 'announcements', ann.id), ann);
      return ann;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `announcements/${ann.id}`);
    }
  },

  async deleteAnnouncement(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'announcements', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `announcements/${id}`);
    }
  },

  // 11. Activities CRUD on Firebase Firestore
  async addActivity(activity: Activity): Promise<Activity> {
    try {
      await setDoc(doc(db, 'activities', activity.id), activity);
      return activity;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `activities/${activity.id}`);
    }
  },

  async updateActivity(id: string, updates: Partial<Activity>): Promise<void> {
    try {
      await updateDoc(doc(db, 'activities', id), updates);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `activities/${id}`);
    }
  },

  async deleteActivity(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'activities', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `activities/${id}`);
    }
  },

  // 12. User Accounts CRUD on Firebase Firestore
  async addUser(user: UserAccount): Promise<UserAccount> {
    try {
      await setDoc(doc(db, 'users', user.id), user);
      return user;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `users/${user.id}`);
    }
  },

  async updateUser(id: string, updates: Partial<UserAccount>): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', id), updates);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${id}`);
    }
  },

  async deleteUser(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'users', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${id}`);
    }
  },

  // 13. Notifications CRUD on Firebase Firestore
  async addNotification(notif: NotificationItem): Promise<NotificationItem> {
    try {
      await setDoc(doc(db, 'notifications', notif.id), notif);
      return notif;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `notifications/${notif.id}`);
    }
  },

  async markNotificationAsRead(id: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'notifications', id), { unread: false });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `notifications/${id}`);
    }
  },

  async markAllNotificationsAsRead(notifications: NotificationItem[]): Promise<void> {
    try {
      const batch = writeBatch(db);
      notifications.filter((n) => n.unread).forEach((n) => {
        batch.update(doc(db, 'notifications', n.id), { unread: false });
      });
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'notifications/batchMarkRead');
    }
  },

  async deleteNotification(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'notifications', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `notifications/${id}`);
    }
  },

  async clearAllNotifications(notifications: NotificationItem[]): Promise<void> {
    try {
      const batch = writeBatch(db);
      notifications.forEach((n) => {
        batch.delete(doc(db, 'notifications', n.id));
      });
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'notifications/batchClear');
    }
  },

  // 14. Reset Database to complete initial state in Firebase Firestore
  async resetDatabase(): Promise<DatabaseSchema> {
    await this.seedInitialDatabase();
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(FULL_INITIAL_DATABASE));
    return FULL_INITIAL_DATABASE;
  },

  // 15. Export JSON
  exportDatabase(dbData: DatabaseSchema) {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(dbData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `zad_al_raheel_firebase_db_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  },
};
