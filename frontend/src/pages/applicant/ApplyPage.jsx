import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { submitApplication } from '../../services/api';
import Card from '../../components/shared/Card';
import ApplicationForm from '../../components/applicant/ApplicationForm';
import Toast from '../../components/shared/Toast';

export default function ApplyPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('error');

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    setToastMessage('');

    try {
      const payload = {
        ...formData,
        applicantEmail: user?.email || 'applicant@nfst.gov.in'
      };

      const result = await submitApplication(payload);
      setToastType('success');
      setToastMessage('Application submitted successfully! Redirecting to tracking status...');

      // Redirect straight to status page for that submission
      setTimeout(() => {
        navigate('/applicant/status', { state: { application: result } });
      }, 700);
    } catch (err) {
      setToastType('error');
      setToastMessage(err.message || 'Failed to submit application. Please retry.');
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <Toast
        message={toastMessage}
        type={toastType}
        onClose={() => setToastMessage('')}
      />

      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-primary)' }}>
          NFST Fellowship Application Form
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
          Ministry of Tribal Affairs • National Fellowship for Higher Education of ST Students
        </p>
      </div>

      <Card>
        <ApplicationForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </Card>
    </div>
  );
}
