import React, { useState, useEffect } from "react";
import { Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";


const QueueStatus = () => {
  const navigate = useNavigate();
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");

  const location = useLocation();
  const { patientName, type, symptoms } = location.state || {};

// Mock data for frontend-only display
const queueNumber = 5; // temporary dummy number
const currentServing = 2; // temporary dummy current serving
const formData = {
  name: patientName, 
  service: type === "appointment" ? "Appointment" : "Walk-in", symptoms: symptoms // dummy
};
//is service type appointment, if true set appointment if false set service to walk-in

  // Calculate estimated wait
  const avgWaitTime = 15; // in minutes
  const estimatedWait = queueNumber
    ? (parseInt(queueNumber) - currentServing) * avgWaitTime
    : 0;

  // Check if patient's turn is near
  useEffect(() => {
    const queuePos = parseInt(queueNumber);
    const difference = queuePos - currentServing;

    if (difference === 2) {
      setNotificationMessage("Your turn is coming up soon! Please be ready.");
      setShowNotification(true);
    } else if (difference === 0) {
      setNotificationMessage("It's your turn now! Please proceed to the counter.");
      setShowNotification(true);
    }
  }, [queueNumber, currentServing]);

  const PushNotification = () => {
    if (!showNotification) return null;
    return (
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4 animate-in slide-in-from-top">
        <Alert className="bg-green-600 text-white border-green-700 shadow-lg">
          <Bell className="h-5 w-5 text-white" />
          <AlertTitle className="text-white font-semibold ml-2">
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <PushNotification />

      <div className="max-w-[900px] mt-[50px] w-full mx-auto space-y-6">
        <div className="bg-white rounded-xl shadow p-6 text-center ">
          <Badge className="sm:text-lg text-sm mb-4 bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
            <Bell className="w-4 h-4 mr-2" />
            Queue Joined
          </Badge>

          <h2 className="md:text-xl text-lg text-gray-600 mb-2">Your Queue Number</h2>
          <div className="text-6xl font-bold text-green-600 mb-6">
            {queueNumber}
          </div>

          <div className="space-y-3 text-left bg-gray-50 rounded-xl p-4 sm:text-lg text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 font-normal">Service</span>
              <span className="font-medium text-gray-900">
                {formData.service}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 font-normal">Currently Serving</span>
              <span className="font-medium text-gray-900">
                #{String(currentServing).padStart(3, "0")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 font-normal">Estimated Wait</span>
              <span className="font-medium text-gray-900">
                {estimatedWait} mins
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 font-normal">People Ahead</span>
              <span className="font-medium text-gray-900">
                {parseInt(queueNumber) - currentServing}
              </span>
            </div>

            <div className="pt-3 border-t border-gray-200">
              <span className="text-gray-600 sm:text-lg text-sm font-normal">Symptoms:</span>
              <div className="flex flex-wrap gap-2 mt-2 ">
                {formData.symptoms.map((symptom) => (
                  <Badge
                    key={symptom}
                    variant="secondary"
                    className="bg-green-100 text-green-700  sm:text-base text-sm"
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
                <p className="font-medium text-amber-900 mb-1">
                  Notifications Enabled
                </p>
                <p className="text-sm text-amber-800">
                  You'll receive a push notification when your turn is near and
                  when it's your turn
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5">
            <Button variant="outline" className="w-full sm:text-lg text-sm" size="lg" onClick={() => navigate("/register")}>Done</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QueueStatus;
