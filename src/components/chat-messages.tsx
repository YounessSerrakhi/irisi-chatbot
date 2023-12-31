import Image from "next/image";
import ReactMarkdown from "react-markdown";
import { RefObject } from "react";
import { Document } from "langchain/document";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/accordion";
import { Message } from "@/types/message.type";

type Props = {
  messages: Message[];
  loading: boolean;
  messageListRef: RefObject<HTMLDivElement>;
};

export function ChatMessages({ messages, loading, messageListRef }: Props) {
	const speechResponse = async (messageText: string) => {
		console.log("speechResponse called");
		interface QueryData {
		  inputs: string;
		}
	  
		try {
		  const data: QueryData = {
			inputs: messageText,
		  };
	  
		  const response = await fetch(
			//"https://api-inference.huggingface.co/models/facebook/mms-tts-eng"
			"https://api-inference.huggingface.co/models/espnet/kan-bayashi_ljspeech_vits",
			{
			  headers: { Authorization: "Bearer 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" },
			  method: "POST",
			  body: JSON.stringify(data),
			}
		  );
	  
		  if (!response.ok) {
			throw new Error(`HTTP error! Status: ${response.status}`);
		  }
	  
		  const audioBuffer = await response.arrayBuffer();
		  const audioContext = new (window.AudioContext || window.AudioContext)();
		  const audioSource = audioContext.createBufferSource();
	  
		  audioContext.decodeAudioData(audioBuffer, (buffer) => {
			audioSource.buffer = buffer;
			audioSource.connect(audioContext.destination);
			audioSource.start(0);
		  });
		} catch (error) {
		  console.error("Error during speech response:", error);
		}
	  };
	  

  return (
    <div style={{border:"1px solid #ffffff",boxShadow:"0 8px 16px 0 rgba(0,0,0,0.2), 0 6px 20px 0 rgba(0,0,0,0.19)", padding:"5px" , marginBottom:"10px"}}  className="grow relative w-full">
      <div ref={messageListRef} className="w-full h-full  rounded-lg">
        {messages.map((message, index) => {
          let icon;
          let voiceIcon = (
            <Image
              key={index}
              src="/voice.svg"
              alt="Voice"
              width="30"
              height="30"
              priority
              onClick={() => speechResponse(message.message)}
              className="cursor-pointer"
            />
          );
          let className = "flex gap-2 items-center ";
          if (message.type === "botMessage") {
            icon = (
              <Image
                key={index}
                src="/robot.svg"
                alt="AI"
                width="20"
                height="20"
                className="msg-img"
                priority
              />
            );
            className += " text-black p-6 animate-[fadein 0.5s]";
          } else {
            icon = (
              <Image
                key={index}
                src="/person.svg"
                alt="Me"
                width="20"
                height="20"
                className="msg-img h-full mr-4 rounded-sm "
                priority
              />
            );
            className +=
              loading && index === messages.length - 1
                ? "usermessagewaiting"
                : "text-black p-6";
          }
          return (
            <div key={`chatMessage-${index}`}>
              <div className={className}>
                {icon}
                <div className={(message.type === "botMessage")?"leading-4 msg-bot msg-bubble-bot" : "leading-4 msg-bot msg-bubble"}>
                  <ReactMarkdown>{message.message}</ReactMarkdown>
                </div>
                {message.type === "botMessage" && voiceIcon}
              </div>
              {message.sourceDocs && (
                <div className="p-5" style={{color:"#ffffff"}} key={`sourceDocsAccordion-${index}`}>
                  <Accordion type="single" collapsible className="flex-col">
                    {message.sourceDocs.map((doc: Document, index: number) => (
                      <div key={`messageSourceDocs-${index}`}>
                        <AccordionItem value={`item-${index}`}>
                          <AccordionTrigger>
                            <h3>Source {index + 1}</h3>
                          </AccordionTrigger>
                          <AccordionContent>
                            <ReactMarkdown>{doc.pageContent}</ReactMarkdown>
                            <p className="mt-2" style={{color:"#ffffff"}}>
                              <b>Source:</b> {doc.metadata.source}
                            </p>
                          </AccordionContent>
                        </AccordionItem>
                      </div>
                    ))}
                  </Accordion>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
