import { TeamExporter } from 'football-ds';
import { teams } from './_fixtures';

export const Default = () => (
  <div className="w-[900px]"><TeamExporter {...teams} /></div>
);
