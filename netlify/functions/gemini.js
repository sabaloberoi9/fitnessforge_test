// This line allows our server function to make API calls.
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// This is the main function that Netlify will run every time our app calls it.
exports.handler = async function(event, context) {
    // For security, we only allow our function to be called in a specific way.
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        // Get the data sent from our frontend app.
        const { systemInstruction, history, newUserMessage, imageBase64, recaptchaToken } = JSON.parse(event.body);
        
        // --- SECURITY STEP 1: Get Secret Keys ---
        // These keys are retrieved from Netlify's secure environment, not from the code itself.
        const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
        const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;

        if (!GEMINI_API_KEY || !RECAPTCHA_SECRET_KEY) {
            throw new Error("API Keys are not configured on the server.");
        }

        // --- SECURITY STEP 2: Verify the User is Human with reCAPTCHA ---
        const recaptchaResponse = await fetch(`https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`, {
            method: 'POST'
        });
        const recaptchaData = await recaptchaResponse.json();

        // If reCAPTCHA verification fails, block the request immediately.
        if (!recaptchaData.success || recaptchaData.score < 0.5) {
            return { statusCode: 403, body: 'Bot activity detected. Request blocked.' };
        }

        // --- If human, proceed to call the Google AI ---
        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${GEMINI_API_KEY}`;
        
        // Prepare the data to be sent to the Google AI.
        const contents = history
            .filter(msg => msg.sender !== 'system')
            .map(msg => ({
                role: msg.sender === 'ai' ? 'model' : 'user',
                parts: [{ text: msg.text }]
            }));
            
        const userParts = [{ text: newUserMessage }];
        if (imageBase64) {
            userParts.push({ inlineData: { mimeType: 'image/jpeg', data: imageBase64 } });
        }
        contents.push({ role: 'user', parts: userParts });

        const payload = { contents, systemInstruction: { parts: [{ text: systemInstruction }] } };

        // Call the real Google AI API.
        const apiResponse = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!apiResponse.ok) {
            const errorBody = await apiResponse.text();
            console.error("Google AI API Error:", errorBody);
            throw new Error(`Google AI API failed with status: ${apiResponse.status}`);
        }

        const result = await apiResponse.json();
        const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't get a response.";

        // Send the AI's clean response back to the frontend app.
        return {
            statusCode: 200,
            body: JSON.stringify({ text: text })
        };

    } catch (error) {
        console.error('Serverless function error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
