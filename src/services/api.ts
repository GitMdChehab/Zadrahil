import {
  AcademicCircle,
  Activity,
  AdminUser,
  Announcement,
  DatabaseSchema,
  Donation,
  FinancialTransaction,
  ScheduleClass,
  Student,
  Teacher,
} from '../types';
import { FULL_INITIAL_DATABASE } from '../data/dbData';

const LOCAL_STORAGE_KEY = 'zad_al_raheel_db_v2';

export const api = {
  // 1. Fetch complete database from server (or fallback to localStorage / initial data)
  async getDatabase(): Promise<DatabaseSchema> {
    try {
      const response = await fetch('/api/db');
      if (response.ok) {
        const json = await response.json();
        if (json.success && json.data) {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(json.data));
          return json.data;
        }
      }
    } catch (err) {
      console.warn('Backend API /api/db not reachable, using local storage cache:', err);
    }

    // Fallback to localStorage or bundled initial data
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
  },

  // 2. Save complete database
  async saveDatabase(db: DatabaseSchema): Promise<boolean> {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(db));
    try {
      const response = await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(db),
      });
      return response.ok;
    } catch (err) {
      console.warn('Could not sync to server /api/db (cached in localStorage):', err);
      return false;
    }
  },

  // 3. Add student
  async addStudent(student: Student): Promise<Student> {
    try {
      const response = await fetch('/api/db/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(student),
      });
      if (response.ok) {
        const json = await response.json();
        if (json.student) return json.student;
      }
    } catch (err) {
      console.warn('API error adding student, handled locally:', err);
    }
    return student;
  },

  // 4. Update student
  async updateStudent(id: string, updates: Partial<Student>): Promise<void> {
    try {
      await fetch(`/api/db/students/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
    } catch (err) {
      console.warn('API error updating student:', err);
    }
  },

  // 5. Delete student
  async deleteStudent(id: string): Promise<void> {
    try {
      await fetch(`/api/db/students/${id}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.warn('API error deleting student:', err);
    }
  },

  // 6. Add circle
  async addCircle(circle: AcademicCircle): Promise<AcademicCircle> {
    try {
      const response = await fetch('/api/db/circles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(circle),
      });
      if (response.ok) {
        const json = await response.json();
        if (json.circle) return json.circle;
      }
    } catch (err) {
      console.warn('API error adding circle:', err);
    }
    return circle;
  },

  // Add activity
  async addActivity(activity: Activity): Promise<Activity> {
    try {
      const response = await fetch('/api/db/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(activity),
      });
      if (response.ok) {
        const json = await response.json();
        if (json.activity) return json.activity;
      }
    } catch (err) {
      console.warn('API error adding activity:', err);
    }
    return activity;
  },

  // 7. Add donation
  async addDonation(donation: Donation): Promise<Donation> {
    try {
      const response = await fetch('/api/db/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(donation),
      });
      if (response.ok) {
        const json = await response.json();
        if (json.donation) return json.donation;
      }
    } catch (err) {
      console.warn('API error adding donation:', err);
    }
    return donation;
  },

  // 8. Add transaction
  async addTransaction(tx: FinancialTransaction): Promise<FinancialTransaction> {
    try {
      const response = await fetch('/api/db/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tx),
      });
      if (response.ok) {
        const json = await response.json();
        if (json.transaction) return json.transaction;
      }
    } catch (err) {
      console.warn('API error adding transaction:', err);
    }
    return tx;
  },

  // 9. Add announcement
  async addAnnouncement(ann: Announcement): Promise<Announcement> {
    try {
      const response = await fetch('/api/db/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ann),
      });
      if (response.ok) {
        const json = await response.json();
        if (json.announcement) return json.announcement;
      }
    } catch (err) {
      console.warn('API error adding announcement:', err);
    }
    return ann;
  },

  // 10. Delete announcement
  async deleteAnnouncement(id: string): Promise<void> {
    try {
      await fetch(`/api/db/announcements/${id}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.warn('API error deleting announcement:', err);
    }
  },

  // 11. Reset Database to initial PDF 294 students
  async resetDatabase(): Promise<DatabaseSchema> {
    try {
      const response = await fetch('/api/db/reset', { method: 'POST' });
      if (response.ok) {
        const json = await response.json();
        if (json.data) {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(json.data));
          return json.data;
        }
      }
    } catch (err) {
      console.warn('API reset failed, restoring from local memory:', err);
    }
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(FULL_INITIAL_DATABASE));
    return FULL_INITIAL_DATABASE;
  },

  // 12. Export and download db.json in browser
  exportDatabase(db: DatabaseSchema) {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(db, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `zad_al_raheel_db_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  },
};
