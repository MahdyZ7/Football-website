'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  useAdminFeedback,
  useApproveFeedback,
  useUpdateFeedbackStatus,
  useDeleteFeedback,
} from '../../../hooks/useQueries';
import { toast } from 'sonner';
import LoadingSpinner from '../../../components/LoadingSpinner';
import Navbar from '../../../components/pages/Navbar';
import Footer from '../../../components/pages/footer';
import { FiCheck, FiX, FiTrash2, FiEye } from 'react-icons/fi';

interface AdminFeedbackSubmission {
  id: number;
  type: string;
  title: string;
  description: string;
  status: string;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
  submitter_name: string;
  submitter_email: string;
  submitter_id: number;
  approved_by_name: string | null;
  approved_at: string | null;
  upvotes: number;
  downvotes: number;
  vote_score: number;
}

export default function AdminFeedbackPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const filters = {
    status: selectedStatus === 'all' ? undefined : selectedStatus,
    type: selectedType === 'all' ? undefined : selectedType,
  };

  const { data: feedbackData, isLoading: feedbackLoading } = useAdminFeedback(filters);
  const approveMutation = useApproveFeedback();
  const updateStatusMutation = useUpdateFeedbackStatus();
  const deleteMutation = useDeleteFeedback();

  const submissions: AdminFeedbackSubmission[] = feedbackData?.submissions || [];

  // Redirect if not admin
  if (sessionStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <LoadingSpinner message="Loading..." />
      </div>
    );
  }

  if (!session?.user?.isAdmin) {
    router.push('/');
    return null;
  }

  const handleApprove = async (feedbackId: number, action: 'approve' | 'reject') => {
    try {
      await approveMutation.mutateAsync({ feedbackId, action });
      toast.success(`Feedback ${action}d successfully`);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      toast.error(err?.response?.data?.error || `Failed to ${action} feedback`);
    }
  };

  const handleStatusUpdate = async (feedbackId: number, status: string) => {
    try {
      await updateStatusMutation.mutateAsync({ feedbackId, status });
      toast.success('Status updated successfully');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      toast.error(err?.response?.data?.error || 'Failed to update status');
    }
  };

  const handleDelete = async (feedbackId: number) => {
    if (!confirm('Are you sure you want to delete this feedback? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(feedbackId);
      toast.success('Feedback deleted successfully');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      toast.error(err?.response?.data?.error || 'Failed to delete feedback');
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'feature': return 'bg-blue-600';
      case 'bug': return 'bg-red-600';
      case 'feedback': return 'bg-green-600';
      default: return 'bg-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-600';
      case 'approved': return 'bg-green-600';
      case 'rejected': return 'bg-red-600';
      case 'in_progress': return 'bg-orange-500';
      case 'completed': return 'bg-blue-600';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Navbar />
      <main className="flex-1 pt-24 pb-8 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              Feedback Management
            </h1>
            <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
              Review, approve, and manage user feedback submissions
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total', value: submissions.length, color: 'bg-ft-primary' },
              { label: 'Pending', value: submissions.filter(s => s.status === 'pending').length, color: 'bg-yellow-600' },
              { label: 'Approved', value: submissions.filter(s => s.status === 'approved').length, color: 'bg-green-600' },
              { label: 'In Progress', value: submissions.filter(s => s.status === 'in_progress').length, color: 'bg-orange-500' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-lg shadow-md p-4" style={{ backgroundColor: 'var(--bg-card)' }}>
                <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                  {stat.label}
                </p>
                <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="mb-6 rounded-lg shadow-md p-4" style={{ backgroundColor: 'var(--bg-card)' }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 font-medium" style={{ color: 'var(--text-primary)' }}>
                  Filter by Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-4 py-2 rounded border transition-all duration-200
                             focus:ring-2 focus:ring-ft-primary focus:outline-none"
                  style={{
                    backgroundColor: 'var(--input-bg)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-primary)'
                  }}
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block mb-2 font-medium" style={{ color: 'var(--text-primary)' }}>
                  Filter by Type
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-4 py-2 rounded border transition-all duration-200
                             focus:ring-2 focus:ring-ft-primary focus:outline-none"
                  style={{
                    backgroundColor: 'var(--input-bg)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-primary)'
                  }}
                >
                  <option value="all">All Types</option>
                  <option value="feature">Feature Requests</option>
                  <option value="bug">Bug Reports</option>
                  <option value="feedback">General Feedback</option>
                </select>
              </div>
            </div>
          </div>

          {/* Submissions List */}
          {feedbackLoading ? (
            <div className="rounded-lg shadow-md p-8" style={{ backgroundColor: 'var(--bg-card)' }}>
              <LoadingSpinner message="Loading feedback submissions..." />
            </div>
          ) : submissions.length === 0 ? (
            <div className="rounded-lg shadow-md p-8 text-center" style={{ backgroundColor: 'var(--bg-card)' }}>
              <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
                No feedback submissions found.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {submissions.map((submission) => (
                <div
                  key={submission.id}
                  className="rounded-lg shadow-md overflow-hidden"
                  style={{ backgroundColor: 'var(--bg-card)' }}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className={`px-3 py-1 rounded text-white text-sm font-medium ${getTypeColor(submission.type)}`}>
                            {submission.type}
                          </span>
                          <span className={`px-3 py-1 rounded text-white text-sm font-medium ${getStatusColor(submission.status)}`}>
                            {submission.status.replace('_', ' ')}
                          </span>
                          <span className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-sm font-medium"
                                style={{ color: 'var(--text-primary)' }}>
                            Score: {submission.vote_score} ({submission.upvotes}↑ {submission.downvotes}↓)
                          </span>
                        </div>
                        <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                          {submission.title}
                        </h3>
                      </div>

                      <button
                        onClick={() => setExpandedId(expandedId === submission.id ? null : submission.id)}
                        className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      >
                        <FiEye size={20} style={{ color: 'var(--text-primary)' }} />
                      </button>
                    </div>

                    {/* Expanded Details */}
                    {expandedId === submission.id && (
                      <div className="mb-4 p-4 rounded" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                        <p className="mb-3 whitespace-pre-wrap" style={{ color: 'var(--text-primary)' }}>
                          {submission.description}
                        </p>
                        <div className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                          <p><strong>Submitted by:</strong> {submission.submitter_name} ({submission.submitter_email})</p>
                          <p><strong>Submitted on:</strong> {new Date(submission.created_at).toLocaleString()}</p>
                          {submission.approved_by_name && (
                            <p><strong>Approved by:</strong> {submission.approved_by_name} on {new Date(submission.approved_at!).toLocaleString()}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3">
                      {submission.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(submission.id, 'approve')}
                            disabled={approveMutation.isPending}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded
                                       transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
                          >
                            <FiCheck size={16} />
                            Approve
                          </button>
                          <button
                            onClick={() => handleApprove(submission.id, 'reject')}
                            disabled={approveMutation.isPending}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded
                                       transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
                          >
                            <FiX size={16} />
                            Reject
                          </button>
                        </>
                      )}

                      {submission.is_approved && (
                        <select
                          value={submission.status}
                          onChange={(e) => handleStatusUpdate(submission.id, e.target.value)}
                          disabled={updateStatusMutation.isPending}
                          className="px-4 py-2 rounded border transition-all duration-200
                                     focus:ring-2 focus:ring-ft-primary focus:outline-none text-sm"
                          style={{
                            backgroundColor: 'var(--input-bg)',
                            borderColor: 'var(--border-color)',
                            color: 'var(--text-primary)'
                          }}
                        >
                          <option value="approved">Approved</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      )}

                      <button
                        onClick={() => handleDelete(submission.id)}
                        disabled={deleteMutation.isPending}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded
                                   transition-all duration-200 flex items-center gap-2 disabled:opacity-50 ml-auto"
                      >
                        <FiTrash2 size={16} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
