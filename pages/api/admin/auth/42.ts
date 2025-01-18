
import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const clientId = process.env.FT_CLIENT_ID;
  const redirectUri = `${process.env.APP_URL}/api/admin/auth/callback`;
  
  const url = `https://api.intra.42.fr/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code`;
  
  res.redirect(url);
}
