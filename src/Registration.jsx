import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Logo from "./assets/logo-abante.png";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./datepicker.css";

function RegistrationForm() {
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
    daysSinceOnSet: "",
  });

  const [selectedPatientType, setSelectedPatientType] = useState(null);

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
  ] 

  // For collapsible categories
  const [expandedCategory, setExpandedCategory] = useState(null);
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
        return { ...prevData, symptoms: currentSymptoms.filter((s) => s !== symptom)};
      }
      return prevData;
    })
  }

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

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Registration Data:", formData);
    document.getElementById("message-box").innerHTML = `
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white p-6 rounded-lg shadow-2xl max-w-sm text-center">
          <h3 class="text-xl font-bold text-green-600 mb-4">Registration Successful!</h3>
          <p class="text-gray-700 text-left mb-4 break-words">
            Role: ${selectedType}
            <br/>Data: ${JSON.stringify(formData, null, 2)}
          </p>
          <button onclick="document.getElementById('message-box').innerHTML=''" class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">Close</button>
        </div>
      </div>
    `;
  };

  // --- Services Data ---
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
        { id: "vdrl", label: "VDRL/RPR (Syphilis Screening)"},
        { id: "antiHCV", label: "Anti-HCV (Hepatitis C Screening)" },
        { id: "hpylori", label: "H.PYLORI (H. pylori Stomach Bacteria Test)" },
        { id: "dengueIg", label: "Dengue IgG+IgM (Dengue Fever Screening: Past/Current)" },
        { id: "dengueNs1", label: "Dengue NS1 (Early Dengue Fever Test)" },
        { id: "dengueDuo", label: "Dengue Duo: NS1, IgG+IgM (Complete Dengue Test) " },
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
        { id: "ast", label: "AST/SGOT (Liver Function Test" },
        { id: "uric", label: "Uric Acid" },
        { id: "creatinine", label: "Creatinine (Kidney Function Test)" },
        { id: "bun", label: "Bun (Kidney Function Test)" },
        { id: "hba1c", label: "HBA1C (Long-Term Blood Sugar)" },
        { id: "albumin", label: "Albumin (Proterin in blood)" },
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

  // --- Step 2: Patient Registration ---
  if (selectedType === "patient") {
    if (!selectedPatientType) {
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

    // Appointment or Walk-in section
    if (selectedPatientType === "appointment" || selectedPatientType === "walkIn") {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
          <Card className="w-full max-w-lg shadow-xl border-t-4 border-green-600">
            <CardHeader>
              <CardTitle className="text-center text-green-700 ">
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
              {/* Appointment Calendar */}
              {selectedPatientType === "appointment" && (
                <div className="space-y-4 mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-gray-700 font-semibold text-center">
                    Select preferred appointment schedule
                  </p>
                  <div className="space-y-2">
                    <Label htmlFor="appointmentDateTime">Appointment Date & Time </Label>
                    <DatePicker
                      selected={formData.appointmentDateTime ? new Date(formData.appointmentDateTime) : null}
                      onChange={(date) => setFormData({ ...formData, appointmentDateTime: date ? date.toISOString() : "" })}
                      showTimeSelect
                      timeFormat="h:mm aa"
                      timeIntervals={50}
                      minTime={new Date().setHours(8,0,0,0)} 
                      maxTime={new Date().setHours(17,0,0,0)} 
                      dateFormat="MMMM d, yyyy h:mm aa"
                      className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-600"
                      placeholderText="Select date and time"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Patient Info Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name & Age */}
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

                {/* Phone & Physician */}
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

                {/*Symptoms Checkbox */}
                <div className="space-y-3 p-4 rounded-lg border border-green-300 border-green-500">
                  <Label className="text-green-700 font-bold">Symptoms (Select all that apply)</Label>
                  <div classname="space-y-2">
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

                {/*Number of days since onset of symptoms */}
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

                {/* Services */}
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

                {/* Buttons */}
                <div className="space-y-3">
                  <Button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    Submit {selectedPatientType === "appointment" ? "Appointment" : "Walk-in"} Registration
                  </Button>
                  <Button
                    type="button"
                    className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800"
                    onClick={() => setSelectedPatientType(null)}
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
  }

  // --- Step 3: Staff Registration ---
  if (selectedType === "staff") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
        <Card className="w-full max-w-sm shadow-xl border-t-4 border-green-600">
          <CardHeader>
            <CardTitle className="text-center text-green-700">Clinic Staff Registration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="staffRole">Staff Role</Label>
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
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter password"
                required
              />
            </div>
            <Button
              className="w-full bg-[#047a52] hover:bg-[#03503a] text-white"
              onClick={handleSubmit}
            >
              Submit Staff Registration
            </Button>
            <Button
              className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800"
              onClick={() => setSelectedType(null)}
            >
              &larr; Back to Role Selection
            </Button>
          </CardContent>
        </Card>
        <div id="message-box"></div>
      </div>
    );
  }

  return null; // Fallback, though it shouldn't reach here
}

export default RegistrationForm;
