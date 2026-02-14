import { useState, useCallback, useRef, KeyboardEvent, FormEvent } from 'react';
import { useSession } from 'next-auth/react';
import { useRegisterUser } from './useQueries';
import { toast } from 'sonner';

interface FormErrors {
  name: string;
  intra: string;
}

/**
 * Custom hook for registration form logic
 * Single Responsibility: Manage form state, validation, and submission
 */
export function useRegistrationForm() {
  const onSuccess = useCallback((message: string, type: 'success' | 'error' | 'info') => {
    if (type === 'success') toast.success(message);
    else if (type === 'error') toast.error(message);
    else toast.info(message);
  }, []);
  const [name, setName] = useState("");
  const [intra, setIntra] = useState("");
  const [errors, setErrors] = useState<FormErrors>({ name: "", intra: "" });

  const nameInputRef = useRef<HTMLInputElement>(null);
  const intraInputRef = useRef<HTMLInputElement>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);

  const { data: session } = useSession();
  const registerUserMutation = useRegisterUser();

  // Validation functions
  const validateName = useCallback((value: string): boolean => {
    if (!value.trim()) {
      setErrors(prev => ({ ...prev, name: "Name is required" }));
      return false;
    }
    if (value.trim().length < 2) {
      setErrors(prev => ({ ...prev, name: "Name must be at least 2 characters" }));
      return false;
    }
    setErrors(prev => ({ ...prev, name: "" }));
    return true;
  }, []);

  const validateIntra = useCallback((value: string): boolean => {
    if (!value.trim()) {
      setErrors(prev => ({ ...prev, intra: "Intra login is required" }));
      return false;
    }
    if (value.trim().length < 3) {
      setErrors(prev => ({ ...prev, intra: "Intra login must be at least 3 characters" }));
      return false;
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(value.trim())) {
      setErrors(prev => ({ ...prev, intra: "Intra login can only contain letters, numbers, - and _" }));
      return false;
    }
    setErrors(prev => ({ ...prev, intra: "" }));
    return true;
  }, []);

  // Handlers
  const handleNameChange = useCallback((value: string) => {
    setName(value);
    if (value.trim()) {
      validateName(value);
    } else {
      setErrors(prev => ({ ...prev, name: "" }));
    }
  }, [validateName]);

  const handleIntraChange = useCallback((value: string) => {
    setIntra(value);
    if (value.trim()) {
      validateIntra(value);
    } else {
      setErrors(prev => ({ ...prev, intra: "" }));
    }
  }, [validateIntra]);

  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLInputElement>, currentField: 'name' | 'intra') => {
    if (event.key === 'Enter') {
      event.preventDefault();

      if (currentField === 'name' && intraInputRef.current) {
        intraInputRef.current.focus();
      } else if (currentField === 'intra' && submitButtonRef.current) {
        submitButtonRef.current.click();
      }
    }
  }, []);

  const handleSubmit = useCallback(async (event: FormEvent, isAllowed: boolean) => {
    event.preventDefault();

    // Check authentication
    if (!session) {
      onSuccess("Please sign in to register", 'error');
      return;
    }

    // Handle admin reset (legacy feature)
    if (name.toLowerCase().endsWith("mangoose")) {
      onSuccess("Resetting user list...", 'info');
      try {
        const response = await fetch("/api/register", {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'X-Secret-Header': name
          },
          body: JSON.stringify({ name, intra })
        });

        if (!response.ok) {
          throw new Error('Failed to reset user list');
        }

        onSuccess("User list has been reset.", 'success');
        return;
      } catch {
        onSuccess("Error resetting user list.", 'error');
        return;
      }
    }

    // Validate submission
    if (!isAllowed) {
      onSuccess("Registration is only allowed on Sunday and Wednesday after 12 PM (noon) till 8 PM the next day.", 'error');
      return;
    }

    // Validate form fields
    const isNameValid = validateName(name);
    const isIntraValid = validateIntra(intra);

    if (!isNameValid || !isIntraValid) {
      onSuccess("Please fix the errors in the form", 'error');
      return;
    }

    // Submit registration using React Query mutation
    registerUserMutation.mutate(
      { name, intra },
      {
        onSuccess: () => {
          onSuccess('Registration successful!', 'success');
          setName("");
          setIntra("");
          setErrors({ name: "", intra: "" });
          // Focus back to name field for next registration
          nameInputRef.current?.focus();
        },
        onError: (error: unknown) => {
          if (typeof error === 'object' && error !== null && 'response' in error) {
            const response = (error as { response: { status: number, data?: any } }).response;
            const { status, data } = response;
            if (status === 401) {
              onSuccess(data?.error || "Please sign in to register", 'error');
            } else if (status === 403) {
              onSuccess(data?.error || "Players limit reached. Better luck next time!", 'error');
            } else if (status === 409) {
              onSuccess(`A user with the Intra-login ${intra} already exists.`, 'error');
            } else if (status === 404) {
              onSuccess(`User with Intra-login ${intra} not found. Please enter name also`, 'error');
            } else {
              onSuccess(data?.error || "Registration failed. Please try again.", 'error');
            }
          } else {
            onSuccess("Registration failed. Please try again.", 'error');
          }
        }
      }
    );
  }, [name, intra, session, validateName, validateIntra, registerUserMutation, onSuccess]);

  const resetForm = useCallback(() => {
    setName("");
    setIntra("");
    setErrors({ name: "", intra: "" });
  }, []);

  return {
    name,
    intra,
    errors,
    nameInputRef,
    intraInputRef,
    submitButtonRef,
    isSubmitting: registerUserMutation.isPending,
    handleNameChange,
    handleIntraChange,
    handleKeyDown,
    handleSubmit,
    resetForm
  };
}
