const SibApiV3Sdk = require('sib-api-v3-sdk');
const dotenv = require('dotenv');

dotenv.config();

const defaultClient = SibApiV3Sdk.ApiClient.instance;

// Configure API key authorization: api-key
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

const sendEmail = async ({ to, subject, htmlContent, textContent, senderName }) => {
  if (!process.env.BREVO_API_KEY) {
      console.warn('BREVO_API_KEY is not set. Email not sent.');
      return;
  }

  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

  sendSmtpEmail.subject = subject;
  sendSmtpEmail.htmlContent = htmlContent;
  sendSmtpEmail.textContent = textContent;
  
  const emailFrom = process.env.BREVO_SENDER_EMAIL || "no-reply@ksvsmart.edu";
  const nameFrom = senderName || "KSV Smart System";
  
  sendSmtpEmail.sender = { "name": nameFrom, "email": emailFrom };
  sendSmtpEmail.to = [{ "email": to }];

  try {
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('API called successfully. Returned data: ' + JSON.stringify(data));
    return data;
  } catch (error) {
    console.error('Brevo API Error:', error);
    let errorDetail = error.message;
    if (error.response && error.response.text) {
        console.error('Response body:', error.response.text);
        // Try to parse JSON body to get readable message
        try {
            const body = JSON.parse(error.response.text);
            if(body.message) errorDetail = body.message;
            else if(body.code) errorDetail = `${body.code} - ${body.message}`;
        } catch(e) {
            errorDetail = error.response.text;
        }
    }
    throw new Error(`Email sending failed: ${errorDetail}`);
  }
};

module.exports = { sendEmail };
