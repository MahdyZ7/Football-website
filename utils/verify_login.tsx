import { ClientCredentials } from 'simple-oauth2';
import axios from 'axios';
import { User } from '../types/user'

const UID = process.env.UID;
const APP_SEC = process.env.APP_SEC;

function cleanName(name: string) {
	if (typeof name !== 'string') {
		name = String(name);
	}
	return name.trim().toLowerCase();
}


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
		return ({name: "", intra: "", verified: false, created_at: "", email: ""})


	try {
		const client = new ClientCredentials(credentials);
		const tokenParams  = {
			scope: 'public',
		}
		

		// Get the access token
		const accessToken = await client.getToken(tokenParams);

		// Making the authenticated API request
		const response = await axios.get('https://api.intra.42.fr/v2/campus/43/users?filter[login]=' + intra, {
			headers: {
				Authorization: `Bearer ${accessToken.token.access_token}`,
			}
		});

		if (response.status != 200)
			return {name: "", intra: "", verified: false, created_at: "", email: ""};
		const data = response.data;
		if (data.length === 0)
			return {name: "", intra: "", verified: false, created_at: "", email: ""};
		if (response.status === 200 && data.length > 0)
		  return {name: data[0].usual_full_name, intra: intra, verified: true, created_at: data[0].created_at, email: data[0].email};
      return {name: "", intra: "", verified: false, created_at: "", email: ""};
	} catch (error) {
		console.error('Error retrieving access token', error);
		return {name: "", intra: "", verified: false, created_at: "", email: ""};
	}
}