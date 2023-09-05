import { BASE_URL } from "@/service/API";
import { useEffect, useRef, useState } from "react";

const mimeType = "audio/webm";

const AudioRecorder = () => {
  const [permission, setPermission] = useState(false);

  const mediaRecorder = useRef<any>(null);
  const [recordingStatus, setRecordingStatus] = useState("inactive");
  const [stream, setStream] = useState<MediaStream>(null);

  const [audioChunks, setAudioChunks] = useState([]);
  const [audio, setAudio] = useState<any>(null);

  const [transcript, setTranscript] = useState("");

  const startRecording = async () => {
    setRecordingStatus("recording");
    //create new Media recorder instance using the stream
    const media = new MediaRecorder(stream, { type: mimeType });
    //set the MediaRecorder instance to the mediaRecorder ref
    mediaRecorder.current = media;
    //invokes the start method to start the recording process
    mediaRecorder.current.start();
    let localAudioChunks = [];
    mediaRecorder.current.ondataavailable = (event) => {
      if (typeof event.data === "undefined") return;
      if (event.data.size === 0) return;
      localAudioChunks.push(event.data);
    };
    setAudioChunks(localAudioChunks);
  };

  useEffect(() => {
    (async () => {
      // get the audio file from the 'audio' variable which is audioUrl
      if (audio) {
        const audioFileResponse = await fetch(audio);

        const audioBlob = await audioFileResponse.blob();

        // send the audio file to the backend
        // Send the audio Blob to the backend
        const response = await fetch(`${BASE_URL}/ai/voice2text`, {
          method: "POST",
          headers: {
            "Content-Type": "application/octet-stream",
          },
          body: audioBlob,
        });
        const data = await response.json();
        setTranscript(data.text);
        console.log(data);
      }
    })();
  }, [audio]);

  const stopRecording = async () => {
    setRecordingStatus("inactive");
    //stops the recording instance
    mediaRecorder.current.stop();
    mediaRecorder.current.onstop = () => {
      //creates a blob file from the audiochunks data
      const audioBlob = new Blob(audioChunks, { type: mimeType });
      //creates a playable URL from the blob file.
      const audioUrl = URL.createObjectURL(audioBlob);
      setAudio(audioUrl);
      setAudioChunks([]);
    };
  };

  const getMicrophonePermission = async () => {
    if ("MediaRecorder" in window) {
      try {
        const streamData = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false,
        });
        setPermission(true);
        setStream(streamData);
      } catch (err: any) {
        alert(err.message);
      }
    } else {
      alert("The MediaRecorder API is not supported in your browser.");
    }
  };
  return (
    <div className="audio-controls">
      {transcript !== "" && (
        <div className="p-2 w-full border-2 shadow-lg rounded-md mb-2">
          {" "}
          {transcript}
        </div>
      )}
      {!permission ? (
        <button onClick={getMicrophonePermission} type="button">
          Get Microphone
        </button>
      ) : null}
      {permission && recordingStatus === "inactive" ? (
        <button onClick={startRecording} type="button">
          Start Recording
        </button>
      ) : null}
      {recordingStatus === "recording" ? (
        <button onClick={stopRecording} type="button">
          Stop Recording
        </button>
      ) : null}

      {/* {audio ? (
        <div className="audio-container">
          <audio src={audio} controls></audio>
          <a download href={audio}>
            Download Recording
          </a>
        </div>
      ) : null} */}
    </div>
  );
};

export default AudioRecorder;
