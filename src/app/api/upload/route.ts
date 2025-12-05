import { NextResponse } from 'next/server';
import { getLeads, addLead } from '@/lib/db';
import { Lead } from '@/types';
import * as XLSX from 'xlsx';
import { normalizeName, normalizePhone, isDuplicate } from '@/lib/cleaner';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rawData = XLSX.utils.sheet_to_json(sheet);

        const existingLeads = await getLeads();
        let addedCount = 0;
        let duplicateCount = 0;

        for (const row of rawData as any[]) {
            // Get all keys from the row
            const keys = Object.keys(row);

            // DEBUG: Log first row to see what we're working with
            if (rawData.indexOf(row) === 0) {
                console.log('🔍 DEBUG - Primera fila del Excel:');
                console.log('Columnas detectadas:', keys);
                console.log('Datos:', row);
            }

            // Helper function to normalize column names for flexible matching
            const normalizeKey = (key: string) => key.trim().toLowerCase().replace(/\s+/g, '_');

            // Try to find name field (more flexible - uses partial matching)
            const nameKey = keys.find(k => {
                const normalized = normalizeKey(k);
                return normalized.includes('name') || normalized.includes('nombre');
            });

            // Try to find email field
            const emailKey = keys.find(k => {
                const normalized = normalizeKey(k);
                return normalized.includes('email') || normalized.includes('correo') || normalized.includes('mail');
            });

            // Try to find phone field
            const phoneKey = keys.find(k => {
                const normalized = normalizeKey(k);
                return normalized.includes('phone') || normalized.includes('telefono') ||
                    normalized.includes('teléfono') || normalized.includes('celular') ||
                    normalized.includes('móvil') || normalized.includes('movil');
            });

            // Try to find source/campaign field
            const sourceKey = keys.find(k => {
                const normalized = normalizeKey(k);
                return normalized.includes('campaign') || normalized.includes('campaña') ||
                    normalized.includes('source') || normalized.includes('origen') ||
                    normalized.includes('platform') || normalized.includes('plataforma') ||
                    normalized.includes('company') || normalized.includes('empresa');
            });

            // DEBUG: Log what keys were found
            if (rawData.indexOf(row) === 0) {
                console.log('🔍 DEBUG - Mapeo de columnas:');
                console.log('nameKey:', nameKey, '→', nameKey ? row[nameKey] : 'NO ENCONTRADO');
                console.log('emailKey:', emailKey, '→', emailKey ? row[emailKey] : 'NO ENCONTRADO');
                console.log('phoneKey:', phoneKey, '→', phoneKey ? row[phoneKey] : 'NO ENCONTRADO');
                console.log('sourceKey:', sourceKey, '→', sourceKey ? row[sourceKey] : 'NO ENCONTRADO');
            }

            // Extract values
            let name = nameKey ? String(row[nameKey] || '') : '';
            let email = emailKey ? String(row[emailKey] || '') : '';
            let phone = phoneKey ? String(row[phoneKey] || '') : '';
            const source = sourceKey ? String(row[sourceKey] || 'Imported') : 'Imported';

            // Smart detection: If name is empty but email looks like a name, swap them
            if (!name && email && !email.includes('@')) {
                name = email;
                email = '';
            }

            // If we still don't have a name, try the first non-empty value
            if (!name && !email && !phone) {
                const firstValue = keys.find(k => row[k] && String(row[k]).trim());
                if (firstValue) {
                    const value = String(row[firstValue]);
                    if (value.includes('@')) {
                        email = value;
                    } else {
                        name = value;
                    }
                }
            }

            const cleanName = normalizeName(name);
            const cleanPhone = normalizePhone(phone);

            const newLead: Partial<Lead> = {
                name: cleanName,
                email: email.trim(),
                phone: cleanPhone,
                source: source,
            };

            if (isDuplicate(newLead, existingLeads)) {
                duplicateCount++;
                continue;
            }

            const lead: Lead = {
                id: crypto.randomUUID(),
                name: cleanName,
                email: email.trim(),
                phone: cleanPhone,
                source: source,
                createdAt: new Date().toISOString(),
                status: 'new',
                tags: ['importado'],
                observations: '',
                history: [],
            };

            await addLead(lead);
            addedCount++;
        }

        return NextResponse.json({ added: addedCount, duplicates: duplicateCount });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
