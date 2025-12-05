import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as XLSX from 'xlsx';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ruta al archivo Excel que quieres analizar
// Cambia esto por la ruta de tu archivo
const excelFilePath = process.argv[2];

if (!excelFilePath) {
    console.log('❌ Por favor proporciona la ruta del archivo Excel');
    console.log('Uso: node scripts/analyze-excel.js <ruta-del-archivo>');
    process.exit(1);
}

if (!fs.existsSync(excelFilePath)) {
    console.log(`❌ El archivo no existe: ${excelFilePath}`);
    process.exit(1);
}

console.log('📊 Analizando archivo Excel...\n');

try {
    const buffer = fs.readFileSync(excelFilePath);
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rawData = XLSX.utils.sheet_to_json(sheet);

    console.log(`📄 Hoja: ${sheetName}`);
    console.log(`📝 Total de filas: ${rawData.length}\n`);

    if (rawData.length > 0) {
        const firstRow = rawData[0];
        const columns = Object.keys(firstRow);

        console.log('🔍 Columnas detectadas:');
        console.log('━'.repeat(60));
        columns.forEach((col, index) => {
            const value = firstRow[col];
            console.log(`${index + 1}. "${col}"`);
            console.log(`   Valor ejemplo: "${value}"`);
            console.log(`   Tipo: ${typeof value}`);
            console.log('');
        });

        console.log('━'.repeat(60));
        console.log('\n📋 Primera fila completa:');
        console.log(JSON.stringify(firstRow, null, 2));

        console.log('\n💡 Sugerencias de mapeo:');
        columns.forEach(col => {
            const lowerCol = col.toLowerCase();
            if (/name|nombre/i.test(col)) {
                console.log(`✅ "${col}" → Parece ser NOMBRE`);
            } else if (/email|correo|mail/i.test(col)) {
                console.log(`✅ "${col}" → Parece ser EMAIL`);
            } else if (/phone|telefono|teléfono|celular/i.test(col)) {
                console.log(`✅ "${col}" → Parece ser TELÉFONO`);
            } else if (/campaign|campaña|source|origen/i.test(col)) {
                console.log(`✅ "${col}" → Parece ser CAMPAÑA/ORIGEN`);
            } else {
                console.log(`❓ "${col}" → Columna desconocida`);
            }
        });
    }
} catch (error) {
    console.error('❌ Error al analizar el archivo:', error.message);
    process.exit(1);
}
