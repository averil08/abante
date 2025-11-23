import React, { createContext, useState, useMemo, useEffect } from "react";
import { 
  getAllPatients, 
  updatePatientStatus as updatePatientStatusDB,
  cancelPatient as cancelPatientDB,
  requeuePatient as requeuePatientDB,
  acceptAppointment as acceptAppointmentDB,
  rejectAppointment as rejectAppointmentDB,
  registerWalkInPatient as registerWalkInPatientDB,
  registerAppointmentPatient as registerAppointmentPatientDB,
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
  const [callingNext, setCallingNext] = useState(false);

  // LocalStorage key and helpers for a quick client-side fallback
  const LOCAL_KEY = 'abante.currentServing';

  const loadLocalCurrentServing = () => {
    try {
      const raw = localStorage.getItem(LOCAL_KEY);
      if (!raw) return null;
      const n = parseInt(raw, 10);
      return Number.isNaN(n) ? null : n;
    } catch (err) {
      return null;
    }
  };

  const saveLocalCurrentServing = (n) => {
    try {
      if (n === null || n === undefined) return;
      localStorage.setItem(LOCAL_KEY, String(n));
    } catch (err) {
      // ignore storage errors
    }
  };

  // Persist-aware setter: accepts either a value or an updater function
  const setCurrentServingPersist = (val) => {
    if (typeof val === 'function') {
      setCurrentServing(prev => {
        const next = val(prev);
        saveLocalCurrentServing(next);
        return next;
      });
    } else {
      setCurrentServing(val);
      saveLocalCurrentServing(val);
    }
  };

  // ✅ Load patients from database on mount
  useEffect(() => {
    // Try to restore a quick client-side pointer for UX while DB loads
    const saved = loadLocalCurrentServing();
    if (saved !== null) setCurrentServing(saved);

    loadPatients();
    
    // ✅ Subscribe to real-time changes (guarded)
    let subscription;
    try {
      subscription = subscribeToPatients((payload) => {
        console.log('Real-time change:', payload);
        loadPatients(); // Reload patients when changes occur
      });
    } catch (err) {
      console.error('Error subscribing to patients:', err);
      subscription = null;
    }

    return () => {
      try {
        if (subscription && typeof subscription.unsubscribe === 'function') {
          subscription.unsubscribe();
        }
      } catch (err) {
        console.error('Error unsubscribing from patients subscription:', err);
      }
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
          isPriority: p.is_priority || false,
          priorityType: p.priority_type || null,
          requeued: p.requeued || false,
          originalQueueNo: p.original_queue_no,
          isInactive: p.is_inactive || false,
          physician: p.physician || null,
          daysSinceOnset: p.days_since_onset || null
        }));
        setPatients(mappedPatients);

        // ✅ ONLY set currentServing and activePatient if there's no active patient yet
        // This prevents overwriting the newly registered patient's session
        if (!activePatient) {
          // Set currentServing based on any "in progress" patient
          const inProgress = mappedPatients.find(p => p.status === 'in progress' && p.inQueue && !p.isInactive);
          if (inProgress) {
            setActivePatient(inProgress);
            setCurrentServingPersist(inProgress.queueNo || 1);
          } else {
            // If none in progress, set currentServing to smallest queued queueNo or keep existing
            const queued = mappedPatients.filter(p => p.inQueue && !p.isInactive && typeof p.queueNo === 'number');
            if (queued.length > 0) {
              const smallest = queued.reduce((min, p) => (p.queueNo < min ? p.queueNo : min), queued[0].queueNo);
              setCurrentServingPersist(prev => prev && prev > 0 ? prev : smallest);
            }
          }
        } else {
          // If there IS an active patient, only update currentServing based on in-progress patients
          // but don't change activePatient
          const inProgress = mappedPatients.find(p => p.status === 'in progress' && p.inQueue && !p.isInactive);
          if (inProgress) {
            setCurrentServingPersist(inProgress.queueNo);
          }
        }
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


// ✅ Register walk-in via Supabase and update local state optimistically

const registerWalkInPatient = async (patientData) => {
    try {
      const result = await registerWalkInPatientDB(patientData);
      if (result.success) {
        const p = result.data;
        const mapped = {
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
        };

        setPatients(prev => [...prev, mapped]);
        setActivePatient(mapped);

      }
      return result;
    } catch (error) {
      console.error('Error registering walk-in patient (context):', error);
      return { success: false, error: error.message };
    }
  };

// ✅ Register appointment via Supabase and update local state
const registerAppointmentPatient = async (patientData, appointmentDateTime) => {
  try {
    const result = await registerAppointmentPatientDB(patientData, appointmentDateTime);
    if (result.success) {
      // Create the patient object directly from the result
      const p = result.data.patient || result.data;
      const newPatient = {
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
        isPriority: p.is_priority || false,
        priorityType: p.priority_type || null,
        requeued: p.requeued || false,
        originalQueueNo: p.original_queue_no,
        isInactive: p.is_inactive || false,
        physician: p.physician || null,
        daysSinceOnset: p.days_since_onset || null
      };
      
      // Set as active patient FIRST
      setActivePatient(newPatient);
      
      // DON'T save the queue number as currentServing - it's the patient's ticket, not what's being called
      
      
      // Then reload all patients in background
      await loadPatients();
    }
    return result;
  } catch (error) {
    console.error('Error registering appointment patient (context):', error);
    return { success: false, error: error.message };
  }
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
        // If cancelling affected the currentServing, persist current value
        const affected = patients.find(p => p.id === patientId);
        if (affected && affected.queueNo) saveLocalCurrentServing(currentServing);
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
        // persist current pointer in case this changed ordering
        saveLocalCurrentServing(currentServing);
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
        saveLocalCurrentServing(currentServing);
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
        // ensure persisted pointer matches DB-derived pointer after reload
        saveLocalCurrentServing(currentServing);
      }
      return result;
    } catch (error) {
      console.error('Error requeuing patient:', error);
      return { success: false, error: error.message };
    }
  };

  // ✅ Call next patient (priority-aware, DB-backed)
  const callNextPatient = async () => {
    if (callingNext) return;
    setCallingNext(true);
    try {
      // Build current queued list (fresh from state)
      const queued = patients
        .filter(p => p.inQueue && !p.isInactive && typeof p.queueNo === 'number')
        .slice() // clone
        .sort((a, b) => {
          const pa = a.isPriority ? 0 : 1;
          const pb = b.isPriority ? 0 : 1;
          if (pa !== pb) return pa - pb; // priority first
          return a.queueNo - b.queueNo; // then FIFO
        });

      if (queued.length === 0) {
        setCallingNext(false);
        return;
      }

      // Mark existing in-progress patient as done (if any)
      const currentlyInProgress = patients.find(p => p.status === 'in progress' && p.inQueue && !p.isInactive);
      if (currentlyInProgress) {
        const resDone = await updatePatientStatus(currentlyInProgress.id, 'done');
        if (!resDone || !resDone.success) {
          console.error('Failed to mark patient done', resDone);
          setCallingNext(false);
          return;
        }
      }

      // Pick the next waiting patient according to priority-first ordering
      const nextPatient = queued.find(p => p.status === 'waiting');

      if (nextPatient) {
        const resNext = await updatePatientStatus(nextPatient.id, 'in progress');
        if (resNext && resNext.success) {
          setActivePatient(nextPatient);
          setCurrentServingPersist(nextPatient.queueNo);
        } else {
          console.error('Failed to set next patient in progress', resNext);
        }
      } else {
        // No waiting patient found: advance pointer locally
        setCurrentServingPersist(prev => (typeof prev === 'number' ? prev + 1 : (currentServing || 0) + 1));
        setActivePatient(null);
      }
    } catch (error) {
      console.error('Error calling next patient:', error);
    } finally {
      setCallingNext(false);
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
      registerWalkInPatient,
      registerAppointmentPatient,
      currentServing,
      setCurrentServing: setCurrentServingPersist,
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