import { useRef } from 'react';
import { RegistrationForm, DesignSandbox } from 'football-ds';

function Form(props: { isAllowed?: boolean; name?: string; intra?: string; errors?: { name: string; intra: string }; isSubmitting?: boolean }) {
  const a = useRef<HTMLInputElement>(null), b = useRef<HTMLInputElement>(null), c = useRef<HTMLButtonElement>(null);
  const noop = () => {};
  return (
    <div className="w-[560px]">
      <RegistrationForm
        name={props.name ?? ''} intra={props.intra ?? ''} errors={props.errors ?? { name: '', intra: '' }}
        nameInputRef={a} intraInputRef={b} submitButtonRef={c}
        isSubmitting={props.isSubmitting ?? false} isAllowed={props.isAllowed ?? true}
        timeUntilNext="Sunday 12:00 PM (2d 4h 15m)" loading={false}
        onNameChange={noop} onIntraChange={noop} onKeyDown={noop} onSubmit={(e) => e.preventDefault()}
      />
    </div>
  );
}

export const Open = () => <Form name="John Doe" intra="jdoe" />;
export const Closed = () => <Form isAllowed={false} />;
export const ValidationErrors = () => <Form name="" intra="j doe" errors={{ name: 'Name is required', intra: 'Invalid intra login' }} />;
export const Submitting = () => <Form name="John Doe" intra="jdoe" isSubmitting />;
export const SignedOut = () => (
  <DesignSandbox session="guest"><Form /></DesignSandbox>
);
export const Banned = () => (
  <DesignSandbox session="banned"><Form name="Li Chen" intra="lchen" /></DesignSandbox>
);
