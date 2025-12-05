import fs from 'fs';
import path from 'path';

try {
    const envPath = path.join(process.cwd(), '.env');
    console.log('Checking file:', envPath);

    if (!fs.existsSync(envPath)) {
        console.log('ERROR: .env file not found');
        process.exit(1);
    }

    const envContent = fs.readFileSync(envPath, 'utf-8');
    console.log('File size:', envContent.length, 'bytes');

    const lines = envContent.split('\n');
    console.log('Total lines:', lines.length);

    lines.forEach((line, index) => {
        const trimmed = line.trim();
        if (trimmed) {
            const parts = trimmed.split('=');
            const key = parts[0].trim();
            console.log(`Line ${index + 1}: Found key "${key}"`);

            if (key === 'DATABASE_URL') {
                const value = parts.slice(1).join('=').trim();
                console.log('  -> Value starts with:', value.substring(0, 15) + '...');
                console.log('  -> Value length:', value.length);
            }
        }
    });

} catch (e) {
    console.error('Error reading .env:', e);
}
