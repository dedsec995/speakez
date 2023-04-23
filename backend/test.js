
const AWS = require("aws-sdk");
AWS.config.loadFromPath("awsCreds.json");
const s3 = new AWS.S3();

(async() =>{await s3.putObject({
    Body:"Hi",
    Bucket:"speakez",
    Key:"test.txt",
})
.promise();
})();  