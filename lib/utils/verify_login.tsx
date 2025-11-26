import { ClientCredentials } from 'simple-oauth2';
import { User } from '../../types/user'

const UID = process.env.UID;
const APP_SEC = process.env.APP_SEC;

function cleanName(name: string) {
	if (typeof name !== 'string') {
		name = String(name);
	}
	return name.trim().toLowerCase();
}

const createEmptyUser = (): User => ({
	name: "",
	intra: "",
	verified: false,
	created_at: "",
	email: ""
});


export default async function verifyLogin(intra: string): Promise<User> {
	
	intra = cleanName(intra);
	const credentials = {
		client: {
			id: UID || "",
			secret: APP_SEC || "",
		},
		auth: {
			tokenHost: 'https://api.intra.42.fr',
		},
	};

	if (!UID || !APP_SEC)
		return createEmptyUser();


	try {
		const client = new ClientCredentials(credentials);
		const tokenParams  = {
			scope: 'public',
		}
		

		// Get the access token
		const accessToken = await client.getToken(tokenParams);

		// Making the authenticated API request
		const response = await fetch('https://api.intra.42.fr/v2/campus/43/users?filter[login]=' + intra, {
			headers: {
				Authorization: `Bearer ${accessToken.token.access_token}`,
			}
		});

		if (!response.ok)
			return createEmptyUser();
		const data = await response.json();
		if (data.length === 0)
			return createEmptyUser();
		if (response.status === 200 && data.length > 0)
		  return {name: data[0].usual_full_name, intra: intra, verified: true, created_at: data[0].created_at, email: data[0].email};
      return createEmptyUser();
	} catch (error) {
		console.error('Error retrieving access token', error);
		return createEmptyUser();
	}
}