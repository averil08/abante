import React, { useState, useContext, useMemo } from 'react';
import Sidebar from "@/components/Sidebar";
import { BarChart3, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PatientContext } from "./PatientContext";
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
  const handleNav = () => setNav(!nav);
  const { patients, avgWaitTime } = useContext(PatientContext);

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

  // Calculate all analytics data
  const analytics = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

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

    // Most requested services (top 10 for bar chart)
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
      .slice(0, 5)
      .map(([service, count]) => ({ service, count }));

    // Peak registration heatmap (hour x day of week) - 8am to 5pm only
    const heatmapData = [];
    for (let hour = 8; hour <= 17; hour++) { // 8am to 5pm
      for (let day = 1; day < 7; day++) { // Mon=1, Sat=6
        heatmapData.push({ hour, day, count: 0 });
      }
    }

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

    // Walk-ins vs Appointments (served only)
    const servedWalkIn = patients.filter(p => p.type === "Walk-in" && p.status === "done").length;
    const servedAppointment = patients.filter(p => p.type === "Appointment" && p.status === "done").length;
    
    const walkInVsAppointment = [
      { name: 'Walk-in', value: servedWalkIn },
      { name: 'Appointment', value: servedAppointment }
    ];

    // Real queue length calculation per hour (8am-5pm)
  const calculateRealQueuePerHour = () => {
    const hourlyPeakQueue = Array.from({ length: 10 }, (_, i) => ({
      hour: formatHour(i + 8),
      queueLength: 0
    }));

    // For each hour from 8am to 5pm
    for (let hour = 8; hour <= 17; hour++) {
      const hourIndex = hour - 8;
      
      // Count how many patients were in queue during this hour
      let maxQueueAtHour = 0;
      
      patients.forEach(p => {
        if (!p.registeredAt || !p.inQueue || p.isInactive) return;
        
        const regDate = new Date(p.registeredAt);
        const regHour = regDate.getHours();
        
        // If patient registered at or before this hour
        if (regHour <= hour) {
          // Count all patients who were waiting or in progress at this hour
          const waitingCount = patients.filter(other => {
            if (!other.registeredAt || !other.inQueue || other.isInactive) return false;
            
            const otherRegDate = new Date(other.registeredAt);
            const otherRegHour = otherRegDate.getHours();
            
            // Patient registered by this hour AND is waiting/in-progress
            return otherRegHour <= hour && 
                  (other.status === 'waiting' || other.status === 'in progress');
          }).length;
          
          maxQueueAtHour = Math.max(maxQueueAtHour, waitingCount);
        }
      });
      
      hourlyPeakQueue[hourIndex].queueLength = maxQueueAtHour;
    }

    return hourlyPeakQueue;
  };

  const queueTrendByHour = calculateRealQueuePerHour();

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

    // Age distribution histogram
    const ageRanges = [
      { range: '0-10', min: 0, max: 10, count: 0 },
      { range: '11-20', min: 11, max: 20, count: 0 },
      { range: '21-30', min: 21, max: 30, count: 0 },
      { range: '31-40', min: 31, max: 40, count: 0 },
      { range: '41-50', min: 41, max: 50, count: 0 },
      { range: '51-60', min: 51, max: 60, count: 0 },
      { range: '61-70', min: 61, max: 70, count: 0 },
      { range: '71+', min: 71, max: 150, count: 0 }
    ];

    patients.forEach(p => {
      const age = parseInt(p.age);
      const range = ageRanges.find(r => age >= r.min && age <= r.max);
      if (range) range.count++;
    });

    const ageDistribution = ageRanges.map(({ range, count }) => ({ range, count }));

    return {
      patientsPerDay,
      patientsPerHour,
      topServices,
      heatmapData,
      walkInVsAppointment,
      queueTrendByHour,
      weeklyData,
      ageDistribution,
      totalPatients: patients.length,
      servedWalkIn,
      servedAppointment
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

  // Download report function (keeping original functionality)
  const getWeekPeriod = (date) => {
    const current = new Date(date);
    const day = current.getDay();
    const diff = current.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(current.setDate(diff));
    
    const formatDate = (d) => {
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];
      return `${months[d.getMonth()]} ${d.getDate()}`;
    };
    
    return `${formatDate(monday)} - ${formatDate(new Date())}`;
  };

  const downloadAnalyticsReport = () => {
  const doc = new jsPDF();
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const weekPeriod = getWeekPeriod(now);

  // Logo and Header
  const logoWidth = 30;
  const logoHeight = 30;
  const logoX = 105 - (logoWidth / 2);
  const logoY = 10;
  doc.addImage(logoImage, 'JPEG', logoX, logoY, logoWidth, logoHeight);

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('De Valley Medical Clinic and Diagnostic Center, Inc.', 105, logoY + logoHeight + 10, { align: 'center' });
  
  doc.setFontSize(13);
  doc.text('Analytics Report', 105, logoY + logoHeight + 18, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text(`Generated: ${dateStr} at ${timeStr}`, 14, 68);
  doc.text(`Analysis Period: ${weekPeriod}`, 14, 74);
  doc.text(`Average Wait Time: ${avgWaitTime} mins`, 196, 68, { align: 'right' });
  doc.text(`Total Patients: ${analytics.totalPatients}`, 196, 74, { align: 'right' });

  let yPosition = 86;

  // Summary Statistics
  doc.setFont(undefined, 'bold');
  doc.setFontSize(12);
  doc.text('Patient Statistics Summary', 14, yPosition);
  yPosition += 6;

  autoTable(doc, {
    startY: yPosition,
    head: [['Metric', 'Value']],
    body: [
      ['Total Patients', analytics.totalPatients],
      ['Walk-ins Served', analytics.servedWalkIn],
      ['Appointments Served', analytics.servedAppointment],
      ['Average Wait Time', `${avgWaitTime} mins`]
    ],
    headStyles: { fillColor: [16, 185, 129] },
    styles: { fontSize: 9 },
    margin: { left: 14 }
  });

  yPosition = doc.lastAutoTable.finalY + 10;

  // Patients per Day of Week
  doc.setFont(undefined, 'bold');
  doc.setFontSize(12);
  doc.text('Patients per Day of Week', 14, yPosition);
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

  // Top 5 Most Requested Services
  doc.setFont(undefined, 'bold');
  doc.setFontSize(12);
  doc.text('Top 5 Most Requested Services', 14, yPosition);
  yPosition += 6;

  autoTable(doc, {
    startY: yPosition,
    head: [['Service', 'Request Count']],
    body: analytics.topServices.map(({ service, count }) => [service, count]),
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

  // Queue Length Trend
  doc.setFont(undefined, 'bold');
  doc.setFontSize(12);
  doc.text('Queue Length Trend by Hour', 14, yPosition);
  yPosition += 6;

  autoTable(doc, {
    startY: yPosition,
    head: [['Time', 'Queue Length']],
    body: analytics.queueTrendByHour.map(({ hour, queueLength }) => [hour, queueLength]),
    headStyles: { fillColor: [245, 158, 11] },
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

  // Age Distribution
  doc.setFont(undefined, 'bold');
  doc.setFontSize(12);
  doc.text('Age Distribution', 14, yPosition);
  yPosition += 6;

  autoTable(doc, {
    startY: yPosition,
    head: [['Age Range', 'Patient Count']],
    body: analytics.ageDistribution.map(({ range, count }) => [range, count]),
    headStyles: { fillColor: [236, 72, 153] },
    styles: { fontSize: 9 },
    margin: { left: 14 }
  });

  yPosition = doc.lastAutoTable.finalY + 10;

  // Check if we need a new page
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 20;
  }

  // Walk-ins vs Appointments
  doc.setFont(undefined, 'bold');
  doc.setFontSize(12);
  doc.text('Walk-ins vs Appointments (Served)', 14, yPosition);
  yPosition += 6;

  autoTable(doc, {
    startY: yPosition,
    head: [['Type', 'Count']],
    body: analytics.walkInVsAppointment.map(({ name, value }) => [name, value]),
    headStyles: { fillColor: [16, 185, 129] },
    styles: { fontSize: 9 },
    margin: { left: 14 }
  });

  // Save the PDF
  doc.save(`Analytics_Report_${now.toISOString().split('T')[0]}.pdf`);
};

  return (
    <div className="flex w-full min-h-screen bg-gray-50">
      <Sidebar nav={nav} handleNav={handleNav} />

      <div className="flex-1 ml-0 md:ml-52">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
            <div className="hidden sm:flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-6 h-6 text-green-600" />
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Clinic Analytics</h1>
                  <p className="text-sm text-gray-600">Visual performance insights and statistics</p>
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

            <div className="sm:hidden space-y-4">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-6 h-6 text-green-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Clinic Analytics</h1>
                  <p className="text-sm text-gray-600">Visual insights</p>
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

        {/* Charts Content */}
        <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
          
          {/* Bar Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Patients per Day of Week */}
            <Card>
              <CardHeader>
                <CardTitle>Patients per Day of Week</CardTitle>
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
                <CardDescription>Hourly distribution of patient registrations</CardDescription>
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

          {/* Most Requested Services */}
          <Card>
            <CardHeader>
              <CardTitle>Top 5 Most Requested Services</CardTitle>
              <CardDescription>Services ordered by request frequency</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.topServices} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis 
                    dataKey="service" 
                    type="category" 
                    width={120}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip />
                  <Bar dataKey="count" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Heatmap */}
          <Card>
            <CardHeader>
              <CardTitle>Peak Registration Hours Heatmap</CardTitle>
              <CardDescription>When do patients come the most? (Mon-Sat)</CardDescription>
            </CardHeader>
            <CardContent>
              <HeatmapChart data={analytics.heatmapData} />
            </CardContent>
          </Card>

          {/* Pie Chart and Line Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Walk-ins vs Appointments Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Walk-ins vs Appointments Served</CardTitle>
                <CardDescription>Distribution of completed consultations</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.walkInVsAppointment}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {analytics.walkInVsAppointment.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [`${value} patients`, name]} />
                    <Legend 
                      layout="horizontal" 
                      verticalAlign="bottom" 
                      align="center"
                      wrapperStyle={{ paddingTop: '20px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Queue Length Trend */}
             <Card>
              <CardHeader>
                <CardTitle>Queue Length Trend</CardTitle>
                <CardDescription>When do patients wait the longest?</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.queueTrendByHour}>
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
                    <Legend />
                    <Line type="monotone" dataKey="queueLength" stroke="#f59e0b" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Weekly Trend and Age Distribution */}
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

            {/* Age Distribution Histogram */}
            <Card>
              <CardHeader>
                <CardTitle>Age Distribution</CardTitle>
                <CardDescription>Patient demographics by age group</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.ageDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#ec4899" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Analytics;