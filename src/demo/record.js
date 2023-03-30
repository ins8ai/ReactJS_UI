import { useState } from "react";
import { initWebsocket } from "../api/websocket";

export default function Record({
  token,
  microphone,
  uploadData,
  actionMsg,
  loading,
  recording,
  featuresSelected,
}) {
  const [isRecord, setIsRecord] = useState(true);
  const [isDisabled, setIsDisabled] = useState(false);

  let playButton = document.getElementById("start_btn");
  var result;

  const disableButton = () => {
    setIsDisabled(true);
    setTimeout(function () {
      setIsDisabled(false);
    }, 1000);
  };

  const resPopup = () => {
    if (isRecord) {
      console.log("Recording: ", isRecord);
      recording(true);
      disableButton();
    } else {
      console.log("Recording: ", isRecord);
      recording(false);
      disableButton();
    }
  };

  const checkMicOnClick = () => {
    if (!microphone) {
      alert(
        "Recording device not detected, ensure that microphone is set as Allow under site permission."
      );
    }
  };

  const bufferTime = () => {
    loading(true);
    setIsDisabled(true);
    setIsRecord(!isRecord);
    actionMsg(
      isRecord
        ? "Establishing Websocket Connection"
        : "Closing Websocket Connection"
    );
    setTimeout(function () {
      resPopup();
      loading(false);
    }, 1000);
  };

  const handleClick = async () => {
    if (token !== "") {
      checkMicOnClick();
      if (microphone) {
        bufferTime();
        if (isRecord) {
          try {
            result = await initWebsocket(token, featuresSelected);
          } catch (err) {
            alert(err);
          } finally {
            var resultAudio = result.audioFile;
            var resultMsg = result.filteredMsgRes;
            uploadData({ resultAudio, resultMsg });
          }
        } else {
          playButton.dispatchEvent(new Event("pause"));
        }
      }
    } else {
      alert(
        `API Token not detected, generate one and paste it on the input,`
      );
    }
  };

  return (
    <label
      className={
        isDisabled ? "btnCustom disabled" : "btnCustom"
      }
      id="start_btn_wrapper"
    >
      {isRecord ? <span>Record</span> : <span>Recording</span>}
      <button
        disabled={isDisabled}
        id="start_btn"
        onClick={handleClick}
        style={{ display: "none" }}
      />
    </label>
  );
}
