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
export const assignDoctor = (serviceIds, patients, activeDoctors = []) => {
  console.log('🔍 assignDoctor called with:', { serviceIds, activeDoctorsCount: activeDoctors.length });

  // Get list of active doctors based on IDs provided
  const activeDoctorsList = doctors.filter(d => activeDoctors.includes(d.id));

  // If there are no active doctors, we can't automatically assign to an "active" doctor
  if (activeDoctorsList.length === 0) {
    console.log('⚠️ No active doctors available for automatic assignment');
    // If we have services, we could potentially assign to any doctor matching the service
    // but the requirement specifies "active doctor".
    // Fallback: If no active doctors, we return null so it stays "not assigned" until a doctor starts.
    return null;
  }

  // Case 1: No services selected - assign to least busy active doctor
  if (!serviceIds || serviceIds.length === 0) {
    console.log('ℹ️ No services selected - assigning to least busy active doctor');

    const doctorLoads = activeDoctorsList.map(doctor => {
      const load = patients.filter(p =>
        p.assignedDoctor?.id === doctor.id &&
        p.status !== 'done' &&
        p.status !== 'cancelled' &&
        !p.isInactive
      ).length;

      return { doctor, load };
    });

    doctorLoads.sort((a, b) => a.load - b.load);
    console.log(`✅ Assigned to shortest queue: ${doctorLoads[0].doctor.name} (load: ${doctorLoads[0].load})`);
    return doctorLoads[0].doctor;
  }

  // Case 2: Services selected - find active doctors who can handle these services
  const capableActiveDoctors = activeDoctorsList.filter(doctor => {
    return serviceIds.some(serviceId => doctor.specializations.includes(serviceId));
  });

  if (capableActiveDoctors.length > 0) {
    console.log(`ℹ️ Found ${capableActiveDoctors.length} capable active doctors`);
    const doctorLoads = capableActiveDoctors.map(doctor => {
      const load = patients.filter(p =>
        p.assignedDoctor?.id === doctor.id &&
        p.status !== 'done' &&
        p.status !== 'cancelled' &&
        !p.isInactive
      ).length;

      return { doctor, load };
    });

    doctorLoads.sort((a, b) => a.load - b.load);
    return doctorLoads[0].doctor;
  }

  // Fallback: If no capable ACTIVE doctor, assign to any capable doctor?
  // User says "check for doctors whose queues have been started by the secretary"
  // This implies active doctors.
  // If no capable active doctor exists, maybe assign to the least busy active doctor anyway?
  // Or stay unassigned. Let's assign to least busy active doctor as a catch-all if they specifically requested no doctor.

  console.log('⚠️ No capable active doctor found for services. Assigning to least busy active doctor.');
  const doctorLoads = activeDoctorsList.map(doctor => {
    const load = patients.filter(p =>
      p.assignedDoctor?.id === doctor.id &&
      p.status !== 'done' &&
      p.status !== 'cancelled' &&
      !p.isInactive
    ).length;

    return { doctor, load };
  });

  doctorLoads.sort((a, b) => a.load - b.load);
  return doctorLoads[0].doctor;
};