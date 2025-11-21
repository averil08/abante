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
          patient_type: 'walk-in',
          status: 'waiting',
          is_priority: patientData.isPriority || false,
          priority_type: patientData.priorityType || null,
          in_queue: true
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
          patient_type: 'appointment',
          status: 'waiting',
          appointment_status: 'pending',
          appointment_datetime: appointmentDateTime,
          in_queue: false,
          is_priority: patientData.isPriority || false,
          priority_type: patientData.priorityType || null
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
          status: 'pending'
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
// APPOINTMENT MANAGEMENT FUNCTIONS
// ============================================

// Accept appointment
export const acceptAppointment = async (patientId) => {
  try {
    // Update patient record
    const { data: patientData, error: patientError } = await supabase
      .from('patients')
      .update({ 
        appointment_status: 'accepted',
        in_queue: true 
      })
      .eq('id', patientId)
      .select();

    if (patientError) throw patientError;

    // Update appointment record
    const { data: appointmentData, error: appointmentError } = await supabase
      .from('appointments')
      .update({ status: 'accepted' })
      .eq('patient_id', patientId)
      .select();

    if (appointmentError) throw appointmentError;

    return { 
      success: true, 
      data: { patient: patientData[0], appointment: appointmentData[0] }
    };
  } catch (error) {
    console.error('Error accepting appointment:', error);
    return { success: false, error: error.message };
  }
};

// Reject appointment
export const rejectAppointment = async (patientId, reason) => {
  try {
    // Update patient record
    const { data: patientData, error: patientError } = await supabase
      .from('patients')
      .update({ 
        appointment_status: 'rejected',
        rejection_reason: reason,
        rejected_at: new Date().toISOString(),
        in_queue: false 
      })
      .eq('id', patientId)
      .select();

    if (patientError) throw patientError;

    // Update appointment record
    const { data: appointmentData, error: appointmentError } = await supabase
      .from('appointments')
      .update({ 
        status: 'rejected',
        rejection_reason: reason 
      })
      .eq('patient_id', patientId)
      .select();

    if (appointmentError) throw appointmentError;

    return { 
      success: true, 
      data: { patient: patientData[0], appointment: appointmentData[0] }
    };
  } catch (error) {
    console.error('Error rejecting appointment:', error);
    return { success: false, error: error.message };
  }
};

// ============================================
// PATIENT STATUS MANAGEMENT FUNCTIONS
// ============================================

// Update patient status
export const updatePatientStatus = async (patientId, newStatus) => {
  try {
    const { data, error } = await supabase
      .from('patients')
      .update({ status: newStatus })
      .eq('id', patientId)
      .select();

    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (error) {
    console.error('Error updating patient status:', error);
    return { success: false, error: error.message };
  }
};

// Cancel patient
export const cancelPatient = async (patientId) => {
  try {
    const { data, error } = await supabase
      .from('patients')
      .update({ 
        status: 'cancelled',
        in_queue: false 
      })
      .eq('id', patientId)
      .select();

    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (error) {
    console.error('Error cancelling patient:', error);
    return { success: false, error: error.message };
  }
};

// Requeue patient
export const requeuePatient = async (patientId) => {
  try {
    // Get the original patient data
    const { data: originalPatient, error: fetchError } = await supabase
      .from('patients')
      .select('*')
      .eq('id', patientId)
      .single();

    if (fetchError) throw fetchError;

    // Mark original as inactive
    const { error: updateError } = await supabase
      .from('patients')
      .update({ 
        is_inactive: true,
        in_queue: false 
      })
      .eq('id', patientId);

    if (updateError) throw updateError;

    // Create new patient entry
    const { data: newPatient, error: insertError } = await supabase
      .from('patients')
      .insert([
        {
          name: originalPatient.name,
          age: originalPatient.age,
          phone_num: originalPatient.phone_num,
          physician: originalPatient.physician,
          symptoms: originalPatient.symptoms,
          services: originalPatient.services,
          days_since_onset: originalPatient.days_since_onset,
          patient_type: originalPatient.patient_type,
          status: 'waiting',
          in_queue: true,
          requeued: true,
          original_queue_no: originalPatient.queue_no,
          is_priority: originalPatient.is_priority,
          priority_type: originalPatient.priority_type
        }
      ])
      .select();

    if (insertError) throw insertError;

    return { success: true, data: newPatient[0] };
  } catch (error) {
    console.error('Error requeuing patient:', error);
    return { success: false, error: error.message };
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
    const targetDate = new Date(appointmentDateTime);
    const minutes = targetDate.getMinutes();
    targetDate.setMinutes(minutes < 30 ? 0 : 30, 0, 0);
    
    const { data, error } = await supabase
      .from('patients')
      .select('id')
      .eq('patient_type', 'appointment')
      .neq('appointment_status', 'rejected')
      .gte('appointment_datetime', targetDate.toISOString())
      .lt('appointment_datetime', new Date(targetDate.getTime() + 30 * 60000).toISOString());

    if (error) throw error;
    
    // Return true if slot is available (less than max slots)
    const MAX_SLOTS = 1;
    return (data?.length || 0) < MAX_SLOTS;
  } catch (error) {
    console.error('Error checking appointment availability:', error);
    return false;
  }
};

// Get available slots for a time
export const getAvailableSlots = async (appointmentDateTime) => {
  try {
    const MAX_SLOTS = 1;
    const targetDate = new Date(appointmentDateTime);
    const minutes = targetDate.getMinutes();
    targetDate.setMinutes(minutes < 30 ? 0 : 30, 0, 0);
    
    const { data, error } = await supabase
      .from('patients')
      .select('id')
      .eq('patient_type', 'appointment')
      .neq('appointment_status', 'rejected')
      .gte('appointment_datetime', targetDate.toISOString())
      .lt('appointment_datetime', new Date(targetDate.getTime() + 30 * 60000).toISOString());

    if (error) throw error;
    
    const bookedCount = data?.length || 0;
    return Math.max(0, MAX_SLOTS - bookedCount);
  } catch (error) {
    console.error('Error getting available slots:', error);
    return 0;
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

// Get today's walk-in patients
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
      .from('patients')
      .select('*')
      .eq('patient_type', 'appointment')
      .order('appointment_datetime', { ascending: true });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return { success: false, error: error.message };
  }
};

// Get upcoming appointments
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
      .from('patients')
      .select('*')
      .eq('patient_type', 'appointment')
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

// ============================================
// STAFF REGISTRATION FUNCTIONS
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
// REAL-TIME SUBSCRIPTIONS
// ============================================

// Subscribe to patient changes
export const subscribeToPatients = (callback) => {
  return supabase
    .channel('patients_channel')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'patients' },
      callback
    )
    .subscribe();
};

// Subscribe to appointment changes
export const subscribeToAppointments = (callback) => {
  return supabase
    .channel('appointments_channel')
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'appointments' },
      callback
    )
    .subscribe();
};