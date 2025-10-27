const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

let db;
let SQL;

async function init() {
  SQL = await initSqlJs();
  
  const dbPath = path.join(__dirname, 'tickets.db');
  
  // Load existing database or create new one
  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
    // Create tables
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
  if (!db) return;
  
  try {
    const dbPath = path.join(__dirname, 'tickets.db');
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  } catch (err) {
    console.error('Error saving database:', err);
  }
}

// Run query with params
function run(sql, params = []) {
  if (!db) return;
  
  if (params.length > 0) {
    // Replace ? with actual values
    let query = sql;
    params.forEach((param) => {
      const value = typeof param === 'string' ? `'${param}'` : param;
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
  params.forEach((param) => {
    const value = typeof param === 'string' ? `'${param}'` : param;
    query = query.replace('?', value);
  });
  
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
  params.forEach((param) => {
    const value = typeof param === 'string' ? `'${param}'` : param;
    query = query.replace('?', value);
  });
  
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
