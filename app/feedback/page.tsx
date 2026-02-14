'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useFeedback, useUserVotes, useSubmitFeedback, useVoteFeedback, useRemoveVote } from '../../hooks/useQueries';
import { useFeedbackColors } from '../../hooks/useFeedbackColors';
import { toast } from 'sonner';
import { FeedbackCardSkeleton } from '../../components/Skeleton';
import Navbar from '../../components/pages/Navbar';
import Footer from '../../components/pages/footer';
import { ThumbsUp, ThumbsDown, Plus, X } from 'lucide-react';
import { Button, IconButton } from '../../components/ui/Button';
import { Input, Textarea, Select } from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';

interface FeedbackSubmission {
  id: number;
  type: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  upvotes: number;
  downvotes: number;
  vote_score: number;
}

export default function FeedbackPage() {
  const { data: session, status: sessionStatus } = useSession();
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [formData, setFormData] = useState({
    type: 'feature',
    title: '',
    description: '',
  });

  const { data: feedbackData, isLoading: feedbackLoading } = useFeedback(selectedType === 'all' ? undefined : selectedType);
  const { data: votesData } = useUserVotes();
  const submitMutation = useSubmitFeedback();
  const voteMutation = useVoteFeedback();
  const removeVoteMutation = useRemoveVote();

  const submissions: FeedbackSubmission[] = feedbackData?.submissions || [];
  const userVotes: Record<number, string> = votesData?.votes || {};

  // Use shared color utilities hook (eliminates code duplication)
  const { getTypeColor, getStatusColor, formatStatus } = useFeedbackColors();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session) {
      toast.error('You must be logged in to submit feedback');
      return;
    }

    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await submitMutation.mutateAsync(formData);
      toast.success('Feedback submitted! It will be visible once approved by an admin.');
      setFormData({ type: 'feature', title: '', description: '' });
      setShowSubmitForm(false);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      toast.error(err?.response?.data?.error || 'Failed to submit feedback');
    }
  };

  const handleVote = async (feedbackId: number, voteType: 'upvote' | 'downvote') => {
    if (!session) {
      toast.error('You must be logged in to vote');
      return;
    }

    try {
      const currentVote = userVotes[feedbackId];

      if (currentVote === voteType) {
        // Remove vote if clicking the same button
        await removeVoteMutation.mutateAsync(feedbackId);
        toast.success('Vote removed');
      } else {
        // Add or change vote
        await voteMutation.mutateAsync({ feedbackId, voteType });
        toast.success(`${voteType === 'upvote' ? 'Upvoted' : 'Downvoted'}!`);
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      toast.error(err?.response?.data?.error || 'Failed to vote');
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Navbar />
      <main className="flex-1 pt-24 pb-8 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              Feedback & Suggestions
            </h1>
            <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
              Share your ideas, report bugs, and help us improve the platform
            </p>
          </div>

          {/* Submit Button */}
          {session && !showSubmitForm && (
            <Button
              onClick={() => setShowSubmitForm(true)}
              variant="primary"
              size="lg"
              icon={<Plus size={20} />}
              className="mb-6"
            >
              Submit Feedback
            </Button>
          )}

          {!session && sessionStatus !== 'loading' && (
            <div className="mb-6 rounded-lg shadow-md p-6" style={{ backgroundColor: 'var(--bg-card)' }}>
              <p style={{ color: 'var(--text-primary)' }}>
                Please sign in to submit feedback and vote on suggestions.
              </p>
            </div>
          )}

          {/* Submit Form */}
          {showSubmitForm && (
            <div className="mb-6 rounded-lg shadow-md p-6" style={{ backgroundColor: 'var(--bg-card)' }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  Submit New Feedback
                </h2>
                <IconButton
                  onClick={() => setShowSubmitForm(false)}
                  variant="ghost"
                  icon={<X size={24} />}
                  label="Close feedback form"
                  aria-label="Close feedback submission form"
                />
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Select
                  label="Type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  options={[
                    { value: 'feature', label: 'Feature Request' },
                    { value: 'bug', label: 'Bug Report' },
                    { value: 'feedback', label: 'General Feedback' }
                  ]}
                  fullWidth
                />

                <Input
                  label="Title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  maxLength={200}
                  placeholder="Brief summary of your feedback"
                  helperText={`${formData.title.length}/200 characters`}
                  fullWidth
                />

                <Textarea
                  label="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={6}
                  placeholder="Detailed description of your feedback..."
                  fullWidth
                />

                <div className="flex gap-3">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    loading={submitMutation.isPending}
                  >
                    Submit Feedback
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setShowSubmitForm(false)}
                    variant="secondary"
                    size="lg"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Filter Tabs */}
          <div className="mb-6 flex gap-2 flex-wrap">
            {['all', 'feature', 'bug', 'feedback'].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 py-2 rounded font-medium transition-all duration-200 ${
                  selectedType === type
                    ? 'bg-ft-primary text-white'
                    : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
                style={selectedType !== type ? { color: 'var(--text-primary)' } : undefined}
              >
                {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1) + 's'}
              </button>
            ))}
          </div>

          {/* Submissions List */}
          {feedbackLoading ? (
            <FeedbackCardSkeleton count={4} />
          ) : submissions.length === 0 ? (
            <div className="rounded-lg shadow-md p-8 text-center" style={{ backgroundColor: 'var(--bg-card)' }}>
              <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
                No {selectedType === 'all' ? '' : selectedType} feedback yet. Be the first to contribute!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {submissions.map((submission) => (
                <div
                  key={submission.id}
                  className="rounded-lg shadow-md p-6"
                  style={{ backgroundColor: 'var(--bg-card)' }}
                >
                  <div className="flex gap-4">
                    {/* Vote Section */}
                    <div className="flex flex-col items-center gap-2">
                      <button
                        onClick={() => handleVote(submission.id, 'upvote')}
                        disabled={voteMutation.isPending || removeVoteMutation.isPending}
                        className={`p-2 rounded transition-all duration-200 ${
                          userVotes[submission.id] === 'upvote'
                            ? 'bg-ft-primary text-white'
                            : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                        style={userVotes[submission.id] !== 'upvote' ? { color: 'var(--text-primary)' } : undefined}
                        aria-label={`${userVotes[submission.id] === 'upvote' ? 'Remove upvote from' : 'Upvote'} "${submission.title}"`}
                        aria-pressed={userVotes[submission.id] === 'upvote'}
                        title={userVotes[submission.id] === 'upvote' ? 'Remove upvote' : 'Upvote this feedback'}
                      >
                        <ThumbsUp size={20} />
                      </button>
                      <span
                        className="text-lg font-bold"
                        style={{ color: 'var(--text-primary)' }}
                        aria-label={`Vote score: ${submission.vote_score}`}
                      >
                        {submission.vote_score}
                      </span>
                      <button
                        onClick={() => handleVote(submission.id, 'downvote')}
                        disabled={voteMutation.isPending || removeVoteMutation.isPending}
                        className={`p-2 rounded transition-all duration-200 ${
                          userVotes[submission.id] === 'downvote'
                            ? 'bg-red-600 text-white'
                            : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                        style={userVotes[submission.id] !== 'downvote' ? { color: 'var(--text-primary)' } : undefined}
                        aria-label={`${userVotes[submission.id] === 'downvote' ? 'Remove downvote from' : 'Downvote'} "${submission.title}"`}
                        aria-pressed={userVotes[submission.id] === 'downvote'}
                        title={userVotes[submission.id] === 'downvote' ? 'Remove downvote' : 'Downvote this feedback'}
                      >
                        <ThumbsDown size={20} />
                      </button>
                    </div>

                    {/* Content Section */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className={`px-3 py-1 rounded text-white text-sm font-medium ${getTypeColor(submission.type)}`}>
                          {submission.type}
                        </span>
                        {submission.status !== 'approved' && (
                          <span className={`px-3 py-1 rounded text-white text-sm font-medium ${getStatusColor(submission.status)}`}>
                            {formatStatus(submission.status)}
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                        {submission.title}
                      </h3>
                      <p className="mb-3 whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>
                        {submission.description}
                      </p>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        Submitted {new Date(submission.created_at).toLocaleDateString()}
                      </p>
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
