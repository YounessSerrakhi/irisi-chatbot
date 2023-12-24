import { ChatOpenAI } from "langchain/chat_models/openai";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { ConversationalRetrievalQAChain } from "langchain/chains";
import { AIMessage, HumanMessage } from "langchain/schema";
import { pinecone } from "@/libs/pinecone";

const CONDENSE_TEMPLATE = `Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question.

Chat History:
{chat_history}
Follow Up Input: {question}
Standalone question:`;

const QA_TEMPLATE = `You are a helpful AI assistant. Use the following pieces of context to answer the question at the end.
If you don't know the answer, just say you don't know. DO NOT try to make up an answer.
If the question is not related to the context, politely respond that you are tuned to only answer questions that are related to the context.

{context}

Question: {question}
Helpful answer in markdown:`;

export async function POST(request: Request) {
	const { question, history } = await request.json();
	// const { question, history } = request.body;

	console.log("question", question);
	console.log("history", history);

	if (!question) {
		return Response.json(
			{ message: "No question in the request" },
			{ status: 200 }
		);
	}

	try {
		if (!process.env.PINECONE_INDEX_NAME) throw Error("no index");
		const index = pinecone.Index(process.env.PINECONE_INDEX_NAME);

		const vectorStore = await PineconeStore.fromExistingIndex(
			new OpenAIEmbeddings({}),
			{
				pineconeIndex: index,
				textKey: "text",
			}
		);

		const model = new ChatOpenAI({
			modelName: "gpt-3.5-turbo",
		});
		const chain = ConversationalRetrievalQAChain.fromLLM(
			model,
			vectorStore.asRetriever(),
			{
				qaTemplate: QA_TEMPLATE,
				questionGeneratorTemplate: CONDENSE_TEMPLATE,
				returnSourceDocuments: true,
				// verbose: true,
			}
		);

		const pastMessages = history.map((message: string, i: number) => {
			if (i % 2 === 0) {
				return new HumanMessage(message);
			} else {
				return new AIMessage(message);
			}
		});

		//Ask a question using chat history
		const response = await chain.call({
			question: question,
			chat_history: pastMessages,
		});

		console.log("response", response);
		return Response.json(response, { status: 200 });
	} catch (e) {
		console.error(e);
	}
}