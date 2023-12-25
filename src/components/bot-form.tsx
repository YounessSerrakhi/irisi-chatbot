import { LoadingDots } from "./loading-dots";
import { useRef, useEffect, useState } from "react";

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
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [isRecording, setIsRecording] = useState<boolean>(false);

  useEffect(() => {
    textAreaRef.current?.focus();

    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        const recorder = new MediaRecorder(stream);
        
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            setAudioChunks((chunks) => [...chunks, e.data]);
          }
        };

        setMediaRecorder(recorder);
      })
      .catch((error) => {
        console.error('Error accessing microphone:', error);
      });

    return () => {
      if (mediaRecorder) {
        mediaRecorder.stop();
      }
    };
  }, []);

  useEffect(() => {
    setIsQueryEmpty(query.trim() === '');
  }, [query]);

  const handleRecordingStart = () => {
    if (mediaRecorder) {
      console.log('Recording started');
      setAudioChunks([]);
      mediaRecorder.start();
      setIsRecording(true);
    }
  };

  const handleRecordingStop = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      console.log('Recording stopped');
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const handleRecordingData = async () => {
	if (mediaRecorder && audioChunks.length > 0) {
	  console.log('Processing recorded data');
	  const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
  
	  try {
		const response = await fetch(
		  "https://api-inference.huggingface.co/models/openai/whisper-large-v3",
		  {
			headers: { Authorization: "Bearer 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" },
			method: "POST",
			body: audioBlob,
		  }
		);
  
		if (response.ok) {
		  const text = await response.text();
		  console.log('Converted text:', text);
  
		  // Now you can use the converted text
		  handleSubmit(query);
		} else {
		  console.error('Error converting audio to text:', response.status);
		}
	  } catch (error) {
		console.error('Error during speech-to-text conversion:', error);
	  }
	}
  };
  

  return (
    <div className="relative flex flex-col justify-center items-center px-4">
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
                {isQueryEmpty ? (
                  // Microphone Icon
                  <button
                    type="button"
                    onClick={isRecording ? handleRecordingStop : handleRecordingStart}
                    onMouseUp={handleRecordingData}
                    className={`p-1 ${isRecording ? 'text-red-500' : ''}`}
                  >
                    {isRecording ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-mic-fill" viewBox="0 0 16 16">
                        <path d="M5 3a3 3 0 0 1 6 0v5a3 3 0 0 1-6 0z" />
                        <path d="M3.5 6.5A.5.5 0 0 1 4 7v1a4 4 0 0 0 8 0V7a.5.5 0 0 1 1 0v1a5 5 0 0 1-4.5 4.975V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 .5-.5" />
                      </svg>
                    ) : (
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-mic-fill" viewBox="0 0 16 16">
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
                      className="w-[1.2em] h-[1.2em] rotate-90 fill-current"
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
