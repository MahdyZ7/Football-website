import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, BannedUser, PlayerHistoryResponse } from '../types/user';
import { SiteConfig } from '../lib/config/defaults';

// Custom error class that preserves HTTP status and parsed response data
export class ApiError extends Error {
  status: number;
  data: Record<string, unknown>;
  constructor(message: string, status: number, data?: Record<string, unknown>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data ?? {};
  }
}

// lightweight fetch wrapper to replace axios
const request = async (url: string, options?: RequestInit) => {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(options?.headers as Record<string,string> | undefined) },
    ...options,
  });
  if (!res.ok) {
    let data: Record<string, unknown>;
    try {
      data = await res.json();
    } catch {
      const text = await res.text();
      data = { error: text || res.statusText };
    }
    throw new ApiError(String(data?.error || res.statusText), res.status, data);
  }
  return res.json();
};

// API functions
const api = {
  users: {
    getAll: async (): Promise<User[]> => {
	  return await request('/api/users');
    },
    register: async (userData: { name: string; intra: string }): Promise<{
      name: string;
      id: string;
      registrationStatus: 'confirmed' | 'waitlisted';
      waitlistPosition: number | null;
      message: string;
    }> => {
      return await request('/api/register', { method: 'POST', body: JSON.stringify(userData) });
    },
    delete: async (intra: string) => {
      return await request('/api/register', { method: 'DELETE', body: JSON.stringify({ intra }) });
    },
  },
  allowed: {
    check: async (): Promise<{ isAllowed: boolean }> => {
      return await request('/api/allowed');
    },
  },
  verify: {
    check: async (): Promise<{ isAllowed: boolean }> => {
      return await request('/api/verify');
    },
  },
  bannedUsers: {
    getAll: async (): Promise<BannedUser[]> => {
      return await request('/api/banned-users');
    },
  },
  money: {
    getAll: async () => {
      return await request('/api/moneyDb');
    },
  },
  me: {
    history: async (): Promise<PlayerHistoryResponse> => {
      return await request('/api/me/history');
    },
  },
  admin: {
    auth: async (): Promise<{ authenticated: boolean; user?: string }> => {
      return await request('/api/admin/auth');
    },
    logs: async () => {
      return await request('/api/admin-logs');
    },
    banned: async (): Promise<BannedUser[]> => {
      return await request('/api/admin/banned');
    },
    banUser: async (banData: { userId: string; reason: string; duration: string }) => {
      return await request('/api/admin/ban', { method: 'POST', body: JSON.stringify(banData) });
    },
    unbanUser: async (intra: string) => {
      return await request('/api/admin/ban', { method: 'DELETE', body: JSON.stringify({ intra }) });
    },
    deleteUser: async (userId: string) => {
      return await request('/api/admin/users', { method: 'DELETE', body: JSON.stringify({ id: userId }) });
    },
    verifyUser: async (verifyData: { id: string; verified: boolean }) => {
      return await request('/api/admin/users/verify', { method: 'PATCH', body: JSON.stringify(verifyData) });
    },
  },
  editName: {
    update: async (editData: { intra: string; newName: string }) => {
      return await request('/api/edit-name', { method: 'PATCH', body: JSON.stringify(editData) });
    },
  },
  feedback: {
    getAll: async (type?: string) => {
      const url = type ? `/api/feedback?type=${type}` : '/api/feedback';
      return await request(url);
    },
    submit: async (feedbackData: { type: string; title: string; description: string }) => {
      return await request('/api/feedback', { method: 'POST', body: JSON.stringify(feedbackData) });
    },
    vote: async (voteData: { feedbackId: number; voteType: string }) => {
      return await request('/api/feedback/vote', { method: 'POST', body: JSON.stringify(voteData) });
    },
    removeVote: async (feedbackId: number) => {
      return await request(`/api/feedback/vote?feedbackId=${feedbackId}`, { method: 'DELETE' });
    },
    getUserVotes: async () => {
      return await request('/api/feedback/vote');
    },
    admin: {
      getAll: async (filters?: { status?: string; type?: string }) => {
        const params = new URLSearchParams();
        if (filters?.status) params.append('status', filters.status);
        if (filters?.type) params.append('type', filters.type);
        const url = params.toString() ? `/api/admin/feedback?${params}` : '/api/admin/feedback';
        return await request(url);
      },
      approve: async (approveData: { feedbackId: number; action: string }) => {
        return await request('/api/admin/feedback/approve', { method: 'POST', body: JSON.stringify(approveData) });
      },
      updateStatus: async (statusData: { feedbackId: number; status: string }) => {
        return await request('/api/admin/feedback/status', { method: 'PATCH', body: JSON.stringify(statusData) });
      },
      delete: async (feedbackId: number) => {
        return await request(`/api/admin/feedback?id=${feedbackId}`, { method: 'DELETE' });
      },
    },
  },
  config: {
    get: async (): Promise<{ config: SiteConfig; version: number; updatedAt: string | null }> => {
      return await request('/api/config');
    },
    adminGet: async (): Promise<{ config: SiteConfig; version: number; updatedAt: string | null; updatedByName: string | null }> => {
      return await request('/api/admin/config');
    },
    adminUpdate: async (data: { changes: Partial<SiteConfig>; expectedVersion: number }): Promise<{ config: SiteConfig; version: number }> => {
      return await request('/api/admin/config', { method: 'PATCH', body: JSON.stringify(data) });
    },
    snapshots: {
      list: async (): Promise<{ snapshots: Array<{ id: number; name: string; description: string | null; config_version: number; is_auto: boolean; created_at: string; created_by_name: string }> }> => {
        return await request('/api/admin/config/snapshots');
      },
      create: async (data: { name: string; description?: string }) => {
        return await request('/api/admin/config/snapshots', { method: 'POST', body: JSON.stringify(data) });
      },
      restore: async (snapshotId: number) => {
        return await request('/api/admin/config/snapshots', {
          method: 'POST',
          body: JSON.stringify({ action: 'restore', snapshotId }),
        });
      },
    },
  },
  tournamentVotes: {
    getAll: async () => {
      return await request('/api/tournament-votes');
    },
    submitVotes: async (voteData: {
      awardType: string;
      votes: Array<{ playerName: string; playerTeam: string; rank: number }>;
    }) => {
      return await request('/api/tournament-votes', { method: 'POST', body: JSON.stringify(voteData) });
    },
    removeVotes: async (awardType: string) => {
      return await request(`/api/tournament-votes?awardType=${awardType}`, { method: 'DELETE' });
    },
    admin: {
      getAll: async (filters?: { awardType?: string; playerName?: string }) => {
        const params = new URLSearchParams();
        if (filters?.awardType) params.append('awardType', filters.awardType);
        if (filters?.playerName) params.append('playerName', filters.playerName);
        const url = params.toString() ? `/api/admin/tournament-votes?${params}` : '/api/admin/tournament-votes';
        return await request(url);
      },
      deleteUserVotes: async (voterId: string, awardType: string) => {
        return await request(`/api/admin/tournament-votes?voterId=${voterId}&awardType=${awardType}`, { method: 'DELETE' });
      },
    },
  },
};

// Query keys
export const queryKeys = {
  users: ['users'] as const,
  allowed: ['allowed'] as const,
  verify: ['verify'] as const,
  bannedUsers: ['bannedUsers'] as const,
  money: ['money'] as const,
  playerHistory: ['playerHistory'] as const,
  adminAuth: ['adminAuth'] as const,
  adminLogs: ['adminLogs'] as const,
  adminBanned: ['adminBanned'] as const,
  feedback: ['feedback'] as const,
  userVotes: ['userVotes'] as const,
  adminFeedback: ['adminFeedback'] as const,
  tournamentVotes: ['tournamentVotes'] as const,
  adminTournamentVotes: ['adminTournamentVotes'] as const,
  siteConfig: ['siteConfig'] as const,
  adminConfig: ['adminConfig'] as const,
  configSnapshots: ['configSnapshots'] as const,
};

// Custom hooks
export const useUsers = () => {
  return useQuery({
    queryKey: queryKeys.users,
    queryFn: api.users.getAll,
    staleTime: 1000 * 30, // 30 seconds
  });
};

export const useAllowedStatus = () => {
  return useQuery({
    queryKey: queryKeys.allowed,
    queryFn: api.allowed.check,
    staleTime: 1000 * 60, // 1 minute
    refetchInterval: 1000 * 30, // Refetch every 30 seconds
  });
};

export const useVerifyStatus = () => {
  return useQuery({
    queryKey: queryKeys.verify,
    queryFn: api.verify.check,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useBannedUsers = () => {
  return useQuery({
    queryKey: queryKeys.bannedUsers,
    queryFn: api.bannedUsers.getAll,
    staleTime: 1000 * 60, // 1 minute
  });
};

export const useAdminAuth = () => {
  return useQuery({
    queryKey: queryKeys.adminAuth,
    queryFn: api.admin.auth,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false, // Don't retry auth failures
  });
};

export const usePlayerHistory = (enabled = true) => {
  return useQuery({
    queryKey: queryKeys.playerHistory,
    queryFn: api.me.history,
    staleTime: 1000 * 30,
    retry: 1,
    retryDelay: 2000,
    enabled,
  });
};

export const useAdminLogs = () => {
  return useQuery({
    queryKey: queryKeys.adminLogs,
    queryFn: api.admin.logs,
    staleTime: 1000 * 30, // 30 seconds
  });
};

export const useAdminBanned = () => {
  return useQuery({
    queryKey: queryKeys.adminBanned,
    queryFn: api.admin.banned,
    staleTime: 1000 * 60, // 1 minute
  });
};

export const useMoney = () => {
  return useQuery({
    queryKey: queryKeys.money,
    queryFn: api.money.getAll,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Mutation hooks
export const useRegisterUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.users.register,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
      queryClient.invalidateQueries({ queryKey: queryKeys.playerHistory });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.users.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
      queryClient.invalidateQueries({ queryKey: queryKeys.playerHistory });
    },
  });
};

export const useBanUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.admin.banUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
      queryClient.invalidateQueries({ queryKey: queryKeys.bannedUsers });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminBanned });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminLogs });
      queryClient.invalidateQueries({ queryKey: queryKeys.playerHistory });
    },
  });
};

export const useUnbanUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.admin.unbanUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
      queryClient.invalidateQueries({ queryKey: queryKeys.bannedUsers });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminBanned });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminLogs });
      queryClient.invalidateQueries({ queryKey: queryKeys.playerHistory });
    },
  });
};

export const useAdminDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.admin.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminLogs });
      queryClient.invalidateQueries({ queryKey: queryKeys.playerHistory });
    },
  });
};

export const useVerifyUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.admin.verifyUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminLogs });
      queryClient.invalidateQueries({ queryKey: queryKeys.playerHistory });
    },
  });
};

export const useEditName = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.editName.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminLogs });
    },
  });
};

// Feedback hooks
export const useFeedback = (type?: string) => {
  return useQuery({
    queryKey: type ? [...queryKeys.feedback, type] : queryKeys.feedback,
    queryFn: () => api.feedback.getAll(type),
    staleTime: 1000 * 30, // 30 seconds
  });
};

export const useUserVotes = () => {
  return useQuery({
    queryKey: queryKeys.userVotes,
    queryFn: api.feedback.getUserVotes,
    staleTime: 1000 * 60, // 1 minute
  });
};

export const useAdminFeedback = (filters?: { status?: string; type?: string }) => {
  return useQuery({
    queryKey: filters ? [...queryKeys.adminFeedback, filters] : queryKeys.adminFeedback,
    queryFn: () => api.feedback.admin.getAll(filters),
    staleTime: 1000 * 30, // 30 seconds
  });
};

export const useSubmitFeedback = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.feedback.submit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.feedback });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminFeedback });
    },
  });
};

export const useVoteFeedback = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.feedback.vote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.feedback });
      queryClient.invalidateQueries({ queryKey: queryKeys.userVotes });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminFeedback });
    },
  });
};

export const useRemoveVote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.feedback.removeVote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.feedback });
      queryClient.invalidateQueries({ queryKey: queryKeys.userVotes });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminFeedback });
    },
  });
};

export const useApproveFeedback = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.feedback.admin.approve,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.feedback });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminFeedback });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminLogs });
    },
  });
};

export const useUpdateFeedbackStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.feedback.admin.updateStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.feedback });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminFeedback });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminLogs });
    },
  });
};

export const useDeleteFeedback = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.feedback.admin.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.feedback });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminFeedback });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminLogs });
    },
  });
};

// Tournament voting hooks
export const useTournamentVotes = () => {
  return useQuery({
    queryKey: queryKeys.tournamentVotes,
    queryFn: api.tournamentVotes.getAll,
    staleTime: 1000 * 30, // 30 seconds
  });
};

export const useSubmitTournamentVotes = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.tournamentVotes.submitVotes,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tournamentVotes });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminTournamentVotes });
    },
  });
};

export const useRemoveTournamentVotes = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (awardType: string) => api.tournamentVotes.removeVotes(awardType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tournamentVotes });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminTournamentVotes });
    },
  });
};

export const useAdminTournamentVotes = (filters?: { awardType?: string; playerName?: string }) => {
  return useQuery({
    queryKey: filters ? [...queryKeys.adminTournamentVotes, filters] : queryKeys.adminTournamentVotes,
    queryFn: () => api.tournamentVotes.admin.getAll(filters),
    staleTime: 1000 * 30, // 30 seconds
  });
};

export const useAdminDeleteTournamentVotes = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ voterId, awardType }: { voterId: string; awardType: string }) =>
      api.tournamentVotes.admin.deleteUserVotes(voterId, awardType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tournamentVotes });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminTournamentVotes });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminLogs });
    },
  });
};

// Site config hooks
export const useSiteConfig = () => {
  return useQuery({
    queryKey: queryKeys.siteConfig,
    queryFn: api.config.get,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  });
};

export const useAdminConfig = () => {
  return useQuery({
    queryKey: queryKeys.adminConfig,
    queryFn: api.config.adminGet,
    staleTime: 1000 * 30,
  });
};

export const useUpdateConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.config.adminUpdate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.siteConfig });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminConfig });
      queryClient.invalidateQueries({ queryKey: queryKeys.configSnapshots });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminLogs });
      queryClient.invalidateQueries({ queryKey: queryKeys.allowed });
    },
  });
};

export const useConfigSnapshots = () => {
  return useQuery({
    queryKey: queryKeys.configSnapshots,
    queryFn: api.config.snapshots.list,
    staleTime: 1000 * 60,
  });
};

export const useCreateSnapshot = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.config.snapshots.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.configSnapshots });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminLogs });
    },
  });
};

export const useRestoreSnapshot = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.config.snapshots.restore,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.siteConfig });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminConfig });
      queryClient.invalidateQueries({ queryKey: queryKeys.configSnapshots });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminLogs });
      queryClient.invalidateQueries({ queryKey: queryKeys.allowed });
    },
  });
};
