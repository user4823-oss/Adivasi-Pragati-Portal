import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchApplicationById, updateApplicationStatus } from '../../services/api';
import ReviewPanel from '../../components/admin/ReviewPanel';
import Card from '../../components/shared/Card';
import Button from '../../components/shared/Button';

export default function ApplicationReviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');

  const loadApplication = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await fetchApplicationById(id);
      setApplication(data);
    } catch (err) {
      setError(err.message || `Unable to load application ${id}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplication();
  }, [id]);

  const handleStatusUpdate = async (appId, newStatus, remarks, flagReason = null, flaggedDocument = null) => {
    try {
      setUpdating(true);
      const updated = await updateApplicationStatus(appId, newStatus, remarks, flagReason, flaggedDocument);
      setApplication(updated);
      return true;
    } catch (err) {
      alert(`Status update failed: ${err.message}`);
      return false;
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <div style={{ fontSize: '1.2rem', color: 'var(--color-primary)', fontWeight: 600 }}>
          Loading application dossier {id}...
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div style={{ maxWidth: '700px', margin: '2rem auto' }}>
        <Card>
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <h2 style={{ color: 'var(--color-error)', marginBottom: '0.5rem' }}>Dossier Not Found</h2>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.25rem' }}>
              {error || `No application found with reference identifier ${id}.`}
            </p>
            <Button variant="primary" onClick={() => navigate('/admin/dashboard')}>
              Return to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <ReviewPanel
        application={application}
        onStatusUpdate={handleStatusUpdate}
        isUpdating={updating}
        onBack={() => navigate('/admin/dashboard')}
      />
    </div>
  );
}
