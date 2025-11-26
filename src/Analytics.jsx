import React, { useState, useContext, useMemo } from 'react';
import Sidebar from "@/components/Sidebar";
import { Users, ChartNoAxesCombined, TicketCheck, Clock, TrendingUp, Activity, Stethoscope, Calendar, BarChart3, Menu, X, Download  } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from "@/components/ui/badge";
import { PatientContext } from "./PatientContext";
import {  useNavigate } from "react-router-dom";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logoImage from '@/assets/partner-logo.jpg'; 
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

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

    // Patients per day of week
    const dayOfWeekData = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 };
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    patients.forEach(p => {
      if (p.registeredAt) {
        const date = new Date(p.registeredAt);
        const dayName = dayNames[date.getDay()];
        if (dayOfWeekData.hasOwnProperty(dayName)) {
          dayOfWeekData[dayName]++;
        }
      }
    });

    const patientsPerDay = Object.entries(dayOfWeekData).map(([day, count]) => ({
      day,
      patients: count
    }));

    // Patients per hour (8am-5pm only)
    const hourData = Array.from({ length: 10 }, (_, i) => ({ hour: i + 8, patients: 0 })); // 8am to 5pm (8-17)
    patients.forEach(p => {
      if (p.registeredAt) {
        const hour = new Date(p.registeredAt).getHours();
        if (hour >= 8 && hour <= 17) {
          const index = hour - 8;
          hourData[index].patients++;
        }
      }
    });

    const formatHour = (hour) => {
      if (hour === 12) return '12:00 PM';
      if (hour < 12) return `${hour}:00 AM`;
      return `${hour - 12}:00 PM`;
    };

    const patientsPerHour = hourData.map(({ hour, patients }) => ({
      hour: formatHour(hour),
      patients
    }));

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

    // Helper function to convert 24-hour to 12-hour format
    const formatTo12Hour = (hour) => {
      const h = parseInt(hour);
      const period = h >= 12 ? 'PM' : 'AM';
      const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
      return `${hour12}:00 ${period}`;
    };

     // Peak registration heatmap (hour x day of week) - 8am to 5pm only
    const heatmapData = [];
    for (let hour = 8; hour <= 17; hour++) { // 8am to 5pm
      for (let day = 1; day < 7; day++) { // Mon=1, Sat=6
        heatmapData.push({ hour, day, count: 0 });
      }
    }
    
    const peakHours = Object.entries(hourCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([hour, count]) => {
      const startHour = parseInt(hour);
      const endHour = startHour + 1;
      return {
        time: `${formatTo12Hour(startHour)} - ${formatTo12Hour(endHour)}`,
        count
      };
    });

    patients.forEach(p => {
      if (p.registeredAt) {
        const date = new Date(p.registeredAt);
        const hour = date.getHours();
        const day = date.getDay();
        if (day >= 1 && day <= 6 && hour >= 8 && hour <= 17) { // Mon-Sat, 8am-5pm only
          const cell = heatmapData.find(h => h.hour === hour && h.day === day);
          if (cell) cell.count++;
        }
      }
    });

    // Patient count trend by weeks (last 8 weeks)
    const weeklyData = [];
    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date(today);
      weekStart.setDate(weekStart.getDate() - (i * 7));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      const count = patients.filter(p => {
        if (!p.registeredAt) return false;
        const pDate = new Date(p.registeredAt);
        return pDate >= weekStart && pDate <= weekEnd;
      }).length;

      weeklyData.push({
        week: `Week ${8 - i}`,
        patients: count
      });
    }

     

    return {
      patientsPerDay,
      patientsPerHour,
      heatmapData,
      weeklyData,
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

  // Colors for charts
  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

   // Heatmap component (simplified grid visualization) - 8am to 5pm
  const HeatmapChart = ({ data }) => {
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const maxCount = Math.max(...data.map(d => d.count));
      
      const formatHour = (hour) => {
        if (hour === 12) return '12PM';
        if (hour < 12) return `${hour}AM`;
        return `${hour - 12}PM`;
      };
      
      return (
        <div className="overflow-x-auto pb-2">
          <div className="inline-block min-w-full">
            <div className="grid grid-cols-7 gap-1 sm:gap-2 text-xs">
              <div></div>
              {days.map(day => (
                <div key={day} className="text-center font-semibold p-1 text-[10px] sm:text-xs">{day}</div>
              ))}
              
              {Array.from({ length: 10 }, (_, i) => i + 8).map(hour => (
                <React.Fragment key={hour}>
                  <div className="text-right pr-1 sm:pr-2 py-1 sm:py-2 font-medium text-[9px] sm:text-xs whitespace-nowrap">
                    {formatHour(hour)}
                  </div>
                  {days.map((_, dayIdx) => {
                    const cell = data.find(d => d.hour === hour && d.day === dayIdx + 1);
                    const intensity = cell ? (cell.count / maxCount) : 0;
                    const bgColor = intensity === 0 ? 'bg-gray-100' :
                      intensity < 0.25 ? 'bg-green-100' :
                      intensity < 0.5 ? 'bg-green-300' :
                      intensity < 0.75 ? 'bg-green-500' : 'bg-green-700';
                    
                    return (
                      <div
                        key={`${hour}-${dayIdx}`}
                        className={`${bgColor} p-2 sm:p-3 md:p-4 rounded text-center text-[9px] sm:text-xs ${intensity > 0.5 ? 'text-white' : 'text-gray-700'}`}
                        title={`${days[dayIdx]} ${formatHour(hour)} - ${cell?.count || 0} patients`}
                      >
                        {cell?.count || 0}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      );
    };

  // Download Analytics Report Function
  // Helper function to get the week period (Monday to current day)
const getWeekPeriod = (date) => {
  const current = new Date(date);
  const day = current.getDay();
  const diff = current.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
  const monday = new Date(current.setDate(diff));
  
  const formatDate = (d) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December'];
    return `${months[d.getMonth()]} ${d.getDate()}`;
  };
  
  return `${formatDate(monday)} - ${formatDate(new Date())}`;
};

// Download Analytics Report Function (PDF)
const downloadAnalyticsReport = () => {
  const doc = new jsPDF();
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  const timeStr = now.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  const weekPeriod = getWeekPeriod(now);

  // Add logo - centered above clinic name
  const logoWidth = 30;
  const logoHeight = 30;
  const logoX = 105 - (logoWidth / 2);
  const logoY = 10;
  doc.addImage(logoImage, 'JPEG', logoX, logoY, logoWidth, logoHeight);

  // Clinic Name - positioned below logo
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('De Valley Medical Clinic and Diagnostic Center, Inc.', 105, logoY + logoHeight + 10, { align: 'center' });
  
  // Report Title
  doc.setFontSize(13);
  doc.text('Analytics Report', 105, logoY + logoHeight + 18, { align: 'center' });
      
  // Report Information - Two columns layout
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');

  // Left column
  doc.text(`Generated: ${dateStr} at ${timeStr}`, 14, 68);
  doc.text(`Analysis Period: ${weekPeriod}`, 14, 74);

  // Right column (aligned to the right)
  doc.text(`Average Wait Time: ${avgWaitTime} mins`, 196, 68, { align: 'right' });
  doc.text(`Total Patients: ${patients.length}`, 196, 74, { align: 'right' });

  let yPosition = 86;

  // Patient Volume Statistics
  doc.setFont(undefined, 'bold');
  doc.setFontSize(12);
  doc.text('Patient Volume Statistics', 14, yPosition);
  yPosition += 6;

  autoTable(doc, {
    startY: yPosition,
    head: [['Metric', 'Count']],
    body: [
      ['Total Patients Today', analytics.totalToday],
      ['Total Patients This Week', analytics.totalWeek],
      ['Walk-in Patients Served', analytics.servedWalkIn],
      ['Appointments Served', analytics.servedAppointment],
      ['Average Wait Time', `${avgWaitTime} mins`]
    ],
    headStyles: { fillColor: [34, 139, 34] },
    styles: { fontSize: 9 },
    margin: { left: 14 }
  });
  yPosition = doc.lastAutoTable.finalY + 10;

  // Check if we need a new page
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 20;
  }

  // Patients per Day of Week
  doc.setFont(undefined, 'bold');
  doc.setFontSize(12);
  doc.text('Patients per Day', 14, yPosition);
  yPosition += 6;

  autoTable(doc, {
    startY: yPosition,
    head: [['Day', 'Patient Count']],
    body: analytics.patientsPerDay.map(({ day, patients }) => [day, patients]),
    headStyles: { fillColor: [16, 185, 129] },
    styles: { fontSize: 9 },
    margin: { left: 14 }
  });

  yPosition = doc.lastAutoTable.finalY + 10;

  // Check if we need a new page
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 20;
  }

  // Patients per Hour
  doc.setFont(undefined, 'bold');
  doc.setFontSize(12);
  doc.text('Patients per Hour (8AM - 5PM)', 14, yPosition);
  yPosition += 6;

  autoTable(doc, {
    startY: yPosition,
    head: [['Time', 'Patient Count']],
    body: analytics.patientsPerHour.map(({ hour, patients }) => [hour, patients]),
    headStyles: { fillColor: [59, 130, 246] },
    styles: { fontSize: 9 },
    margin: { left: 14 }
  });

  yPosition = doc.lastAutoTable.finalY + 10;

  // Check if we need a new page
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 20;
  }

  // Weekly Patient Trend
  doc.setFont(undefined, 'bold');
  doc.setFontSize(12);
  doc.text('Patient Count Trend (Last 8 Weeks)', 14, yPosition);
  yPosition += 6;

  autoTable(doc, {
    startY: yPosition,
    head: [['Week', 'Patient Count']],
    body: analytics.weeklyData.map(({ week, patients }) => [week, patients]),
    headStyles: { fillColor: [139, 92, 246] },
    styles: { fontSize: 9 },
    margin: { left: 14 }
  });

  yPosition = doc.lastAutoTable.finalY + 10;

  // Check if we need a new page
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 20;
  }

  // Most Prevalent Symptoms
  doc.setFont(undefined, 'bold');
  doc.setFontSize(12);
  doc.text('Most Prevalent Symptoms (Top 5)', 14, yPosition);
  yPosition += 6;

  if (analytics.topSymptoms.length > 0) {
    autoTable(doc, {
      startY: yPosition,
      head: [['Rank', 'Symptom', 'Patient Count']],
      body: analytics.topSymptoms.map(([symptom, count], idx) => [
        idx + 1,
        symptom,
        count
      ]),
      headStyles: { fillColor: [239, 68, 68] },
      styles: { fontSize: 9 },
      margin: { left: 14 }
    });
    yPosition = doc.lastAutoTable.finalY + 10;
  } else {
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    doc.text('No symptom data available', 14, yPosition);
    yPosition += 10;
  }

  // Check if we need a new page
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 20;
  }

  // Most Requested Services
  doc.setFont(undefined, 'bold');
  doc.setFontSize(12);
  doc.text('Most Requested Services (Top 5)', 14, yPosition);
  yPosition += 6;

  if (analytics.topServices.length > 0) {
    autoTable(doc, {
      startY: yPosition,
      head: [['Rank', 'Service', 'Request Count']],
      body: analytics.topServices.map(([service, count], idx) => [
        idx + 1,
        service,
        count
      ]),
      headStyles: { fillColor: [34, 139, 34] },
      styles: { fontSize: 9 },
      margin: { left: 14 }
    });
    yPosition = doc.lastAutoTable.finalY + 10;
  } else {
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    doc.text('No service data available', 14, yPosition);
    yPosition += 10;
  }

  // Check if we need a new page
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 20;
  }

  // Age Distribution
  doc.setFont(undefined, 'bold');
  doc.setFontSize(12);
  doc.text('Age Distribution', 14, yPosition);
  yPosition += 6;

  autoTable(doc, {
    startY: yPosition,
    head: [['Age Group', 'Patient Count', 'Percentage']],
    body: Object.entries(analytics.ageGroups).map(([group, count]) => {
      const percentage = patients.length > 0 ? Math.round((count / patients.length) * 100) : 0;
      const isTop = analytics.mostPrevalentAge && group === analytics.mostPrevalentAge[0];
      return [
        `${group} years${isTop ? ' (Most Prevalent)' : ''}`,
        count,
        `${percentage}%`
      ];
    }),
    headStyles: { fillColor: [59, 130, 246] },
    styles: { fontSize: 9 },
    margin: { left: 14 }
  });
  yPosition = doc.lastAutoTable.finalY + 10;

  // Check if we need a new page
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 20;
  }

    // Peak Registration Hours
  doc.setFont(undefined, 'bold');
  doc.setFontSize(12);
  doc.text('Peak Hours', 14, yPosition);
  yPosition += 6;

  if (analytics.peakHours.length > 0) {
    autoTable(doc, {
      startY: yPosition,
      head: [['Time Slot', 'Patient Count']],
      body: analytics.peakHours.map(peak => [
        peak.time,
        peak.count
      ]),
      headStyles: { fillColor: [245, 158, 11] },
      styles: { fontSize: 9 },
      margin: { left: 14 }
    });
    yPosition = doc.lastAutoTable.finalY + 10;
  } else {
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    doc.text('No peak hour data available', 14, yPosition);
    yPosition += 10;
  }

  // Check if we need a new page
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 20;
  }

  // Peak Registration Hours Heatmap
  doc.setFont(undefined, 'bold');
  doc.setFontSize(12);
  doc.text('Peak Hours Heatmap (Mon-Sat, 8AM-5PM)', 14, yPosition);
  yPosition += 6;

  // Prepare heatmap data for table
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const formatHourLabel = (hour) => {
    if (hour === 12) return '12PM';
    if (hour < 12) return `${hour}AM`;
    return `${hour - 12}PM`;
  };

  const heatmapTableData = [];
  for (let hour = 8; hour <= 17; hour++) {
    const rowData = [formatHourLabel(hour)];
    for (let day = 1; day <= 6; day++) {
      const cell = analytics.heatmapData.find(d => d.hour === hour && d.day === day);
      rowData.push(cell?.count || 0);
    }
    heatmapTableData.push(rowData);
  }

  autoTable(doc, {
    startY: yPosition,
    head: [['Time', ...days]],
    body: heatmapTableData,
    headStyles: { fillColor: [16, 185, 129], halign: 'center' },
    styles: { fontSize: 8, halign: 'center' },
    margin: { left: 14 },
    columnStyles: {
      0: { fontStyle: 'bold', fillColor: [243, 244, 246] }
    }
  });

  // Save the PDF
  doc.save(`Analytics_Report_${now.toISOString().split('T')[0]}.pdf`);
};

  return (
    <div className="flex w-full min-h-screen bg-gray-50">
       <Sidebar nav={nav} handleNav={handleNav} />

      {/* MAIN CONTENT */}
      <div className="flex-1 ml-0 md:ml-52">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
            {/* Desktop: Side by side layout */}
            <div className="hidden sm:flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-6 h-6 text-green-600" />
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Clinic Analytics</h1>
                  <p className="text-sm text-gray-600">Performance insights and statistics</p>
                </div>
              </div>
              <button
                onClick={downloadAnalyticsReport}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download Report</span>
              </button>
            </div>

            {/* Mobile: Stacked layout */}
            <div className="sm:hidden space-y-4">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-6 h-6 text-green-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Clinic Analytics</h1>
                  <p className="text-sm text-gray-600">Insights and statistics</p>
                </div>
              </div>
              <button
                onClick={downloadAnalyticsReport}
                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-md transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download Report</span>
              </button>
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
          
          {/* Bar Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Patients per Day */}
            <Card>
              <CardHeader>
                <CardTitle>Patients per Day</CardTitle>
                <CardDescription>Distribution of patient visits by weekday</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.patientsPerDay}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="patients" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Patients per Hour */}
             <Card>
              <CardHeader>
                <CardTitle>Patients per Hour</CardTitle>
                <CardDescription>Hourly distribution of patient</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.patientsPerHour}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="hour" 
                      angle={-45} 
                      textAnchor="end" 
                      height={80}
                      interval={0}
                      tick={{ fontSize: 10 }}
                    />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="patients" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Patient Count Trend by Weeks */}
            <Card>
              <CardHeader>
                <CardTitle>Patient Count Trend (8 Weeks)</CardTitle>
                <CardDescription>Weekly patient volume over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="patients" stroke="#8b5cf6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
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
                    <p className="text-sm font-semibold text-gray-700">Peak Hours</p>
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
          {/* Heatmap */}
            <Card>
              <CardHeader>
                <CardTitle>Peak Hours Heatmap</CardTitle>
                <CardDescription>When do patients come the most? (Mon-Sat)</CardDescription>
              </CardHeader>
              <CardContent>
                <HeatmapChart data={analytics.heatmapData} />
              </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
};

export default Analytics;