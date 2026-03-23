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
    schedule: "Thu-Fri: 10AM-12NN then 2PM-4PM, 2nd & 4th Wed, 1st & 3rd Sat: 10AM-4PM",
    availability: [
      { days: [4, 5], startHour: 10, endHour: 12 },
      { days: [4, 5], startHour: 14, endHour: 16 },
      { days: [3], startHour: 10, endHour: 16, weeksOfMonth: [2, 4] },
      { days: [6], startHour: 10, endHour: 16, weeksOfMonth: [1, 3] }
    ]
  },
  {
    id: 2,
    name: "Dr. Leila Rachel Dupiag",
    specialization: "Pediatrics",
    specializations: [
      "pedia", "follow-up",
      "urinalysis", "fecalysis"
    ],
    schedule: "Mon-Tue, 1st & 3rd Wed, 2nd & 4th Sat: 10AM-12NN, Thu-Fri: 12PM-2PM",
    availability: [
      { days: [1, 2], startHour: 10, endHour: 12 },
      { days: [4, 5], startHour: 12, endHour: 14 },
      { days: [3], startHour: 10, endHour: 12, weeksOfMonth: [1, 3] },
      { days: [6], startHour: 10, endHour: 12, weeksOfMonth: [2, 4] }
    ]
  },
  {
    id: 3,
    name: "Dr. Genevive Bandiwan-Laking",
    specialization: "Pediatrics",
    specializations: [
      "pedia", "follow-up",
      "urinalysis", "fecalysis"
    ],
    schedule: "Mon-Tue, 1st & 3rd Wed, 2nd & 4th Sat: 2:30PM-5PM",
    availability: [
      { days: [1, 2], startHour: 14.5, endHour: 17 },
      { days: [3], startHour: 14.5, endHour: 17, weeksOfMonth: [1, 3] },
      { days: [6], startHour: 14.5, endHour: 17, weeksOfMonth: [2, 4] }
    ]
  },
  {
    id: 4,
    name: "Dr. Elvira Lampacan",
    specialization: "OB-GYN",
    specializations: [
      "pregnancyT", "follow-up",
      "urinalysis",
      "fecalysis"
    ],
    schedule: "Wed, Fri: 10AM-12NN, Thu: 10AM-12NN then 1PM-3PM",
    availability: [
      { days: [3, 5], startHour: 10, endHour: 12 },
      { days: [4], startHour: 10, endHour: 12 },
      { days: [4], startHour: 13, endHour: 15 }
    ]
  },
  {
    id: 5,
    name: "Dr. Herschel Charisse Rivera-Ang",
    specialization: "OB-GYN",
    specializations: [
      "pregnancyT", "follow-up",
      "urinalysis",
      "fecalysis"
    ],
    schedule: "Mon-Wed: 3PM-5PM",
    availability: [
      { days: [1, 2, 3], startHour: 15, endHour: 17 }
    ]
  },
  {
    id: 6,
    name: "Dr. Clarissa Lee",
    specialization: "OB-GYN",
    specializations: [
      "pregnancyT", "follow-up",
      "urinalysis",
      "fecalysis"
    ],
    schedule: "Mon-Tue: 10AM-12NN, Fri: 1PM-3PM",
    availability: [
      { days: [1, 2], startHour: 10, endHour: 12 },
      { days: [5], startHour: 13, endHour: 15 }
    ]
  },
  {
    id: 7,
    name: "Dr. Cecille Pating",
    specialization: "OB-GYN",
    specializations: [
      "pregnancyT", "follow-up",
      "urinalysis",
      "fecalysis"
    ],
    schedule: "Sat: 10AM-3PM",
    availability: [
      { days: [6], startHour: 10, endHour: 15 }
    ]
  },
  {
    id: 8,
    name: "Dr. Rajiv Laoagan",
    specialization: "General Surgery",
    specializations: [
      "general surgery",
      "urinalysis", "fecalysis", "fecal"
    ],
    schedule: "Thu, Sat: 10AM-3PM",
    availability: [
      { days: [4, 6], startHour: 10, endHour: 15 }
    ]
  },
  {
    id: 9,
    name: "Dr. Richard Ang",
    specialization: "Orthopedic Surgery",
    specializations: [
      "follow-up",
      "orthopedic",
      "psa",
      "semen",
      "urinalysis"
    ],
    schedule: "Mon-Wed: 1PM-3PM",
    availability: [
      { days: [1, 2, 3], startHour: 13, endHour: 15 }
    ]
  },
  {
    id: 10,
    name: "Dr. Rhea Jeanne Awas",
    specialization: "ENT",
    specializations: [
      "ent",
      "urinalysis", "fecalysis"
    ],
    schedule: "Fri: 10AM-1PM",
    availability: [
      { days: [5], startHour: 10, endHour: 13 }
    ]
  },
  {
    id: 11,
    name: "Dr. Cynthia Moran",
    specialization: "Internal Medicine",
    specializations: [
      "adult", "senior", "preventive", "follow-up",
      "cbc", "platelet", "esr", "abo",
      "fbs", "rbs", "hba1c",
      "lipid", "totalCh", "triglycerides", "hdl", "ldl",
      "alt", "ast", "uric", "creatinine", "bun",
      "albumin", "totalProtein", "alp", "phosphorus",
      "sodium", "potassium", "chloride", "ionizedCal", "totalCal", "magnesium",
      "urinalysis", "fecalysis", "fecal",
      "tsh", "ft3", "t4", "t3",
      "totalBilirubin"
    ],
    schedule: "Fri: 10AM-12NN",
    availability: [
      { days: [5], startHour: 10, endHour: 12 }
    ]
  },
  {
    id: 12,
    name: "Dr. Richard Boado",
    specialization: "Internal Medicine",
    specializations: [
      "adult", "senior", "preventive", "follow-up"
    ],
    schedule: "Mon, Sat: 9AM-12NN",
    availability: [
      { days: [1, 6], startHour: 9, endHour: 12 }
    ]
  },
  {
    id: 13,
    name: "Dr. Ian Feb Golocan-Alquiza",
    specialization: "Nephrology",
    specializations: [
      "fbs", "rbs", "creatinine", "bun", "hba1c",
      "urinalysis",
      "75g"
    ],
    schedule: "Mon, Thu: 12PM-4PM",
    availability: [
      { days: [1, 4], startHour: 12, endHour: 16 }
    ]
  },
  {
    id: 14,
    name: "Dr. Jefferson Richmond G. Chomenwey",
    specialization: "General Surgery",
    specializations: [
      "general surgery",
      "urinalysis", "fecalysis", "fecal"
    ],
    schedule: "By Appointment Only",
    availability: [
      { days: [1, 2, 3, 4, 5], startHour: 8, endHour: 17 }
    ]
  }
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