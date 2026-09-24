import { Input, Icons } from 'football-ds';

export const Default = () => (
  <div className="w-80">
    <Input label="Full name" placeholder="e.g. Jane Smith" fullWidth />
  </div>
);

export const WithHelper = () => (
  <div className="w-80">
    <Input label="Intra login" defaultValue="jsmith" helperText="Your 42 intra username" fullWidth />
  </div>
);

export const WithError = () => (
  <div className="w-80">
    <Input label="Intra login" defaultValue="j smith" error="Intra logins can't contain spaces" fullWidth />
  </div>
);

export const Disabled = () => (
  <div className="w-80">
    <Input label="Intra login" defaultValue="jdoe" disabled fullWidth helperText="Signed in with 42 Intra" />
  </div>
);
