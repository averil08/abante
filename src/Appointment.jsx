import React, { useState, useContext } from 'react';
import Sidebar from "@/components/Sidebar";
import { Calendar, Clock, Phone, User, Activity, Stethoscope, CheckCircle, XCircle, MessageSquare, Filter, Eye, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from "@/components/ui/badge";
import { PatientContext } from "./PatientContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import './appointment-responsive.css'; // ADD THIS CSS FILE

const Appointment = () => {
  const [nav, setNav] = useState(false);
  const handleNav = () => setNav(!nav);
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  const { patients, acceptAppointment, rejectAppointment } = useContext(PatientContext);

  // Filter appointments (patients with type "Appointment")
  const allAppointments = (patients || [])
    .filter(p =>
      p.type === "Appointment" &&
      p.status !== "done"
    );

  // Helper function to check if appointment is in the future
  const isFutureAppointment = (appointment) => {
    const appointmentDate = new Date(appointment.appointmentDateTime || appointment.appointment_datetime);
    return appointmentDate > new Date();
  };

  // Helper function to categorize upcoming appointments
  const categorizeUpcoming = (appointment) => {
    const appointmentDate = new Date(appointment.appointmentDateTime || appointment.appointment_datetime);
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const endOfWeek = new Date(now);
    endOfWeek.setDate(endOfWeek.getDate() + 7);

    const appointmentDay = new Date(appointmentDate.getFullYear(), appointmentDate.getMonth(), appointmentDate.getDate());
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrowDay = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());

    if (appointmentDay.getTime() === today.getTime()) {
      return 'today';
    } else if (appointmentDay.getTime() === tomorrowDay.getTime()) {
      return 'tomorrow';
    } else if (appointmentDate <= endOfWeek) {
      return 'thisWeek';
    }
    return 'later';
  };

  // Get filtered appointments based on active filter
  const getFilteredAppointments = () => {
    switch (activeFilter) {
      case 'pending':
        return allAppointments
          .filter(a => !a.appointmentStatus || a.appointmentStatus === 'pending')
          .sort((a, b) => new Date(b.registeredAt) - new Date(a.registeredAt));

      case 'accepted':
        return allAppointments
          .filter(a => a.appointmentStatus === 'accepted')
          .sort((a, b) => new Date(b.registeredAt) - new Date(a.registeredAt));

      case 'rejected':
        return allAppointments
          .filter(a => a.appointmentStatus === 'rejected')
          .sort((a, b) => new Date(b.rejectedAt || b.registeredAt) - new Date(a.rejectedAt || a.registeredAt));

      case 'cancelled':
        return allAppointments
          .filter(a => a.appointmentStatus === 'cancelled')
          .sort((a, b) => new Date(b.cancelledAt || b.registeredAt) - new Date(a.cancelledAt || a.registeredAt));

      case 'upcoming':
        return allAppointments
          .filter(a => a.appointmentStatus === 'accepted' && isFutureAppointment(a))
          .sort((a, b) => {
            const dateA = new Date(a.appointmentDateTime || a.appointment_datetime);
            const dateB = new Date(b.appointmentDateTime || b.appointment_datetime);
            return dateA - dateB;
          });

      case 'all':
      default:
        return allAppointments
          .sort((a, b) => new Date(b.registeredAt) - new Date(a.registeredAt));
    }
  };

  const filteredAppointments = getFilteredAppointments();

  // Group upcoming appointments by category
  const groupedUpcoming = activeFilter === 'upcoming' ? {
    today: filteredAppointments.filter(a => categorizeUpcoming(a) === 'today'),
    tomorrow: filteredAppointments.filter(a => categorizeUpcoming(a) === 'tomorrow'),
    thisWeek: filteredAppointments.filter(a => categorizeUpcoming(a) === 'thisWeek'),
    later: filteredAppointments.filter(a => categorizeUpcoming(a) === 'later')
  } : null;

  // Service labels mapping
  const serviceLabels = {
    pedia: "Pediatric Consultation",
    adult: "Adult Consultation",
    senior: "Senior Consultation (60+)",
    preventive: "Preventive/Annual Physical Exam",
    "follow-up": "Follow-up Consultation",
    cbc: "CBC (Complete Blood Count)",
    platelet: "Platelet Count",
    esr: "ESR (Inflammation Check)",
    abo: "Blood Type Test: ABO/Rh Typing",
    hbsag: "HBsAg (Hepatitis B Screening)",
    vdrl: "VDRL/RPR (Syphilis Screening)",
    antiHCV: "Anti-HCV (Hepatitis C Screening)",
    hpylori: "H.PYLORI (H. pylori Stomach Bacteria Test)",
    dengueIg: "Dengue IgG+IgM (Dengue Fever Screening: Past/Current)",
    dengueNs1: "Dengue NS1 (Early Dengue Fever Test)",
    dengueDuo: "Dengue Duo: NS1, IgG+IgM (Complete Dengue Test)",
    typhidot: "Typhidot (Typhoid Fever Test)",
    fbs: "FBS (Fasting Blood Sugar)",
    rbs: "RBS (Random Blood Sugar)",
    lipid: "Lipid Profile (Cholesterol and Fats Check)",
    totalCh: "Total Cholesterol",
    triglycerides: "Triglycerides (Blood Fats)",
    hdl: "HDL (Good Cholesterol)",
    ldl: "LDL (Bad Cholesterol)",
    alt: "ALT/SGPT (Liver Function Test)",
    ast: "AST/SGOT (Liver Function Test)",
    uric: "Uric Acid",
    creatinine: "Creatinine (Kidney Function Test)",
    bun: "Bun (Kidney Function Test)",
    hba1c: "HBA1C (Long-Term Blood Sugar)",
    albumin: "Albumin (Protein in blood)",
    magnesium: "Magnesium",
    totalProtein: "Total Protein (present in blood)",
    alp: "ALP (Bone and Liver Enzyme)",
    phosphorus: "Phosphorus",
    sodium: "Sodium",
    potassium: "Potassium",
    ionizedCal: "Ionized Calcium (Free Calcium Level)",
    totalCal: "Total Calcium",
    chloride: "Chloride",
    urinalysis: "Urinalysis",
    fecalysis: "Fecalysis (Stool Test)",
    pregnancyT: "Pregnancy Test",
    fecal: "Fecal Occult Blood (Hidden Blood in Stool)",
    semen: "Semen Analysis",
    "general surgery": "General Surgery Consultation",
    ent: "ENT (Ear, Nose, Throat) Consultation",
    orthopedic: "Orthopedic Surgery Consultation",
    tsh: "TSH (Thyroid Stimulating Hormone)",
    ft3: "FT3 (Free T3 Thyroid Hormone)",
    "75g": "75 Grams OGTT (Diabetes Glucose Challenge Test)",
    t4: "T4 (T4 Thyroid Hormone)",
    t3: "T3 (T3 Thyroid Hormone)",
    psa: "PSA (Prostate Health Screening)",
    totalBilirubin: "Total/ Direct Bilirubin (Jaundice Check)"
  };

  const getServiceLabel = (serviceId) => serviceLabels[serviceId] || serviceId;

  const handleAccept = (appointment) => {
    acceptAppointment(appointment.id);
  };

  const handleRejectClick = (appointment) => {
    setRejectionDialog({
      open: true,
      appointment: appointment,
      reason: ""
    });
  };

  const [rejectionDialog, setRejectionDialog] = useState({
    open: false,
    appointment: null,
    reason: ""
  });

  const handleRejectConfirm = () => {
    if (!rejectionDialog.reason.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }

    rejectAppointment(rejectionDialog.appointment.id, rejectionDialog.reason);
    setRejectionDialog({ open: false, appointment: null, reason: "" });
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    const date = new Date(dateTimeString);
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }

    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDateShort = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    const date = new Date(dateTimeString);
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }

    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setIsDetailsDialogOpen(true);
  };

  // Render appointment card for mobile
  const renderAppointmentCard = (appointment) => (
    <Card key={appointment.id} className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <Badge variant="outline" className="font-mono">
            #{String(appointment.queueNo).padStart(3, '0')}
          </Badge>
          {appointment.appointmentStatus === 'accepted' ? (
            <Badge className="bg-green-600">Accepted</Badge>
          ) : appointment.appointmentStatus === 'rejected' ? (
            <Badge variant="destructive" className="bg-red-600 text-white">
              Not Accepted
            </Badge>
          ) : appointment.appointmentStatus === 'cancelled' ? (
            <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300">
              Cancelled
            </Badge>
          ) : (
            <Badge variant="secondary" className="bg-amber-100 text-amber-700">
              Pending
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2 mb-3">
          <User className="w-4 h-4 text-gray-400" />
          <span className="font-semibold text-gray-900 text-lg">{appointment.name}</span>
          <span className="text-gray-500 text-sm">• {appointment.age} yrs</span>
        </div>

        <div className="flex items-center gap-2 mb-3 text-sm">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="text-gray-700">
            {formatDateShort(appointment.appointmentDateTime || appointment.appointment_datetime)}
          </span>
        </div>

        {appointment.assignedDoctor ? (
          <div className="flex items-center gap-2 mb-3">
            <Stethoscope className="w-4 h-4 text-purple-600" />
            <span className="text-purple-700 font-medium text-sm">
              {appointment.assignedDoctor.name}
            </span>
          </div>
        ) : (
          <div className="mb-3">
            <p className="text-xs text-gray-500 mb-1.5">Services:</p>
            <div className="flex flex-wrap gap-1.5">
              {appointment.services && appointment.services.length > 0 ? (
                <>
                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                    {getServiceLabel(appointment.services[0])}
                  </Badge>
                  {appointment.services.length > 1 && (
                    <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600">
                      +{appointment.services.length - 1} more
                    </Badge>
                  )}
                </>
              ) : (
                <span className="text-gray-400 text-sm">None</span>
              )}
            </div>
          </div>
        )}

        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-1.5">Symptoms:</p>
          <div className="flex flex-wrap gap-1.5">
            {appointment.symptoms && appointment.symptoms.length > 0 ? (
              <>
                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                  {appointment.symptoms[0]}
                </Badge>
                {appointment.symptoms.length > 1 && (
                  <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600">
                    +{appointment.symptoms.length - 1} more
                  </Badge>
                )}
              </>
            ) : (
              <span className="text-gray-400 text-sm">None</span>
            )}
          </div>
        </div>

        <div className="flex gap-2 pt-3 border-t">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 text-blue-600 border-blue-300 hover:bg-blue-50"
            onClick={() => handleViewDetails(appointment)}
          >
            <Eye className="w-4 h-4 mr-1" />
            View
          </Button>

          {(!appointment.appointmentStatus || appointment.appointmentStatus === 'pending') && (
            <>
              <Button
                size="sm"
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                onClick={() => handleAccept(appointment)}
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Accept
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 text-red-600 border-red-300 hover:bg-red-50"
                onClick={() => handleRejectClick(appointment)}
              >
                <XCircle className="w-4 h-4 mr-1" />
                Decline
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );

  // UPDATED: Render appointment table for desktop - RESPONSIVE VERSION
  const renderAppointmentTable = (appointments) => (
    <>
      {/* Mobile Card View */}
      <div className="block lg:hidden">
        {appointments.map((appointment) => renderAppointmentCard(appointment))}
      </div>

      {/* Desktop Table View - RESPONSIVE */}
      <div className="hidden lg:block overflow-x-auto max-w-full">
        <Table className="min-w-full">
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-semibold text-gray-700 px-2 xl:px-4 text-xs whitespace-nowrap">
                Queue #
              </TableHead>
              <TableHead className="font-semibold text-gray-700 px-2 xl:px-4 text-xs whitespace-nowrap">
                Patient Name
              </TableHead>
              <TableHead className="font-semibold text-gray-700 px-2 xl:px-4 text-xs whitespace-nowrap">
                Age
              </TableHead>
              <TableHead className="font-semibold text-gray-700 px-2 xl:px-4 text-xs whitespace-nowrap">
                Appointment Time
              </TableHead>
              <TableHead className="font-semibold text-gray-700 px-2 xl:px-4 text-xs whitespace-nowrap">
                Doctor/Service
              </TableHead>
              <TableHead className="font-semibold text-gray-700 px-2 xl:px-4 text-xs whitespace-nowrap">
                Symptoms
              </TableHead>
              <TableHead className="font-semibold text-gray-700 text-center px-2 xl:px-4 text-xs whitespace-nowrap">
                Status
              </TableHead>
              <TableHead className="font-semibold text-gray-700 text-center px-2 xl:px-4 text-xs whitespace-nowrap">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.map((appointment) => (
              <TableRow
                key={appointment.id}
                className="hover:bg-gray-50 transition-colors"
              >
                {/* Queue Number */}
                <TableCell className="font-medium px-2 xl:px-4">
                  <Badge variant="outline" className="font-mono text-[10px] xl:text-xs">
                    #{String(appointment.queueNo).padStart(3, '0')}
                  </Badge>
                </TableCell>

                {/* Patient Name */}
                <TableCell className="px-2 xl:px-4">
                  <div className="flex items-center gap-1 xl:gap-2">
                    <User className="w-3 h-3 xl:w-4 xl:h-4 text-gray-400 flex-shrink-0" />
                    <span
                      className="font-semibold text-gray-900 text-xs xl:text-sm truncate max-w-[100px] xl:max-w-[150px]"
                      title={appointment.name}
                    >
                      {appointment.name}
                    </span>
                  </div>
                </TableCell>

                {/* Age */}
                <TableCell className="px-2 xl:px-4">
                  <span className="text-gray-700 text-xs xl:text-sm whitespace-nowrap">
                    {appointment.age} yrs
                  </span>
                </TableCell>

                {/* Appointment Time */}
                <TableCell className="px-2 xl:px-4">
                  <div className="flex items-center gap-1 xl:gap-2">
                    <Clock className="w-3 h-3 xl:w-4 xl:h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-700 text-[11px] xl:text-sm whitespace-nowrap">
                      {formatDateShort(appointment.appointmentDateTime || appointment.appointment_datetime)}
                    </span>
                  </div>
                </TableCell>

                {/* Doctor/Service */}
                <TableCell className="px-2 xl:px-4 max-w-[150px] xl:max-w-[200px]">
                  {appointment.assignedDoctor ? (
                    <div className="flex items-center gap-1 xl:gap-2">
                      <Stethoscope className="w-3 h-3 xl:w-4 xl:h-4 text-purple-600 flex-shrink-0" />
                      <span
                        className="text-purple-700 font-medium text-xs xl:text-sm truncate"
                        title={appointment.assignedDoctor.name}
                      >
                        {appointment.assignedDoctor.name}
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {appointment.services && appointment.services.length > 0 ? (
                        <>
                          <Badge
                            variant="outline"
                            className="text-[10px] xl:text-xs bg-green-50 text-green-700 border-green-200 truncate max-w-[120px] xl:max-w-[150px]"
                            title={getServiceLabel(appointment.services[0])}
                          >
                            {getServiceLabel(appointment.services[0])}
                          </Badge>
                          {appointment.services.length > 1 && (
                            <Badge variant="outline" className="text-[10px] xl:text-xs bg-gray-50 text-gray-600">
                              +{appointment.services.length - 1}
                            </Badge>
                          )}
                        </>
                      ) : (
                        <span className="text-gray-400 text-xs">None</span>
                      )}
                    </div>
                  )}
                </TableCell>

                {/* Symptoms */}
                <TableCell className="px-2 xl:px-4 max-w-[140px] xl:max-w-[180px]">
                  <div className="flex flex-wrap gap-1">
                    {appointment.symptoms && appointment.symptoms.length > 0 ? (
                      <>
                        <Badge
                          variant="outline"
                          className="text-[10px] xl:text-xs bg-blue-50 text-blue-700 border-blue-200 truncate max-w-[100px] xl:max-w-[120px]"
                          title={appointment.symptoms[0]}
                        >
                          {appointment.symptoms[0]}
                        </Badge>
                        {appointment.symptoms.length > 1 && (
                          <Badge variant="outline" className="text-[10px] xl:text-xs bg-gray-50 text-gray-600">
                            +{appointment.symptoms.length - 1}
                          </Badge>
                        )}
                      </>
                    ) : (
                      <span className="text-gray-400 text-xs">None</span>
                    )}
                  </div>
                </TableCell>

                {/* Status */}
                <TableCell className="text-center px-2 xl:px-4">
                  {appointment.appointmentStatus === 'accepted' ? (
                    <Badge className="bg-green-600 text-[10px] xl:text-xs whitespace-nowrap">Accepted</Badge>
                  ) : appointment.appointmentStatus === 'rejected' ? (
                    <Badge variant="destructive" className="bg-red-600 text-white text-[10px] xl:text-xs whitespace-nowrap">
                      Not Accepted
                    </Badge>
                  ) : appointment.appointmentStatus === 'cancelled' ? (
                    <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300 text-[10px] xl:text-xs whitespace-nowrap">
                      Cancelled
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-amber-100 text-amber-700 text-[10px] xl:text-xs whitespace-nowrap">
                      Pending
                    </Badge>
                  )}
                </TableCell>

                {/* Actions */}
                <TableCell className="px-2 xl:px-4">
                  <div className="flex items-center justify-center gap-1 xl:gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-7 w-7 p-0"
                      onClick={() => handleViewDetails(appointment)}
                      title="View Details"
                    >
                      <Eye className="w-3 h-3 xl:w-4 xl:h-4" />
                    </Button>

                    {(!appointment.appointmentStatus || appointment.appointmentStatus === 'pending') && (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-green-600 hover:text-green-700 hover:bg-green-50 h-7 w-7 p-0"
                          onClick={() => handleAccept(appointment)}
                          title="Accept"
                        >
                          <CheckCircle className="w-3 h-3 xl:w-4 xl:h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 h-7 w-7 p-0"
                          onClick={() => handleRejectClick(appointment)}
                          title="Decline"
                        >
                          <XCircle className="w-3 h-3 xl:w-4 xl:h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );

  return (
    <div className="flex w-full min-h-screen">
      <Sidebar nav={nav} handleNav={handleNav} />

      {/* MAIN CONTENT - UPDATED WITH overflow-x-hidden */}
      <div className="flex-1 min-h-screen bg-gray-50 ml-0 md:ml-52 transition-all duration-300 overflow-x-hidden">
        {/* Header */}
        <div className="bg-white shadow-sm pt-12 lg:pt-3">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6 text-green-600" />
              <div>
                <h1 className="text-xl max-sm:text-base font-bold text-gray-900">Appointment Management</h1>
                <p className="text-sm text-gray-600">Review and manage patient appointments</p>
              </div>
            </div>
          </div>
        </div>

        {/* Appointments Section */}
        <div className="max-w-7xl mx-auto p-4 sm:p-6">
          {/* Filter Buttons */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Filter by:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => setActiveFilter('all')}
                variant={activeFilter === 'all' ? 'default' : 'outline'}
                className={activeFilter === 'all'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'hover:bg-gray-100'
                }
              >
                All
                <Badge variant="secondary" className="ml-2 bg-white text-gray-700">
                  {allAppointments.length}
                </Badge>
              </Button>

              <Button
                onClick={() => setActiveFilter('pending')}
                variant={activeFilter === 'pending' ? 'default' : 'outline'}
                className={activeFilter === 'pending'
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : 'hover:bg-gray-100'
                }
              >
                Pending Approval
                <Badge variant="secondary" className="ml-2 bg-white text-gray-700">
                  {allAppointments.filter(a => !a.appointmentStatus || a.appointmentStatus === 'pending').length}
                </Badge>
              </Button>

              <Button
                onClick={() => setActiveFilter('accepted')}
                variant={activeFilter === 'accepted' ? 'default' : 'outline'}
                className={activeFilter === 'accepted'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'hover:bg-gray-100'
                }
              >
                Accepted
                <Badge variant="secondary" className="ml-2 bg-white text-gray-700">
                  {allAppointments.filter(a => a.appointmentStatus === 'accepted').length}
                </Badge>
              </Button>

              <Button
                onClick={() => setActiveFilter('rejected')}
                variant={activeFilter === 'rejected' ? 'default' : 'outline'}
                className={activeFilter === 'rejected'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'hover:bg-gray-100'
                }
              >
                Not Accepted
                <Badge variant="secondary" className="ml-2 bg-white text-gray-700">
                  {allAppointments.filter(a => a.appointmentStatus === 'rejected').length}
                </Badge>
              </Button>

              <Button
                onClick={() => setActiveFilter('cancelled')}
                variant={activeFilter === 'cancelled' ? 'default' : 'outline'}
                className={activeFilter === 'cancelled'
                  ? 'bg-orange-500 hover:bg-orange-600'
                  : 'hover:bg-gray-100'
                }
              >
                Cancelled
                <Badge variant="secondary" className="ml-2 bg-white text-gray-700">
                  {allAppointments.filter(a => a.appointmentStatus === 'cancelled').length}
                </Badge>
              </Button>

              <Button
                onClick={() => setActiveFilter('upcoming')}
                variant={activeFilter === 'upcoming' ? 'default' : 'outline'}
                className={activeFilter === 'upcoming'
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'hover:bg-gray-100'
                }
              >
                Upcoming
                <Badge variant="secondary" className="ml-2 bg-white text-gray-700">
                  {allAppointments.filter(a => a.appointmentStatus === 'accepted' && isFutureAppointment(a)).length}
                </Badge>
              </Button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total Appointments</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-gray-900">{allAppointments.length}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Accepted</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">
                  {allAppointments.filter(a => a.appointmentStatus === 'accepted').length}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Pending</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-amber-600">
                  {allAppointments.filter(a => !a.appointmentStatus || a.appointmentStatus === 'pending').length}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Appointments List */}
          {filteredAppointments.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg">
                  {activeFilter === 'all' && 'No appointments scheduled'}
                  {activeFilter === 'pending' && 'No pending appointments'}
                  {activeFilter === 'accepted' && 'No accepted appointments'}
                  {activeFilter === 'rejected' && 'No rejected appointments'}
                  {activeFilter === 'cancelled' && 'No cancelled appointments'}
                  {activeFilter === 'upcoming' && 'No upcoming appointments'}
                </p>
              </CardContent>
            </Card>
          ) : activeFilter === 'upcoming' && groupedUpcoming ? (
            <div className="space-y-6">
              {groupedUpcoming.today.length > 0 && (
                <Card>
                  <CardHeader className="bg-green-50">
                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-green-600" />
                      Today ({groupedUpcoming.today.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    {renderAppointmentTable(groupedUpcoming.today)}
                  </CardContent>
                </Card>
              )}

              {groupedUpcoming.tomorrow.length > 0 && (
                <Card>
                  <CardHeader className="bg-blue-50">
                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      Tomorrow ({groupedUpcoming.tomorrow.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    {renderAppointmentTable(groupedUpcoming.tomorrow)}
                  </CardContent>
                </Card>
              )}

              {groupedUpcoming.thisWeek.length > 0 && (
                <Card>
                  <CardHeader className="bg-purple-50">
                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-purple-600" />
                      This Week ({groupedUpcoming.thisWeek.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    {renderAppointmentTable(groupedUpcoming.thisWeek)}
                  </CardContent>
                </Card>
              )}

              {groupedUpcoming.later.length > 0 && (
                <Card>
                  <CardHeader className="bg-gray-50">
                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-gray-600" />
                      Later ({groupedUpcoming.later.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    {renderAppointmentTable(groupedUpcoming.later)}
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>
                  {activeFilter === 'all' && 'All Appointments'}
                  {activeFilter === 'pending' && 'Pending Appointments'}
                  {activeFilter === 'accepted' && 'Accepted Appointments'}
                  {activeFilter === 'rejected' && 'Not Accepted Appointments'}
                  {activeFilter === 'cancelled' && 'Cancelled Appointments'}
                </CardTitle>
                <CardDescription>
                  {filteredAppointments.length} appointment{filteredAppointments.length !== 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {renderAppointmentTable(filteredAppointments)}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Appointment Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <User className="w-6 h-6 text-green-600" />
              Appointment Details
            </DialogTitle>
            <DialogDescription>
              Queue #{String(selectedAppointment?.queueNo).padStart(3, '0')} • {selectedAppointment?.name}
            </DialogDescription>
          </DialogHeader>

          {selectedAppointment && (
            <div className="space-y-4 mt-4">
              <div className="flex items-center gap-2">
                {selectedAppointment.appointmentStatus === 'accepted' ? (
                  <Badge className="bg-green-600">Accepted</Badge>
                ) : selectedAppointment.appointmentStatus === 'rejected' ? (
                  <Badge variant="destructive" className="bg-red-600 text-white">Not Accepted</Badge>
                ) : (selectedAppointment.appointmentStatus === 'cancelled' || selectedAppointment.status === 'cancelled') ? (
                  <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300">
                    Cancelled
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-amber-100 text-amber-700">Pending</Badge>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Clock className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Appointment Time</p>
                    <p className="font-semibold text-gray-900 text-sm">
                      {formatDateTime(selectedAppointment.appointmentDateTime || selectedAppointment.appointment_datetime)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <User className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Age</p>
                    <p className="font-semibold text-gray-900">{selectedAppointment.age} years old</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Phone className="w-5 h-5 text-purple-600 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Phone Number</p>
                    <p className="font-semibold text-gray-900">{selectedAppointment.phoneNum || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-gray-600 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Queue Number</p>
                    <p className="font-semibold text-gray-900">#{String(selectedAppointment.queueNo).padStart(3, '0')}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  <p className="text-sm font-semibold text-blue-900">Symptoms</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedAppointment.symptoms && selectedAppointment.symptoms.length > 0 ? (
                    selectedAppointment.symptoms.map((symptom, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs bg-white text-blue-700 border-blue-200">
                        {symptom}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-gray-500 text-sm">None reported</span>
                  )}
                </div>
              </div>

              {selectedAppointment.assignedDoctor ? (
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Stethoscope className="w-5 h-5 text-purple-600" />
                    <p className="text-sm font-semibold text-purple-900">Requested Doctor</p>
                  </div>
                  <div>
                    <p className="font-semibold text-purple-900">{selectedAppointment.assignedDoctor.name}</p>
                    {selectedAppointment.assignedDoctor.specialization && (
                      <p className="text-sm text-purple-700">{selectedAppointment.assignedDoctor.specialization}</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Stethoscope className="w-5 h-5 text-green-600" />
                    <p className="text-sm font-semibold text-green-900">Requested Services</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedAppointment.services && selectedAppointment.services.length > 0 ? (
                      selectedAppointment.services.map((serviceId, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs bg-white text-green-700 border-green-200">
                          {getServiceLabel(serviceId)}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-gray-500 text-sm">None selected</span>
                    )}
                  </div>
                </div>
              )}

              {(selectedAppointment.appointmentStatus === 'rejected' || selectedAppointment.status === 'cancelled') && selectedAppointment.rejectionReason && (
                <div className={`p-4 border rounded-lg ${selectedAppointment.status === 'cancelled' ? 'bg-orange-50 border-orange-200' : 'bg-red-50 border-red-200'}`}>
                  <div className="flex items-start gap-3">
                    <MessageSquare className={`w-5 h-5 flex-shrink-0 mt-0.5 ${selectedAppointment.status === 'cancelled' ? 'text-orange-600' : 'text-red-600'}`} />
                    <div className="flex-1">
                      <p className={`text-sm font-semibold mb-1 ${selectedAppointment.status === 'cancelled' ? 'text-orange-900' : 'text-red-900'}`}>
                        {selectedAppointment.status === 'cancelled' ? 'Reason for Cancellation' : 'Reason for Appointment Refusal'}
                      </p>
                      <p className={`text-sm ${selectedAppointment.status === 'cancelled' ? 'text-orange-800' : 'text-red-800'}`}>{selectedAppointment.rejectionReason}</p>
                      {selectedAppointment.status === 'cancelled' ? (
                        selectedAppointment.cancelledAt && (
                          <p className="text-xs text-orange-600 mt-1">
                            Cancelled on {formatDateTime(selectedAppointment.cancelledAt)}
                          </p>
                        )
                      ) : (
                        selectedAppointment.rejectedAt && (
                          <p className="text-xs text-red-600 mt-1">
                            Not Accepted on {formatDateTime(selectedAppointment.rejectedAt)}
                          </p>
                        )
                      )}
                    </div>
                  </div>
                </div>
              )}

              {(!selectedAppointment.appointmentStatus || selectedAppointment.appointmentStatus === 'pending') && (
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                  <Button
                    onClick={() => {
                      handleAccept(selectedAppointment);
                      setIsDetailsDialogOpen(false);
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Accept Appointment
                  </Button>
                  <Button
                    onClick={() => {
                      setIsDetailsDialogOpen(false);
                      handleRejectClick(selectedAppointment);
                    }}
                    variant="outline"
                    className="flex-1 text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Decline Appointment
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Rejection Reason Dialog */}
      <Dialog open={rejectionDialog.open} onOpenChange={(open) => setRejectionDialog({ ...rejectionDialog, open })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">Decline Appointment</DialogTitle>
            <DialogDescription>
              Please provide a reason for not accepting {rejectionDialog.appointment?.name}'s appointment.
              This will be shared with the patient.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Reason for Appointment Refusal *
              </label>
              <Textarea
                placeholder="e.g., No available time slots, Requires specialist referral, etc."
                value={rejectionDialog.reason}
                onChange={(e) => setRejectionDialog({ ...rejectionDialog, reason: e.target.value })}
                className="min-h-[100px] resize-none"
                maxLength={500}
              />
              <p className="text-xs text-gray-500 text-right">
                {rejectionDialog.reason.length}/500 characters
              </p>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setRejectionDialog({ open: false, appointment: null, reason: "" })}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRejectConfirm}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white"
              disabled={!rejectionDialog.reason.trim()}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Send Notice to Patient
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Appointment;