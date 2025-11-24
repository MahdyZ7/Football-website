import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { User, BannedUser } from '../types/user';

// API functions
const api = {
  users: {
    getAll: async (): Promise<User[]> => {
      const { data } = await axios.get('/api/users');
      return data;
    },
    register: async (userData: { name: string; intra: string }): Promise<{ name: string; id: string }> => {
      const { data } = await axios.post('/api/register', userData);
      return data;
    },
    delete: async (intra: string) => {
      const { data } = await axios.delete('/api/register', {
        data: { intra },
      });
      return data;
    },
  },
  allowed: {
    check: async (): Promise<{ isAllowed: boolean }> => {
      const { data } = await axios.get('/api/allowed');
      return data;
    },
  },
  verify: {
    check: async (): Promise<{ isAllowed: boolean }> => {
      const { data } = await axios.get('/api/verify');
      return data;
    },
  },
  bannedUsers: {
    getAll: async (): Promise<BannedUser[]> => {
      const { data } = await axios.get('/api/banned-users');
      return data;
    },
  },
  money: {
    getAll: async () => {
      const { data } = await axios.get('/api/moneyDb');
      return data;
    },
  },
  admin: {
    auth: async (): Promise<{ authenticated: boolean; user?: string }> => {
      const { data } = await axios.get('/api/admin/auth');
      return data;
    },
    logs: async () => {
      const { data } = await axios.get('/api/admin-logs');
      return data;
    },
    banned: async (): Promise<BannedUser[]> => {
      const { data } = await axios.get('/api/admin/banned');
      return data;
    },
    banUser: async (banData: { userId: string; reason: string; duration: string }) => {
      const { data } = await axios.post('/api/admin/ban', banData);
      return data;
    },
    unbanUser: async (userId: string) => {
      const { data } = await axios.delete('/api/admin/ban', { data: { user_id: userId } });
      return data;
    },
    deleteUser: async (userId: string) => {
      const { data } = await axios.delete('/api/admin/users', { data: { id: userId } });
      return data;
    },
    verifyUser: async (verifyData: { id: string; verified: boolean }) => {
      const { data } = await axios.patch('/api/admin/users/verify', verifyData);
      return data;
    },
  },
  editName: {
    update: async (editData: { intra: string; newName: string }) => {
      const { data } = await axios.patch('/api/edit-name', editData);
      return data;
    },
  },
  feedback: {
    getAll: async (type?: string) => {
      const url = type ? `/api/feedback?type=${type}` : '/api/feedback';
      const { data } = await axios.get(url);
      return data;
    },
    submit: async (feedbackData: { type: string; title: string; description: string }) => {
      const { data } = await axios.post('/api/feedback', feedbackData);
      return data;
    },
    vote: async (voteData: { feedbackId: number; voteType: string }) => {
      const { data } = await axios.post('/api/feedback/vote', voteData);
      return data;
    },
    removeVote: async (feedbackId: number) => {
      const { data } = await axios.delete(`/api/feedback/vote?feedbackId=${feedbackId}`);
      return data;
    },
    getUserVotes: async () => {
      const { data } = await axios.get('/api/feedback/vote');
      return data;
    },
    admin: {
      getAll: async (filters?: { status?: string; type?: string }) => {
        const params = new URLSearchParams();
        if (filters?.status) params.append('status', filters.status);
        if (filters?.type) params.append('type', filters.type);
        const url = params.toString() ? `/api/admin/feedback?${params}` : '/api/admin/feedback';
        const { data } = await axios.get(url);
        return data;
      },
      approve: async (approveData: { feedbackId: number; action: string }) => {
        const { data } = await axios.post('/api/admin/feedback/approve', approveData);
        return data;
      },
      updateStatus: async (statusData: { feedbackId: number; status: string }) => {
        const { data } = await axios.patch('/api/admin/feedback/status', statusData);
        return data;
      },
      delete: async (feedbackId: number) => {
        const { data } = await axios.delete(`/api/admin/feedback?id=${feedbackId}`);
        return data;
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
  adminAuth: ['adminAuth'] as const,
  adminLogs: ['adminLogs'] as const,
  adminBanned: ['adminBanned'] as const,
  feedback: ['feedback'] as const,
  userVotes: ['userVotes'] as const,
  adminFeedback: ['adminFeedback'] as const,
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
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.users.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
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
    },
  });
};

export const useUnbanUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.admin.unbanUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bannedUsers });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminBanned });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminLogs });
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