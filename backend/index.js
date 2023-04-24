const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");

const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({ apiKey: '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'});
const openai = new OpenAIApi(configuration);

const AWS = require("aws-sdk");
AWS.config.loadFromPath("awsCreds.json");

//-------------------S3-----------------------------

const s3 = new AWS.S3();
const bbuckt = "speakez";

//-------------------S3 END-------------------------

app.use(bodyParser.json());
app.use(cors());

//------------------------------------- AWS IOT config & object --------------------------------------------------------

const awsIot = require('aws-iot-device-sdk');

const device = awsIot.device({
    keyPath: './AWS_secrets/private.pem.key',
    certPath: './AWS_secrets/certificate.pem.crt',
    caPath: './AWS_secrets/AmazonRootCA1.pem',
    clientId: 'raspberryThing',
    port: 8883,
    clientId: 'client', // Set client ID to 'client'
    region: 'us-east-1',
    host: 'a3rrqwl14ozs4u-ats.iot.us-east-1.amazonaws.com',
});

//---------------------------------------------Ends Here--------------------------------------------------------------


app.post('/api/text-to-audio-file', async (req, res) => {
    console.log("Inside CHATGPT")
    const completion = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: req.body.text,
        max_tokens: 100,
        temperature: 0.5
    })

    let num = (Math.random() * 100000000).toFixed(0);

    const polly = new AWS.Polly({ region: "us-east-1" })
    const params = {
        OutputFormat: "mp3",
        Text: completion.data.choices[0].text,
        VoiceId: "Matthew"
    }

    polly.synthesizeSpeech(params, (err, data) => {
        if (err) {
            console.error(err);
            return;
        }

        let filePath = "/app/dist/voice/";
        let fileName = num + ".mp3";

        if (num) fs.writeFileSync(filePath + fileName, data.AudioStream)

        if (num) (async() =>{await s3.putObject({
            Body:data.AudioStream,
            Bucket: bbuckt,
            Key: fileName,
            ContentType: ';audio/mpeg'
        })
        .promise();
    })();  

    })

    setTimeout(() => { res.status(200).json(num) }, 4500)
})

//--------------------------------Light On------------------------------------

app.post('/api/aws-iot', async (req, res) => {

    let num = (Math.random() * 100000000).toFixed(0);

    device.publish('topic_1', JSON.stringify(req.body.text), (error) => {
        if (error) {
            console.error('Failed to publish data:', error);
        } else {
            console.log('Data published successfully');
        }
    });   
    setTimeout(() => { res.status(200).json(num) }, 4500)
})

//--------------------------------Light ON------------------------------------

// Change the Directory
app.use(express.static(process.cwd() + '/dist'));

// Change the Directory
app.get('/', (req,res) => {
    res.sendFile(process.cwd() + '/dist/index.html');
  });
  
app.listen(4001, () => { 
    console.log(`Server is ready at http://localhost:4001`); 
});