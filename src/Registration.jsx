import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Logo from "./assets/logo-abante.png"

function RegistrationForm() {
  const [selectedType, setSelectedType] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    phoneNum: "",
    physician: "",
    staffId: "",
    services: [],
  });

  // For collapsible categories
  const [expandedCategory, setExpandedCategory] = useState(null);
  const toggleCategory = (id) => {
    setExpandedCategory(expandedCategory === id ? null : id);
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
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
        { id: "senior", label: "Senior/Geriatric Consultation" },
        { id: "preventive", label: "Preventive/Annual Physical Exam" },
        { id: "follow-up", label: "Follow-up Consultation" },
      ],
    },
    {
      id: "hematology",
      label: "Hematology",
      services: [
        { id: "cbc", label: "CBC" },
        { id: "platelet", label: "Platelet Count" },
        { id: "esr", label: "ESR" },
        { id: "abo", label: "ABO/Rh Typing (Direct and Reverse)" },
      ],
    },
    {
      id: "immunology",
      label: "Immunology & Serology",
      services: [
        { id: "hbsag", label: "HBsAg" },
        { id: "vdrl", label: "VDRL/RPR" },
        { id: "antiHCV", label: "Anti-HCV" },
        { id: "hpylori", label: "H.PYLORI" },
        { id: "dengueIg", label: "Dengue IgG+IgM" },
        { id: "dengueNs1", label: "Dengue NS1" },
        { id: "dengueDuo", label: "Dengue Duo (NS1, IgG+IgM)" },
        { id: "typhidot", label: "Typhidot" },
      ],
    },
    {
      id: "chemistry",
      label: "Clinical Chemistry",
      services: [
        { id: "fbs", label: "FBS" },
        { id: "rbs", label: "RBS" },
        { id: "lipid", label: "Lipid Profile" },
        { id: "totalCh", label: "Total Cholesterol" },
        { id: "triglycerides", label: "Triglycerides" },
        { id: "hdl", label: "HDL" },
        { id: "ldl", label: "LDL" },
        { id: "alt", label: "ALT/SGPT" },
        { id: "ast", label: "AST/SGOT" },
        { id: "uric", label: "Uric Acid" },
        { id: "creatinine", label: "Creatinine" },
        { id: "bun", label: "Bun" },
        { id: "hba1c", label: "HBA1C" },
        { id: "albumin", label: "Albumin" },
        { id: "magnesium", label: "Magnesium"},
        { id: "totalProtein", label: "Total Protein"},
        { id: "alp", label: "ALP" },
        { id: "phosphorus", label: "Phosphorus"},
        { id: "sodium", label: "Sodium"},
        { id: "potassium", label: "Potassium"},
        { id: "ionizedCal", label: "Ionized Calcium"},
        { id: "totalCal", label: "Total Calcium" },
        { id: "chloride", label: "Chloride"},
      ],
    },
    {
      id: "microscopy",
      label: "Clinical Microscopy & Parasitology",
      services: [
        { id: "urinaysis", label: "Urinalysis"},
        { id: "fecalysis", label: "Fecalysis" },
        { id: "pregnancyT", label: "Pregnancy Test"},
        { id: "fecal", label: "Fecal Occult Blood"},
        { id: "semen", label: "Semen Analysis"},
      ],
    },
    {
      id: "others",
      label: "Others",
      services: [
        { id: "tsh", label: "TSH"},
        { id: "ft3", label: "FT3"},
        { id: "75g", label: "75 Grams OGTT"},
        { id: "t4", label: "T4"},
        { id: "t3", label: "T3"},
        { id: "psa", label: "PSA"},
        { id: "totalBiliburin", label: "Total/ Direct Biliburin"},
      ],
    },
  ];

  // --- Step 1: Role Selection ---
  if (!selectedType) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
        <Card className="w-full max-w-md shadow-xl border-t-4 border-green-600">
          <div className="flex justify-center mt-4">
            <img src={Logo} alt="Abante Logo" className="w-30 h-24 object-contain"/>
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
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
        <Card className="w-full max-w-lg shadow-xl border-t-4 border-green-600">
          <CardHeader>
            <CardTitle className="text-center text-green-700">Patient Account Registration</CardTitle>
            <p className="text-sm text-center text-gray-500">Fields marked with * are required.</p>
          </CardHeader>
          <CardContent>
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
                  placeholder="Enter physician's name (if applicable)"
                />
              </div>

              {/* Services */}
              <div className="space-y-3 p-4 rounded-lg border border-green-300 bg-green-50">
                <Label className="text-green-700 font-bold">Select Services of Interest</Label>

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
                      <div className="ml-2 mt-2 space-y-2">
                        {category.services.map(({ id, label }) => (
                          <div key={id} className="flex items-center">
                            <input
                              type="checkbox"
                              id={id}
                              checked={formData.services.includes(id)}
                              onChange={(e) => handleServiceChange(id, e.target.checked)}
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
                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white">
                  Submit Patient Registration
                </Button>
                <Button
                  type="button"
                  className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800"
                  onClick={() => setSelectedType(null)}
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
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter password"
              />
            </div>

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
}

export default RegistrationForm;
