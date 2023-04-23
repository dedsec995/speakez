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

app.use(bodyParser.json());
app.use(cors());

app.post('/api/text-to-audio-file', async (req, res) => {

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

        let filePath = "../public/voice/";
        let fileName = num + ".mp3";

        if (num) fs.writeFileSync(filePath + fileName, data.AudioStream)
    })

    setTimeout(() => { res.status(200).json(num) }, 4500)
})

// Change the Directory
app.use(express.static(process.cwd() + '/../dist'));

// Change the Directory
app.get('/', (req,res) => {
    res.sendFile(process.cwd() + '/../dist/index.html');
  });
  
app.listen(4001, () => { 
    console.log(`Server is ready at http://localhost:4001`); 
});