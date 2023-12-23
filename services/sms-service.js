const https = require('https');

const sendSMS = async (phoneNumber, OTP) => {
    const apiUrl = process.env.SMS_API_URL;
    const apiKey = process.env.SMS_API_KEY;

    const url = `${apiUrl}?APIKey=${apiKey}&senderid=AAYAMC&channel=2&DCS=0&flashsms=0&number=91${phoneNumber}&text=Your OTP is: ${OTP}. Regards AAYAM&route=31&EntityId=1301159531158036635&dlttemplateid=1307161797225449463`;

    return new Promise((resolve, reject) => {
        const request = https.get(url, (response) => {
            let data = '';

            response.on('data', (chunk) => {
                data += chunk;
            });

            response.on('end', () => {
                try {
                    const parsedData = JSON.parse(data);
                    
                    resolve(parsedData);
                } catch (error) {
                    console.error('Error parsing JSON:', error);
                    reject(error);
                }
            });
        });

        request.on('error', (error) => {
            console.error('Error sending SMS:', error);
            reject(error);
        });

        request.end();
    });
};

module.exports = sendSMS;
