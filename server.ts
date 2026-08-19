import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { FULL_INITIAL_DATABASE } from './src/data/dbData';
import { DatabaseSchema } from './src/types';

const DB_FILE_PATH = path.join(process.cwd(), 'db.json');

// Initialize db.json if not exists
function loadDatabase(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const data = fs.readFileSync(DB_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(data);
      if (parsed && parsed.students && parsed.students.length > 0) {
        return {
          ...FULL_INITIAL_DATABASE,
          ...parsed,
          exchangeRate: parsed.exchangeRate || FULL_INITIAL_DATABASE.exchangeRate,
          branchesRef: parsed.branchesRef || FULL_INITIAL_DATABASE.branchesRef,
          gradesRef: parsed.gradesRef || FULL_INITIAL_DATABASE.gradesRef,
          curriculumTracksRef: parsed.curriculumTracksRef || FULL_INITIAL_DATABASE.curriculumTracksRef,
          donationCategoriesRef: parsed.donationCategoriesRef || FULL_INITIAL_DATABASE.donationCategoriesRef,
          expenseItemsRef: parsed.expenseItemsRef || FULL_INITIAL_DATABASE.expenseItemsRef,
          users: parsed.users && parsed.users.length > 0 ? parsed.users : FULL_INITIAL_DATABASE.users,
        };
      }
    }
  } catch (err) {
    console.error('Error reading db.json, falling back to initial data:', err);
  }

  // Write default initial database
  saveDatabase(FULL_INITIAL_DATABASE);
  return FULL_INITIAL_DATABASE;
}

function saveDatabase(db: DatabaseSchema): boolean {
  try {
    db.meta = {
      ...db.meta,
      totalStudents: db.students?.length || 0,
      totalTeachers: db.teachers?.length || 0,
      totalCircles: db.circles?.length || 0,
      lastUpdated: new Date().toISOString(),
    };
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(db, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing to db.json:', err);
    return false;
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '20mb' }));

  // Ensure initial db.json exists on disk
  let inMemoryDb = loadDatabase();

  // === REST API ROUTES FOR DB.JSON ===

  // 1. Get full database
  app.get('/api/db', (req, res) => {
    inMemoryDb = loadDatabase();
    res.json({
      success: true,
      data: inMemoryDb,
    });
  });

  // 2. Overwrite full database
  app.post('/api/db', (req, res) => {
    const newDb = req.body;
    if (!newDb || !Array.isArray(newDb.students)) {
      return res.status(400).json({ success: false, message: 'Invalid database payload' });
    }
    inMemoryDb = newDb;
    saveDatabase(inMemoryDb);
    res.json({ success: true, message: 'Database saved successfully to db.json', meta: inMemoryDb.meta });
  });

  // 3. Add Student
  app.post('/api/db/students', (req, res) => {
    inMemoryDb = loadDatabase();
    const student = req.body;
    if (!student.id) {
      student.id = `st-${Date.now()}`;
    }
    inMemoryDb.students = [student, ...inMemoryDb.students];
    saveDatabase(inMemoryDb);
    res.status(201).json({ success: true, student });
  });

  // 4. Update Student
  app.put('/api/db/students/:id', (req, res) => {
    inMemoryDb = loadDatabase();
    const { id } = req.params;
    const updated = req.body;
    const index = inMemoryDb.students.findIndex((s) => s.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    inMemoryDb.students[index] = { ...inMemoryDb.students[index], ...updated };
    saveDatabase(inMemoryDb);
    res.json({ success: true, student: inMemoryDb.students[index] });
  });

  // 5. Delete Student
  app.delete('/api/db/students/:id', (req, res) => {
    inMemoryDb = loadDatabase();
    const { id } = req.params;
    inMemoryDb.students = inMemoryDb.students.filter((s) => s.id !== id);
    saveDatabase(inMemoryDb);
    res.json({ success: true, message: 'Student deleted successfully' });
  });

  // 6. Add Circle
  app.post('/api/db/circles', (req, res) => {
    inMemoryDb = loadDatabase();
    const circle = req.body;
    if (!circle.id) {
      circle.id = `circle-${Date.now()}`;
    }
    inMemoryDb.circles = [...inMemoryDb.circles, circle];
    saveDatabase(inMemoryDb);
    res.status(201).json({ success: true, circle });
  });

  // 7. Add Donation
  app.post('/api/db/donations', (req, res) => {
    inMemoryDb = loadDatabase();
    const donation = req.body;
    if (!donation.id) {
      donation.id = `don-${Date.now()}`;
    }
    inMemoryDb.donations = [donation, ...inMemoryDb.donations];
    
    // Also create corresponding financial transaction
    const exchangeRate = inMemoryDb.exchangeRate?.usdToLbp || 89500;
    const amountUSD = donation.amountUSD || donation.amount || 0;
    const tx = {
      id: `tx-${Date.now()}`,
      date: donation.date || 'اليوم',
      description: `تبرع وارد (${donation.donorName}) - ${donation.category}`,
      category: 'تبرعات' as const,
      amountUSD,
      amountLBP: donation.amountLBP || amountUSD * exchangeRate,
      currency: donation.currency || 'USD',
      status: 'مكتمل' as const,
      type: 'income' as const,
    };
    inMemoryDb.transactions = [tx, ...inMemoryDb.transactions];

    saveDatabase(inMemoryDb);
    res.status(201).json({ success: true, donation, transaction: tx });
  });

  // 8. Add Financial Transaction
  app.post('/api/db/transactions', (req, res) => {
    inMemoryDb = loadDatabase();
    const tx = req.body;
    if (!tx.id) {
      tx.id = `tx-${Date.now()}`;
    }
    inMemoryDb.transactions = [tx, ...inMemoryDb.transactions];
    saveDatabase(inMemoryDb);
    res.status(201).json({ success: true, transaction: tx });
  });

  // 9. Add Announcement
  app.post('/api/db/announcements', (req, res) => {
    inMemoryDb = loadDatabase();
    const ann = req.body;
    if (!ann.id) {
      ann.id = `ann-${Date.now()}`;
    }
    inMemoryDb.announcements = [ann, ...inMemoryDb.announcements];
    saveDatabase(inMemoryDb);
    res.status(201).json({ success: true, announcement: ann });
  });

  // 10. Delete Announcement
  app.delete('/api/db/announcements/:id', (req, res) => {
    inMemoryDb = loadDatabase();
    const { id } = req.params;
    inMemoryDb.announcements = inMemoryDb.announcements.filter((a) => a.id !== id);
    saveDatabase(inMemoryDb);
    res.json({ success: true, message: 'Announcement deleted' });
  });

  // 11. Reset Database to initial PDF dataset (294 students, 30 teachers, 32 circles)
  app.post('/api/db/reset', (req, res) => {
    inMemoryDb = {
      ...FULL_INITIAL_DATABASE,
      meta: {
        ...FULL_INITIAL_DATABASE.meta,
        lastUpdated: new Date().toISOString(),
      },
    };
    saveDatabase(inMemoryDb);
    res.json({ success: true, message: 'Database reset to initial PDF data (294 students)', data: inMemoryDb });
  });

  // 12. Download db.json directly
  app.get('/api/db/download', (req, res) => {
    inMemoryDb = loadDatabase();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=zad_al_raheel_db.json');
    res.send(JSON.stringify(inMemoryDb, null, 2));
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', studentsCount: inMemoryDb.students?.length || 0 });
  });

  // Vite Middleware in development / Static in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Zad Al-Raheel Server running on http://localhost:${PORT}`);
    console.log(`Database loaded with ${inMemoryDb.students?.length || 0} students from db.json`);
  });
}

startServer();
