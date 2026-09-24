import { Textarea } from 'football-ds';

export const Default = () => (
  <div className="w-96">
    <Textarea label="Description" placeholder="Describe the feature or bug..." rows={4} fullWidth />
  </div>
);

export const WithValue = () => (
  <div className="w-96">
    <Textarea
      label="Announcement message"
      rows={3}
      fullWidth
      defaultValue="Thursday's game moves to Outdoor Pitch 1 this week. Team selection starts 5 minutes before kick-off."
      helperText="Shown in a popup on the home page"
    />
  </div>
);

export const WithError = () => (
  <div className="w-96">
    <Textarea label="Description" rows={3} fullWidth defaultValue="Bug" error="Please add at least 20 characters" />
  </div>
);
