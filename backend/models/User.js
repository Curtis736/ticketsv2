const db = require('../database-sqljs');

const User = {
  findAll() {
    return db.all('SELECT id, name, email, role, created_at FROM users ORDER BY id DESC');
  },

  findById(id) {
    return db.get('SELECT id, name, email, password, role FROM users WHERE id = ?', [id]);
  },

  findByEmail(email) {
    return db.get('SELECT * FROM users WHERE email = ?', [email]);
  },

  create({ name, email, password, role = 'user' }) {
    db.run('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', [name, email, password, role]);
    db.saveDatabase();
    return this.findByEmail(email);
  },

  update(id, data) {
    const fields = [];
    const values = [];
    
    Object.keys(data).forEach(key => {
      if (key !== 'id') {
        fields.push(`${key} = ?`);
        values.push(data[key]);
      }
    });
    
    if (fields.length === 0) return this.findById(id);
    
    values.push(id);
    db.run(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
    db.saveDatabase();
    
    return this.findById(id);
  }
};

module.exports = User;
