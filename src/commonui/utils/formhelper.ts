export class FormHelper {
	static isValidEmail(email:string) {
		const re = /^[a-zA-Z0-9._-a-zA-Z0-9.\+0-9.]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
		return re.test(email);
	}
}
