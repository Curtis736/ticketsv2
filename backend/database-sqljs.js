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
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Create indexes for better query performance
      CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
      CREATE INDEX IF NOT EXISTS idx_tickets_created_by ON tickets(created_by);
      CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at);
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `);
    
    // Create default admin user
    const bcrypt = require('bcryptjs');
    const hashedPassword = bcrypt.hashSync('admin', 10);
    
    db.run(`INSERT INTO users (name, email, password, role) VALUES ('Administrateur', 'admin', '${hashedPassword}', 'admin')`);
    
    console.log('✅ Compte admin créé: admin/admin');
    saveDatabase();
  }
  
  console.log('✅ SQLite (sql.js) database loaded');
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

// Escape strings to prevent SQL injection
function escapeString(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/'/g, "''");
}

// Run query with params
function run(sql, params = []) {
  if (!db) return;
  
  if (params.length > 0) {
    // Replace ? with actual values (properly escaped)
    let query = sql;
    params.forEach((param) => {
      let value;
      if (param === null || param === undefined) {
        value = 'NULL';
      } else if (typeof param === 'string') {
        value = `'${escapeString(param)}'`;
      } else if (typeof param === 'number') {
        value = param;
      } else {
        value = `'${escapeString(String(param))}'`;
      }
      query = query.replace('?', value);
    });
    db.run(query);
  } else {
    db.run(sql);
  }
  saveDatabase();
}

// Get helper
function get(sql, params = []) {
  if (!db) return null;
  
  let query = sql;
  if (params.length > 0) {
    params.forEach((param) => {
      let value;
      if (param === null || param === undefined) {
        value = 'NULL';
      } else if (typeof param === 'string') {
        value = `'${escapeString(param)}'`;
      } else if (typeof param === 'number') {
        value = param;
      } else {
        value = `'${escapeString(String(param))}'`;
      }
      query = query.replace('?', value);
    });
  }
  
  const result = db.exec(query);
  if (result.length > 0 && result[0].values.length > 0) {
    const row = result[0].values[0];
    const obj = {};
    result[0].columns.forEach((col, idx) => {
      obj[col] = row[idx];
    });
    return obj;
  }
  return null;
}

// All helper
function all(sql, params = []) {
  if (!db) return [];
  
  let query = sql;
  if (params.length > 0) {
    params.forEach((param) => {
      let value;
      if (param === null || param === undefined) {
        value = 'NULL';
      } else if (typeof param === 'string') {
        value = `'${escapeString(param)}'`;
      } else if (typeof param === 'number') {
        value = param;
      } else {
        value = `'${escapeString(String(param))}'`;
      }
      query = query.replace('?', value);
    });
  }
  
  const result = db.exec(query);
  if (result.length === 0 || result[0].values.length === 0) return [];
  
  return result[0].values.map(row => {
    const obj = {};
    result[0].columns.forEach((col, idx) => {
      obj[col] = row[idx];
    });
    return obj;
  });
}

// Initialize
init().catch(err => console.error('Database init error:', err));

module.exports = { run, get, all, saveDatabase };
