import { createClient } from '@supabase/supabase-js';

// Read the variables defined in your .env file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY; 

// Initialize the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============================================
// PATIENT REGISTRATION FUNCTIONS
// ============================================

// Register a walk-in patient
export const registerWalkInPatient = async (patientData) => {
  try {
    const { data, error } = await supabase
      .from('patients')
      .insert([
        {
          name: patientData.name,
          age: parseInt(patientData.age),
          phone_num: patientData.phoneNum,
          physician: patientData.physician || null,
          symptoms: patientData.symptoms || [],
          services: patientData.services || [],
          days_since_onset: patientData.daysSinceOnSet ? parseInt(patientData.daysSinceOnSet) : null,
          patient_type: 'walk-in'
        }
      ])
      .select();

    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (error) {
    console.error('Error registering walk-in patient:', error);
    return { success: false, error: error.message };
  }
};

// Register an appointment patient
export const registerAppointmentPatient = async (patientData, appointmentDateTime) => {
  try {
    // First, create the patient record
    const { data: patientResult, error: patientError } = await supabase
      .from('patients')
      .insert([
        {
          name: patientData.name,
          age: parseInt(patientData.age),
          phone_num: patientData.phoneNum,
          physician: patientData.physician || null,
          symptoms: patientData.symptoms || [],
          services: patientData.services || [],
          days_since_onset: patientData.daysSinceOnSet ? parseInt(patientData.daysSinceOnSet) : null,
          patient_type: 'appointment'
        }
      ])
      .select();

    if (patientError) throw patientError;

    const patient = patientResult[0];

    // Then, create the appointment record
    const { data: appointmentResult, error: appointmentError } = await supabase
      .from('appointments')
      .insert([
        {
          patient_id: patient.id,
          appointment_datetime: appointmentDateTime,
          status: 'scheduled'
        }
      ])
      .select();

    if (appointmentError) throw appointmentError;

    return { 
      success: true, 
      data: {
        patient: patient,
        appointment: appointmentResult[0]
      }
    };
  } catch (error) {
    console.error('Error registering appointment patient:', error);
    return { success: false, error: error.message };
  }
};

// ============================================
// STAFF REGISTRATION FUNCTIONS
// ============================================

// Register clinic staff with authentication
export const registerStaff = async (email, password, staffRole, fullName, companyName, phoneNumber) => {
  try {
    console.log('Attempting to register staff with:', { email, staffRole, fullName, companyName, phoneNumber });
    
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (authError) {
      console.error('Auth error:', authError);
      throw authError;
    }

    console.log('Auth user created successfully:', authData);

    // Insert staff record
    const { data: staffData, error: staffError } = await supabase
      .from('clinic_staff')
      .insert([
        {
          email: email,
          staff_role: staffRole,
          full_name: fullName,
          company_name: companyName,
          phone_number: phoneNumber,
        }
      ])
      .select();

    if (staffError) {
      console.error('Staff insert error:', staffError);
      console.error('Error details:', JSON.stringify(staffError, null, 2));
      throw staffError;
    }

    console.log('Staff record created successfully:', staffData);

    return { 
      success: true, 
      data: staffData[0],
      message: 'Registration successful! Please check your email to verify your account.'
    };
  } catch (error) {
    console.error('Error registering staff:', error);
    console.error('Error message:', error.message);
    console.error('Error details:', error.details);
    console.error('Error hint:', error.hint);
    return { 
      success: false, 
      error: error.message || 'An unknown error occurred',
      details: error.details,
      hint: error.hint
    };
  }
};

// ============================================
// VALIDATION FUNCTIONS
// ============================================

// Check if phone number already exists
export const checkPhoneExists = async (phoneNum) => {
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('phone_num')
      .eq('phone_num', phoneNum)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
  } catch (error) {
    console.error('Error checking phone:', error);
    return false;
  }
};

// Check if appointment slot is available
export const checkAppointmentAvailable = async (appointmentDateTime) => {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('id')
      .eq('appointment_datetime', appointmentDateTime)
      .eq('status', 'scheduled')
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    // Return true if slot is available (no data found)
    return !data;
  } catch (error) {
    console.error('Error checking appointment availability:', error);
    return false;
  }
};

// ============================================
// QUERY FUNCTIONS (for dashboards)
// ============================================

// Get all patients
export const getAllPatients = async () => {
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching patients:', error);
    return { success: false, error: error.message };
  }
};

// Get walk-in patients
export const getWalkInPatients = async () => {
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('patient_type', 'walk-in')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching walk-in patients:', error);
    return { success: false, error: error.message };
  }
};

// Get today's walk-in patients (using the view we created)
export const getTodaysWalkIns = async () => {
  try {
    const { data, error } = await supabase
      .from('todays_walkins')
      .select('*');

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching today\'s walk-ins:', error);
    return { success: false, error: error.message };
  }
};

// Get all appointments
export const getAllAppointments = async () => {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        patients (
          name,
          age,
          phone_num,
          physician,
          symptoms,
          services,
          days_since_onset
        )
      `)
      .order('appointment_datetime', { ascending: true });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return { success: false, error: error.message };
  }
};

// Get upcoming appointments (using the view we created)
export const getUpcomingAppointments = async () => {
  try {
    const { data, error } = await supabase
      .from('upcoming_appointments')
      .select('*');

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching upcoming appointments:', error);
    return { success: false, error: error.message };
  }
};

// Get appointments for a specific date
export const getAppointmentsByDate = async (date) => {
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        patients (
          name,
          age,
          phone_num,
          symptoms,
          services
        )
      `)
      .gte('appointment_datetime', startOfDay.toISOString())
      .lte('appointment_datetime', endOfDay.toISOString())
      .order('appointment_datetime', { ascending: true });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching appointments by date:', error);
    return { success: false, error: error.message };
  }
};

// Search patients by name or phone
export const searchPatients = async (searchTerm) => {
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .or(`name.ilike.%${searchTerm}%,phone_num.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error searching patients:', error);
    return { success: false, error: error.message };
  }
};

// Update appointment status
export const updateAppointmentStatus = async (appointmentId, status) => {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', appointmentId)
      .select();

    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (error) {
    console.error('Error updating appointment status:', error);
    return { success: false, error: error.message };
  }
};

// Get patient statistics (for analytics)
export const getPatientStats = async () => {
  try {
    // Total patients
    const { count: totalPatients, error: totalError } = await supabase
      .from('patients')
      .select('*', { count: 'exact', head: true });

    if (totalError) throw totalError;

    // Walk-in patients
    const { count: walkInCount, error: walkInError } = await supabase
      .from('patients')
      .select('*', { count: 'exact', head: true })
      .eq('patient_type', 'walk-in');

    if (walkInError) throw walkInError;

    // Appointment patients
    const { count: appointmentCount, error: appointmentError } = await supabase
      .from('patients')
      .select('*', { count: 'exact', head: true })
      .eq('patient_type', 'appointment');

    if (appointmentError) throw appointmentError;

    // Today's patients
    const today = new Date().toISOString().split('T')[0];
    const { count: todayCount, error: todayError } = await supabase
      .from('patients')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', `${today}T00:00:00`)
      .lte('created_at', `${today}T23:59:59`);

    if (todayError) throw todayError;

    return {
      success: true,
      data: {
        totalPatients: totalPatients || 0,
        walkInPatients: walkInCount || 0,
        appointmentPatients: appointmentCount || 0,
        todayPatients: todayCount || 0
      }
    };
  } catch (error) {
    console.error('Error fetching patient statistics:', error);
    return { success: false, error: error.message };
  }
};