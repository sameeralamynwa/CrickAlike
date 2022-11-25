// // This example requires environment variables named "SPEECH_KEY" and "SPEECH_REGION"
const speechConfig = sdk.SpeechConfig.fromSubscription("a99e3201094941d99e9a24687843c47e", "eastus");
const audioConfig = sdk.AudioConfig.fromWavFileInput(fs.readFileSync("match_videos/world-cup-t20-india-pakistan.wav"));

speechConfig.speechRecognitionLanguage = "en-US";

const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

recognizer.recognizing = (s, e) => {
    // console.log(`RECOGNIZING: Text=${e.result.text}`);
};

recognizer.recognized = (s, e) => {
    if (e.result.reason == sdk.ResultReason.RecognizedSpeech) {
        console.log(`RECOGNIZED: Text=${e.result.text}`);
    }
    else if (e.result.reason == sdk.ResultReason.NoMatch) {
        console.log("NOMATCH: Speech could not be recognized.");
    }
};

recognizer.canceled = (s, e) => {
    console.log(`CANCELED: Reason=${e.reason}`);

    if (e.reason == sdk.CancellationReason.Error) {
        console.log(`"CANCELED: ErrorCode=${e.errorCode}`);
        console.log(`"CANCELED: ErrorDetails=${e.errorDetails}`);
        console.log("CANCELED: Did you set the speech resource key and region values?");
    }

    recognizer.stopContinuousRecognitionAsync();
};

recognizer.sessionStopped = (s, e) => {
    console.log("\n    Session stopped event.");
    recognizer.stopContinuousRecognitionAsync();
};

recognizer.startContinuousRecognitionAsync();

// Make the following call at some point to stop recognition:
// recognizer.stopContinuousRecognitionAsync();

// function fromFile() {
//     let audioConfig = sdk.AudioConfig.fromWavFileInput(fs.readFileSync("match_videos/world-cup-t20-india-pakistan.wav"));
//     let speechRecognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

//     speechRecognizer.recognizeOnceAsync(result => {
//         switch (result.reason) {
//             case sdk.ResultReason.RecognizedSpeech:
//                 console.log(`RECOGNIZED: Text=${result.text}`);
//                 break;
//             case sdk.ResultReason.NoMatch:
//                 console.log("NOMATCH: Speech could not be recognized.");
//                 break;
//             case sdk.ResultReason.Canceled:
//                 const cancellation = sdk.CancellationDetails.fromResult(result);
//                 console.log(`CANCELED: Reason=${cancellation.reason}`);

//                 if (cancellation.reason == sdk.CancellationReason.Error) {
//                     console.log(`CANCELED: ErrorCode=${cancellation.ErrorCode}`);
//                     console.log(`CANCELED: ErrorDetails=${cancellation.errorDetails}`);
//                     console.log("CANCELED: Did you set the speech resource key and region values?");
//                 }
//                 break;
//         }
//         speechRecognizer.close();
//     });
// }

// fromFile();

// function fromFile() {
//     let audioConfig = sdk.AudioConfig.fromWavFileInput(fs.readFileSync("match_videos/world-cup-t20-india-pakistan.wav"));
//     let recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

//     recognizer.recognizeOnceAsync(result => {
//         console.log(`RECOGNIZED: Text=${result.text}`);
//         recognizer.close();
//     });
// }

// fromFile();