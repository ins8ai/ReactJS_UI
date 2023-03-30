import { useState } from "react";
import { DemoPOST } from "../api/uploadFile";

//   Transcription of uploaded file.
//   Only support
//   1) Single Channel .WAV format
//   2) PCM Encoding
//   3) Less than 10mb

export default function Upload({
  token,
  uploadData,
  actionMsg,
  loading,
  featuresSelected,
}) {
  const [isDisabled, setIsDisabled] = useState(false);

  const handleClick = (e) => {
    if (token === "") {
      e.preventDefault();
      alert(`API Token not detected, generate one and paste it on the input,`)
    }
  };

  const handleUpload = async ({ target }) => {
    const formData = new FormData();
    const file = target.files[0];
    formData.append("audio", file);

    loading(true);
    actionMsg("Uploading Audio File")
    setIsDisabled(true);
    try {
      var result = await DemoPOST(token, formData, featuresSelected);
      var resultAudio = [file]
      var resultMsg = result.transcript;
      uploadData({resultAudio, resultMsg});
      loading(false);
      setIsDisabled(false);
    } catch (err) {
      loading(false);
      setIsDisabled(false);
    }
    target.value = "";
  };

  return (
      <label className={(isDisabled) ? "btnCustom disabled" : "btnCustom"} id="upload_btn_wrapper">
        Upload File
        <input
          type="file"
          id="upload"
          accept=".wav"
          onClick={handleClick}
          onChange={handleUpload}
          disabled={isDisabled}
          style={{ display: "none" }}
        />
      </label>
  );
}
