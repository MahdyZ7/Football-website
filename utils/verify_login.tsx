import { ClientCredentials } from 'simple-oauth2';
import axios from 'axios';
import { UserInfo } from '../types/user'

const UID = process.env.UID;
const APP_SEC = process.env.APP_SEC;

function cleanName(name: string) {
	if (typeof name !== 'string') {
		name = String(name);
	}
	return name.trim().toLowerCase();
}


export default async function verifyLogin(intra: string): Promise<UserInfo> {
	
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
		return ({name: "", intra: "", valid: false, error: true})


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
			return {name: "", intra: "", valid: false, error: true};
		const data = response.data;
		console.log(response.status);
		// console.log(data);
		if (data.length === 0)
			return {name: "", intra: "", valid: false, error: false};
		if (response.status === 200 && data.length > 0)
		  return {name: data[0].usual_full_name, intra: intra, valid: true, error: false};
      return {name: "", intra: "", valid: false, error: false};
	} catch (error) {
		console.error('Error retrieving access token', error);
		return {name: "", intra: "", valid: false, error: true};
	}
	return {name: "", intra: "", valid: false, error: true};
}