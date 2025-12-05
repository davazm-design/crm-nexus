import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../data/db.json');
const backupPath = path.join(__dirname, '../data/db.backup.json');

console.log('🧹 Iniciando limpieza de leads...\n');

// 1. Crear backup
console.log('📦 Creando backup...');
const originalData = fs.readFileSync(dbPath, 'utf-8');
fs.writeFileSync(backupPath, originalData);
console.log(`✅ Backup creado: ${backupPath}\n`);

// 2. Leer y parsear datos
const db = JSON.parse(originalData);
const originalCount = db.leads.length;
console.log(`📊 Leads originales: ${originalCount}`);

// 3. Filtrar leads válidos
const validLeads = db.leads.filter(lead => {
    // Un lead es válido si tiene al menos nombre O email O teléfono
    const hasName = lead.name && lead.name.trim() !== '';
    const hasEmail = lead.email && lead.email.trim() !== '';
    const hasPhone = lead.phone && lead.phone.trim() !== '';

    return hasName || hasEmail || hasPhone;
});

const removedCount = originalCount - validLeads.length;
console.log(`✅ Leads válidos: ${validLeads.length}`);
console.log(`🗑️  Leads eliminados: ${removedCount}\n`);

// 4. Guardar datos limpios
db.leads = validLeads;
fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

// 5. Mostrar estadísticas
const newSize = fs.statSync(dbPath).size;
const oldSize = fs.statSync(backupPath).size;
const reduction = ((1 - newSize / oldSize) * 100).toFixed(1);

console.log('📈 Estadísticas:');
console.log(`   Tamaño original: ${(oldSize / 1024 / 1024).toFixed(2)} MB`);
console.log(`   Tamaño nuevo: ${(newSize / 1024 / 1024).toFixed(2)} MB`);
console.log(`   Reducción: ${reduction}%\n`);

console.log('✨ ¡Limpieza completada exitosamente!');
console.log(`💾 Backup disponible en: ${backupPath}`);
