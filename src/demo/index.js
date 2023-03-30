import "./index.css";
import { useState, useEffect } from "react";
import { checkMic } from "./components";
import Record from "./record";
import Upload from "./upload";

// Features
// 1) Punctuation is enabled, to disable it, set the features array to empty eg. useState([])
// 2) Audio file for each transcription is stored in the transcript array. Recommend using React-audio-player to enable playback

const Demo = () => {
  const [isMicOn, updateIsMicOn] = useState(false);
  const [isLoading, updateIsLoading] = useState(false);
  const [isRecord, updateIsRecord] = useState(false);
  const [actionMsg, updateActionMsg] = useState("");

  // Data processed and to be utilised
  const [token, setTokenValue] = useState("");
  const [transcript, updateTranscript] = useState([]);

  // Features to be toggled
  const [features] = useState(["punctuation"]);

  // Check if mic is present when navigated to Demo page
  useEffect(() => {
    const micCheck = async () => {
      const micDetails = await checkMic();
      if (micDetails) {
        updateIsMicOn(micDetails.micDetected);
      }
    };
    micCheck();
  }, []);

  // Handles transcription files from Upload and Record function
  function dataHandler(data) {
    var newData = [...transcript, data];
    var filteredData = newData.filter((item) => item.resultMsg);
    updateTranscript(filteredData);
  }

  // View transcript array in console
  // useEffect(() => {
  //   console.log(transcript);
  // }, [transcript]);

  return (
    <div className="container">
      <div className="header-section">
        <label className="text text-header">Ins8.ai Hyperlocal STT- Demo</label>
        <span className="text-sm opacity-l">
          This is a demo purely for illustrative purposes
        </span>
      </div>
      <div className="block">
        <div className="action-container">
          <input
            value={token}
            onChange={(e) => setTokenValue(e.target.value)}
            placeholder="Enter your API token"
          />
          <Upload
            uploadData={dataHandler}
            token={token}
            actionMsg={updateActionMsg}
            loading={updateIsLoading}
            blockBtn={isRecord}
            featuresSelected={features}
          />
          <Record
            microphone={isMicOn}
            uploadData={dataHandler}
            token={token}
            actionMsg={updateActionMsg}
            loading={updateIsLoading}
            recording={updateIsRecord}
            featuresSelected={features}
          />
        </div>
        <div className="display">
          {!isLoading && (
            <span
              id="results"
              style={{
                padding: "0px 15px",
                display: `${!isRecord ? "none" : "flex"}`,
              }}
              contentEditable={false}
              data-text={"Recording, start speaking"}
            />
          )}
          {isLoading ? (
            <div>{actionMsg}</div>
          ) : (
            transcript
              .slice(0)
              .reverse()
              .map((item, i) => {
                return (
                  <div className="display-item" key={i}>
                    {item.resultMsg && item.resultMsg}
                    {/* {item.resultAudio[0] && (
                      <audio src={item.resultAudio[0]} />
                    )} */}
                  </div>
                );
              })
          )}
        </div>
      </div>
    </div>
  );
};

export default Demo;
