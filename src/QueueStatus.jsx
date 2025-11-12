import React, { useState, useEffect, useContext } from "react";
import { Bell, X } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import { PatientContext } from "./PatientContext";

const QueueStatus = () => {
  const navigate = useNavigate();
  const [nav, setNav] = useState(false);
  const handleNav = () => setNav(!nav);
  
  // ✅ GET ALL VALUES FROM CONTEXT
  const { 
    patients, 
    activePatient, 
    currentServing, 
    avgWaitTime,      // ✅ NOW SYNCED WITH DASHBOARD
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
        <Alert className="bg-green-600 text-white border-green-700 shadow-lg">
          <Bell className="h-5 w-5  text-white" />
          <AlertTitle className="pl-3 text-white font-semibold ml-2">
            Queue Update
          </AlertTitle>
          <AlertDescription className="text-white ml-2">
            {notificationMessage}
          </AlertDescription>
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 text-white hover:bg-green-700"
            onClick={() => setShowNotification(false)}
          >
            <X className="h-4 w-4" />
          </Button>
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

  return (
    <div className="flex w-full min-h-screen">
      <Sidebar nav={nav} handleNav={handleNav} />
      <PushNotification />
      <div className="flex-1 md:ml-30 bg-gray-50 p-4">
        <div className="max-w-[800px] mt-[50px] w-full mx-auto space-y-6">
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <Badge className="sm:text-lg text-sm mb-4 bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
              <Bell className="w-4 h-4 mr-2" />
              Queue Joined
            </Badge>

            <h2 className="md:text-xl text-lg text-gray-600 mb-2">Your Queue Number</h2>
            <div className="text-6xl font-bold text-green-600 mb-6">{queueNumber}</div>

            <div className="space-y-3 text-left bg-gray-50 rounded-xl p-4 sm:text-lg text-sm">
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
                <span className="text-gray-600 sm:text-lg text-sm font-normal">Symptoms:</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {symptoms.map(symptom => (
                    <Badge
                      key={symptom}
                      variant="secondary"
                      className="bg-green-100 text-green-700 sm:text-base text-sm"
                    >
                      {symptom}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-200">
              <div className="flex items-start gap-3">
                <Bell className="w-6 h-5 text-amber-600 mt-0.5" />
                <div className="text-left sm:text-lg text-sm">
                  <p className="font-medium text-amber-900 mb-1">Notifications Enabled</p>
                  <p className="text-sm text-amber-800">
                    You'll receive a push notification when your turn is near and when it's your turn.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5">
              <Button
                variant="outline"
                className="w-full sm:text-lg text-sm"
                size="lg"
                onClick={() => {
                  setActivePatient(null); // ✅ clear when done
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