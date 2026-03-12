//updated frontend only code
export const doctors = [
  {
    id: 1,
    name: "Dr. Melissa B. Edic",
    specialization: "Pediatrics", // Keep for backward compatibility if needed
    specializations: [
      "pedia", "follow-up", // Pediatrics
      "urinalysis", "fecalysis" // Basic lab work for pediatrics
    ],
    schedule: "Thu-Fri: 9AM-5PM, Wed (2nd & 4th): 9AM-3PM",
    availability: [
      { days: [4, 5], startHour: 9, endHour: 17 },
      { days: [3], startHour: 9, endHour: 15, weeksOfMonth: [2, 4] }
    ]
  },
  {
    id: 2,
    name: "Dr. Genevive Bandiwan-Laking",
    specialization: "Pediatrics",
    specializations: [
      "pedia", "follow-up", // Pediatrics
      "urinalysis", "fecalysis" // Basic lab work for pediatrics
    ],
    schedule: "By Appointment Only",
    availability: [
      { days: [1, 2, 3, 4, 5], startHour: 8, endHour: 17 }
    ]
  },
  {
    id: 3,
    name: "Dr. Cynthia Moran",
    specialization: "Internal Medicine",
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
    ],
    schedule: "Wed: 9AM-12PM",
    availability: [
      { days: [3], startHour: 9, endHour: 12 }
    ]
  },
  {
    id: 4,
    name: "Dr. Edrian O. Geronimo",
    specialization: "Infectious Disease",
    specializations: [
      "adult", "senior", "preventive", "follow-up", // Infectious Disease consults
      "cbc", "platelet", "esr", "abo",              // Hematology
      "hbsag", "vdrl", "antiHCV", "hpylori",        // Immunology & Serology
      "dengueIg", "dengueNs1", "dengueDuo", "typhidot", // Tropical infections
      "urinalysis", "fecalysis", "fecal"            // Clinical Microscopy
    ],
    schedule: "Tue, Thu: 9AM-12PM",
    availability: [
      { days: [2, 4], startHour: 9, endHour: 12 }
    ]
  },
  {
    id: 5,
    name: "Dr. Feb Golocan-Alquiza",
    specialization: "Nephrology",
    specializations: [
      "fbs", "rbs", "creatinine", "bun", "hba1c", // Nephrology (kidney + diabetes)
      "urinalysis",                                // Kidney function assessment
      "75g"                                        // Glucose tolerance test for diabetes
    ],
    schedule: "Mon, Tue, Thu: 1PM-5PM",
    availability: [
      { days: [1, 2, 4], startHour: 13, endHour: 17 }
    ]
  },
  {
    id: 6,
    name: "Dr. Tanya Charissa Diomampo",
    specialization: "Nephrology",
    specializations: [
      "creatinine", "bun", "hba1c", // Nephrology (kidney + diabetes)
      "urinalysis",                  // Kidney function assessment
      "75g"                          // Glucose tolerance test for diabetes
    ],
    schedule: "Wed: 1PM-5PM, Sat: 10AM-1PM",
    availability: [
      { days: [3], startHour: 13, endHour: 17 },
      { days: [6], startHour: 10, endHour: 13 }
    ]
  },
  {
    id: 7,
    name: "Dr. Maricar Josephine A. Geronimo",
    specialization: "Nephrology",
    specializations: [
      "lipid", "totalCh", "triglycerides", "hdl", "ldl", "fbs", "rbs", // Nephrology (lipids + diabetes)
      "urinalysis",                                                      // Kidney assessment
      "75g"                                                              // Glucose tolerance test
    ],
    schedule: "Fri: 1PM-5PM",
    availability: [
      { days: [5], startHour: 13, endHour: 17 }
    ]
  },
  {
    id: 8,
    name: "Dr. Elvira T. Lampacan",
    specialization: "OB-GYN",
    specializations: [
      "pregnancyT", "follow-up", // OB-GYN
      "urinalysis",              // Prenatal screening
      "fecalysis"                // General health screening
    ],
    schedule: "Wed, Fri: 9:30AM-12PM, Thu: 1PM-3PM",
    availability: [
      { days: [3, 5], startHour: 9.5, endHour: 12 },
      { days: [4], startHour: 13, endHour: 15 }
    ]
  },
  {
    id: 9,
    name: "Dr. Clarissa Mae L. Lee",
    specialization: "OB-GYN",
    specializations: [
      "pregnancyT", "follow-up", // OB-GYN
      "urinalysis",              // Prenatal screening
      "fecalysis"                // General health screening
    ],
    schedule: "Mon, Tue: 9:30AM-12PM, Sat: 1PM-3PM",
    availability: [
      { days: [1, 2], startHour: 9.5, endHour: 12 },
      { days: [6], startHour: 13, endHour: 15 }
    ]
  },
  {
    id: 10,
    name: "Dr. Herschel Charisse C. Rivera-Ang",
    specialization: "OB-GYN",
    specializations: [
      "pregnancyT", "follow-up", // OB-GYN
      "urinalysis",              // Prenatal screening
      "fecalysis"                // General health screening
    ],
    schedule: "Mon-Wed: 1PM-3PM",
    availability: [
      { days: [1, 2, 3], startHour: 13, endHour: 15 }
    ]
  },
  {
    id: 11,
    name: "Dr. Cecille P. Pating",
    specialization: "OB-GYN",
    specializations: [
      "pregnancyT", "follow-up", // OB-GYN
      "urinalysis",              // Prenatal screening
      "fecalysis"                // General health screening
    ],
    schedule: "Thu, Sat: 9:30AM-12PM, Fri: 1PM-3PM",
    availability: [
      { days: [4, 6], startHour: 9.5, endHour: 12 },
      { days: [5], startHour: 13, endHour: 15 }
    ]
  },
  {
    id: 12,
    name: "Dr. Richard S. Ang",
    specialization: "Orthopedics & Urology",
    specializations: [
      "follow-up",
      "orthopedic",
      "psa",        // Prostate screening (male health/urology)
      "semen",      // Semen analysis (urology/male fertility)
      "urinalysis"  // Urinary system assessment
    ],
    schedule: "Mon-Fri: 8AM-5PM",
    availability: [
      { days: [1, 2, 3, 4, 5], startHour: 8, endHour: 17 }
    ]
  },
  {
    id: 13,
    name: "Dr. Rajiv D. Laoagan",
    specialization: "General Surgery",
    specializations: [
      "general surgery",
      "urinalysis", "fecalysis", "fecal" // Pre-surgical screening
    ],
    schedule: "Thu: 8AM-5PM, Fri-Sat: 8AM-12PM",
    availability: [
      { days: [4], startHour: 8, endHour: 17 },
      { days: [5, 6], startHour: 8, endHour: 12 }
    ]
  },
  {
    id: 14,
    name: "Dr. Jefferson Richmond G. Chomenwey",
    specialization: "General Surgery",
    specializations: [
      "general surgery",
      "urinalysis", "fecalysis", "fecal" // Pre-surgical screening
    ],
    schedule: "By Appointment Only",
    availability: [
      { days: [1, 2, 3, 4, 5], startHour: 8, endHour: 17 }
    ]
  },
  {
    id: 15,
    name: "Dr. Rhea Jeanne L. Awas",
    specialization: "ENT",
    specializations: [
      "ent",
      "urinalysis", "fecalysis" // General screening
    ],
    schedule: "Mon-Wed: 8AM-5PM",
    availability: [
      { days: [1, 2, 3], startHour: 8, endHour: 17 }
    ]
  },
];


//ADDED change 1/30/26
// UPDATED 3/12/26: Enhanced assignment logic (Symptoms + Demographics)
export const assignDoctor = (patientData, patients, activeDoctors = []) => {
  // Backward compatibility: handle if serviceIds array is passed instead of patient object
  const isArrayInput = Array.isArray(patientData);
  const serviceIds = isArrayInput ? patientData : (patientData?.services || []);
  const symptoms = isArrayInput ? [] : (patientData?.symptoms || []);
  const age = isArrayInput ? null : (patientData?.age ? parseInt(patientData.age) : null);

  console.log('🔍 assignDoctor called with:', { serviceIds, symptoms, age, activeDoctorsCount: activeDoctors.length });

  // Get list of active doctors based on IDs provided
  const activeDoctorsList = doctors.filter(d => activeDoctors.includes(d.id));

  if (activeDoctorsList.length === 0) {
    console.log('⚠️ No active doctors available for automatic assignment');
    return null;
  }

  // Define a helper to find the least busy doctor from a specific subset
  const getLeastBusy = (subset) => {
    if (!subset || subset.length === 0) return null;
    const loads = subset.map(doctor => {
      const load = patients.filter(p =>
        p.assignedDoctor?.id === doctor.id &&
        p.status !== 'done' &&
        p.status !== 'cancelled' &&
        !p.isInactive
      ).length;
      return { doctor, load };
    });
    loads.sort((a, b) => a.load - b.load);
    return loads[0].doctor;
  };

  // Case 1: Services selected - find active doctors who can handle these services
  if (serviceIds && serviceIds.length > 0) {
    const capableActiveDoctors = activeDoctorsList.filter(doctor => {
      return serviceIds.some(serviceId => doctor.specializations.includes(serviceId));
    });

    if (capableActiveDoctors.length > 0) {
      return getLeastBusy(capableActiveDoctors);
    }
  }

  // Case 2: No specific services matched - Use Symptoms and Demographics
  if (!isArrayInput) {
    // A. Pediatrics (Age-based)
    if (age !== null && age < 18) {
      const pediaDoctors = activeDoctorsList.filter(d => d.specialization === 'Pediatrics');
      if (pediaDoctors.length > 0) {
        console.log('👶 Child detected - routing to active Pediatrician');
        return getLeastBusy(pediaDoctors);
      }
    }

    // B. ENT (Symptom-based)
    const entSymptoms = ['Ear Pain', 'Sore Throat', 'Runny Nose'];
    if (symptoms.some(s => entSymptoms.includes(s))) {
      const entDoctors = activeDoctorsList.filter(d => d.specialization === 'ENT');
      if (entDoctors.length > 0) {
        console.log('👂 ENT symptoms detected - routing to active ENT specialist');
        return getLeastBusy(entDoctors);
      }
    }

    // C. General Surgery / Gastro (Symptom-based)
    const surgerySymptoms = ['Stomach Pain', 'Vomiting', 'Diarrhea'];
    if (symptoms.some(s => surgerySymptoms.includes(s))) {
      const surgeryDoctors = activeDoctorsList.filter(d => d.specialization === 'General Surgery');
      if (surgeryDoctors.length > 0) {
        console.log('🩺 Gastro symptoms detected - routing to active General Surgeon');
        return getLeastBusy(surgeryDoctors);
      }
    }

    // D. Adult Internal Medicine (Age-based fallback)
    if (age !== null && age >= 18) {
      const imDoctors = activeDoctorsList.filter(d => d.specialization === 'Internal Medicine');
      if (imDoctors.length > 0) {
        console.log('👤 Adult detected - routing to active Internal Medicine');
        return getLeastBusy(imDoctors);
      }
    }
  }

  // Case 3: Ultimate Fallback - Assign to least busy among ALL active doctors
  console.log('ℹ️ No specific mapping found - assigning to least busy overall active doctor');
  return getLeastBusy(activeDoctorsList);
};