const db = require('../database-sqljs');

(async () => {
  try {
    console.log('🔄 Mise à jour de tous les tickets en "Résolu"...');

    // Attendre que la base soit prête
    if (db.ready && typeof db.ready.then === 'function') {
      await db.ready;
    }

    db.run("UPDATE tickets SET status = 'Résolu'");
    console.log('✅ Tous les tickets ont été passés au statut "Résolu".');
  } catch (err) {
    console.error('❌ Erreur lors de la mise à jour des tickets :', err);
    // Laisser Node définir le code de sortie sans forcer l'arrêt brutal du loop libuv
    process.exitCode = 1;
  }
})();


