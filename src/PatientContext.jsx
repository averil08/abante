import React, { createContext, useState, useMemo } from "react";

export const PatientContext = createContext();

export const PatientProvider = ({ children }) => {
  const [activePatient, setActivePatient] = useState(null);
  const [patients, setPatients] = useState([
    { queueNo: 1, name: "Jane Doe", age: 26, type: "Walk-in", symptoms: ["Fever", "Cough"], services: ["cbc", "fbs"], phoneNum: "09171234567", status: "done", registeredAt: new Date().toISOString() },
    { queueNo: 2, name: "Mark Cruz", age: 32, type: "Appointment", symptoms: ["Rashes"], services: ["pedia"], phoneNum: "09181234567", status: "in progress",  registeredAt: new Date().toISOString()},
    { queueNo: 3, name: "Leah Santos", age: 21, type: "Walk-in", symptoms: ["Headache"], services: ["adult"], phoneNum: "09191234567", status: "waiting",  registeredAt: new Date().toISOString() },
    { queueNo: 4, name: "Analyn Gomez", age: 21, type: "Walk-in", symptoms: ["Headache"], services: ["urinalysis"], phoneNum: "09201234567", status: "waiting",  registeredAt: new Date().toISOString() },
  ]);

  const [currentServing, setCurrentServing] = useState(2);
  const [avgWaitTime, setAvgWaitTime] = useState(15); // ✅ ADD THIS

  // Update the addPatient function:
const addPatient = (newPatient) => {
  setPatients(prev => [
    ...prev,
    { 
      queueNo: prev.length + 1, 
      status: "waiting", 
      registeredAt: new Date().toISOString(), // ✅ ADD THIS
      ...newPatient 
    }
  ]);
};

  const updatePatientStatus = (queueNo, newStatus) => {
    setPatients(prev =>
      prev.map(p => p.queueNo === queueNo ? { ...p, status: newStatus } : p)
    );
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

  // ✅ ADD FUNCTION TO UPDATE WAIT TIME
  const addWaitTime = () => {
    setAvgWaitTime(prev => prev + 5);
  };

  // Derived queue info (computed automatically)
  const queueInfo = useMemo(() => {
    const total = patients.length;
    const waitingCount = patients.filter(p => p.status === "waiting").length;
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
      avgWaitTime,        // ✅ EXPOSE avgWaitTime
      addWaitTime,        // ✅ EXPOSE addWaitTime
      queueInfo
    }}>
      {children}
    </PatientContext.Provider>
  );
};