import React, { useContext } from 'react';
import { PatientContext } from '@/PatientContext';
import NotificationModal from './NotificationModal';

/**
 * Global component to render the NotificationModal on any page 
 * that is wrapped by PatientProvider.
 */
const GlobalModal = () => {
  const { modalNotification, clearModalNotification } = useContext(PatientContext);
  const userRole = localStorage.getItem('userRole');

  // Skip global modal for staff/secretary/admin.
  // They will see it explicitly rendered on the Appointment page instead.
  if (userRole === 'secretary' || userRole === 'staff' || userRole === 'admin') return null;

  if (!modalNotification) return null;

  return (
    <NotificationModal 
      isOpen={!!modalNotification}
      onClose={clearModalNotification}
      title={modalNotification.title}
      description={modalNotification.description}
      type={modalNotification.type}
      data={modalNotification.data}
      actionLabel="Understood"
    />
  );
};

export default GlobalModal;
