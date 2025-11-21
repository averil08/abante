import React, { createContext, useState, useMemo, useEffect } from "react";
import { 
  getAllPatients, 
  updatePatientStatus as updatePatientStatusDB,
  cancelPatient as cancelPatientDB,
  requeuePatient as requeuePatientDB,
  acceptAppointment as acceptAppointmentDB,
  rejectAppointment as rejectAppointmentDB,
  getAvailableSlots as getAvailableSlotsDB,
  subscribeToPatients
} from "./lib/supabaseClient";

export const PatientContext = createContext();

export const PatientProvider = ({ children }) => {
  const [activePatient, setActivePatient] = useState(null);
  const [patients, setPatients] = useState([]);
  const [currentServing, setCurrentServing] = useState(1);
  const [avgWaitTime, setAvgWaitTime] = useState(15);
  const [loading, setLoading] = useState(true);

  // ✅ Load patients from database on mount
  useEffect(() => {
    loadPatients();
    
    // ✅ Subscribe to real-time changes
    const subscription = subscribeToPatients((payload) => {
      console.log('Real-time change:', payload);
      loadPatients(); // Reload patients when changes occur
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // ✅ Load all patients from database
  const loadPatients = async () => {
    try {
      const result = await getAllPatients();
      if (result.success) {
        // Map database fields to frontend format
        const mappedPatients = result.data.map(p => ({
          id: p.id,
          queueNo: p.queue_no,
          name: p.name,
          age: p.age,
          phoneNum: p.phone_num,
          type: p.patient_type === 'walk-in' ? 'Walk-in' : 'Appointment',
          symptoms: p.symptoms || [],
          services: p.services || [],
          status: p.status,
          registeredAt: p.created_at,
          appointmentDateTime: p.appointment_datetime,
          appointmentStatus: p.appointment_status,
          rejectionReason: p.rejection_reason,
          rejectedAt: p.rejected_at,
          inQueue: p.in_queue,
          isPriority: p.is_priority,
          priorityType: p.priority_type,
          requeued: p.requeued,
          originalQueueNo: p.original_queue_no,
          isInactive: p.is_inactive
        }));
        setPatients(mappedPatients);
      }
    } catch (error) {
      console.error('Error loading patients:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Automatically sync activePatient with patients array
  useEffect(() => {
    if (activePatient) {
      // If current activePatient is inactive, find the new requeued version
      if (activePatient.isInactive) {
        const newTicket = patients.find(p => 
          p.requeued && 
          p.originalQueueNo === activePatient.queueNo && 
          !p.isInactive
        );
        if (newTicket) {
          setActivePatient(newTicket);
          return;
        }
      }
      
      // Normal sync for active patients
      const updatedPatient = patients.find(p => p.id === activePatient.id);
      if (updatedPatient && JSON.stringify(updatedPatient) !== JSON.stringify(activePatient)) {
        setActivePatient(updatedPatient);
      }
    }
  }, [patients, activePatient]);

  // ✅ Get available slots (calls backend)
  const getAvailableSlots = async (dateTimeString) => {
    if (!dateTimeString) return 1;
    
    try {
      const slots = await getAvailableSlotsDB(dateTimeString);
      return slots;
    } catch (error) {
      console.error('Error getting available slots:', error);
      return 0;
    }
  };

  // ✅ Add patient (handled by Checkin.jsx calling registerWalkInPatient/registerAppointmentPatient)
  const addPatient = (newPatient) => {
    // This function now just updates local state
    // The actual database insertion happens in Checkin.jsx
    setPatients(prev => [...prev, newPatient]);
  };

  // ✅ Update patient status
  const updatePatientStatus = async (patientId, newStatus) => {
    try {
      const result = await updatePatientStatusDB(patientId, newStatus);
      if (result.success) {
        setPatients(prev =>
          prev.map(p => p.id === patientId ? { ...p, status: newStatus } : p)
        );
      }
      return result;
    } catch (error) {
      console.error('Error updating patient status:', error);
      return { success: false, error: error.message };
    }
  };

  // ✅ Cancel patient
  const cancelPatient = async (patientId) => {
    try {
      const result = await cancelPatientDB(patientId);
      if (result.success) {
        setPatients(prev =>
          prev.map(p => p.id === patientId ? { ...p, status: "cancelled", inQueue: false } : p)
        );
      }
      return result;
    } catch (error) {
      console.error('Error cancelling patient:', error);
      return { success: false, error: error.message };
    }
  };

  // ✅ Accept appointment
  const acceptAppointment = async (queueNo) => {
    try {
      const patient = patients.find(p => p.queueNo === queueNo);
      if (!patient) {
        console.error('Patient not found');
        return { success: false, error: 'Patient not found' };
      }

      const result = await acceptAppointmentDB(patient.id);
      if (result.success) {
        setPatients(prev =>
          prev.map(p => p.id === patient.id ? { 
            ...p, 
            appointmentStatus: "accepted", 
            inQueue: true 
          } : p)
        );
      }
      return result;
    } catch (error) {
      console.error('Error accepting appointment:', error);
      return { success: false, error: error.message };
    }
  };

  // ✅ Reject appointment
  const rejectAppointment = async (queueNo, reason) => {
    try {
      const patient = patients.find(p => p.queueNo === queueNo);
      if (!patient) {
        console.error('Patient not found');
        return { success: false, error: 'Patient not found' };
      }

      const result = await rejectAppointmentDB(patient.id, reason);
      if (result.success) {
        setPatients(prev =>
          prev.map(p => p.id === patient.id ? { 
            ...p, 
            appointmentStatus: "rejected",
            rejectionReason: reason,
            rejectedAt: new Date().toISOString(),
            inQueue: false 
          } : p)
        );
      }
      return result;
    } catch (error) {
      console.error('Error rejecting appointment:', error);
      return { success: false, error: error.message };
    }
  };

  // ✅ Requeue patient
  const requeuePatient = async (queueNo) => {
    try {
      const patient = patients.find(p => p.queueNo === queueNo);
      if (!patient) {
        console.error('Patient not found');
        return { success: false, error: 'Patient not found' };
      }

      const result = await requeuePatientDB(patient.id);
      if (result.success) {
        // Reload patients to get the new ticket
        await loadPatients();
      }
      return result;
    } catch (error) {
      console.error('Error requeuing patient:', error);
      return { success: false, error: error.message };
    }
  };

  // ✅ Call next patient
  const callNextPatient = async () => {
    try {
      // Update current patient to done
      const currentPatient = patients.find(p => p.queueNo === currentServing);
      if (currentPatient) {
        await updatePatientStatus(currentPatient.id, "done");
      }

      // Update next patient to in progress
      const nextPatient = patients.find(p => p.queueNo === currentServing + 1);
      if (nextPatient) {
        await updatePatientStatus(nextPatient.id, "in progress");
      }

      setCurrentServing(prev => prev + 1);
    } catch (error) {
      console.error('Error calling next patient:', error);
    }
  };

  const addWaitTime = () => {
    setAvgWaitTime(prev => prev + 5);
  };

  const queueInfo = useMemo(() => {
    const total = patients.filter(p => p.inQueue && !p.isInactive).length;
    const waitingCount = patients.filter(p => p.status === "waiting" && p.inQueue && !p.isInactive).length;
    return { total, waitingCount, currentServing };
  }, [patients, currentServing]);

  return (
    <PatientContext.Provider value={{
      patients,
      setPatients,
      addPatient,
      currentServing,
      setCurrentServing,
      activePatient,
      setActivePatient,
      updatePatientStatus,
      callNextPatient,
      avgWaitTime,
      addWaitTime,
      queueInfo,
      getAvailableSlots,
      cancelPatient,
      requeuePatient,
      acceptAppointment,
      rejectAppointment,
      loading,
      loadPatients
    }}>
      {children}
    </PatientContext.Provider>
  );
};