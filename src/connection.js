export const BACKEND = "https://" + process.env.REACT_APP_BACKEND_URL;

export const WEBSOCKET_URL = "wss://" + process.env.REACT_APP_BACKEND_URL + "/stt/websocket/recognize";

export const AUDIO_UPLOAD_URL = BACKEND + "/stt/recognize";
