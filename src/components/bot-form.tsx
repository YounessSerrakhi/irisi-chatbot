import { LoadingDots } from "./loading-dots";
import { useRef, useEffect, useState } from "react";

// Declare a global interface to add the webkitSpeechRecognition property to the Window object
declare global {
  interface Window {
    webkitSpeechRecognition: any;
  }
}


type Props = {
  handleSubmit: (_e: any) => Promise<void>;
  handleEnter: (_e: any) => void;
  onChange: (_value: string) => void;
  query: string;
  loading: boolean;
};

export function BotForm({
  handleSubmit,
  handleEnter,
  onChange,
  query,
  loading,
}: Props) {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [isQueryEmpty, setIsQueryEmpty] = useState<boolean>(true);
  const [recordingComplete, setRecordingComplete] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isRecording, setIsRecording] = useState<boolean>(false);


  // Reference to store the SpeechRecognition instance
  const recognitionRef = useRef<any>(null);

  // Function to start recording
  const startRecording = () => {
    setIsRecording(true);
    // Create a new SpeechRecognition instance and configure it
    recognitionRef.current = new window.webkitSpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;

    // Event handler for speech recognition results
    recognitionRef.current.onresult = (event: any) => {
      const { transcript } = event.results[event.results.length - 1][0];

      // Log the recognition results and update the transcript state
      console.log(event.results);
      setTranscript(transcript);
      onChange(transcript);
    };

    // Start the speech recognition
    recognitionRef.current.start();
  };

  // Cleanup effect when the component unmounts
  useEffect(() => {
    return () => {
      // Stop the speech recognition if it's active
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Function to stop recording
  const stopRecording = () => {
    if (recognitionRef.current) {
      // Stop the speech recognition and mark recording as complete
      recognitionRef.current.stop();
      setRecordingComplete(true);
      setTranscript('');
      setIsRecording(false);
    }
  };

  // Toggle recording state and manage recording actions
  const handleToggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      startRecording();
    } else {
      stopRecording();
    }
  };


  useEffect(() => {
    setIsQueryEmpty(query.trim() === '');
  }, [query]);


  return (
    <div className="relative flex flex-col justify-center items-center px-4 ">
      <div style={{ color: "#ffffff" }}>
        {/* {transcript} */}
      </div>
      <div className="relative">
        <form onSubmit={(e) => handleSubmit(e)}>
          <textarea
            disabled={loading}
            onKeyDown={handleEnter}
            ref={textAreaRef}
            autoFocus={false}
            rows={1}
            maxLength={512}
            id="userInput"
            name="userInput"
            placeholder={
              loading ? "Waiting for response..." : "What is this legal case about?"
            }
            value={query}
            onChange={(e) => onChange(e.target.value)}

            className="w-[75vw] relative resize-none text-base py-4 px-8 bg-white text-black outline-none border border-[#d9d9e3] rounded-lg"
          />
          <div className="absolute flex top-3.5 right-4 text-[#A5A2A2] space-x-2">
            {loading ? (
              <div className="absolute top-1 right-1">
                <LoadingDots color="#000" />
              </div>
            ) : (
              <>
                {transcript === '' || isQueryEmpty ? (
                  // Microphone Icon
                  <button
                    type="button"
                    onClick={handleToggleRecording}
                    className={`p-1 ${isRecording ? 'text-red-500' : ''}`}
                  >
                    {isRecording ? (
                      // Button for stopping recording
                      <svg style={{ color: "red" }} xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" className="bi bi-mic-fill" viewBox="0 0 16 16">
                        <path d="M5 3a3 3 0 0 1 6 0v5a3 3 0 0 1-6 0z" />
                        <path d="M3.5 6.5A.5.5 0 0 1 4 7v1a4 4 0 0 0 8 0V7a.5.5 0 0 1 1 0v1a5 5 0 0 1-4.5 4.975V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 .5-.5" />
                      </svg>
                    ) : (
                      // Button for starting recording
                      <svg xmlns="http://www.w3.org/2000/svg" style={{ color: "#000000" }} width="30" height="30" fill="currentColor" className="bi bi-mic-fill" viewBox="0 0 16 16">
                        <path d="M5 3a3 3 0 0 1 6 0v5a3 3 0 0 1-6 0z" />
                        <path d="M3.5 6.5A.5.5 0 0 1 4 7v1a4 4 0 0 0 8 0V7a.5.5 0 0 1 1 0v1a5 5 0 0 1-4.5 4.975V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 .5-.5" />
                      </svg>
                    )}
                  </button>
                ) : (
                  // Send Button
                  <button
                    type="submit"
                    className="p-1"
                  >
                    <svg
                      viewBox="0 0 20 20"
                      width="30" height="30"
                      className=" rotate-90 fill-current"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
                    </svg>
                  </button>
                )}
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
