import fs from 'fs';
import path from 'path';

const envPath = path.join(process.cwd(), '.env');

try {
    if (fs.existsSync(envPath)) {
        console.log('Reading .env...');
        let content = fs.readFileSync(envPath, 'utf8');

        // Check for BOM (Byte Order Mark)
        if (content.charCodeAt(0) === 0xFEFF) {
            console.log('BOM detected! Removing it...');
            content = content.slice(1);
        } else {
            // Check for other weird characters at the start
            // Sometimes Windows adds other invisible chars
            const firstChar = content.substring(0, 1);
            if (!/^[A-Za-z0-9#]/.test(firstChar)) {
                console.log(`Suspicious first character code: ${content.charCodeAt(0)}. Trimming...`);
                // Find the first 'D' for DATABASE_URL
                const index = content.indexOf('DATABASE_URL');
                if (index > -1) {
                    content = content.substring(index);
                }
            }
        }

        fs.writeFileSync(envPath, content, { encoding: 'utf8' });
        console.log('.env file fixed and saved as UTF-8.');
    } else {
        console.log('.env not found.');
    }
} catch (err) {
    console.error('Error fixing .env:', err);
}
