import React, { useState, useEffect, useContext } from "react";
import { Bell, X, QrCode, Users, ChartNoAxesCombined, TicketCheck, Calendar, User } from "lucide-react";
import { AiOutlineClose, AiOutlineMenu } from "react-icons/ai";
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
  
  // View mode: 'clinic' (default) or 'patient'
  const [viewMode, setViewMode] = useState('clinic');
  
  // ✅ GET ALL VALUES FROM CONTEXT
  const { 
    patients, 
    activePatient, 
    currentServing, 
    avgWaitTime,
    setActivePatient 
  } = useContext(PatientContext);

  const currentPatient = patients.find(p => p.queueNo === activePatient?.queueNo);

  // 🔔 State for notifications
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");

  // 💡 Queue data
  const queueNumber = currentPatient?.queueNo || 0;
  const service = currentPatient?.type || "Walk-in";
  const symptoms = currentPatient?.symptoms || [];
  
  // ✅ CALCULATE WITH REAL avgWaitTime FROM CONTEXT
  const peopleAhead = Math.max(queueNumber - currentServing, 0);
  const estimatedWait = peopleAhead * avgWaitTime;

  // 🔔 Watch queue updates and notify user
  useEffect(() => {
    if (!currentPatient) return;

    const difference = queueNumber - currentServing;
    
    if (difference === 1) {
      setNotificationMessage("Your turn is coming up soon! Please be ready.");
      setShowNotification(true);
    } else if (difference === 0) {
      setNotificationMessage("It's your turn now! Please proceed to the counter.");
      setShowNotification(true);
    } else {
      setShowNotification(false);
    }
  }, [currentServing, queueNumber, currentPatient]);

  // 🔔 Notification component
  const PushNotification = () => {
    if (!showNotification) return null;
    return (
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4 animate-in slide-in-from-top">
        <Alert className="bg-green-600 text-white border-green-700 shadow-lg relative">
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 text-white hover:bg-green-700 h-8 w-8 p-0"
            onClick={() => setShowNotification(false)}
          >
            <X className="h-4 w-4" />
          </Button>
          
          <div className="pr-8">
            <div className="flex items-center gap-2 mb-2">
              <Bell className="h-5 w-5 text-white" />
              <AlertTitle className=" text-white font-semibold  ml-2">
                Queue Update
              </AlertTitle>
            </div>
            <AlertDescription className="text-white text-sm pl-7">
              {notificationMessage}
            </AlertDescription>
          </div>
        </Alert>
      </div>
    );
  };

  // 🚨 If no matching patient found
  if (!currentPatient) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-700">
        Patient not found in the queue.
      </div>
    );
  }

  // === CLINIC VIEW (Default - With Sidebar) ===
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

            <li className="group p-4 flex items-center gap-2 hover:bg-green-600 hover:text-white hover:cursor-pointer" 
                onClick={() => navigate("/checkin")}>
              <TicketCheck className="w-5 h-5 text-green-600 group-hover:text-white" />
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

            <li className="group p-4 flex items-center gap-2 hover:bg-green-600 hover:text-white hover:cursor-pointer" 
                onClick={() => { navigate("/checkin"); setNav(false); }}>
              <TicketCheck className="w-5 h-5 text-green-600 group-hover:text-white" />
              Patient Check-In
            </li>
          </ul>
        </div>

        {/* MAIN CONTENT WITH SIDEBAR */}
        <PushNotification />
        <div className="flex-1 min-h-screen bg-gray-50 ml-0 md:ml-52 p-4">
          <div className="max-w-[800px] mt-[20px] sm:mt-[50px] w-full mx-auto space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 text-center">
              <Badge className="text-sm sm:text-lg mb-4 bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                <Bell className="w-4 h-4 mr-2" />
                Queue Joined
              </Badge>

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

              {/* View Toggle & Done Buttons */}
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
  

  // === PATIENT VIEW (No Sidebar) ===
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <PushNotification />
      
      <div className="flex-1 p-4">
        <div className="max-w-[800px] mt-[20px] sm:mt-[50px] w-full mx-auto space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 text-center">
            <Badge className="text-sm sm:text-lg mb-4 bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
              <Bell className="w-4 h-4 mr-2" />
              Queue Joined
            </Badge>

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

            {/* View Toggle & Done Buttons */}
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