import { Select } from 'football-ds';

export const WithOptions = () => (
  <div className="w-72">
    <Select
      label="Feedback type"
      fullWidth
      defaultValue="feature"
      options={[
        { value: 'feature', label: 'Feature request' },
        { value: 'bug', label: 'Bug report' },
        { value: 'feedback', label: 'General feedback' },
      ]}
    />
  </div>
);

export const WithChildren = () => (
  <div className="w-72">
    <Select label="Ban reason" fullWidth defaultValue="LATE" helperText="Duration is calculated automatically">
      <option value="NOT_READY">Not ready when booking starts (4 days)</option>
      <option value="CANCEL">Cancelled reservation (8 days)</option>
      <option value="LATE">Late over 15 minutes (8 days)</option>
      <option value="NO_SHOW">No show without notice (30 days)</option>
    </Select>
  </div>
);

export const WithError = () => (
  <div className="w-72">
    <Select label="Status" fullWidth error="Choose a status" options={[{ value: '', label: 'Select...' }, { value: 'in_progress', label: 'In progress' }]} />
  </div>
);
