import React, { createContext, useState, useMemo, useEffect } from "react";

export const PatientContext = createContext();

export const PatientProvider = ({ children }) => {
  const [activePatient, setActivePatient] = useState(null);
  const [patients, setPatients] = useState([
    { queueNo: 1, name: "Jane Doe", age: 26, type: "Walk-in", symptoms: ["Fever", "Cough"], services: ["cbc", "fbs"], phoneNum: "09171234567", status: "done", registeredAt: new Date().toISOString(), inQueue: true },
    { queueNo: 2, name: "Mark Cruz", age: 32, type: "Appointment", symptoms: ["Rashes"], services: ["pedia"], phoneNum: "09181234567", status: "in progress", registeredAt: new Date().toISOString(), appointmentDateTime: new Date(Date.now() + 86400000).toISOString(), appointmentStatus: "accepted", inQueue: true },
    { queueNo: 3, name: "Leah Santos", age: 21, type: "Walk-in", symptoms: ["Headache"], services: ["adult"], phoneNum: "09191234567", status: "waiting", registeredAt: new Date().toISOString(), inQueue: true },
    { queueNo: 4, name: "Analyn Gomez", age: 21, type: "Walk-in", symptoms: ["Headache"], services: ["urinalysis"], phoneNum: "09201234567", status: "waiting", registeredAt: new Date().toISOString(), inQueue: true },
  ]); 

  const [currentServing, setCurrentServing] = useState(2);
  const [avgWaitTime, setAvgWaitTime] = useState(15);

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
      const updatedPatient = patients.find(p => p.queueNo === activePatient.queueNo);
      if (updatedPatient && JSON.stringify(updatedPatient) !== JSON.stringify(activePatient)) {
        setActivePatient(updatedPatient);
      }
    }
  }, [patients, activePatient]);

  const getAvailableSlots = (dateTimeString) => {
    if (!dateTimeString) return 1; // Changed from 5 to 1 slot only
    
    const MAX_SLOTS_PER_TIME = 1; //changed from 5 slots to 1
    const targetDate = new Date(dateTimeString);
    
    const minutes = targetDate.getMinutes();
    targetDate.setMinutes(minutes < 30 ? 0 : 30, 0, 0);
    
    // Count appointments that are NOT rejected (only count pending and accepted)
    const bookedCount = patients.filter(p => {
      if (!p.appointmentDateTime) return false;

      // Don't count rejected appointments
      if (p.appointmentStatus === 'rejected') return false;

      const pDate = new Date(p.appointmentDateTime);
      pDate.setMinutes(pDate.getMinutes() < 30 ? 0 : 30, 0, 0);
      return pDate.getTime() === targetDate.getTime();
    }).length;
    
    return Math.max(0, MAX_SLOTS_PER_TIME - bookedCount);
  };

  //added ispriority and prioritytype
  const addPatient = (newPatient) => {
    setPatients(prev => [
      ...prev,
      { 
        ...newPatient,
        isPriority: newPatient.isPriority || false,
        priorityType: newPatient.priorityType || null,
        queueNo: prev.length + 1, 
        status: newPatient.status || "waiting",
        registeredAt: new Date().toISOString(),
        inQueue: true,
      }
    ]);
  };

  const updatePatientStatus = (queueNo, newStatus) => {
    setPatients(prev =>
      prev.map(p => p.queueNo === queueNo ? { ...p, status: newStatus } : p)
    );
  };

  const cancelPatient = (queueNo) => {
    setPatients(prev =>
      prev.map(p => p.queueNo === queueNo ? { ...p, status: "cancelled" } : p)
    );
  };

  // ✅ Accept appointment - changes status from 'pending' to 'accepted'
  const acceptAppointment = (queueNo) => {
    setPatients(prev =>
      prev.map(p => p.queueNo === queueNo ? { ...p, appointmentStatus: "accepted", inQueue: true } : p)
    );
  };

  // ✅ Updated rejectAppointment function to accept and store the reason
  const rejectAppointment = (queueNo, reason) => {
    setPatients(prev =>
      prev.map(p => p.queueNo === queueNo ? { 
        ...p, 
        appointmentStatus: "rejected", 
        rejectionReason: reason,
        rejectedAt: new Date().toISOString(),
        inQueue: false 
      } : p)
    );
  };

  const requeuePatient = (queueNo) => {
    setPatients(prev => {
      // Find the cancelled patient
      const cancelledPatient = prev.find(p => p.queueNo === queueNo);
      if (!cancelledPatient) return prev;
      
      // Get the highest queue number to assign new ticket
      const maxQueueNo = Math.max(...prev.map(p => p.queueNo));
      const newQueueNo = maxQueueNo + 1;
      
      // Create new patient entry with new queue number
      const newPatient = {
        ...cancelledPatient,
        queueNo: newQueueNo,
        status: "waiting",
        registeredAt: new Date().toISOString(),
        requeued: true,
        originalQueueNo: queueNo,
        inQueue: true,
      };
      
      // Mark old entry as inactive (but keep it in history)
      const updatedPatients = prev.map(p => 
        p.queueNo === queueNo ? { ...p, isInactive: true, inQueue: false } : p
      );
      
      // Add new patient entry at the end
      return [...updatedPatients, newPatient];
    });
  };

  const callNextPatient = () => {
    setPatients(prev =>
      prev.map(p => {
        if (p.queueNo === currentServing) return { ...p, status: "done" };
        if (p.queueNo === currentServing + 1) return { ...p, status: "in progress" };
        return p;
      })
    );
    setCurrentServing(prev => prev + 1);
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
    }}>
      {children}
    </PatientContext.Provider>
  );
};