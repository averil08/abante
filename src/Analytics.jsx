import React, { useState, useContext, useMemo } from 'react';
import { Users, ChartNoAxesCombined, TicketCheck, Clock, TrendingUp, Activity, Stethoscope, Calendar, BarChart3, Menu, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from "@/components/ui/badge";
import { PatientContext } from "./PatientContext";
import img1 from './assets/logo-abante.png';
import { Link, useNavigate } from "react-router-dom";
import { AiOutlineClose, AiOutlineMenu } from 'react-icons/ai';

const Analytics = () => {
  const [nav, setNav] = useState(false);
  const navigate = useNavigate();
  const handleNav = () => setNav(!nav);
  const { patients, avgWaitTime } = useContext(PatientContext);

  // Service labels mapping
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
    urinalysis: "Urinalysis", fecalysis: "Fecalysis", pregnancyT: "Pregnancy Test",
    tsh: "TSH", ft3: "FT3", psa: "PSA"
  };

  // Calculate analytics
  const analytics = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Today's patients
    const todayPatients = patients.filter(p => {
      const regDate = p.registeredAt ? new Date(p.registeredAt) : today;
      return regDate >= today;
    });

    // This week's patients
    const weekPatients = patients.filter(p => {
      const regDate = p.registeredAt ? new Date(p.registeredAt) : today;
      return regDate >= oneWeekAgo;
    });

    // Walk-in vs Appointment counts (served only)
    const servedWalkIn = patients.filter(p => p.type === "Walk-in" && p.status === "done").length;
    const servedAppointment = patients.filter(p => p.type === "Appointment" && p.status === "done").length;

    // Most prevalent symptoms
    const symptomCount = {};
    patients.forEach(p => {
      if (p.symptoms) {
        p.symptoms.forEach(symptom => {
          symptomCount[symptom] = (symptomCount[symptom] || 0) + 1;
        });
      }
    });
    const topSymptoms = Object.entries(symptomCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // Most requested services
    const serviceCount = {};
    patients.forEach(p => {
      if (p.services) {
        p.services.forEach(service => {
          const label = serviceLabels[service] || service;
          serviceCount[label] = (serviceCount[label] || 0) + 1;
        });
      }
    });
    const topServices = Object.entries(serviceCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // Age distribution
    const ageGroups = {
      "0-17": 0,
      "18-35": 0,
      "36-50": 0,
      "51-65": 0,
      "65+": 0
    };
    patients.forEach(p => {
      const age = parseInt(p.age);
      if (age <= 17) ageGroups["0-17"]++;
      else if (age <= 35) ageGroups["18-35"]++;
      else if (age <= 50) ageGroups["36-50"]++;
      else if (age <= 65) ageGroups["51-65"]++;
      else ageGroups["65+"]++;
    });
    const mostPrevalentAge = Object.entries(ageGroups)
      .sort((a, b) => b[1] - a[1])[0];

    // Peak hours (registration times)
    const hourCount = {};
    patients.forEach(p => {
      if (p.registeredAt) {
        const hour = new Date(p.registeredAt).getHours();
        hourCount[hour] = (hourCount[hour] || 0) + 1;
      }
    });
    const peakHours = Object.entries(hourCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([hour, count]) => ({
        time: `${hour}:00 - ${parseInt(hour) + 1}:00`,
        count
      }));

    return {
      totalToday: todayPatients.length,
      totalWeek: weekPatients.length,
      servedWalkIn,
      servedAppointment,
      topSymptoms,
      topServices,
      mostPrevalentAge,
      ageGroups,
      peakHours
    };
  }, [patients]);

  return (
    <div className="flex w-full min-h-screen bg-gray-50">
      {/* DESKTOP SIDEBAR */}
      <div className="hidden md:flex fixed left-0 top-0 h-full w-52 bg-gray-50 border-r border-gray-300 shadow-lg flex-col">
        <img className="w-[175px] m-4" src={img1} alt="Logo" />
        <ul className="mt-8 text-sm text-gray-700">
          <li className="group p-4 flex items-center gap-2 hover:bg-green-600 hover:text-white hover:cursor-pointer" onClick={() => navigate("/dashboard")}>
            <Users className="w-5 h-5 text-green-600 group-hover:text-white" />
            <Link to="/dashboard">Clinic Dashboard</Link>
          </li>

          <li className="group p-4 flex items-center gap-2 hover:bg-green-600 hover:text-white hover:cursor-pointer" onClick={() => navigate("/analytics")}>
            <ChartNoAxesCombined className="w-5 h-5 text-green-600 group-hover:text-white" /> 
            <Link to="/analytics">Clinic Analytics</Link>
          </li>

          <li className="group p-4 flex items-center gap-2 hover:bg-green-600 hover:text-white hover:cursor-pointer" onClick={() => navigate("/appointment")}>
            <Calendar className="w-5 h-5 text-green-600 group-hover:text-white" />
            Appointments
          </li>

          <li className="group p-4 flex items-center gap-2 hover:bg-green-600 hover:text-white hover:cursor-pointer" onClick={() => navigate("/checkin")}>
            <TicketCheck className="w-5 h-5 text-green-600 group-hover:text-white" /> Patient Check-In
          </li>
        </ul>
      </div>

      {/* MOBILE HAMBURGER */}
      <div className="md:hidden fixed top-10 right-10 z-50" onClick={handleNav}>
        {nav ? <AiOutlineClose size={24} /> : <AiOutlineMenu size={24} />}
      </div>

      {/* MOBILE SIDEBAR */}
      <div className={`fixed top-0 left-0 w-64 h-full bg-white shadow-lg transform transition-transform duration-300
        ${nav ? "translate-x-0" : "-translate-x-full"} md:hidden`}>
        <img className="w-[175px] m-10" src={img1} alt="Logo" />
        <ul className="mt-10 text-sm text-gray-700">
          <li className="group p-4 flex items-center gap-2 hover:bg-green-600 hover:text-white hover:cursor-pointer" onClick={() => navigate("/dashboard")}>
            <Users className="w-5 h-5 text-green-600 group-hover:text-white" />
            <Link to="/dashboard">Clinic Dashboard</Link>
          </li>

          <li className="group p-4 flex items-center gap-2 hover:bg-green-600 hover:text-white hover:cursor-pointer" onClick={() => navigate("/analytics")}>
            <ChartNoAxesCombined className="w-5 h-5 text-green-600 group-hover:text-white" /> Clinic Analytics
          </li>

          <li className="group p-4 flex items-center gap-2 hover:bg-green-600 hover:text-white hover:cursor-pointer" onClick={() => navigate("/appointment")}>
            <Calendar className="w-5 h-5 text-green-600 group-hover:text-white" />
            Appointments
          </li>

          <li className="group p-4 flex items-center gap-2 hover:bg-green-600 hover:text-white hover:cursor-pointer" onClick={() => navigate("/checkin")}>
            <TicketCheck className="w-5 h-5 text-green-600 group-hover:text-white" /> Patient Check-In
          </li>
        </ul>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 ml-0 md:ml-52">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-6 h-6 text-green-600" />
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Clinic Analytics</h1>
                <p className="text-sm text-gray-600">Performance insights and statistics</p>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Content */}
        <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
          {/* Patient Volume Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Total Patients Today
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">{analytics.totalToday}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Total This Week
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-blue-600">{analytics.totalWeek}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Walk-in Served
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-purple-600">{analytics.servedWalkIn}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Appointments Served
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-orange-600">{analytics.servedAppointment}</p>
              </CardContent>
            </Card>
          </div>

          {/* Symptoms & Services */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-red-600" />
                  Most Prevalent Symptoms
                </CardTitle>
                <CardDescription>Top 5 reported symptoms</CardDescription>
              </CardHeader>
              <CardContent>
                {analytics.topSymptoms.length > 0 ? (
                  <div className="space-y-3">
                    {analytics.topSymptoms.map(([symptom, count], idx) => (
                      <div key={symptom} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-sm">
                            {idx + 1}
                          </div>
                          <span className="font-medium text-gray-900">{symptom}</span>
                        </div>
                        <Badge className="bg-red-600">{count} patients</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-center py-8">No symptom data available</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-green-600" />
                  Most Requested Services
                </CardTitle>
                <CardDescription>Top 5 medical services</CardDescription>
              </CardHeader>
              <CardContent>
                {analytics.topServices.length > 0 ? (
                  <div className="space-y-3">
                    {analytics.topServices.map(([service, count], idx) => (
                      <div key={service} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-sm">
                            {idx + 1}
                          </div>
                          <span className="font-medium text-gray-900">{service}</span>
                        </div>
                        <Badge className="bg-green-600">{count} requests</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-center py-8">No service data available</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Age Distribution & Wait Time */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Age Distribution
                </CardTitle>
                <CardDescription>Patient demographics by age group</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(analytics.ageGroups).map(([group, count]) => {
                    const percentage = patients.length > 0 ? Math.round((count / patients.length) * 100) : 0;
                    const isTop = analytics.mostPrevalentAge && group === analytics.mostPrevalentAge[0];
                    return (
                      <div key={group} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className={`font-medium ${isTop ? 'text-blue-600' : 'text-gray-700'}`}>
                            {group} years {isTop && '👑'}
                          </span>
                          <span className="text-gray-600">{count} ({percentage}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className={`h-2.5 rounded-full ${isTop ? 'bg-blue-600' : 'bg-blue-400'}`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-emerald-600" />
                  Wait Time & Peak Hours
                </CardTitle>
                <CardDescription>Service efficiency metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                    <p className="text-sm text-emerald-700 mb-1">Average Wait Time</p>
                    <p className="text-3xl font-bold text-emerald-600">{avgWaitTime} mins</p>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-gray-700">Peak Registration Hours</p>
                    {analytics.peakHours.length > 0 ? (
                      analytics.peakHours.map((peak, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-amber-600" />
                            <span className="font-medium text-gray-900">{peak.time}</span>
                          </div>
                          <Badge className="bg-amber-600">{peak.count} patients</Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-400 text-sm py-2">No peak hour data available</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;