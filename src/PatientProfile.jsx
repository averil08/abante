import React, { useState, useContext, useMemo } from 'react';
import { PatientContext } from "./PatientContext";
import Sidebar from "@/components/Sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import { Textarea } from '@/components/ui/textarea';
import { Search, User, Calendar, Phone, Stethoscope, FileText, Clock, ChevronRight, ArrowLeft, Edit2, Save, X, AlertCircle, Activity } from 'lucide-react';

const PatientProfile = () => {
  const [nav, setNav] = useState(false);
  const handleNav = () => setNav(!nav);
  
  const { patients } = useContext(PatientContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [diagnoses, setDiagnoses] = useState({});
  const [editingVisit, setEditingVisit] = useState(null);
  const [diagnosisInput, setDiagnosisInput] = useState("");

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

  const saveDiagnosis = (queueNo, diagnosis) => {
    setDiagnoses(prev => ({
      ...prev,
      [queueNo]: diagnosis
    }));
  };

  const handleSaveDiagnosis = () => {
    if (!editingVisit || !diagnosisInput.trim()) return;
    
    saveDiagnosis(editingVisit, diagnosisInput.trim());
    setEditingVisit(null);
    setDiagnosisInput("");
  };

  const handleEditDiagnosis = (queueNo) => {
    setEditingVisit(queueNo);
    setDiagnosisInput(diagnoses[queueNo] || "");
  };

  const handleCancelEdit = () => {
    setEditingVisit(null);
    setDiagnosisInput("");
  };

  const normalizeName = (name) => {
    if (!name) return '';
    return name.toLowerCase().trim();
  };

  const uniquePatients = useMemo(() => {
    const patientMap = new Map();
    
    patients.forEach(visit => {
      if (visit.isInactive) return;
      
      if (visit.type === 'Appointment' && 
          (visit.appointmentStatus === 'pending' || visit.appointmentStatus === 'rejected')) {
        return;
      }
      
      const normalizedName = normalizeName(visit.name);
      const key = normalizedName;
            
      if (!patientMap.has(key)) {
        patientMap.set(key, {
          name: visit.name,
          phoneNum: visit.phoneNum,
          age: visit.age,
          visits: []
        });
      } else {
        const existing = patientMap.get(key);
        
        if (visit.phoneNum) {
          existing.phoneNum = visit.phoneNum;
        }
        
        if (visit.age) {
          existing.age = visit.age;
        }
        
        const hasMoreCapitals = (visit.name.match(/[A-Z]/g) || []).length > 
                               (existing.name.match(/[A-Z]/g) || []).length;
        
        if (hasMoreCapitals || visit.name.length > existing.name.length) {
          existing.name = visit.name;
        }
      }

      patientMap.get(key).visits.push(visit);
    });
  
    return Array.from(patientMap.values()).map(patient => ({
      ...patient,
      visits: patient.visits.sort((a, b) => 
        new Date(b.registeredAt) - new Date(a.registeredAt)
      ),
      totalVisits: patient.visits.length,
      lastVisit: patient.visits[0],
      firstVisit: patient.visits[patient.visits.length - 1]
    })).sort((a, b) => 
      new Date(b.lastVisit.registeredAt) - new Date(a.lastVisit.registeredAt)
    );
  }, [patients]);

  const filteredPatients = uniquePatients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (patient.phoneNum && patient.phoneNum.includes(searchTerm))
  );

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const styles = {
      'waiting': 'bg-yellow-100 text-yellow-700 border-yellow-300',
      'in progress': 'bg-blue-100 text-blue-700 border-blue-300',
      'done': 'bg-emerald-100 text-emerald-700 border-emerald-300',
      'cancelled': 'bg-red-100 text-red-700 border-red-300'
    };
    return styles[status] || 'bg-gray-100 text-gray-700 border-gray-300';
  };

  // Patient List View
  if (!selectedPatient) {
    return (
      <div className="flex w-full min-h-screen">
        <Sidebar className='pt-10' nav={nav} handleNav={handleNav} />

        <div className="flex-1 min-h-screen bg-gray-50 ml-0 md:ml-52">
          <div className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
              <div className="flex items-center gap-3 mb-4 pt-12 lg:pt-3">
                <User className="w-6 h-6 text-green-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Patient Profiles</h1>
                  <p className="text-sm text-gray-600">View patient visit history and diagnosis information</p>
                </div>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by name or phone number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full max-w-md"
                />
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto p-4 sm:p-6">
            <Card>
              <CardHeader>
                <CardTitle>All Patients ({filteredPatients.length})</CardTitle>
                <CardDescription>Click on a patient to view their complete profile and diagnoses</CardDescription>
              </CardHeader>
              <CardContent>
                {filteredPatients.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <User className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium mb-2">No patients found</p>
                    <p className="text-sm">Try adjusting your search criteria</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredPatients.map((patient, idx) => {
                      const lastDiagnosis = diagnoses[patient.lastVisit.queueNo];
                      
                      return (
                        <Card 
                          key={idx}
                          className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-green-600"
                          onClick={() => setSelectedPatient(patient)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="text-lg font-bold text-gray-900">{patient.name}</h3>
                                  <Badge variant="outline" className="text-xs">
                                    {patient.totalVisits} {patient.totalVisits === 1 ? 'visit' : 'visits'}
                                  </Badge>
                                  {patient.totalVisits > 1 && (
                                    <Badge className="text-xs bg-blue-100 text-blue-700 border-blue-300">
                                      Returning Patient
                                    </Badge>
                                  )}
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                                  <div className="flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    <span>Age: {patient.age}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4" />
                                    <span>{patient.phoneNum || 'No phone'}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    <span>Last visit: {formatDate(patient.lastVisit.registeredAt).split(',')[0]}</span>
                                  </div>
                                </div>

                                {lastDiagnosis && (
                                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                                    <div className="flex items-start gap-2">
                                      <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                      <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium text-blue-700 mb-1">Last Diagnosis:</p>
                                        <p className="text-sm text-blue-900 line-clamp-2">{lastDiagnosis}</p>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {patient.lastVisit.assignedDoctor && (
                                  <div className="mt-2 flex items-center gap-2 text-sm">
                                    <Stethoscope className="w-4 h-4 text-green-600" />
                                    <span className="font-medium text-green-700">
                                      {patient.lastVisit.assignedDoctor.name}
                                    </span>
                                  </div>
                                )}
                              </div>
                              
                              <ChevronRight className="w-6 h-6 text-gray-400" />
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Patient Detail View - SINGLE COLUMN
  return (
    <div className="flex w-full min-h-screen">
      <Sidebar nav={nav} handleNav={handleNav} />

      <div className="flex-1 min-h-screen bg-gray-50 ml-0 md:ml-52">
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 pt-10">
            <Button 
              onClick={() => setSelectedPatient(null)}
              variant="outline"
              className="mb-3"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Patient List
            </Button>
            
            <div className="flex items-center gap-3">
              <User className="w-8 h-8 text-green-600" />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-gray-900">{selectedPatient.name}</h1>
                  {selectedPatient.totalVisits > 1 && (
                    <Badge className="bg-blue-100 text-blue-700 border-blue-300">
                      Returning Patient
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600">Patient Profile & Medical Records</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
          
          {/* 1. DIAGNOSIS HISTORY - TOP PRIORITY */}
          <Card className="border-2 border-blue-400 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <AlertCircle className="w-6 h-6" />
                Diagnosis History
              </CardTitle>
              <CardDescription className="text-blue-700">Medical diagnoses for each visit - Click Edit/Add to update</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {(() => {
                const diagnosisHistory = selectedPatient.visits.map((visit, idx) => ({
                  visit,
                  diagnosis: diagnoses[visit.queueNo],
                  visitNumber: selectedPatient.visits.length - idx,
                  isEditing: editingVisit === visit.queueNo
                }));

                return (
                  <div className="space-y-4">
                    {diagnosisHistory.map(({ visit, diagnosis, visitNumber, isEditing }) => (
                      <div key={visit.queueNo} className="p-5 border-2 border-gray-200 rounded-lg bg-white hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-bold text-lg text-gray-900">Visit #{visitNumber}</h4>
                              <Badge className={getStatusBadge(visit.status)}>
                                {visit.status}
                              </Badge>
                              <Badge variant="outline" className={
                                visit.type === 'Walk-in' ? 'bg-blue-50 text-blue-700 border-blue-300' : 'bg-purple-50 text-purple-700 border-purple-300'
                              }>
                                {visit.type}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>{formatDate(visit.registeredAt)}</span>
                              </div>
                              {visit.assignedDoctor && (
                                <div className="flex items-center gap-1">
                                  <Stethoscope className="w-4 h-4 text-green-600" />
                                  <span className="text-green-700 font-medium">Dr. {visit.assignedDoctor.name}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          {!isEditing && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditDiagnosis(visit.queueNo)}
                              className="h-9 px-4"
                            >
                              <Edit2 className="w-4 h-4 mr-1" />
                              {diagnosis ? 'Edit' : 'Add'}
                            </Button>
                          )}
                        </div>

                        {isEditing ? (
                          <div className="space-y-3">
                            <Textarea
                              value={diagnosisInput}
                              onChange={(e) => setDiagnosisInput(e.target.value)}
                              placeholder="Enter diagnosis for this visit..."
                              className="min-h-[120px] text-base"
                              autoFocus
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={handleSaveDiagnosis}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <Save className="w-4 h-4 mr-1" />
                                Save Diagnosis
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCancelEdit}
                              >
                                <X className="w-4 h-4 mr-1" />
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : diagnosis ? (
                          <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-md mt-3">
                            <p className="text-sm font-semibold text-blue-800 mb-2">DIAGNOSIS:</p>
                            <p className="text-base text-blue-900 whitespace-pre-wrap leading-relaxed">{diagnosis}</p>
                          </div>
                        ) : (
                          <div className="p-4 bg-gray-50 border border-gray-200 rounded-md mt-3">
                            <p className="text-sm text-gray-500 italic text-center">No diagnosis recorded for this visit</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })()}
            </CardContent>
          </Card>

          {/* 2. BASIC INFORMATION */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-green-600" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Full Name</p>
                  <p className="font-semibold text-gray-900 text-lg">{selectedPatient.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Current Age</p>
                  <p className="font-semibold text-gray-900">{selectedPatient.age} years old</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Contact Number</p>
                  <p className="font-semibold text-gray-900">{selectedPatient.phoneNum || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Visits</p>
                  <p className="font-semibold text-gray-900">{selectedPatient.totalVisits}</p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">First Visit</p>
                  <p className="font-semibold text-gray-900">{formatDate(selectedPatient.firstVisit.registeredAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Last Visit</p>
                  <p className="font-semibold text-gray-900">{formatDate(selectedPatient.lastVisit.registeredAt)}</p>
                </div>
              </div>

              {selectedPatient.lastVisit.assignedDoctor && (
                <div className="mt-6 pt-6 border-t">
                  <p className="text-sm text-gray-600 mb-2">Current/Last Assigned Doctor</p>
                  <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-md">
                    <Stethoscope className="w-6 h-6 text-green-600" />
                    <p className="font-semibold text-green-700 text-lg">
                      {selectedPatient.lastVisit.assignedDoctor.name}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 3. VISIT HISTORY DETAILS */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-green-600" />
                Visit History Details
              </CardTitle>
              <CardDescription>Complete timeline of all patient visits ({selectedPatient.visits.length} total)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {selectedPatient.visits.map((visit, idx) => (
                  <Card key={visit.queueNo} className={`border-l-4 ${
                    visit.status === 'done' ? 'border-l-emerald-600' :
                    visit.status === 'cancelled' ? 'border-l-red-600' :
                    visit.status === 'in progress' ? 'border-l-blue-600' :
                    'border-l-yellow-600'
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-gray-900">Visit #{selectedPatient.visits.length - idx}</h4>
                            <Badge className={getStatusBadge(visit.status)}>
                              {visit.status}
                            </Badge>
                            {visit.requeued && (
                              <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-300">
                                Requeued
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">Queue #{String(visit.queueNo).padStart(3, '0')}</p>
                        </div>
                        <Badge variant="outline" className={
                          visit.type === 'Walk-in' ? 'bg-blue-50 text-blue-700 border-blue-300' : 'bg-purple-50 text-purple-700 border-purple-300'
                        }>
                          {visit.type}
                        </Badge>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600">Registered:</span>
                          <span className="font-medium">{formatDate(visit.registeredAt)}</span>
                        </div>
                        
                        {visit.assignedDoctor && (
                          <div className="flex items-center gap-2">
                            <Stethoscope className="w-4 h-4 text-green-600" />
                            <span className="text-gray-600">Doctor:</span>
                            <span className="font-medium text-green-700">{visit.assignedDoctor.name}</span>
                          </div>
                        )}

                        {visit.completedAt && (
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-emerald-600" />
                            <span className="text-gray-600">Completed:</span>
                            <span className="font-medium text-emerald-700">{formatDate(visit.completedAt)}</span>
                          </div>
                        )}

                        {visit.cancelledAt && (
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-red-600" />
                            <span className="text-gray-600">Cancelled:</span>
                            <span className="font-medium text-red-700">{formatDate(visit.cancelledAt)}</span>
                          </div>
                        )}
                      </div>

                      {visit.symptoms && visit.symptoms.length > 0 && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-sm text-gray-600 mb-2 font-medium">Symptoms:</p>
                          <div className="flex flex-wrap gap-1">
                            {visit.symptoms.map((symptom, i) => (
                              <Badge key={i} variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                                {symptom}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {visit.services && visit.services.length > 0 && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-sm text-gray-600 mb-2 font-medium">Services:</p>
                          <div className="flex flex-wrap gap-1">
                            {visit.services.map((serviceId, i) => (
                              <Badge key={i} variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                {getServiceLabel(serviceId)}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {visit.type === 'Appointment' && visit.appointmentDateTime && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-sm text-gray-600">Appointment Date:</p>
                          <p className="font-medium text-sm">{formatDate(visit.appointmentDateTime)}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 4. SERVICE HISTORY SUMMARY */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-600" />
                Services Availed Summary
              </CardTitle>
              <CardDescription>All services requested across all visits</CardDescription>
            </CardHeader>
            <CardContent>
              {(() => {
                const allServices = selectedPatient.visits
                  .flatMap(visit => visit.services || [])
                  .reduce((acc, service) => {
                    acc[service] = (acc[service] || 0) + 1;
                    return acc;
                  }, {});

                const serviceEntries = Object.entries(allServices).sort((a, b) => b[1] - a[1]);

                if (serviceEntries.length === 0) {
                  return <p className="text-gray-500 text-center py-4">No services recorded</p>;
                }

                return (
                  <div className="flex flex-wrap gap-2">
                    {serviceEntries.map(([serviceId, count]) => (
                      <Badge 
                        key={serviceId} 
                        variant="outline" 
                        className="bg-green-50 text-green-700 border-green-300 text-sm py-1"
                      >
                        {getServiceLabel(serviceId)} <span className="ml-1 font-bold">×{count}</span>
                      </Badge>
                    ))}
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PatientProfile;