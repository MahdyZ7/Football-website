'use client';

import { useState } from 'react';
import { useAdminFeedback } from '../../hooks/useQueries';
import { useAdminFeedbackHandlers } from '../../hooks/useAdminFeedbackHandlers';
import { useFeedbackColors } from '../../hooks/useFeedbackColors';
import { FeedbackCardSkeleton } from '../Skeleton';
import { Button, IconButton } from '../ui/Button';
import { Select } from '../ui/Input';
import { Check, X, Trash2, Eye } from 'lucide-react';

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

const AdminFeedback: React.FC = () => {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const { handleApprove, handleStatusUpdate, handleDelete, approvePending, updatePending, deletePending } = useAdminFeedbackHandlers();
  const { getTypeColor, getStatusColor, formatStatus } = useFeedbackColors();

  const filters = {
    status: selectedStatus === 'all' ? undefined : selectedStatus,
    type: selectedType === 'all' ? undefined : selectedType,
  };

  const { data: feedbackData, isLoading: feedbackLoading } = useAdminFeedback(filters);
  const submissions: AdminFeedbackSubmission[] = feedbackData?.submissions || [];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
          Feedback Management
        </h2>
        <p style={{ color: 'var(--text-secondary)' }}>
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
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>{stat.label}</p>
            <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-6 rounded-lg shadow-md p-4" style={{ backgroundColor: 'var(--bg-card)' }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Filter by Status"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            fullWidth
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </Select>

          <Select
            label="Filter by Type"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            fullWidth
          >
            <option value="all">All Types</option>
            <option value="feature">Feature Requests</option>
            <option value="bug">Bug Reports</option>
            <option value="feedback">General Feedback</option>
          </Select>
        </div>
      </div>

      {/* Submissions List */}
      {feedbackLoading ? (
        <FeedbackCardSkeleton count={5} />
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
                        {formatStatus(submission.status)}
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

                  <IconButton
                    onClick={() => setExpandedId(expandedId === submission.id ? null : submission.id)}
                    variant="ghost"
                    size="md"
                    icon={<Eye size={20} />}
                    label={expandedId === submission.id ? "Collapse details" : "Expand details"}
                    aria-label={`${expandedId === submission.id ? 'Collapse' : 'Expand'} details for "${submission.title}"`}
                    aria-expanded={expandedId === submission.id}
                  />
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
                      <Button
                        onClick={() => handleApprove(submission.id, 'approve')}
                        disabled={approvePending}
                        variant="success"
                        size="sm"
                        icon={<Check size={16} />}
                      >
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleApprove(submission.id, 'reject')}
                        disabled={approvePending}
                        variant="danger"
                        size="sm"
                        icon={<X size={16} />}
                      >
                        Reject
                      </Button>
                    </>
                  )}

                  {submission.is_approved && (
                    <Select
                      value={submission.status}
                      onChange={(e) => handleStatusUpdate(submission.id, e.target.value)}
                      disabled={updatePending}
                      className="text-sm"
                    >
                      <option value="approved">Approved</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </Select>
                  )}

                  <Button
                    onClick={() => handleDelete(submission.id)}
                    disabled={deletePending}
                    variant="danger"
                    size="sm"
                    icon={<Trash2 size={16} />}
                    className="ml-auto"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminFeedback;
