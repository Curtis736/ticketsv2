const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

let db;
let SQL;

async function init() {
  SQL = await initSqlJs();
  
  // Create data directory if it doesn't exist
  const dataDir = path.join(__dirname, 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  const dbPath = path.join(dataDir, 'tickets.db');
  
  // Load existing database or create new one
  let shouldCreateTables = false;
  
  if (fs.existsSync(dbPath)) {
    try {
      // Check if it's a directory
      const stats = fs.statSync(dbPath);
      if (stats.isDirectory()) {
        console.log('⚠️ tickets.db is a directory, creating new DB');
        db = new SQL.Database();
        shouldCreateTables = true;
      } else {
        const buffer = fs.readFileSync(dbPath);
        db = new SQL.Database(buffer);
        
        // Check if tables exist
        try {
          db.exec('SELECT 1 FROM users LIMIT 1');
          db.exec('SELECT 1 FROM tickets LIMIT 1');
          console.log('✅ Tables exist in database');
        } catch (err) {
          console.log('📋 Tables do not exist, creating...');
          shouldCreateTables = true;
        }
      }
    } catch (err) {
      console.error('Error reading database file:', err);
      db = new SQL.Database();
      shouldCreateTables = true;
    }
  } else {
    db = new SQL.Database();
    shouldCreateTables = true;
  }
  
    // Create tables if needed
  if (shouldCreateTables) {
    // Create tables with indexes for better performance
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS tickets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        status TEXT DEFAULT 'Ouvert',
        priority TEXT DEFAULT 'Moyenne',
        category TEXT DEFAULT 'Général',
        created_by INTEGER,
        created_by_name TEXT NOT NULL,
        admin_notes TEXT DEFAULT '',
        assigned_to TEXT DEFAULT '',
        tracking_token TEXT,
        tracking_token_expires DATETIME,
        canceled_at DATETIME,
        canceled_reason TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS ticket_files (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ticket_id INTEGER NOT NULL,
        filename TEXT NOT NULL,
        original_name TEXT NOT NULL,
        mime_type TEXT,
        size INTEGER,
        uploaded_by TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Create indexes for better query performance
      CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
      CREATE INDEX IF NOT EXISTS idx_tickets_created_by ON tickets(created_by);
      CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at);
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_ticket_files_ticket_id ON ticket_files(ticket_id);
    `);
    
    // Create default admin user
    const bcrypt = require('bcryptjs');
    const hashedPassword = bcrypt.hashSync('admin', 10);
    
    db.run(`INSERT INTO users (name, email, password, role) VALUES ('Administrateur', 'admin', '${hashedPassword}', 'admin')`);
    
    console.log('✅ Compte admin créé: admin/admin');
    saveDatabase();
  }
  
  ensureTrackingColumns();
  console.log('✅ SQLite (sql.js) database loaded');
}

function ensureTrackingColumns() {
  try {
    const info = db.exec(`PRAGMA table_info('tickets')`);
    const columns = info?.[0]?.values?.map(row => row[1]) || [];
    if (!columns.includes('tracking_token')) {
      db.run(`ALTER TABLE tickets ADD COLUMN tracking_token TEXT`);
    }
    if (!columns.includes('tracking_token_expires')) {
      db.run(`ALTER TABLE tickets ADD COLUMN tracking_token_expires DATETIME`);
    }
    if (!columns.includes('canceled_at')) {
      db.run(`ALTER TABLE tickets ADD COLUMN canceled_at DATETIME`);
    }
    if (!columns.includes('canceled_reason')) {
      db.run(`ALTER TABLE tickets ADD COLUMN canceled_reason TEXT`);
    }

    // Ensure ticket_files table exists even for older databases
    db.run(`
      CREATE TABLE IF NOT EXISTS ticket_files (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ticket_id INTEGER NOT NULL,
        filename TEXT NOT NULL,
        original_name TEXT NOT NULL,
        mime_type TEXT,
        size INTEGER,
        uploaded_by TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_ticket_files_ticket_id ON ticket_files(ticket_id);
    `);
  } catch (err) {
    console.error('Error ensuring tracking columns:', err);
  }
}

// Save database to file
function saveDatabase() {
  if (!db) {
    console.warn('⚠️ Cannot save database: db not initialized');
    return;
  }
  
  try {
    const dataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
      console.log('📁 Created data directory:', dataDir);
    }
    const dbPath = path.join(dataDir, 'tickets.db');
    const data = db.export();
    const buffer = Buffer.from(data);
    
    // Write to temporary file first, then rename (atomic operation)
    const tempPath = dbPath + '.tmp';
    fs.writeFileSync(tempPath, buffer, { flag: 'w' });
    fs.renameSync(tempPath, dbPath);
    
    // Verify file was written
    const stats = fs.statSync(dbPath);
    console.log(`💾 Database saved: ${dbPath} (${stats.size} bytes)`);
  } catch (err) {
    console.error('❌ Error saving database:', err);
    throw err; // Re-throw to alert caller
  }
}

// Run query with params
function run(sql, params = []) {
  if (!db) return;

  const stmt = db.prepare(sql);
  try {
    if (params.length > 0) {
      stmt.run(params);
    } else {
      stmt.run();
    }
  } finally {
    stmt.free();
  }

  saveDatabase();
}

// Get helper
function get(sql, params = []) {
  if (!db) return null;

  const stmt = db.prepare(sql);
  try {
    if (params.length > 0) {
      stmt.bind(params);
    }

    if (!stmt.step()) {
      return null;
    }

    return stmt.getAsObject();
  } finally {
    stmt.free();
  }
}

// All helper
function all(sql, params = []) {
  if (!db) return [];

  const stmt = db.prepare(sql);
  const results = [];

  try {
    if (params.length > 0) {
      stmt.bind(params);
    }

    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
  } finally {
    stmt.free();
  }

  return results;
}

// Initialize once and expose readiness promise
const ready = init().catch(err => {
  console.error('Database init error:', err);
  throw err;
});

module.exports = { run, get, all, saveDatabase, ready };
