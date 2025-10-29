const db = require('../database-sqljs');

const Ticket = {
  findAll() {
    return db.all(`
      SELECT 
        t.*,
        COALESCE(u.name, t.created_by_name) as creator_name,
        u.email as creator_email
      FROM tickets t
      LEFT JOIN users u ON t.created_by = u.id
      ORDER BY t.created_at DESC
    `);
  },

  findById(id) {
    return db.get('SELECT t.*, u.name as creator_name, u.email as creator_email FROM tickets t LEFT JOIN users u ON t.created_by = u.id WHERE t.id = ?', [id]);
  },

  findByUser(userId) {
    return db.all('SELECT * FROM tickets WHERE created_by = ? ORDER BY created_at DESC', [userId]);
  },

  create({ title, description, priority, category, created_by, created_by_name }) {
    console.log('Ticket.create called with:', { title, description, priority, category, created_by, created_by_name });
    
    try {
      // Insert ticket
      db.run(`
        INSERT INTO tickets (title, description, priority, category, created_by, created_by_name)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [title, description, priority, category, created_by, created_by_name]);
      
      console.log('INSERT successful');
      
      // Force save to disk immediately
      const { saveDatabase } = require('../database-sqljs');
      saveDatabase();
      console.log('✅ Database saved to disk');
      
      // Get last insert id
      const result = db.get('SELECT last_insert_rowid() as id');
      console.log('Last insert ID:', result);
      console.log('Result as ID:', result?.id);
      
      // Alternative: Query by order to get the last inserted ticket
      const allTickets = db.all('SELECT * FROM tickets ORDER BY id DESC LIMIT 1');
      console.log('Last ticket from query:', allTickets);
      
      if (allTickets && allTickets.length > 0) {
        const ticket = allTickets[0];
        console.log('Returning ticket:', ticket);
        
        // Verify ticket exists in DB by querying again
        const verifyTicket = db.get('SELECT * FROM tickets WHERE id = ?', [ticket.id]);
        if (verifyTicket) {
          console.log('✅ Ticket verified in database, ID:', ticket.id);
        } else {
          console.error('⚠️ WARNING: Ticket not found after insertion!');
        }
        
        return ticket;
      }
      
      // Fallback: construct ticket manually
      const ticket = {
        id: result?.id || null,
        title,
        description,
        priority,
        category,
        created_by,
        created_by_name,
        status: 'Ouvert',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log('Fallback ticket:', ticket);
      return ticket;
    } catch (err) {
      console.error('Error in Ticket.create:', err);
      throw err;
    }
  },

  update(id, data) {
    // Map frontend fields to database columns
    const setStatements = [];
    const values = [];
    
    // Handle status
    if (data.status !== undefined && data.status !== null) {
      setStatements.push('status = ?');
      values.push(data.status);
    }
    
    // Handle adminNotes (convert to admin_notes)
    if (data.adminNotes !== undefined && data.adminNotes !== null) {
      setStatements.push('admin_notes = ?');
      values.push(data.adminNotes);
    }
    
    // Handle priority
    if (data.priority !== undefined && data.priority !== null) {
      setStatements.push('priority = ?');
      values.push(data.priority);
    }
    
    // Handle category
    if (data.category !== undefined && data.category !== null) {
      setStatements.push('category = ?');
      values.push(data.category);
    }
    
    // Handle title
    if (data.title !== undefined && data.title !== null) {
      setStatements.push('title = ?');
      values.push(data.title);
    }
    
    // Handle description
    if (data.description !== undefined && data.description !== null) {
      setStatements.push('description = ?');
      values.push(data.description);
    }
    
    if (setStatements.length === 0) return this.findById(id);
    
    // Add updated_at
    setStatements.push('updated_at = datetime(\'now\')');
    
    // Add id for WHERE clause
    values.push(id);
    
    const sql = `UPDATE tickets SET ${setStatements.join(', ')} WHERE id = ?`;
    db.run(sql, values);
    
    return this.findById(id);
  },

  delete(id) {
    db.run('DELETE FROM tickets WHERE id = ?', [id]);
    return { changes: 1 };
  }
};

module.exports = Ticket;
