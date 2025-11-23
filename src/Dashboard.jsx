import React, { useState, useContext, useEffect } from 'react';
import Sidebar from "@/components/Sidebar";
import { Clock, TrendingUp, Users, XCircle, CheckCircle2  } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import Logo from "./assets/logo-abante.png";
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
    callNextPatient,
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

  const getStatusBadge = (status) => {
    switch (status) {
      case 'waiting':
        return { text: 'Waiting', className: 'bg-yellow-100 text-yellow-700' };
      case 'in progress':
        return { text: 'In Progress', className: 'bg-blue-100 text-blue-700' };
      case 'done':
        return { text: 'Completed', className: 'bg-emerald-100 text-emerald-700' };
      case 'cancelled':
        return { text: 'Cancelled', className: 'bg-red-100 text-red-700' };
      default:
        return { text: status, className: 'bg-gray-100 text-gray-700' };
    }
  };

  const handleCallNext = () => {
    const currentPatient = patients.find(p => p.queueNo === currentServing);
    if (currentPatient && currentPatient.id) {
      updatePatientStatus(currentPatient.id, 'done');
    } else {
      console.warn('No current patient found to mark done for queueNo', currentServing);
    }

    const nextPriorityPatient = patients.find(p =>
      p.status === "waiting" && p.inQueue && p.isPriority
    );

    if (nextPriorityPatient) {
      if (nextPriorityPatient.id) updatePatientStatus(nextPriorityPatient.id, 'in progress');
      setCurrentServing(nextPriorityPatient.queueNo);
      return;
    }

    const nextWaitingPatient = patients.find(p =>
     p.status === "waiting" && p.inQueue && !p.isPriority
    );

    if (nextWaitingPatient) {
      if (nextWaitingPatient.id) updatePatientStatus(nextWaitingPatient.id, 'in progress');
      setCurrentServing(nextWaitingPatient.queueNo);
    } else {
      setCurrentServing(prev => prev + 1);
    }
  };

  const handleCallSpecificPatient = (queueNo) => {
    if (currentServing) {
      const currentPatient = patients.find(p => p.queueNo === currentServing);
      if (currentPatient && currentPatient.status === 'in progress') {
        if (currentPatient.id) updatePatientStatus(currentPatient.id, 'done');
      }
    }

    const selected = patients.find(p => p.queueNo === queueNo);
    if (selected && selected.id) updatePatientStatus(selected.id, 'in progress');
    setCurrentServing(queueNo);
  };

  // ✅ FIXED: Made handleCancel async to properly await state updates, preventing the need for rapid double-clicks
  const handleCancel = async () => {
    const currentPatientForCancel = patients.find(p => p.queueNo === currentServing);
    if (currentPatientForCancel && currentPatientForCancel.id) {
      await cancelPatient(currentPatientForCancel.id);
    } else {
      console.warn('No current patient found to cancel for queueNo', currentServing);
    }

    const nextPriorityPatient = patients.find(p =>
      p.status === "waiting" && p.inQueue && p.isPriority
    );

    if (nextPriorityPatient) {
      if (nextPriorityPatient.id) await updatePatientStatus(nextPriorityPatient.id, 'in progress');
      setCurrentServing(nextPriorityPatient.queueNo);
      return;
    }

    const nextWaitingPatient = patients.find(p =>
      p.queueNo > currentServing && p.status === "waiting" && p.inQueue
    );

    if (nextWaitingPatient) {
      if (nextWaitingPatient.id) await updatePatientStatus(nextWaitingPatient.id, 'in progress');
      setCurrentServing(nextWaitingPatient.queueNo);
    } else {
      setCurrentServing(prev => prev + 1);
    }
  };

  const queuePatients = patients.filter(p => {
    if (p.isInactive) return false;
    if (p.type === "Appointment" && p.appointmentStatus !== "accepted") return false;
    if (p.status === "done" || p.status === "cancelled") return false;
    if (p.isPriority) return false;
    return p.inQueue;
  });

  const donePatients = patients.filter(p => {
    if (p.isInactive) return false;
    return p.status === "done" && p.inQueue;
  });

  const cancelPatients = patients.filter(p => {
    const status = (p.status || '').toString().toLowerCase().trim();
    return status === 'cancelled' || status === 'canceled' || status.includes('cancel');
  });

  useEffect(() => {
    console.debug('Dashboard: cancelPatients count=', cancelPatients.length, cancelPatients.slice(0,5));
  }, [cancelPatients]);

  const priorityPatients = patients.filter(p => {
    if (p.isInactive) return false;
    if (p.status === "done" || p.status === "cancelled") return false;
    return p.isPriority && p.inQueue;
  });

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
                    onClick={async () => { if (typeof callNextPatient === 'function') await callNextPatient(); }}
                    className="w-full bg-green-600 hover:bg-green-700 text-sm sm:text-base"
                  >
                    Call Next Patient
                  </Button>

                  {/* ✅ FIXED: Changed to use handleCancel for proper async cancellation and advancement */}
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

          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Patient Queue (Active)</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Patients currently in progress or waiting</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="block lg:hidden space-y-4">
                {queuePatients.map(patient => (
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
                    {queuePatients.map(patient => (
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

          <Card className="mt-6">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-yellow-500" />
                <div>
                  <CardTitle className="text-base sm:text-lg">Priority Patients</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Patients who are PWD, Pregnant or Senior Citizen</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {priorityPatients.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No Priority consultations yet</p>
                </div>
              ) : (
                <>
                  <div className="block lg:hidden space-y-4">
                    {priorityPatients.map(patient => (
                      <Card key={patient.queueNo} className={`border-l-4 ${patient.status === 'waiting' ? 'border-l-yellow-600' : patient.status === 'in progress' ? 'border-l-green-600' : 'border-l-emerald-600'}`}>
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
                                  : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100'
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

                  <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-yellow-50">
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
                        {priorityPatients.map(patient => (
                          <tr key={patient.queueNo} className="border-b transition-colors hover:bg-yellow-50">
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
                                    : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100'
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
                </>
              )}
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <div>
                  <CardTitle className="text-base sm:text-lg">Done Patients</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Patients who have completed their consultation</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {donePatients.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No completed consultations yet</p>
                </div>
              ) : (
                <>
                  <div className="block lg:hidden space-y-4">
                    {donePatients.map(patient => (
                      <Card key={patient.queueNo} className="border-l-4 border-l-emerald-600">
                        <CardContent className="pt-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <p className="font-bold text-lg text-gray-900">
                                #{String(patient.queueNo).padStart(3, '0')}
                              </p>
                              <p className="text-sm text-gray-600">{patient.name}</p>
                            </div>
                            <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
                              Cancelled
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

                  <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-red-50">
                          <th className="border px-4 py-2 text-left text-sm font-medium text-gray-600">Queue #</th>
                          <th className="border px-4 py-2 text-left text-sm font-medium text-gray-600">Patient Name</th>
                          <th className="border px-4 py-2 text-left text-sm font-medium text-gray-600">Age</th>
                          <th className="border px-4 py-2 text-left text-sm font-medium text-gray-600">Phone</th>
                          <th className="border px-4 py-2 text-left text-sm font-medium text-gray-600">Type</th>
                          <th className="border px-4 py-2 text-left text-sm font-medium text-gray-600">Symptoms</th>
                          <th className="border px-4 py-2 text-left text-sm font-medium text-gray-600">Services</th>
                        </tr>
                      </thead>
                      <tbody>
                        {donePatients.map(patient => (
                          <tr key={patient.queueNo} className="border-b transition-colors hover:bg-emerald-50">
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
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-red-600" />
                <div>
                  <CardTitle className="text-base sm:text-lg">Cancelled Patients</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Patients who missed their turn in queue</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {cancelPatients.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No cancelled consultations yet</p>
                </div>
              ) : (
                <>
                  <div className="block lg:hidden space-y-4">
                    {cancelPatients.map(patient => (
                      <Card key={patient.id} className="border-l-4 border-l-red-600">
                        <CardContent className="pt-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <p className="font-bold text-lg text-gray-900">
                                #{String(patient.queueNo).padStart(3, '0')}
                              </p>
                              <p className="text-sm text-gray-600">{patient.name}</p>
                            </div>
                            <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
                              Cancelled
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

                  <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-red-50">
                          <th className="border px-4 py-2 text-left text-sm font-medium text-gray-600">Queue #</th>
                          <th className="border px-4 py-2 text-left text-sm font-medium text-gray-600">Patient Name</th>
                          <th className="border px-4 py-2 text-left text-sm font-medium text-gray-600">Age</th>
                          <th className="border px-4 py-2 text-left text-sm font-medium text-gray-600">Phone</th>
                          <th className="border px-4 py-2 text-left text-sm font-medium text-gray-600">Type</th>
                          <th className="border px-4 py-2 text-left text-sm font-medium text-gray-600">Symptoms</th>
                          <th className="border px-4 py-2 text-left text-sm font-medium text-gray-600">Services</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cancelPatients.map(patient => (
                          <tr key={patient.id} className="border-b transition-colors hover:bg-red-50">
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
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;