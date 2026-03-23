import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { doctors } from './src/doctorData.js';

// Parse .env file manually so we don't need the dotenv package
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '.env');

if (!fs.existsSync(envPath)) {
  console.error("Error: .env file not found.");
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let key = match[1];
    let value = match[2] || '';
    // remove quotes from value
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    } else if (value.startsWith("'") && value.endsWith("'")) {
      value = value.slice(1, -1);
    }
    envVars[key] = value;
  }
});

const supabaseUrl = envVars['VITE_SUPABASE_URL'];
const supabaseServiceKey = envVars['VITE_SUPABASE_SERVICE_ROLE_KEY'] || envVars['VITE_SUPABASE_ANON_KEY'];

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Error: Missing VITE_SUPABASE_URL or the API Key in .env");
  process.exit(1);
}

// Using the service key (if provided) bypasses RLS policies so the script can write securely.
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function syncDoctorsToSupabase() {
  console.log("Starting doctors sync process mapped from doctorData.js...");
  
  // Transform doctors array from doctorData.js
  const doctorRows = doctors.map(d => ({
    id: d.id,
    name: d.name,
    specializations: d.specializations,
    is_active: d.is_active !== undefined ? d.is_active : true,
    created_at: d.created_at || new Date().toISOString()
  }));

  console.log(`Found ${doctorRows.length} total active doctors to sync.`);

  // Verify the doctors table exists
  const { data: currentDoctors, error: fetchError } = await supabase
    .from('doctors')
    .select('id');
  
  if (fetchError) {
    if (fetchError.code === '42P01') {
      console.error("Failure: The 'doctors' table does not exist in Supabase yet. Please make sure the table has been seeded before syncing!");
      process.exit(1);
    }
    console.error("Error fetching current doctors from Supabase:", fetchError.message);
    process.exit(1);
  }

  // 1. Calculate the difference (who needs to be dropped)
  const validIds = doctorRows.map(d =>   d.id);
  const idsToDelete = currentDoctors
      .map(d => d.id)
      .filter(id => !validIds.includes(id));
      
  if (idsToDelete.length > 0) {
    console.log(`Deleting obsolete or archived doctors with IDs: ${idsToDelete.join(', ')}...`);
    const { error: deleteError } = await supabase
        .from('doctors')
        .delete()
        .in('id', idsToDelete);
        
    if (deleteError) {
      console.error("Error deleting old doctors:", deleteError.message);
    } else {
      console.log("Successfully removed obsolete doctors.");
    }
  } else {
    console.log("No obsolete doctors to delete.");
  }

  // 2. Upsert (Insert or Update exactly matching ID sequences)
  console.log("Upserting the active doctors to sync the database with doctorData.js...");
  const { error: upsertError } = await supabase
      .from('doctors')
      .upsert(doctorRows, { onConflict: 'id' });
      
  if (upsertError) {
    console.error("Error upserting active doctors:", upsertError.message);
  } else {
    console.log("Success! The 'doctors' table has been fully synchronized with doctorData.js.");
  }
}

syncDoctorsToSupabase();
