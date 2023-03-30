import { TranscriptionRecord } from "../demo/components";
import { WEBSOCKET_URL } from "../connection";

export async function initWebsocket(
  access,
  featuresSelected,
) {
  const SAMPLE_RATE = 16000;
  const SAMPLE_SIZE = 16;

  var playButton = document.getElementById("start_btn");
  var context;
  let constraints = {
    audio: {
      echoCancellation: true,
      channelCount: 1,
      sampleRate: SAMPLE_RATE,
      sampleSize: SAMPLE_SIZE,
    },
  };
  var sourceNode;
  var socket;
  var EOT_FLAG;
  const EOT_STRING = "!!END_OF_TRANSCRIPTION!!";

  // The first time you hit play, connect to the microphone
  // Hook up the play/pause state to the microphone context
  context = new AudioContext();
  context.resume.bind(context);

  var audioPromise = navigator.mediaDevices.getUserMedia(constraints);

  audioPromise
    .then(function (micStream) {
      var microphone = context.createMediaStreamSource(micStream);
      var analyser = context.createAnalyser();
      microphone.connect(analyser);
    })
    .catch(console.log.bind(console));

  // Create a node that sends raw bytes across the websocket
  var scriptNode = context.createScriptProcessor(4096, 1, 1);
  // var scriptNode = new AudioWorklet(4096, 1, 1);

  // Need the maximum value for 16-bit signed samples, to convert from float.
  const MAX_INT = Math.pow(2, 16 - 1) - 1;

  scriptNode.addEventListener("audioprocess", function (e) {
    var floatSamples = e.inputBuffer.getChannelData(0);
    // The samples are floats in range [-1, 1]. Convert to 16-bit signed
    // integer.
    socket.send(
      Int16Array.from(
        floatSamples.map(function (n) {
          return n * MAX_INT;
        })
      )
    );
  });

  function newWebsocket() {
    var msgRes = [];
    var filteredMsgRes = [];
    var recordedChunks = [];
    var blobToFile;
    var audioFile = [];

    let config = `&language=en-sg`;
    if (featuresSelected.length > 0) {
      config += featuresSelected.map((item) => `&${item}=true`).join("");
      // console.log("Features at Demo", config);
    }

    console.log("Initializing new websocket");
    var websocketPromise = new Promise(function (resolve, reject) {
      var webSocketUrl = WEBSOCKET_URL + "?api_token=" + access + config;

      var socket = new WebSocket(webSocketUrl);
      socket.addEventListener("open", resolve);
      socket.addEventListener("error", reject);
      // TODO: Initialize the EOT_FLAG here
      EOT_FLAG = false;
    });

    Promise.all([audioPromise, websocketPromise])
      .then(function (values) {
        var micStream = values[0];
        socket = values[1].target;

        // Create recorder to store mic-streams
        // Seems like only webm format is available
        var mediaRecorder = new MediaRecorder(micStream, {
          mimeType: "audio/webm",
        });
        mediaRecorder.addEventListener("dataavailable", function (e) {
          if (e.data.size > 0) recordedChunks.push(e.data);
        });

        mediaRecorder.addEventListener("stop", function () {
          blobToFile = new File(recordedChunks, "Recorded Audio", {
            type: "audio/wav",
          });
        });

        // If the socket is closed for whatever reason, pause the mic
        socket.addEventListener(
          "close",
          function (e) {
            if (!EOT_FLAG) {
              console.log("Closing websocket before EOT from server!");
            }
            // Filter away empty array and join the remaining array, adding a space in between them
            filteredMsgRes.push(msgRes.filter((n) => n).join(" "));
            audioFile.push(blobToFile);
            console.log("Websocket closing..");
            // If triggered by ws ensure state is in pause
            playButton.dispatchEvent(new Event("pause"));
          },
          { once: true }
        );

        socket.addEventListener(
          "error",
          function (e) {
            console.log("Error from websocket", e);
            playButton.dispatchEvent(new Event("pause"));
          },
          { once: true }
        );

        function startByteStream() {
          // Hook up the scriptNode to the mic
          sourceNode = context.createMediaStreamSource(micStream);
          sourceNode.connect(scriptNode);
          scriptNode.connect(context.destination);
          mediaRecorder.start();
        }

        // Send the initial configuration message.
        socket.send(
          JSON.stringify({
            encoding: "raw",
            sample_rate_hertz: context.sampleRate,
            stop_string: "EOS",
          })
        );

        // Start streaming audio
        startByteStream();
        // User presses stop button
        playButton.addEventListener(
          "pause",
          function (e) {
            // Stop the recording and audio streaming
            playButton.dispatchEvent(new Event("pause"));
            mediaRecorder.stop();
            if (sourceNode) sourceNode.disconnect();
            scriptNode.disconnect();
            var stop_string = "EOS";

            var str_bytes = new Uint8Array(stop_string.length);
            for (var i = 0; i < stop_string.length; i++) {
              str_bytes[i] = stop_string.charCodeAt(i);
            }
            socket.send(str_bytes);
            console.log("EOS sent.");
          },
          { once: true }
        );

        socket.addEventListener("message", function (e) {
          var result = e.data;
          if (result === EOT_STRING) {
            EOT_FLAG = true;
          } else {
            // This line immediately retrieve any message and display it on Display board (Data here will not be stored)
            TranscriptionRecord(result);

            // This line push message to msgRes array where it will be processed and stored back in index.tsx (Data here will not be shown until user end WS)
            msgRes.push(result);
            // console.log(msgRes);
          }
        });
      })
      .catch(console.log.bind(console));
    return { filteredMsgRes, audioFile, recordedChunks };
  }

  // Start socket manually for the first time, subsequent sockets are initilized by event listener above
  return newWebsocket();
}
