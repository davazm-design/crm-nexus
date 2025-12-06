import fs from 'fs/promises';
import path from 'path';
import { DB, Lead, Message } from '@/types';
import { prisma } from './prisma';

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// --- FILE SYSTEM IMPLEMENTATION (LOCAL) ---
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'db.json');
const BACKUP_PATH = path.join(DATA_DIR, 'db.backup.json');

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
        if (error.code === 'ENOENT') return { leads: [], settings: {} };
        console.error('CRITICAL: db.json corrupt. Reading backup...', error);
        try {
            const backupData = await fs.readFile(BACKUP_PATH, 'utf-8');
            return JSON.parse(backupData);
        } catch {
            throw new Error('Database corruption detected.');
        }
    }
}

async function writeDB(data: DB): Promise<void> {
    await ensureDataDir();
    try {
        try {
            const currentData = await fs.readFile(DB_PATH, 'utf-8');
            await fs.writeFile(BACKUP_PATH, currentData, 'utf-8');
        } catch { }
        await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
        console.error('Failed to write DB', error);
        throw error;
    }
}

// --- HYBRID EXPORTS ---

export async function getLeads(): Promise<Lead[]> {
    console.log('🔍 getLeads called. NODE_ENV:', process.env.NODE_ENV, 'IS_PRODUCTION:', IS_PRODUCTION);

    // Force Prisma in production OR when DATABASE_URL is set
    const usePrisma = IS_PRODUCTION || process.env.DATABASE_URL;

    if (usePrisma) {
        try {
            console.log('📦 Using Prisma to fetch leads...');
            const leads = await prisma.lead.findMany({
                include: { history: true },
                orderBy: { createdAt: 'desc' }
            });
            console.log(`✅ Prisma returned ${leads.length} leads`);
            return leads as unknown as Lead[];
        } catch (error) {
            console.error('❌ Error fetching leads from Prisma:', error);
            throw error;
        }
    } else {
        const db = await readDB();
        return db.leads;
    }
}

export async function addLead(lead: Lead): Promise<Lead> {
    if (IS_PRODUCTION) {
        // Prisma create
        const { history, ...leadData } = lead;
        const newLead = await prisma.lead.create({
            data: {
                ...leadData,
                // Handle history creation if any exists initially
                history: {
                    create: history.map(msg => ({
                        content: msg.content,
                        sender: msg.sender,
                        timestamp: new Date(msg.timestamp) // Ensure Date type
                    }))
                }
            },
            include: { history: true }
        });
        return newLead as unknown as Lead;
    } else {
        const db = await readDB();
        db.leads.push(lead);
        await writeDB(db);
        return lead;
    }
}

export async function updateLead(id: string, updates: Partial<Lead>): Promise<Lead | null> {
    if (IS_PRODUCTION) {
        try {
            // Separate history from other updates as it's a relation
            const { history, ...scalarUpdates } = updates;

            const updatedLead = await prisma.lead.update({
                where: { id },
                data: scalarUpdates,
                include: { history: true }
            });
            return updatedLead as unknown as Lead;
        } catch (error) {
            return null;
        }
    } else {
        const db = await readDB();
        const index = db.leads.findIndex((l) => l.id === id);
        if (index === -1) return null;

        const currentLead = db.leads[index];
        const updatedLead = { ...currentLead, ...updates };

        db.leads[index] = updatedLead;
        await writeDB(db);
        return updatedLead;
    }
}

export async function deleteLead(id: string): Promise<boolean> {
    if (IS_PRODUCTION) {
        try {
            await prisma.lead.delete({ where: { id } });
            return true;
        } catch {
            return false;
        }
    } else {
        const db = await readDB();
        const initialLength = db.leads.length;
        const newLeads = db.leads.filter((l) => l.id !== id);

        if (newLeads.length === initialLength) return false;

        db.leads = newLeads;
        await writeDB(db);
        return true;
    }
}

export async function seedDB(initialData: DB): Promise<void> {
    if (IS_PRODUCTION) {
        // Optional: Implement seeding for Prisma if needed
        console.log('Seeding not implemented for production yet');
    } else {
        await writeDB(initialData);
    }
}
