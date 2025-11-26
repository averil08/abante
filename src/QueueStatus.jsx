import React, { useState, useEffect, useContext } from "react";
import Sidebar from "@/components/Sidebar";
//added MessageSquare icon
import { Bell, X, QrCode, User, RefreshCw, XCircle, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import { PatientContext } from "./PatientContext";
import Logo from "./assets/logo-abante.png";

const QueueStatus = () => {
  const navigate = useNavigate();
  const [nav, setNav] = useState(false);
  const handleNav = () => setNav(!nav);
  
  const [viewMode, setViewMode] = useState('clinic');
  
  const { 
    patients, 
    activePatient, 
    currentServing, 
    avgWaitTime,
    setActivePatient,
    requeuePatient
  } = useContext(PatientContext);

  // ✅ Always get the latest patient data from the patients array
  const currentPatient = patients.find(p => p.queueNo === activePatient?.queueNo);

  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState("success");

  const queueNumber = currentPatient?.queueNo || 0;
  const service = currentPatient?.type || "Walk-in";
  const symptoms = currentPatient?.symptoms || [];
  
  const peopleAhead = Math.max(queueNumber - currentServing, 0);
  const estimatedWait = peopleAhead * avgWaitTime;

  // ✅ Check if appointment is pending approval
  const isAppointmentPending = currentPatient?.type === 'Appointment' && 
    (!currentPatient?.appointmentStatus || currentPatient?.appointmentStatus === 'pending');

  // ✅ Check if appointment is rejected
  const isAppointmentRejected = currentPatient?.type === 'Appointment' && 
    currentPatient?.appointmentStatus === 'rejected';

  // ✅ Watch for status changes in the patients array
  useEffect(() => {
    if (!currentPatient) return;

    // Don't show notifications if appointment is pending
    if (isAppointmentPending) return;

    const difference = queueNumber - currentServing;
    
    // Check if cancelled
    if (currentPatient.status === "cancelled") {
      setNotificationMessage("Your appointment has been cancelled. You didn't show up.");
      setNotificationType("cancelled");
      setShowNotification(true);
      return;
    }
    
    // Check if patient is in progress
    if (currentPatient.status === "in progress") {
      setNotificationMessage("It's your turn now! Please proceed to the counter.");
      setNotificationType("success");
      setShowNotification(true);
      return;
    }
    
    // Check if coming up soon
    if (difference === 1 && currentPatient.status === "waiting") {
      setNotificationMessage("Your turn is coming up soon! Please be ready.");
      setNotificationType("success");
      setShowNotification(true);
    } else if (difference === 0 && currentPatient.status === "waiting") {
      setNotificationMessage("It's your turn now! Please proceed to the counter.");
      setNotificationType("success");
      setShowNotification(true);
    } else {
      // Only hide notification if it's not a cancellation
      if (notificationType !== "cancelled") {
        setShowNotification(false);
      }
    }
  }, [currentPatient, currentServing, queueNumber, notificationType, isAppointmentPending]);

  // ✅ Handle requeue - creates new ticket and updates activePatient
  const handleRequeue = () => {
    const oldQueueNo = queueNumber;
    requeuePatient(oldQueueNo);
    
    // Find the new ticket that was just created
    setTimeout(() => {
      const newTicket = patients.find(p => 
        p.requeued && p.originalQueueNo === oldQueueNo && !p.isInactive
      );
      
      if (newTicket) {
        setActivePatient(newTicket);
        setNotificationMessage(`You've been added back to the queue with ticket #${String(newTicket.queueNo).padStart(3, '0')}!`);
      } else {
        setNotificationMessage("You've been added back to the queue!");
      }
      setNotificationType("success");
      setTimeout(() => {
        setShowNotification(false);
      }, 3000);
    }, 100);
  };

    const PushNotification = () => {
    if (!showNotification) return null;
    
    const isCancelled = notificationType === "cancelled";
    
    return (
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4 animate-in slide-in-from-top">
        <div className={`${
          isCancelled ? "bg-red-600" : "bg-green-600"
        } text-white shadow-lg rounded-xl p-4 relative`}>
          {!isCancelled && (
            <button
              className="absolute top-2 right-2 text-white hover:opacity-80"
              onClick={() => setShowNotification(false)}
            >
              <X className="h-4 w-4" />
            </button>
          )}

          <div className="flex items-start gap-3 pr-8">
            <Bell className="h-5 w-5 mt-0.5" />
            <div>
              <p className="font-semibold mb-1">
                {isCancelled ? "Appointment Cancelled" : "Queue Update"}
              </p>
              <p className="text-sm leading-relaxed">{notificationMessage}</p>
            </div>
          </div>

          {isCancelled && (
            <div className="mt-3 pl-8">
              <Button
                onClick={handleRequeue}
                className="bg-white text-red-600 hover:bg-gray-100"
                size="sm"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Requeue
              </Button>
            </div>
          )}
        </div>

      </div>
    );
  };

  if (!currentPatient) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-700">
        Patient not found in the queue.
      </div>
    );
  }

  // === PENDING APPOINTMENT APPROVAL VIEW ===
  if (isAppointmentPending) {
    // Clinic View
    if (viewMode === 'clinic') {
      return (
        <div className="flex w-full min-h-screen">
          <Sidebar nav={nav} handleNav={handleNav} />
          <div className="flex-1 min-h-screen bg-gray-50 ml-0 md:ml-52 p-4">
            <div className="max-w-[800px] mt-[20px] sm:mt-[50px] w-full mx-auto space-y-6">
              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 text-center">
                <Badge className="text-sm sm:text-lg mb-4 bg-amber-100 text-amber-700 hover:bg-amber-100">
                  <Bell className="w-4 h-4 mr-2" />
                  Appointment Pending
                </Badge>

                <div className="flex justify-center mb-4">
                  <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center">
                    <Bell className="w-10 h-10 text-amber-600" />
                  </div>
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Appointment Submitted</h2>
                <p className="text-gray-600 mb-6 text-sm sm:text-base">
                  Your appointment request is pending approval from our secretary.
                </p>

                <div className="space-y-3 text-left bg-gray-50 rounded-xl p-4 text-sm sm:text-lg">
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-normal">Name</span>
                    <span className="font-medium text-gray-900">{currentPatient.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-normal">Appointment Time</span>
                    <span className="font-medium text-gray-900">
                      {currentPatient.appointmentDateTime 
                        ? new Date(currentPatient.appointmentDateTime).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                          })
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-normal">Status</span>
                    <span className="font-medium text-amber-600">Pending Approval</span>
                  </div>

                  <div className="pt-3 border-t border-gray-200">
                    <span className="text-gray-600 text-sm sm:text-lg font-normal">Symptoms:</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {symptoms.map(symptom => (
                        <Badge
                          key={symptom}
                          variant="secondary"
                          className="bg-green-100 text-green-700 text-sm sm:text-base"
                        >
                          {symptom}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-3 sm:p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="flex items-start gap-3">
                    <Bell className="w-5 sm:w-6 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-left text-sm sm:text-lg">
                      <p className="font-medium text-blue-900 mb-1">What happens next?</p>
                      <p className="text-xs sm:text-sm text-blue-800">
                        Our secretary will review your appointment request. Once approved, you'll see your queue number and estimated wait time. Please check back later or wait for a notification.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <Button
                    onClick={() => setViewMode('patient')}
                    className="w-full text-sm sm:text-lg bg-green-600 hover:bg-green-700 text-white"
                    size="lg"
                  >
                    <User className="w-4 sm:w-5 h-4 sm:h-5 mr-2" />
                    Switch to Patient View
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full text-sm sm:text-lg"
                    size="lg"
                    onClick={() => {
                      setActivePatient(null);
                      navigate("/checkin");
                    }}
                  >
                    Done
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Patient View
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="flex-1 p-4">
          <div className="max-w-[800px] mt-[20px] sm:mt-[50px] w-full mx-auto space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 text-center">
              <Badge className="text-sm sm:text-lg mb-4 bg-amber-100 text-amber-700 hover:bg-amber-100">
                <Bell className="w-4 h-4 mr-2" />
                Appointment Pending
              </Badge>

              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center">
                  <Bell className="w-10 h-10 text-amber-600" />
                </div>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Appointment Submitted</h2>
              <p className="text-gray-600 mb-6 text-sm sm:text-base">
                Your appointment request is pending approval from our secretary.
              </p>

              <div className="space-y-3 text-left bg-gray-50 rounded-xl p-4 text-sm sm:text-lg">
                <div className="flex justify-between">
                  <span className="text-gray-600 font-normal">Name</span>
                  <span className="font-medium text-gray-900">{currentPatient.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-normal">Appointment Time</span>
                  <span className="font-medium text-gray-900">
                    {currentPatient.appointmentDateTime 
                      ? new Date(currentPatient.appointmentDateTime).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        })
                      : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-normal">Status</span>
                  <span className="font-medium text-amber-600">Pending Approval</span>
                </div>

                <div className="pt-3 border-t border-gray-200">
                  <span className="text-gray-600 text-sm sm:text-lg font-normal">Symptoms:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {symptoms.map(symptom => (
                      <Badge
                        key={symptom}
                        variant="secondary"
                        className="bg-green-100 text-green-700 text-sm sm:text-base"
                      >
                        {symptom}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 p-3 sm:p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex items-start gap-3">
                  <Bell className="w-5 sm:w-6 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-left text-sm sm:text-lg">
                    <p className="font-medium text-blue-900 mb-1">What happens next?</p>
                    <p className="text-xs sm:text-sm text-blue-800">
                      Our secretary will review your appointment request. Once approved, you'll see your queue number and estimated wait time. Please check back later or wait for a notification.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <Button
                  onClick={() => setViewMode('clinic')}
                  variant="outline"
                  className="w-full text-sm sm:text-lg border-green-600 text-green-600 hover:bg-green-50"
                  size="lg"
                >
                  <QrCode className="w-4 sm:w-5 h-4 sm:h-5 mr-2" />
                  Back to Clinic View
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full text-sm sm:text-lg"
                  size="lg"
                  onClick={() => {
                    setActivePatient(null);
                    navigate("/checkin");
                  }}
                >
                  Done
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // === REJECTED APPOINTMENT VIEW ===
  if (isAppointmentRejected) {
    // Clinic View
    if (viewMode === 'clinic') {
      return (
        <div className="flex w-full min-h-screen">
          <Sidebar nav={nav} handleNav={handleNav} />
          <div className="flex-1 min-h-screen bg-gray-50 ml-0 md:ml-52 p-4">
            <div className="max-w-[800px] mt-[20px] sm:mt-[50px] w-full mx-auto space-y-6">
              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 text-center">
                <Badge className="text-sm sm:text-lg mb-4 bg-red-100 text-red-700 hover:bg-red-100">
                  <XCircle className="w-4 h-4 mr-2" />
                  Appointment Cancelled
                </Badge>

                <div className="flex justify-center mb-4">
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                    <XCircle className="w-10 h-10 text-red-600" />
                  </div>
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Appointment Not Approved</h2>
                <p className="text-gray-600 mb-6 text-sm sm:text-base">
                  We're sorry, but your appointment request was not approved.
                </p>

                <div className="space-y-3 text-left bg-gray-50 rounded-xl p-4 text-sm sm:text-lg">
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-normal">Name</span>
                    <span className="font-medium text-gray-900">{currentPatient.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-normal">Requested Time</span>
                    <span className="font-medium text-gray-900">
                      {currentPatient.appointmentDateTime 
                        ? new Date(currentPatient.appointmentDateTime).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                          })
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-normal">Status</span>
                    <span className="font-medium text-red-600">Cancelled</span>
                  </div>

                  <div className="pt-3 border-t border-gray-200">
                    <span className="text-gray-600 text-sm sm:text-lg font-normal">Symptoms:</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {symptoms.map(symptom => (
                        <Badge
                          key={symptom}
                          variant="secondary"
                          className="bg-green-100 text-green-700 text-sm sm:text-base"
                        >
                          {symptom}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Added Rejection Reason Display for clinic view */}
                {currentPatient.rejectionReason && (
                  <div className="mt-6 p-3 sm:p-4 bg-red-100 rounded-xl border border-red-300">
                    <div className="flex items-start gap-3">
                      <MessageSquare className="w-5 sm:w-6 h-5 text-red-700 mt-0.5 flex-shrink-0" />
                      <div className="text-left text-sm sm:text-lg">
                        <p className="font-semibold text-red-900 mb-2">Reason for Cancellation:</p>
                        <p className="text-xs sm:text-sm text-red-800 mb-2">
                          {currentPatient.rejectionReason}
                        </p>
                        {currentPatient.rejectedAt && (
                          <p className="text-xs text-red-700 italic">
                            Not approved on {new Date(currentPatient.rejectedAt).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-6 p-3 sm:p-4 bg-red-50 rounded-xl border border-red-200">
                  <div className="flex items-start gap-3">
                    <XCircle className="w-5 sm:w-6 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div className="text-left text-sm sm:text-lg">
                      <p className="font-medium text-red-900 mb-1">What you can do:</p>
                      <p className="text-xs sm:text-sm text-red-800">
                        Please contact the clinic to reschedule or try booking a different time slot. You can also visit as a walk-in patient.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <Button
                    onClick={() => setViewMode('patient')}
                    className="w-full text-sm sm:text-lg bg-green-600 hover:bg-green-700 text-white"
                    size="lg"
                  >
                    <User className="w-4 sm:w-5 h-4 sm:h-5 mr-2" />
                    Switch to Patient View
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full text-sm sm:text-lg"
                    size="lg"
                    onClick={() => {
                      setActivePatient(null);
                      navigate("/checkin");
                    }}
                  >
                    Done
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Patient View
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="flex-1 p-4">
          <div className="max-w-[800px] mt-[20px] sm:mt-[50px] w-full mx-auto space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 text-center">
              <Badge className="text-sm sm:text-lg mb-4 bg-red-100 text-red-700 hover:bg-red-100">
                <XCircle className="w-4 h-4 mr-2" />
                Appointment Cancelled
              </Badge>

              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="w-10 h-10 text-red-600" />
                </div>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Appointment Not Approved</h2>
              <p className="text-gray-600 mb-6 text-sm sm:text-base">
                We're sorry, but your appointment request was not approved.
              </p>

              <div className="space-y-3 text-left bg-gray-50 rounded-xl p-4 text-sm sm:text-lg">
                <div className="flex justify-between">
                  <span className="text-gray-600 font-normal">Name</span>
                  <span className="font-medium text-gray-900">{currentPatient.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-normal">Requested Time</span>
                  <span className="font-medium text-gray-900">
                    {currentPatient.appointmentDateTime 
                      ? new Date(currentPatient.appointmentDateTime).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        })
                      : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-normal">Status</span>
                  <span className="font-medium text-red-600">Cancelled</span>
                </div>

                <div className="pt-3 border-t border-gray-200">
                  <span className="text-gray-600 text-sm sm:text-lg font-normal">Symptoms:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {symptoms.map(symptom => (
                      <Badge
                        key={symptom}
                        variant="secondary"
                        className="bg-green-100 text-green-700 text-sm sm:text-base"
                      >
                        {symptom}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Added Rejection Reason Display for patient view */}
              {currentPatient.rejectionReason && (
                <div className="mt-6 p-3 sm:p-4 bg-red-100 rounded-xl border border-red-300">
                  <div className="flex items-start gap-3">
                    <MessageSquare className="w-5 sm:w-6 h-5 text-red-700 mt-0.5 flex-shrink-0" />
                    <div className="text-left text-sm sm:text-lg">
                      <p className="font-semibold text-red-900 mb-2">Reason for Rejection:</p>
                      <p className="text-xs sm:text-sm text-red-800 mb-2">
                        {currentPatient.rejectionReason}
                      </p>
                      {currentPatient.rejectedAt && (
                        <p className="text-xs text-red-700 italic">
                          Not approved on {new Date(currentPatient.rejectedAt).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 p-3 sm:p-4 bg-red-50 rounded-xl border border-red-200">
                <div className="flex items-start gap-3">
                  <XCircle className="w-5 sm:w-6 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="text-left text-sm sm:text-lg">
                    <p className="font-medium text-red-900 mb-1">What you can do:</p>
                    <p className="text-xs sm:text-sm text-red-800">
                      Please contact the clinic to reschedule or try booking a different time slot. You can also visit as a walk-in patient.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <Button
                  onClick={() => setViewMode('clinic')}
                  variant="outline"
                  className="w-full text-sm sm:text-lg border-green-600 text-green-600 hover:bg-green-50"
                  size="lg"
                >
                  <QrCode className="w-4 sm:w-5 h-4 sm:h-5 mr-2" />
                  Back to Clinic View
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full text-sm sm:text-lg"
                  size="lg"
                  onClick={() => {
                    setActivePatient(null);
                    navigate("/checkin");
                  }}
                >
                  Done
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // === NORMAL QUEUE STATUS VIEW (After approval or Walk-in) ===
  // Clinic View
  if (viewMode === 'clinic') {
    return (
      <div className="flex w-full min-h-screen">
        <Sidebar nav={nav} handleNav={handleNav} />
        <PushNotification />
        <div className="flex-1 min-h-screen bg-gray-50 ml-0 md:ml-52 p-4">
          <div className="max-w-[800px] mt-[20px] sm:mt-[50px] w-full mx-auto space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 text-center">
              <Badge className={`text-sm sm:text-lg mb-4 ${
                currentPatient.status === 'cancelled' 
                  ? 'bg-red-100 text-red-700' 
                  : currentPatient.status === 'in progress'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-emerald-100 text-emerald-700'
              } hover:bg-emerald-100`}>
                <Bell className="w-4 h-4 mr-2" />
                {currentPatient.status === 'cancelled' ? 'Cancelled' : 
                 currentPatient.status === 'in progress' ? 'In Progress' : 'Queue Joined'}
              </Badge>

              {currentPatient.requeued && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Requeued:</strong> Your original ticket #{String(currentPatient.originalQueueNo).padStart(3, '0')} has been replaced with this new ticket.
                  </p>
                </div>
              )}

              <h2 className="text-lg md:text-xl text-gray-600 mb-2">Your Queue Number</h2>
              <div className="text-5xl sm:text-6xl font-bold text-green-600 mb-6">{queueNumber}</div>

              <div className="space-y-3 text-left bg-gray-50 rounded-xl p-4 text-sm sm:text-lg">
                <div className="flex justify-between">
                  <span className="text-gray-600 font-normal">Service</span>
                  <span className="font-medium text-gray-900">{service}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-normal">Currently Serving</span>
                  <span className="font-medium text-gray-900">
                    #{String(currentServing).padStart(3, "0")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-normal">Status</span>
                  <span className={`font-medium ${
                    currentPatient.status === 'cancelled' ? 'text-red-600' : 
                    currentPatient.status === 'in progress' ? 'text-green-600' : 
                    'text-gray-900'
                  }`}>
                    {currentPatient.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-normal">Estimated Wait</span>
                  <span className="font-medium text-gray-900">{estimatedWait} mins</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-normal">People Ahead</span>
                  <span className="font-medium text-gray-900">{peopleAhead}</span>
                </div>

                <div className="pt-3 border-t border-gray-200">
                  <span className="text-gray-600 text-sm sm:text-lg font-normal">Symptoms:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {symptoms.map(symptom => (
                      <Badge
                        key={symptom}
                        variant="secondary"
                        className="bg-green-100 text-green-700 text-sm sm:text-base"
                      >
                        {symptom}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 p-3 sm:p-4 bg-amber-50 rounded-xl border border-amber-200">
                <div className="flex items-start gap-3">
                  <Bell className="w-5 sm:w-6 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="text-left text-sm sm:text-lg">
                    <p className="font-medium text-amber-900 mb-1">Notifications Enabled</p>
                    <p className="text-xs sm:text-sm text-amber-800">
                      You'll receive a push notification when your turn is near and when it's your turn.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <Button
                  onClick={() => setViewMode('patient')}
                  className="w-full text-sm sm:text-lg bg-green-600 hover:bg-green-700 text-white"
                  size="lg"
                >
                  <User className="w-4 sm:w-5 h-4 sm:h-5 mr-2" />
                  Switch to Patient View
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full text-sm sm:text-lg"
                  size="lg"
                  onClick={() => {
                    setActivePatient(null);
                    navigate("/checkin");
                  }}
                >
                  Done
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Patient View
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <PushNotification />
      
      <div className="flex-1 p-4">
        <div className="max-w-[800px] mt-[20px] sm:mt-[50px] w-full mx-auto space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 text-center">
            <Badge className={`text-sm sm:text-lg mb-4 ${
              currentPatient.status === 'cancelled' 
                ? 'bg-red-100 text-red-700' 
                : currentPatient.status === 'in progress'
                ? 'bg-green-100 text-green-700'
                : 'bg-emerald-100 text-emerald-700'
            } hover:bg-emerald-100`}>
              <Bell className="w-4 h-4 mr-2" />
              {currentPatient.status === 'cancelled' ? 'Cancelled' : 
               currentPatient.status === 'in progress' ? 'In Progress' : 'Queue Joined'}
            </Badge>

            {currentPatient.requeued && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Requeued:</strong> Your original ticket #{String(currentPatient.originalQueueNo).padStart(3, '0')} has been replaced with this new ticket.
                </p>
              </div>
            )}

            <h2 className="text-lg md:text-xl text-gray-600 mb-2">Your Queue Number</h2>
            <div className="text-5xl sm:text-6xl font-bold text-green-600 mb-6">{queueNumber}</div>

            <div className="space-y-3 text-left bg-gray-50 rounded-xl p-4 text-sm sm:text-lg">
              <div className="flex justify-between">
                <span className="text-gray-600 font-normal">Service</span>
                <span className="font-medium text-gray-900">{service}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 font-normal">Currently Serving</span>
                <span className="font-medium text-gray-900">
                  #{String(currentServing).padStart(3, "0")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 font-normal">Status</span>
                <span className={`font-medium ${
                  currentPatient.status === 'cancelled' ? 'text-red-600' : 
                  currentPatient.status === 'in progress' ? 'text-green-600' : 
                  'text-gray-900'
                }`}>
                  {currentPatient.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 font-normal">Estimated Wait</span>
                <span className="font-medium text-gray-900">{estimatedWait} mins</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 font-normal">People Ahead</span>
                <span className="font-medium text-gray-900">{peopleAhead}</span>
              </div>

              <div className="pt-3 border-t border-gray-200">
                <span className="text-gray-600 text-sm sm:text-lg font-normal">Symptoms:</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {symptoms.map(symptom => (
                    <Badge
                      key={symptom}
                      variant="secondary"
                      className="bg-green-100 text-green-700 text-sm sm:text-base"
                    >
                      {symptom}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 p-3 sm:p-4 bg-amber-50 rounded-xl border border-amber-200">
              <div className="flex items-start gap-3">
                <Bell className="w-5 sm:w-6 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-left text-sm sm:text-lg">
                  <p className="font-medium text-amber-900 mb-1">Notifications Enabled</p>
                  <p className="text-xs sm:text-sm text-amber-800">
                    You'll receive a push notification when your turn is near and when it's your turn.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <Button
                onClick={() => setViewMode('clinic')}
                variant="outline"
                className="w-full text-sm sm:text-lg border-green-600 text-green-600 hover:bg-green-50"
                size="lg"
              >
                <QrCode className="w-4 sm:w-5 h-4 sm:h-5 mr-2" />
                Back to Clinic View
              </Button>
              
              <Button
                variant="outline"
                className="w-full text-sm sm:text-lg"
                size="lg"
                onClick={() => {
                  setActivePatient(null);
                  navigate("/checkin");
                }}
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QueueStatus;