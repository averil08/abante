export const doctors = [
  { 
    id: 1, 
    name: "Dr. Melissa B. Edic", 
    specializations: [
      "pedia", "follow-up" // Pediatrics
    ]
  },
  { 
    id: 2, 
    name: "Dr. Genevive Bandiwan-Laking", 
    specializations: [
      "pedia", "follow-up" // Pediatrics
    ]
  },
  { 
    id: 3, 
    name: "Dr. Cynthia Moran", 
    specializations: [
      "adult", "senior", "preventive", "follow-up", // General Internal Medicine
      "cbc", "platelet", "esr", "abo",              // Hematology
      "fbs", "rbs", "hba1c",                        // Diabetes monitoring
      "lipid", "totalCh", "triglycerides", "hdl", "ldl", // Lipids
      "alt", "ast", "uric", "creatinine", "bun",    // Liver + Kidney
      "albumin", "totalProtein", "alp", "phosphorus", // Proteins + Minerals
      "sodium", "potassium", "chloride", "ionizedCal", "totalCal", "magnesium" // Electrolytes
    ]
  },
  { 
    id: 4, 
    name: "Dr. Edrian O. Geronimo", 
    specializations: [
      "adult", "senior", "preventive", "follow-up", // Infectious Disease consults
      "cbc", "platelet", "esr", "abo",              // Hematology
      "hbsag", "vdrl", "antiHCV", "hpylori",        // Immunology & Serology
      "dengueIg", "dengueNs1", "dengueDuo", "typhidot" // Tropical infections
    ]
  },
  { 
    id: 5, 
    name: "Dr. Feb Golocan-Alquiza", 
    specializations: [
      "fbs", "rbs", "creatinine", "bun", "hba1c" // Nephrology (kidney + diabetes)
    ]
  },
  { 
    id: 6, 
    name: "Dr. Tanya Charissa Diomampo", 
    specializations: [
      "creatinine", "bun", "hba1c" // Nephrology (kidney + diabetes)
    ]
  },
  { 
    id: 7, 
    name: "Dr. Maricar Josephine A. Geronimo", 
    specializations: [
      "lipid", "totalCh", "triglycerides", "hdl", "ldl", "fbs", "rbs" // Nephrology (lipids + diabetes)
    ]
  },
  { 
    id: 8, 
    name: "Dr. Elvira T. Lampacan", 
    specializations: [
      "pregnancyT", "follow-up" // OB-GYN
    ]
  },
  { 
    id: 9, 
    name: "Dr. Clarissa Mae L. Lee", 
    specializations: [
      "pregnancyT", "follow-up" // OB-GYN
    ]
  },
  { 
    id: 10, 
    name: "Dr. Herschel Charisse C. Rivera-Ang", 
    specializations: [
      "pregnancyT", "follow-up" // OB-GYN
    ]
  },
  { 
    id: 11, 
    name: "Dr. Cecille P. Pating", 
    specializations: [
      "pregnancyT", "follow-up" // OB-GYN
    ]
  },
  { 
    id: 12, 
    name: "Dr. Richard S. Ang", 
    specializations: [
      "follow-up", 
      "orthopedic", 
      "psa"        // Prostate screening (fits male health, though usually urology)
    ]
  },
  { id: 13, 
    name: "Dr. Rajiv D. Laoagan", 
    specializations: [
      "general surgery"
    ] 
  },
  { id: 14, 
    name: "Dr. Jefferson Richmond G. Chomenwey", specializations: [
      "general surgery"
    ] 
  },
  { id: 15, 
    name: "Dr. Rhea Jeanne L. Awas", 
    specializations: [
      "ent"
    ] 
  },
];


// Function to assign a doctor based on patient load - ONLY ACTIVE DOCTORS
export const assignDoctor = (serviceIds, patients, activeDoctors = []) => {
  // NEW: If no active doctors, return null (not assigned yet)
  if (activeDoctors.length === 0) {
    return null;
  }

  if (!serviceIds || serviceIds.length === 0) {
    // If no services selected, assign to any active general practitioner
    const activeGeneralDoctors = doctors.filter(d => 
      activeDoctors.includes(d.id) && 
      (d.specializations.includes("pedia") || d.specializations.includes("adult"))
    );
    
    if (activeGeneralDoctors.length > 0) {
      return activeGeneralDoctors[0];
    }
    
    // Return first active doctor
    return doctors.find(d => d.id === activeDoctors[0]) || null;
  }

  // Get the first service to determine specialization
  const primaryService = serviceIds[0];
  
  // Find all doctors who can handle this service AND are active
  const availableDoctors = doctors.filter(doctor => 
    doctor.specializations.includes(primaryService) && 
    activeDoctors.includes(doctor.id)
  );
  
  // NEW: If no active doctor specializes in this service, return null
  if (availableDoctors.length === 0) {
    return null;
  }

  // Count current patient load for each available doctor
  const doctorLoads = availableDoctors.map(doctor => {
    const load = patients.filter(p => 
      p.assignedDoctor?.id === doctor.id && 
      p.status !== 'done' && 
      p.status !== 'cancelled' &&
      !p.isInactive
    ).length;
    
    return { doctor, load };
  });

  // Sort by load (ascending) and assign to doctor with least patients
  doctorLoads.sort((a, b) => a.load - b.load);
  
  return doctorLoads[0].doctor;
};