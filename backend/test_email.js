const SibApiV3Sdk = require('sib-api-v3-sdk');
const dotenv = require('dotenv');
dotenv.config();

const apiKey = process.env.BREVO_API_KEY;
if (!apiKey) {
    console.error('ERROR: BREVO_API_KEY is missing in .env');
    process.exit(1);
}

const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKeyAuth = defaultClient.authentications['api-key'];
apiKeyAuth.apiKey = apiKey;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

sendSmtpEmail.subject = "Test Email from KSV Smart System";
sendSmtpEmail.htmlContent = "<p>This is a test email to verify your Brevo API configuration.</p>";
sendSmtpEmail.sender = { "name": "KSV Smart System", "email": process.env.BREVO_SENDER_EMAIL || "no-reply@ksvsmart.edu" };
sendSmtpEmail.to = [{ "email": "test@example.com" }]; // Replace with your email if needed

console.log('Attempting to send test email...');
console.log('Sender:', sendSmtpEmail.sender);

apiInstance.sendTransacEmail(sendSmtpEmail).then(function(data) {
  console.log('SUCCESS! API called successfully. Returned data: ' + JSON.stringify(data));
}, function(error) {
  console.error('FAILED to send email.');
  console.error(error);
  if(error.response) console.error('Response:', error.response.text);
});
