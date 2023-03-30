export const checkMic = async () => {
  //Default state to prevent Non assigned errors
  let micDetected = false;

  micDetected = await navigator.mediaDevices
    .getUserMedia({ audio: true })
    .then(() => {
      console.log("Microphone detected");
      return true;
    })
    .catch((err) => {
      console.log("Microphone not detected/enabled:", err);
      return false;
    });

  return { micDetected };
};

export function TranscriptionRecord(props) {
  var nDiv = document.getElementById("results");
  var content = document.createTextNode(`${props} `);
  nDiv?.appendChild(content);
}
