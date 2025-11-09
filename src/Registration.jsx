import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  registerWalkInPatient, 
  registerAppointmentPatient, 
  registerStaff,
  checkAppointmentAvailable 
} from "./lib/supabaseClient";
import Logo from "./assets/logo-abante.png";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./datepicker.css";
import { useNavigate } from "react-router-dom";

//component starts here
function RegistrationForm() {
  const navigate = useNavigate();
  
  const [selectedType, setSelectedType] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    phoneNum: "",
    physician: "",
    staffId: "",
    symptoms: [],
    services: [],
    appointmentDateTime: "",
    staffRole: "",
    password: "",
    email: "",
    daysSinceOnSet: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPatientType, setSelectedPatientType] = useState(null);
  const [expandedCategory, setExpandedCategory] = useState(null);

  const symptomsList = [
    'Fever',
    'Cough',
    'Sore Throat',
    'Headache',
    'Stomach Pain',
    'Vomiting',
    'Diarrhea',
    'Rash',
    'Ear Pain',
    'Runny Nose',
    'Difficulty Breathing',
    'Itching'
  ];

  const toggleCategory = (id) => {
    setExpandedCategory(expandedCategory === id ? null : id);
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const handleSymptomChange = (symptom, isChecked) => {
    setFormData((prevData) => {
      const currentSymptoms = prevData.symptoms;
      if (isChecked && !currentSymptoms.includes(symptom)) {
        return { ...prevData, symptoms: [...currentSymptoms, symptom] };
      } else if (!isChecked) {
        return { ...prevData, symptoms: currentSymptoms.filter((s) => s !== symptom) };
      }
      return prevData;
    });
  };

  const handleServiceChange = (serviceId, isChecked) => {
    setFormData((prevData) => {
      const currentServices = prevData.services;
      if (isChecked && !currentServices.includes(serviceId)) {
        return { ...prevData, services: [...currentServices, serviceId] };
      } else if (!isChecked) {
        return { ...prevData, services: currentServices.filter((id) => id !== serviceId) };
      }
      return prevData;
    });
  };

  const showMessage = (title, message, isSuccess = true) => {
    document.getElementById("message-box").innerHTML = `
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white p-6 rounded-lg shadow-2xl max-w-sm text-center">
          <h3 class="text-xl font-bold ${isSuccess ? 'text-green-600' : 'text-red-600'} mb-4">${title}</h3>
          <p class="text-gray-700 mb-4">${message}</p>
          <button onclick="document.getElementById('message-box').innerHTML=''" class="bg-${isSuccess ? 'green' : 'red'}-600 text-white px-4 py-2 rounded-md hover:bg-${isSuccess ? 'green' : 'red'}-700">Close</button>
        </div>
      </div>
    `;
  };

  const resetForm = () => {
    setFormData({
      name: "",
      age: "",
      phoneNum: "",
      physician: "",
      staffId: "",
      symptoms: [],
      services: [],
      appointmentDateTime: "",
      staffRole: "",
      password: "",
      email: "",
      daysSinceOnSet: "",
    });
    setExpandedCategory(null);
  };

  const handlePatientSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let result;

      if (selectedPatientType === "walkIn") {
        // Register walk-in patient
        result = await registerWalkInPatient(formData);
      } else if (selectedPatientType === "appointment") {
        // Check if appointment slot is available
        if (!formData.appointmentDateTime) {
          showMessage(
            "Validation Error",
            "Please select an appointment date and time.",
            false
          );
          setIsSubmitting(false);
          return;
        }

        const isAvailable = await checkAppointmentAvailable(formData.appointmentDateTime);
        
        if (!isAvailable) {
          showMessage(
            "Slot Not Available",
            "This time slot is already booked. Please select another time.",
            false
          );
          setIsSubmitting(false);
          return;
        }

        // Register appointment patient
        result = await registerAppointmentPatient(formData, formData.appointmentDateTime);
      }

      if (result.success) {
        const appointmentInfo = selectedPatientType === "appointment" 
          ? `<br/>Appointment: ${new Date(formData.appointmentDateTime).toLocaleString()}`
          : '';
        
        showMessage(
          "Registration Successful!",
          `Welcome, ${formData.name}!<br/>Your ${selectedPatientType === "appointment" ? "appointment" : "walk-in"} registration has been completed successfully.${appointmentInfo}`,
          true
        );
        
        resetForm();
        
        setTimeout(() => {
          setSelectedPatientType(null);
          setSelectedType(null);
          
          //redirect to QueueStatus page here
          navigate("/qstatus", { state: { patientName: formData.name, type: selectedPatientType, symptoms: formData.symptoms} });
        }, 3000);
      } else {
        showMessage(
          "Registration Failed",
          `Error: ${result.error}. Please try again.`,
          false
        );
      }
    } catch (error) {
      showMessage(
        "Registration Failed",
        "An unexpected error occurred. Please try again.",
        false
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStaffSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate inputs
      if (!formData.email || !formData.password || !formData.staffRole) {
        showMessage(
          "Validation Error",
          "Please fill in all required fields.",
          false
        );
        setIsSubmitting(false);
        return;
      }

      if (formData.password.length < 6) {
        showMessage(
          "Validation Error",
          "Password must be at least 6 characters long.",
          false
        );
        setIsSubmitting(false);
        return;
      }

      const result = await registerStaff(
        formData.email,
        formData.password,
        formData.staffRole
      );

      if (result.success) {
        showMessage(
          "Registration Successful!",
          result.message || "Staff registration completed successfully. Please check your email to verify your account.",
          true
        );
        
        resetForm();
        
        setTimeout(() => {
          setSelectedType(null);
        }, 3000);
      } else {
        showMessage(
          "Registration Failed",
          `Error: ${result.error}. Please try again.`,
          false
        );
      }
    } catch (error) {
      showMessage(
        "Registration Failed",
        "An unexpected error occurred. Please try again.",
        false
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const serviceCategories = [
    {
      id: "general",
      label: "General Consultation",
      services: [
        { id: "pedia", label: "Pediatric Consultation" },
        { id: "adult", label: "Adult Consultation" },
        { id: "senior", label: "Senior Consultation (Ages 65+)" },
        { id: "preventive", label: "Preventive/Annual Physical Exam" },
        { id: "follow-up", label: "Follow-up Consultation" },
      ],
    },
    {
      id: "hematology",
      label: "Hematology",
      services: [
        { id: "cbc", label: "CBC (Complete Blood Count)" },
        { id: "platelet", label: "Platelet Count" },
        { id: "esr", label: "ESR (Inflammation Check)" },
        { id: "abo", label: "Blood Type Test: ABO/Rh Typing (Direct and Reverse)" },
      ],
    },
    {
      id: "immunology",
      label: "Immunology & Serology",
      services: [
        { id: "hbsag", label: "HBsAg (Hepatitis B Screening)" },
        { id: "vdrl", label: "VDRL/RPR (Syphilis Screening)" },
        { id: "antiHCV", label: "Anti-HCV (Hepatitis C Screening)" },
        { id: "hpylori", label: "H.PYLORI (H. pylori Stomach Bacteria Test)" },
        { id: "dengueIg", label: "Dengue IgG+IgM (Dengue Fever Screening: Past/Current)" },
        { id: "dengueNs1", label: "Dengue NS1 (Early Dengue Fever Test)" },
        { id: "dengueDuo", label: "Dengue Duo: NS1, IgG+IgM (Complete Dengue Test)" },
        { id: "typhidot", label: "Typhidot (Typhoid Fever Test)" },
      ],
    },
    {
      id: "chemistry",
      label: "Clinical Chemistry",
      services: [
        { id: "fbs", label: "FBS (Fasting Blood Sugar)" },
        { id: "rbs", label: "RBS (Random Blood Sugar)" },
        { id: "lipid", label: "Lipid Profile (Cholesterol and Fats Check)" },
        { id: "totalCh", label: "Total Cholesterol" },
        { id: "triglycerides", label: "Triglycerides (Blood Fats)" },
        { id: "hdl", label: "HDL (Good Cholesterol)" },
        { id: "ldl", label: "LDL (Bad Cholesterol)" },
        { id: "alt", label: "ALT/SGPT (Liver Function Test)" },
        { id: "ast", label: "AST/SGOT (Liver Function Test)" },
        { id: "uric", label: "Uric Acid" },
        { id: "creatinine", label: "Creatinine (Kidney Function Test)" },
        { id: "bun", label: "Bun (Kidney Function Test)" },
        { id: "hba1c", label: "HBA1C (Long-Term Blood Sugar)" },
        { id: "albumin", label: "Albumin (Protein in blood)" },
        { id: "magnesium", label: "Magnesium" },
        { id: "totalProtein", label: "Total Protein (present in blood)" },
        { id: "alp", label: "ALP (Bone and Liver Enzyme)" },
        { id: "phosphorus", label: "Phosphorus" },
        { id: "sodium", label: "Sodium" },
        { id: "potassium", label: "Potassium" },
        { id: "ionizedCal", label: "Ionized Calcium (Free Calcium Level)" },
        { id: "totalCal", label: "Total Calcium" },
        { id: "chloride", label: "Chloride" },
      ],
    },
    {
      id: "microscopy",
      label: "Clinical Microscopy & Parasitology",
      services: [
        { id: "urinalysis", label: "Urinalysis" },
        { id: "fecalysis", label: "Fecalysis (Stool Test)" },
        { id: "pregnancyT", label: "Pregnancy Test" },
        { id: "fecal", label: "Fecal Occult Blood (Hidden Blood in Stool)" },
        { id: "semen", label: "Semen Analysis" },
      ],
    },
    {
      id: "others",
      label: "Others",
      services: [
        { id: "tsh", label: "TSH (Thyroid Stimulating Hormone)" },
        { id: "ft3", label: "FT3 (Free T3 Thyroid Hormone)" },
        { id: "75g", label: "75 Grams OGTT (Diabetes Glucose Challenge Test)" },
        { id: "t4", label: "T4 (T4 Thyroid Hormone)" },
        { id: "t3", label: "T3 (T3 Thyroid Hormone)" },
        { id: "psa", label: "PSA (Prostate Health Screening)" },
        { id: "totalBilirubin", label: "Total/ Direct Bilirubin (Jaundice Check)" },
      ],
    },
  ];

  // --- Step 1: Role Selection ---
  if (!selectedType) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
        <Card className="w-full max-w-md shadow-xl border-t-4 border-green-600">
          <div className="flex justify-center mt-4">
            <img src={Logo} alt="Abante Logo" className="w-30 h-24 object-contain" />
          </div>
          <CardHeader>
            <CardTitle className="text-center text-green-700">Welcome</CardTitle>
            <p className="text-center text-sm text-gray-500">
              Select your role to proceed with registration.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              className="w-full bg-[#33a37f] hover:bg-[#059669] text-white transition duration-200"
              onClick={() => setSelectedType("patient")}
            >
              Register as Patient
            </Button>
            <Button
              className="w-full bg-[#047a52] hover:bg-[#03503a] text-white transition duration-200"
              onClick={() => setSelectedType("staff")}
            >
              Register as Clinic Staff
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- Step 2: Patient Type Selection ---
  if (selectedType === "patient" && !selectedPatientType) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
        <Card className="w-full max-w-md shadow-xl border-t-4 border-green-600">
          <CardHeader>
            <CardTitle className="text-center text-green-700">
              Patient Registration
            </CardTitle>
            <p className="text-sm text-center text-gray-500">
              Please choose your registration type
            </p>
          </CardHeader>
          <CardContent className="flex flex-col space-y-4">
            <Button
              className="w-full bg-[#33a37f] hover:bg-[#059669] text-white"
              onClick={() => setSelectedPatientType("appointment")}
            >
              Book an Appointment
            </Button>
            <Button
              className="w-full bg-[#33a37f] hover:bg-[#059669] text-white"
              onClick={() => setSelectedPatientType("walkIn")}
            >
              Walk-in Registration
            </Button>
            <Button
              variant="secondary"
              className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800"
              onClick={() => setSelectedType(null)}
            >
              &larr; Back to Role Selection
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- Step 3: Patient Registration Form ---
  if (selectedType === "patient" && (selectedPatientType === "appointment" || selectedPatientType === "walkIn")) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
        <Card className="w-full max-w-lg shadow-xl border-t-4 border-green-600">
          <CardHeader>
            <CardTitle className="text-center text-green-700">
              {selectedPatientType === "appointment"
                ? "Book an Appointment"
                : "Walk-in Registration"}
            </CardTitle>
            <p className="text-sm text-center text-gray-500">
              {selectedPatientType === "appointment"
                ? "Please select your preferred date and time."
                : "Proceed with registration for walk-in patients."}
            </p>
          </CardHeader>
          <CardContent>
            {selectedPatientType === "appointment" && (
              <div className="space-y-4 mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-gray-700 font-semibold text-center">
                  Select preferred appointment schedule
                </p>
                <div className="space-y-2">
                  <Label htmlFor="appointmentDateTime">Appointment Date & Time *</Label>
                  <DatePicker
                    selected={formData.appointmentDateTime ? new Date(formData.appointmentDateTime) : null}
                    onChange={(date) => setFormData({ ...formData, appointmentDateTime: date ? date.toISOString() : "" })}
                    showTimeSelect
                    timeFormat="h:mm aa"
                    timeIntervals={30}
                    minDate={new Date()}
                    minTime={new Date(new Date().setHours(8, 0, 0, 0))}
                    maxTime={new Date(new Date().setHours(17, 0, 0, 0))}
                    dateFormat="MMMM d, yyyy h:mm aa"
                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-600"
                    placeholderText="Select date and time"
                    required
                  />
                </div>
              </div>
            )}

            <form onSubmit={handlePatientSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">Age *</Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={handleInputChange}
                    placeholder="Enter your age"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNum">Phone Number *</Label>
                <Input
                  id="phoneNum"
                  type="tel"
                  value={formData.phoneNum}
                  onChange={handleInputChange}
                  placeholder="e.g., 09123456789"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="physician">Physician</Label>
                <Input
                  id="physician"
                  type="text"
                  value={formData.physician}
                  onChange={handleInputChange}
                  placeholder="Enter physician's name (ex: Dr.Jon Doe)"
                />
              </div>

              <div className="space-y-3 p-4 rounded-lg border border-green-300">
                <Label className="text-green-700 font-bold">Symptoms (Select all that apply)</Label>
                <div className="space-y-2">
                  {symptomsList.map((symptom) => (
                    <div key={symptom} className="flex items-center">
                      <input
                        type="checkbox"
                        id={symptom}
                        checked={formData.symptoms.includes(symptom)}
                        onChange={(e) => handleSymptomChange(symptom, e.target.checked)}
                        className="h-5 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                      <Label htmlFor={symptom} className="ml-2 text-gray-800">
                        {symptom}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="daysSinceOnSet">Number of Days Since Onset of Symptoms</Label>
                <Input
                  id="daysSinceOnSet"
                  type="number"
                  value={formData.daysSinceOnSet}
                  onChange={handleInputChange}
                  placeholder="Add number only (ex: 3)"
                  min="0"
                />
              </div>

              <div className="space-y-3 p-4 rounded-lg border border-green-300 bg-green-50">
                <Label className="text-green-700 font-bold">
                  Select Services of Interest
                </Label>
                {serviceCategories.map((category) => (
                  <div key={category.id} className="pt-4 border-b last:border-b-0">
                    <div
                      className="cursor-pointer text-green-700 font-semibold flex justify-between items-center"
                      onClick={() => toggleCategory(category.id)}
                    >
                      {category.label}
                      <span>{expandedCategory === category.id ? "▲" : "▼"}</span>
                    </div>
                    {expandedCategory === category.id && (
                      <div className="ml-2 mt-2 space-y-4">
                        {category.services.map(({ id, label }) => (
                          <div key={id} className="flex items-center">
                            <input
                              type="checkbox"
                              id={id}
                              checked={formData.services.includes(id)}
                              onChange={(e) =>
                                handleServiceChange(id, e.target.checked)
                              }
                              className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                            />
                            <Label htmlFor={id} className="ml-2 text-gray-800">
                              {label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <Button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : `Submit ${selectedPatientType === "appointment" ? "Appointment" : "Walk-in"} Registration`}
                </Button>
                <Button
                  type="button"
                  className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800"
                  onClick={() => setSelectedPatientType(null)}
                  disabled={isSubmitting}
                >
                  &larr; Back
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        <div id="message-box"></div>
      </div>
    );
  }

  // --- Step 4: Staff Registration ---
  if (selectedType === "staff") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
        <Card className="w-full max-w-sm shadow-xl border-t-4 border-green-600">
          <CardHeader>
            <CardTitle className="text-center text-green-700">Clinic Staff Registration</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleStaffSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="staff@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="staffRole">Staff Role *</Label>
                <select
                  id="staffRole"
                  value={formData.staffRole || ""}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-600"
                  required
                >
                  <option value="">Select Role</option>
                  <option value="secretary">Secretary</option>
                  <option value="doctor">Doctor</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter password (min 6 characters)"
                  required
                  minLength={6}
                />
              </div>
              <div className="space-y-3">
                <Button
                  type="submit"
                  className="w-full bg-[#047a52] hover:bg-[#03503a] text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Registering..." : "Submit Staff Registration"}
                </Button>
                <Button
                  type="button"
                  className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800"
                  onClick={() => setSelectedType(null)}
                  disabled={isSubmitting}
                >
                  &larr; Back to Role Selection
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        <div id="message-box"></div>
      </div>
    );
  }

  return null;
}

export default RegistrationForm;