import React, { useState, useContext } from "react";
import { PatientContext } from "./PatientContext";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { QrCode, User, Users, ChartNoAxesCombined, TicketCheck, Calendar } from "lucide-react";
import { AiOutlineClose, AiOutlineMenu } from "react-icons/ai";
import { useNavigate, Navigate } from "react-router-dom";
import Logo from "./assets/logo-abante.png";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./datepicker.css";
import {
  registerWalkInPatient,
  registerAppointmentPatient,
  checkAppointmentAvailable
} from "./lib/supabaseClient";

function Checkin() {
  const navigate = useNavigate();
  const { patients, addPatient, activePatient, setActivePatient } = useContext(PatientContext);

  // View state: 'clinic' or 'patient'
  const [viewMode, setViewMode] = useState('clinic');
  const [nav, setNav] = useState(false);
  const handleNav = () => setNav(!nav);
  
  const [selectedPatientType, setSelectedPatientType] = useState(null);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    phoneNum: "",
    physician: "",
    symptoms: [],
    services: [],
    appointmentDateTime: "",
    daysSinceOnSet: "",
  });

  const symptomsList = [
    'Fever','Cough','Sore Throat','Headache','Stomach Pain',
    'Vomiting','Diarrhea','Rash','Ear Pain','Runny Nose',
    'Difficulty Breathing','Itching'
  ];

  const serviceCategories = [
    {
      id: "general",
      label: "General Consultation",
      services: [
        { id: "pedia", label: "Pediatric Consultation" },
        { id: "adult", label: "Adult Consultation" },
        { id: "senior", label: "Senior Consultation (65+)" },
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
        { id: "abo", label: "Blood Type Test: ABO/Rh Typing" },
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

  const toggleCategory = (id) => {
    setExpandedCategory(expandedCategory === id ? null : id);
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const handleSymptomChange = (symptom, isChecked) => {
    setFormData((prev) => {
      const symptoms = prev.symptoms;
      if (isChecked && !symptoms.includes(symptom)) return { ...prev, symptoms: [...symptoms, symptom] };
      if (!isChecked) return { ...prev, symptoms: symptoms.filter(s => s !== symptom) };
      return prev;
    });
  };

  const handleServiceChange = (serviceId, isChecked) => {
    setFormData((prev) => {
      const services = prev.services;
      if (isChecked && !services.includes(serviceId)) return { ...prev, services: [...services, serviceId] };
      if (!isChecked) return { ...prev, services: services.filter(s => s !== serviceId) };
      return prev;
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
      symptoms: [],
      services: [],
      appointmentDateTime: "",
      daysSinceOnSet: "",
    });
    setExpandedCategory(null);
  };

  if (activePatient) {
    return <Navigate to="/qstatus" />;
  }

  const handlePatientSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let result;

      if (selectedPatientType === "Walk-in") {
        result = await registerWalkInPatient(formData);
      } else if (selectedPatientType === "Appointment") {
        if (!formData.appointmentDateTime) {
          showMessage("Validation Error", "Please select appointment date and time.", false);
          setIsSubmitting(false);
          return;
        }

        const isAvailable = await checkAppointmentAvailable(formData.appointmentDateTime);
        if (!isAvailable) {
          showMessage("Slot Not Available", "This time is already booked.", false);
          setIsSubmitting(false);
          return;
        }

        result = await registerAppointmentPatient(formData, formData.appointmentDateTime);
      }

      if (result.success) {
        const newPatient = {
          name: formData.name,
          age: formData.age,
          phoneNum: formData.phoneNum,
          type: selectedPatientType,
          symptoms: formData.symptoms,
          services: formData.services,
          queueNo: patients.length + 1,
        };

        addPatient(newPatient);
        setActivePatient(newPatient);
        resetForm();
        showMessage("Success", `Registration completed for ${formData.name}`, true);

        setTimeout(() => {
          navigate("/qstatus");
        }, 1000);
      } else {
        showMessage("Error", result.error, false);
      }
    } catch (err) {
      console.error("Patient submission error:", err);
      showMessage("Error", err.message || "Unexpected error occurred.", false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // === CLINIC VIEW - QR CODE ONLY ===
  if (viewMode === 'clinic') {
    return (
      <div className="flex w-full min-h-screen">
        {/* DESKTOP SIDEBAR */}
        <div className="hidden md:flex fixed left-0 top-0 h-full w-52 bg-gray-50 border-r border-gray-300 shadow-lg flex-col z-40">
          <img className="w-[175px] m-4" src={Logo} alt="Logo" />
          <ul className="mt-8 text-sm text-gray-700">
            <li className="group p-4 flex items-center gap-2 hover:bg-green-600 hover:text-white hover:cursor-pointer" 
                onClick={() => navigate("/dashboard")}>
              <Users className="w-5 h-5 text-green-600 group-hover:text-white" />
              Clinic Dashboard
            </li>

            <li className="group p-4 flex items-center gap-2 hover:bg-green-600 hover:text-white hover:cursor-pointer" 
                onClick={() => navigate("/analytics")}>
              <ChartNoAxesCombined className="w-5 h-5 text-green-600 group-hover:text-white" />
              Clinic Analytics
            </li>

            <li className="group p-4 flex items-center gap-2 hover:bg-green-600 hover:text-white hover:cursor-pointer" 
                onClick={() => navigate("/appointment")}>
              <Calendar className="w-5 h-5 text-green-600 group-hover:text-white" />
              Appointments
            </li>

            <li className="group p-4 flex items-center gap-2 bg-green-600 text-white hover:cursor-pointer" 
                onClick={() => navigate("/checkin")}>
              <TicketCheck className="w-5 h-5 text-white" />
              Patient Check-In
            </li>
          </ul>
        </div>

        {/* MOBILE HAMBURGER */}
        <div className="md:hidden fixed top-4 right-4 z-50" onClick={handleNav}>
          {nav ? <AiOutlineClose size={24} /> : <AiOutlineMenu size={24} />}
        </div>

        {/* MOBILE SIDEBAR */}
        <div className={`fixed top-0 left-0 w-64 h-full bg-white shadow-lg transform transition-transform duration-300 z-50
          ${nav ? "translate-x-0" : "-translate-x-full"} md:hidden`}>
          <img className="w-[175px] m-10" src={Logo} alt="Logo" />
          <ul className="mt-10 text-sm text-gray-700">
            <li className="group p-4 flex items-center gap-2 hover:bg-green-600 hover:text-white hover:cursor-pointer" 
                onClick={() => { navigate("/dashboard"); setNav(false); }}>
              <Users className="w-5 h-5 text-green-600 group-hover:text-white" />
              Clinic Dashboard
            </li>

            <li className="group p-4 flex items-center gap-2 hover:bg-green-600 hover:text-white hover:cursor-pointer" 
                onClick={() => { navigate("/analytics"); setNav(false); }}>
              <ChartNoAxesCombined className="w-5 h-5 text-green-600 group-hover:text-white" />
              Clinic Analytics
            </li>

            <li className="group p-4 flex items-center gap-2 hover:bg-green-600 hover:text-white hover:cursor-pointer" 
                onClick={() => { navigate("/appointment"); setNav(false); }}>
              <Calendar className="w-5 h-5 text-green-600 group-hover:text-white" />
              Appointments
            </li>

            <li className="group p-4 flex items-center gap-2 bg-green-600 text-white hover:cursor-pointer" 
                onClick={() => { navigate("/checkin"); setNav(false); }}>
              <TicketCheck className="w-5 h-5 text-white" />
              Patient Check-In
            </li>
          </ul>
        </div>

        {/* MAIN CONTENT */}
        <div className="flex-1 min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 ml-0 md:ml-52 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl shadow-2xl border-t-4 border-green-600">
            <CardHeader className="text-center pb-2">
              <div className="flex justify-center mb-4">
                <img src={Logo} alt="Clinic Logo" className="w-48 h-auto" />
              </div>
              <CardTitle className="text-2xl sm:text-3xl text-green-700 mb-2">
                Patient Check-In System
              </CardTitle>
              <p className="text-gray-600 text-sm sm:text-base">
                De Valley Medical Clinic Queue Management
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* QR Code Display */}
              <div className="bg-white p-8 rounded-xl border-2 border-green-200 flex flex-col items-center">
                <QrCode className="w-48 h-48 sm:w-64 sm:h-64 text-green-600 mb-4" strokeWidth={1.5} />
                <p className="text-center text-gray-700 font-medium text-lg mb-2">
                  Scan to Register
                </p>
                <p className="text-center text-gray-500 text-sm max-w-md">
                  Patients can scan this QR code with their mobile device to access the registration form and join the queue.
                </p>
              </div>

              {/* View Toggle Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                <Button 
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  disabled
                >
                  <QrCode className="w-5 h-5 mr-2" />
                  Clinic View (Current)
                </Button>
                <Button 
                  onClick={() => setViewMode('patient')}
                  variant="outline"
                  className="flex-1 border-green-600 text-green-600 hover:bg-green-50"
                >
                  <User className="w-5 h-5 mr-2" />
                  Switch to Patient View
                </Button>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm">
                <p className="text-amber-800">
                  <strong>Note:</strong> This is the clinic view showing the QR code for patients to scan. 
                  Click "Switch to Patient View" to see what patients will interact with.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // === PATIENT VIEW - REGISTRATION FORMS ===
  
  // Step 1: Patient Type Selection
  if (!selectedPatientType) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-t-4 border-green-600">
          {/* Back to Clinic View Button */}
          <div className="p-4 border-b border-gray-200">
            <Button 
              onClick={() => setViewMode('clinic')}
              variant="outline"
              size="sm"
              className="text-green-600 border-green-600 hover:bg-green-50"
            >
              <QrCode className="w-4 h-4 mr-2" />
              Back to Clinic View
            </Button>
          </div>

          <div className="flex justify-center items-center mt-4">
            <img src={Logo} alt="Logo" className="w-[190px] h-auto" />
          </div>

          <CardHeader>
            <CardTitle className="text-center text-green-700">Patient Registration</CardTitle>
            <p className="text-center text-sm text-gray-500">Choose how you'd like to register</p>
          </CardHeader>
          
          <CardContent className="flex flex-col space-y-4">
            <Button 
              className="w-full bg-[#33a37f] hover:bg-[#059669] text-white py-6 text-lg"
              onClick={() => setSelectedPatientType("Appointment")}
            >
              Book Appointment
            </Button>
            <Button 
              className="w-full bg-[#33a37f] hover:bg-[#059669] text-white py-6 text-lg"
              onClick={() => setSelectedPatientType("Walk-in")}
            >
              Walk-in Registration
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Step 2: Patient Form
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-xl border-t-4 border-green-600 my-8">
        {/* Back to Clinic View Button */}
        <div className="p-4 border-b border-gray-200">
          <Button 
            onClick={() => setViewMode('clinic')}
            variant="outline"
            size="sm"
            className="text-green-600 border-green-600 hover:bg-green-50"
          >
            <QrCode className="w-4 h-4 mr-2" />
            Back to Clinic View
          </Button>
        </div>

        <CardHeader>
          <CardTitle className="text-center text-green-700">
            {selectedPatientType === "Appointment" ? "Book Appointment" : "Walk-in Registration"}
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {selectedPatientType === "Appointment" && (
            <div className="space-y-4 mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <Label htmlFor="appointmentDateTime">Appointment Date & Time *</Label>
              <DatePicker
                selected={formData.appointmentDateTime ? new Date(formData.appointmentDateTime) : null}
                onChange={(date) => setFormData({ ...formData, appointmentDateTime: date ? date.toISOString() : "" })}
                showTimeSelect timeFormat="h:mm aa" timeIntervals={30} minDate={new Date()}
                minTime={new Date(new Date().setHours(8,0,0,0))} maxTime={new Date(new Date().setHours(17,0,0,0))}
                dateFormat="MMMM d, yyyy h:mm aa"
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>
          )}

          <form onSubmit={handlePatientSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input id="name" type="text" value={formData.name} onChange={handleInputChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Age *</Label>
                <Input id="age" type="number" value={formData.age} onChange={handleInputChange} required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNum">Phone Number *</Label>
              <Input id="phoneNum" type="tel" value={formData.phoneNum} onChange={handleInputChange} required />
            </div>

            <div className="space-y-3 p-4 rounded-lg border border-green-300">
              <Label className="text-green-700 font-bold">Symptoms (Select all that apply)</Label>
              {symptomsList.map(symptom => (
                <div key={symptom} className="flex items-center">
                  <input type="checkbox" id={symptom} checked={formData.symptoms.includes(symptom)}
                    onChange={(e) => handleSymptomChange(symptom, e.target.checked)}
                    className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500" />
                  <Label htmlFor={symptom} className="ml-2">{symptom}</Label>
                </div>
              ))}
            </div>

            <div className="space-y-3 p-4 rounded-lg border border-green-300 bg-green-50">
              <Label className="text-green-700 font-bold">Select Services</Label>
              {serviceCategories.map(cat => (
                <div key={cat.id} className="pt-2 border-b last:border-b-0">
                  <div className="cursor-pointer flex justify-between font-semibold text-green-700"
                    onClick={() => toggleCategory(cat.id)}>
                    {cat.label} <span>{expandedCategory === cat.id ? "▲" : "▼"}</span>
                  </div>
                  {expandedCategory === cat.id && (
                    <div className="ml-2 mt-2 space-y-2">
                      {cat.services.map(svc => (
                        <div key={svc.id} className="flex items-center">
                          <input type="checkbox" id={svc.id} checked={formData.services.includes(svc.id)}
                            onChange={(e) => handleServiceChange(svc.id, e.target.checked)}
                            className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500" />
                          <Label htmlFor={svc.id} className="ml-2">{svc.label}</Label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Registration"}
              </Button>
              <Button type="button" className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800" onClick={() => setSelectedPatientType(null)}>
                ← Back
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      <div id="message-box"></div>
    </div>
  );
}

export default Checkin;