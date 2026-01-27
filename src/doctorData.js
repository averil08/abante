export const doctors = [
  { 
    id: 1, 
    name: "Dr. Melissa B. Edic", 
    specializations: [
      "pedia", "follow-up", // Pediatrics
      "urinalysis", "fecalysis" // Basic lab work for pediatrics
    ]
  },
  { 
    id: 2, 
    name: "Dr. Genevive Bandiwan-Laking", 
    specializations: [
      "pedia", "follow-up", // Pediatrics
      "urinalysis", "fecalysis" // Basic lab work for pediatrics
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
      "sodium", "potassium", "chloride", "ionizedCal", "totalCal", "magnesium", // Electrolytes
      "urinalysis", "fecalysis", "fecal",           // Clinical Microscopy
      "tsh", "ft3", "t4", "t3",                     // Thyroid function tests
      "totalBilirubin"                              // Liver function
    ]
  },
  { 
    id: 4, 
    name: "Dr. Edrian O. Geronimo", 
    specializations: [
      "adult", "senior", "preventive", "follow-up", // Infectious Disease consults
      "cbc", "platelet", "esr", "abo",              // Hematology
      "hbsag", "vdrl", "antiHCV", "hpylori",        // Immunology & Serology
      "dengueIg", "dengueNs1", "dengueDuo", "typhidot", // Tropical infections
      "urinalysis", "fecalysis", "fecal"            // Clinical Microscopy
    ]
  },
  { 
    id: 5, 
    name: "Dr. Feb Golocan-Alquiza", 
    specializations: [
      "fbs", "rbs", "creatinine", "bun", "hba1c", // Nephrology (kidney + diabetes)
      "urinalysis",                                // Kidney function assessment
      "75g"                                        // Glucose tolerance test for diabetes
    ]
  },
  { 
    id: 6, 
    name: "Dr. Tanya Charissa Diomampo", 
    specializations: [
      "creatinine", "bun", "hba1c", // Nephrology (kidney + diabetes)
      "urinalysis",                  // Kidney function assessment
      "75g"                          // Glucose tolerance test for diabetes
    ]
  },
  { 
    id: 7, 
    name: "Dr. Maricar Josephine A. Geronimo", 
    specializations: [
      "lipid", "totalCh", "triglycerides", "hdl", "ldl", "fbs", "rbs", // Nephrology (lipids + diabetes)
      "urinalysis",                                                      // Kidney assessment
      "75g"                                                              // Glucose tolerance test
    ]
  },
  { 
    id: 8, 
    name: "Dr. Elvira T. Lampacan", 
    specializations: [
      "pregnancyT", "follow-up", // OB-GYN
      "urinalysis",              // Prenatal screening
      "fecalysis"                // General health screening
    ]
  },
  { 
    id: 9, 
    name: "Dr. Clarissa Mae L. Lee", 
    specializations: [
      "pregnancyT", "follow-up", // OB-GYN
      "urinalysis",              // Prenatal screening
      "fecalysis"                // General health screening
    ]
  },
  { 
    id: 10, 
    name: "Dr. Herschel Charisse C. Rivera-Ang", 
    specializations: [
      "pregnancyT", "follow-up", // OB-GYN
      "urinalysis",              // Prenatal screening
      "fecalysis"                // General health screening
    ]
  },
  { 
    id: 11, 
    name: "Dr. Cecille P. Pating", 
    specializations: [
      "pregnancyT", "follow-up", // OB-GYN
      "urinalysis",              // Prenatal screening
      "fecalysis"                // General health screening
    ]
  },
  { 
    id: 12, 
    name: "Dr. Richard S. Ang", 
    specializations: [
      "follow-up", 
      "orthopedic", 
      "psa",        // Prostate screening (male health/urology)
      "semen",      // Semen analysis (urology/male fertility)
      "urinalysis"  // Urinary system assessment
    ]
  },
  { id: 13, 
    name: "Dr. Rajiv D. Laoagan", 
    specializations: [
      "general surgery",
      "urinalysis", "fecalysis", "fecal" // Pre-surgical screening
    ] 
  },
  { id: 14, 
    name: "Dr. Jefferson Richmond G. Chomenwey", 
    specializations: [
      "general surgery",
      "urinalysis", "fecalysis", "fecal" // Pre-surgical screening
    ] 
  },
  { id: 15, 
    name: "Dr. Rhea Jeanne L. Awas", 
    specializations: [
      "ent",
      "urinalysis", "fecalysis" // General screening
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