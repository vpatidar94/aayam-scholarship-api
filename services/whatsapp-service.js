const https = require('https');

const sendTestInfo = async (mobileNo, mode, testDate) => {
    try {
        const payload ={
            "to": '91' + mobileNo,
            "recipient_type": "individual",
            "type": "template",
            "template": {
                "language": {
                    "policy": "deterministic",
                    "code": "en"
                },
                "name": "jeet_reg",
                "components": [
                    {
                        "type": "body",
                        "parameters": [
                            {
                                "type": "text",
                                "text": mode + ''
                            },
                            {
                                "type": "text",
                                "text": testDate + ''
                            }
                        ]
                    }
                ]
            }
        }
        
        
        // Assuming WPMessageTemplate is a function that sends the WhatsApp message
        return await WPMessageTemplate(payload);
    } catch (error) {
        console.log('Error sending WhatsApp message: ' + error);
        throw error;
    }
};

const WPMessageTemplate = async (payload) => {
    const url = process.env.WHATSAPP_API_URL; // Replace with your WhatsApp API URL
    const apiKey = process.env.WHATSAPP_API_KEY; // Replace with your API key

    const headers = {
        'Content-Type': 'application/json',
        'API-KEY': apiKey,
    };

    const requestOptions = {
        method: 'POST',
        headers: headers,
    };

    const req = https.request(url, requestOptions, (res) => {
        let data = '';

        // A chunk of data has been received.
        res.on('data', (chunk) => {
            data += chunk;
        });

        // The whole response has been received.
        res.on('end', () => {
            try {
                const response = JSON.parse(data);
                return response;
                // Handle the response as needed
            } catch (error) {
                console.error('Error parsing response:', error);
                return error;
                // throw new Error('Error parsing response:', error);
            }
        });
    });

    // Handle request errors
    req.on('error', (error) => {
        console.log('Error sending WhatsApp message: ' + error);
        return error;
        // throw error;
    });
    // console.log('send messages', JSON.stringify(payload));
    // Send the payload
    req.write(JSON.stringify(payload));

    // End the request
    req.end();
};

module.exports = {
    sendTestInfo
};
