// supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// Read the variables defined in your .env file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Initialize Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============================================
// HELPER FUNCTIONS
// ============================================

// Generate next queue number
const getNextQueueNo = async () => {
  try {
    const { data: lastPatient, error } = await supabase
      .from('patients')
      .select('queue_number')
      .order('queue_number', { ascending: false })
      .limit(1)
      .single();

    if (error) return 1;
    return lastPatient ? lastPatient.queue_number + 1 : 1;
  } catch (error) {
    console.error("Error fetching last queue number:", error);
    return 1;
  }
};

// ============================================
// PATIENT FUNCTIONS
// ============================================

// Register a walk-in patient
export const registerWalkInPatient = async (formData) => {
  try {
    const nextQueueNo = await getNextQueueNo();
    const { data, error } = await supabase
      .from('patients')
      .insert([{
        name: formData.name,
        age: parseInt(formData.age),
        phone_num: formData.phoneNum,
        physician: formData.physician || null,
        symptoms: formData.symptoms || [],
        services: formData.services || [],
        patient_type: 'walk-in',
        status: 'waiting',
        queue_number: nextQueueNo,
        days_since_onset: formData.daysSinceOnSet ? parseInt(formData.daysSinceOnSet) : null,
        created_at: new Date(),
      }])
      .select();

    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (error) {
    console.error('Error registering walk-in patient:', error);
    return { success: false, error: error.message };
  }
};

// Register an appointment patient
export const registerAppointmentPatient = async (formData, appointmentDateTime) => {
  try {
    const nextQueueNo = await getNextQueueNo();
    const { data, error } = await supabase
      .from('patients')
      .insert([{
        name: formData.name,
        age: parseInt(formData.age),
        phone_num: formData.phoneNum,
        physician: formData.physician || null,
        symptoms: formData.symptoms || [],
        services: formData.services || [],
        patient_type: 'appointment',
        status: 'waiting',
        queue_number: nextQueueNo,
        appointment_datetime: appointmentDateTime,
        days_since_onset: formData.daysSinceOnSet ? parseInt(formData.daysSinceOnSet) : null,
        created_at: new Date(),
      }])
      .select();

    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (error) {
    console.error('Error registering appointment patient:', error);
    return { success: false, error: error.message };
  }
};

// Check if phone number exists
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
      .from('patients')
      .select('id')
      .eq('appointment_datetime', appointmentDateTime);

    if (error) throw error;
    return data.length === 0;
  } catch (error) {
    console.error(error);
    return false;
  }
};

// Update patient status
export const updatePatientStatus = async (patientId, status) => {
  try {
    const { data, error } = await supabase
      .from('patients')
      .update({ status })
      .eq('id', patientId)
      .select();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ============================================
// STAFF FUNCTIONS
// ============================================

// Register clinic staff with authentication
export const registerStaff = async (email, password, staffRole) => {
  try {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (authError) throw authError;

    // Insert staff record
    const { data: staffData, error: staffError } = await supabase
      .from('clinic_staff')
      .insert([
        {
          email: email,
          staff_role: staffRole,
        }
      ])
      .select();

    if (staffError) throw staffError;

    return { 
      success: true, 
      data: staffData[0],
      message: 'Registration successful! Please check your email to verify your account.'
    };
  } catch (error) {
    console.error('Error registering staff:', error);
    return { success: false, error: error.message };
  }
};

// ============================================
// DASHBOARD FUNCTIONS
// ============================================

// Get all patients
export const getAllPatients = async () => {
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .order('queue_number', { ascending: true });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching patients:", error);
    return { success: false, error: error.message };
  }
};

// Get patient statistics
export const getPatientStats = async () => {
  try {
    const { data: allPatients, error } = await supabase
      .from('patients')
      .select('*');

    if (error || !allPatients) return {};

    const totalPatients = allPatients.length;
    const walkInPatients = allPatients.filter(p => p.patient_type === 'walk-in').length;
    const appointmentPatients = allPatients.filter(p => p.patient_type === 'appointment').length;
    
    const today = new Date().toISOString().split('T')[0]; // yyyy-mm-dd
    const todayPatients = allPatients.filter(p => {
      const date = p.created_at || p.appointment_datetime;
      return date && date.startsWith(today);
    }).length;

    return { totalPatients, walkInPatients, appointmentPatients, todayPatients };
  } catch (error) {
    console.error("Error fetching patient stats:", error);
    return {};
  }
};
