import fs from 'fs/promises';
import path from 'path';
import { DB, Lead } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'db.json');
const BACKUP_PATH = path.join(DATA_DIR, 'db.backup.json');

// Ensure data directory exists
async function ensureDataDir() {
    try {
        await fs.access(DATA_DIR);
    } catch {
        await fs.mkdir(DATA_DIR, { recursive: true });
    }
}

async function readDB(): Promise<DB> {
    await ensureDataDir();
    try {
        const data = await fs.readFile(DB_PATH, 'utf-8');
        return JSON.parse(data);
    } catch (error: any) {
        if (error.code === 'ENOENT') {
            // File doesn't exist, return default structure
            return { leads: [], settings: {} };
        }
        // If JSON is corrupt, try to read backup
        console.error('CRITICAL: db.json is corrupt. Attempting to read backup...', error);
        try {
            const backupData = await fs.readFile(BACKUP_PATH, 'utf-8');
            return JSON.parse(backupData);
        } catch (backupError) {
            console.error('CRITICAL: Backup also failed. Returning empty DB to prevent crash, but data might be lost.', backupError);
            throw new Error('Database corruption detected and backup failed.');
        }
    }
}

async function writeDB(data: DB): Promise<void> {
    await ensureDataDir();
    try {
        // 1. Create backup of current state if it exists
        try {
            const currentData = await fs.readFile(DB_PATH, 'utf-8');
            await fs.writeFile(BACKUP_PATH, currentData, 'utf-8');
        } catch (error: any) {
            if (error.code !== 'ENOENT') console.warn('Warning: Could not create backup', error);
        }

        // 2. Write new data
        await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
        console.error('Failed to write to database', error);
        throw error;
    }
}

export async function getLeads(): Promise<Lead[]> {
    const db = await readDB();
    return db.leads;
}

export async function addLead(lead: Lead): Promise<Lead> {
    // Simple mutex-like behavior: read -> modify -> write immediately
    // In a real SaaS, the DB handles concurrency. Here we minimize the window.
    const db = await readDB();
    db.leads.push(lead);
    await writeDB(db);
    return lead;
}

export async function updateLead(id: string, updates: Partial<Lead>): Promise<Lead | null> {
    const db = await readDB();
    const index = db.leads.findIndex((l) => l.id === id);
    if (index === -1) return null;

    // Merge updates
    const currentLead = db.leads[index];
    const updatedLead = { ...currentLead, ...updates };

    db.leads[index] = updatedLead;
    await writeDB(db);
    return updatedLead;
}

export async function deleteLead(id: string): Promise<boolean> {
    const db = await readDB();
    const initialLength = db.leads.length;
    const newLeads = db.leads.filter((l) => l.id !== id);

    if (newLeads.length === initialLength) return false;

    db.leads = newLeads;
    await writeDB(db);
    return true;
}

export async function seedDB(initialData: DB): Promise<void> {
    await writeDB(initialData);
}
