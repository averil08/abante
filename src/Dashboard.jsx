import React, { useState, useContext } from 'react';
import Sidebar from "@/components/Sidebar";
import { Clock, TrendingUp, Users, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { PatientContext } from "./PatientContext";

const Dashboard = () => {
  const navigate = useNavigate();
  const [nav, setNav] = useState(false);
  const handleNav = () => setNav(!nav);
  
  const { 
    patients, 
    currentServing, 
    setCurrentServing,
    updatePatientStatus,
    cancelPatient,
    avgWaitTime,
    addWaitTime
  } = useContext(PatientContext);

  const doctorName = "Dr. Sarah Gonzales";
  const secretaryName = "Ms. Jenny Cruz";

  const serviceLabels = {
    pedia: "Pediatric", adult: "Adult", senior: "Senior (65+)",
    preventive: "Preventive Exam", "follow-up": "Follow-up",
    cbc: "CBC", platelet: "Platelet Count", esr: "ESR", abo: "Blood Type",
    hbsag: "HBsAg", vdrl: "VDRL/RPR", antiHCV: "Anti-HCV", hpylori: "H.PYLORI",
    dengueIg: "Dengue IgG+IgM", dengueNs1: "Dengue NS1", dengueDuo: "Dengue Duo",
    typhidot: "Typhidot", fbs: "FBS", rbs: "RBS", lipid: "Lipid Profile",
    totalCh: "Total Cholesterol", triglycerides: "Triglycerides", hdl: "HDL",
    ldl: "LDL", alt: "ALT/SGPT", ast: "AST/SGOT", uric: "Uric Acid",
    creatinine: "Creatinine", bun: "BUN", hba1c: "HBA1C", albumin: "Albumin",
    magnesium: "Magnesium", totalProtein: "Total Protein", alp: "ALP",
    phosphorus: "Phosphorus", sodium: "Sodium", potassium: "Potassium",
    ionizedCal: "Ionized Calcium", totalCal: "Total Calcium", chloride: "Chloride",
    urinalysis: "Urinalysis", fecalysis: "Fecalysis", pregnancyT: "Pregnancy Test",
    fecal: "Fecal Occult Blood", semen: "Semen Analysis", tsh: "TSH",
    ft3: "FT3", "75g": "75g OGTT", t4: "T4", t3: "T3", psa: "PSA",
    totalBilirubin: "Total/Direct Bilirubin"
  };

  const getServiceLabel = (serviceId) => serviceLabels[serviceId] || serviceId;

  // ✅ FIXED: Find next waiting patient instead of assuming currentServing + 1
  const handleCallNext = () => {
    // Mark current patient as done
    updatePatientStatus(currentServing, 'done');
    
    // Find the next patient who is waiting (skip cancelled patients)
    const nextWaitingPatient = patients.find(p => 
      p.queueNo > currentServing && p.status === "waiting" && p.inQueue
    );
    
    if (nextWaitingPatient) {
      // Mark the next waiting patient as in progress
      updatePatientStatus(nextWaitingPatient.queueNo, 'in progress');
      setCurrentServing(nextWaitingPatient.queueNo);
    } else {
      // No more waiting patients, just increment
      setCurrentServing(prev => prev + 1);
    }
  };

  // ✅ FIXED: Handle cancel properly
  const handleCancel = () => {
    // Mark current patient as cancelled
    cancelPatient(currentServing);
    
    // Find the next patient who is waiting
    const nextWaitingPatient = patients.find(p => 
      p.queueNo > currentServing && p.status === "waiting" && p.inQueue
    );
    
    if (nextWaitingPatient) {
      // Mark the next waiting patient as in progress
      updatePatientStatus(nextWaitingPatient.queueNo, 'in progress');
      setCurrentServing(nextWaitingPatient.queueNo);
    } else {
      // No more waiting patients, just increment
      setCurrentServing(prev => prev + 1);
    }
  };

  
  // Filter to only show patients in active queue
  const queuePatients = patients.filter(p => p.inQueue && !p.isInactive);
  const totalWaiting = queuePatients.filter(p => p.status === "waiting").length;

  return (
    <div className="flex w-full min-h-screen">
      <Sidebar nav={nav} handleNav={handleNav} />

      <div className="flex-1 min-h-screen bg-gray-50 ml-0 md:ml-52 transition-all duration-300">
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-gray-900">Dashboard — General Consultation</h1>
                  <p className="text-xs sm:text-sm text-gray-600">De Valley Medical Clinic Queue Management</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm text-gray-600">Doctor:</span>
                <span className="text-xs sm:text-sm font-semibold text-gray-900">{doctorName}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm text-gray-600">Secretary:</span>
                <span className="text-xs sm:text-sm font-semibold text-gray-900">{secretaryName}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
            {/* Current Serving */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardDescription className="text-xs sm:text-sm">Current Serving</CardDescription>
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
                  #{String(currentServing).padStart(3, '0')}
                </p>
                <div className="space-y-2">
                  <Button 
                    onClick={handleCallNext} 
                    className="w-full bg-green-600 hover:bg-green-700 text-sm sm:text-base"
                  >
                    Call Next Patient
                  </Button>
                  <Button 
                    onClick={handleCancel}
                    variant="outline"
                    className="w-full text-red-600 border-red-300 hover:bg-red-50 text-sm sm:text-base"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Cancel (No Show)
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Avg Wait Time */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardDescription className="text-xs sm:text-sm">Avg Wait Time</CardDescription>
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">{avgWaitTime} mins</p>
                <Button onClick={addWaitTime} variant="outline" className="w-full text-sm sm:text-base">
                  Add Time (+5 mins)
                </Button>
              </CardContent>
            </Card>

            {/* Total Patients Waiting */}
            <Card className="sm:col-span-2 lg:col-span-1">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardDescription className="text-xs sm:text-sm">Total Patients Waiting</CardDescription>
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-4">{totalWaiting}</p>
                <p className="text-xs sm:text-sm text-gray-500">Currently in queue</p>
              </CardContent>
            </Card>
          </div>

          {/* Patient Queue Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Patient Queue</CardTitle>
              <CardDescription className="text-xs sm:text-sm">List of patients currently in the queue</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Mobile Card View */}
              <div className="block lg:hidden space-y-4">
                {patients.map(patient => (
                  <Card key={patient.queueNo} className="border-l-4 border-l-green-600">
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-bold text-lg text-gray-900">
                            #{String(patient.queueNo).padStart(3, '0')}
                          </p>
                          <p className="text-sm text-gray-600">{patient.name}</p>
                        </div>
                        <Badge
                          variant={
                            patient.status === 'done' ? 'default' : 
                            patient.status === 'in progress' ? 'secondary' : 
                            patient.status === 'cancelled' ? 'destructive' : 
                            'outline'
                          }
                          className={
                            patient.status === 'done'
                              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
                              : patient.status === 'in progress'
                              ? 'bg-green-100 text-green-700 hover:bg-green-100'
                              : patient.status === 'cancelled'
                              ? 'bg-red-100 text-red-700 hover:bg-red-100'
                              : ''
                          }
                        >
                          {patient.status}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Age:</span>
                          <span className="font-medium">{patient.age}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Phone:</span>
                          <span className="font-medium">{patient.phoneNum || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Type:</span>
                          <span className="font-medium">{patient.type}</span>
                        </div>
                        
                        <div className="pt-2 border-t">
                          <p className="text-gray-600 mb-1">Symptoms:</p>
                          <div className="flex flex-wrap gap-1">
                            {patient.symptoms && patient.symptoms.length > 0 ? (
                              patient.symptoms.map((symptom, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                  {symptom}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-gray-400 text-xs">None</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="pt-2">
                          <p className="text-gray-600 mb-1">Services:</p>
                          <div className="flex flex-wrap gap-1">
                            {patient.services && patient.services.length > 0 ? (
                              patient.services.map((serviceId, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                  {getServiceLabel(serviceId)}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-gray-400 text-xs">None</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border px-4 py-2 text-left text-sm font-medium text-gray-600">Queue #</th>
                      <th className="border px-4 py-2 text-left text-sm font-medium text-gray-600">Patient Name</th>
                      <th className="border px-4 py-2 text-left text-sm font-medium text-gray-600">Age</th>
                      <th className="border px-4 py-2 text-left text-sm font-medium text-gray-600">Phone</th>
                      <th className="border px-4 py-2 text-left text-sm font-medium text-gray-600">Type</th>
                      <th className="border px-4 py-2 text-left text-sm font-medium text-gray-600">Symptoms</th>
                      <th className="border px-4 py-2 text-left text-sm font-medium text-gray-600">Services</th>
                      <th className="border px-4 py-2 text-left text-sm font-medium text-gray-600">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patients.map(patient => (
                      <tr key={patient.queueNo} className="border-b transition-colors hover:bg-gray-50">
                        <td className="p-4 align-middle font-semibold">#{String(patient.queueNo).padStart(3, '0')}</td>
                        <td className="p-4 align-middle">{patient.name}</td>
                        <td className="p-4 align-middle">{patient.age}</td>
                        <td className="p-4 align-middle text-gray-600">{patient.phoneNum || 'N/A'}</td>
                        <td className="p-4 align-middle text-gray-500">{patient.type}</td>
                        <td className="p-4 align-middle">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {patient.symptoms && patient.symptoms.length > 0 ? (
                              patient.symptoms.map((symptom, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                  {symptom}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-gray-400 text-xs">None</span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 align-middle">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {patient.services && patient.services.length > 0 ? (
                              patient.services.map((serviceId, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                  {getServiceLabel(serviceId)}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-gray-400 text-xs">None</span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 align-middle">
                          <Badge
                            variant={
                              patient.status === 'done' ? 'default' : 
                              patient.status === 'in progress' ? 'secondary' : 
                              patient.status === 'cancelled' ? 'destructive' : 
                              'outline'
                            }
                            className={
                              patient.status === 'done'
                                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
                                : patient.status === 'in progress'
                                ? 'bg-green-100 text-green-700 hover:bg-green-100'
                                : patient.status === 'cancelled'
                                ? 'bg-red-100 text-red-700 hover:bg-red-100'
                                : ''
                            }
                          >
                            {patient.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;