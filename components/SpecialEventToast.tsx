'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';

const SpecialEventToast: React.FC = () => {
  useEffect(() => {
    const toastId = toast.custom(
      (id) => (
        <div
          className="w-full max-w-md rounded-xl shadow-lg overflow-hidden cursor-pointer"
          onClick={() => toast.dismiss(id)}
          role="alert"
          aria-live="polite"
        >
          <div
            className="p-5 flex items-start gap-4 relative text-white"
            style={{
              background: 'linear-gradient(135deg, var(--ft-primary) 0%, var(--ft-secondary) 100%)',
            }}
          >
            <span className="text-3xl flex-shrink-0 animate-bounce">&#9917;</span>
            <div className="flex-1">
              <strong className="block text-lg mb-1">Special Event This Week!</strong>
              <p className="text-sm leading-relaxed opacity-95">
                Player limit changed to 10 players (8 main + 2 substitutes) for this week only.
              </p>
            </div>
            <button
              className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center
                         bg-white/20 hover:bg-white/30 transition-all text-white text-lg leading-none"
              onClick={(e) => {
                e.stopPropagation();
                toast.dismiss(id);
              }}
              aria-label="Close notification"
            >
              &times;
            </button>
          </div>
        </div>
      ),
      { duration: 12000 }
    );

    return () => {
      toast.dismiss(toastId);
    };
  }, []);

  return null;
};

export default SpecialEventToast;
