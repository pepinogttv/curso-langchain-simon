import { ChatOpenAI } from "@langchain/openai";

const model = new ChatOpenAI({
    modelName: "gpt-4o",
    temperature: 0.5,
    maxTokens: 100,
    // openAIApiKey: process.env.OPENAI_API_KEY,
})

// const response = await model.invoke("What is the capital of France?")

// console.log(response.content)


// const responseBatch = await model.batch([
//     "What is the capital of France?",
//     "What is the capital of Germany?",
//     "What is the capital of Italy?",
//     "What is the capital of Spain?",
//     "What is the capital of Portugal?",
//     "What is the capital of Greece?",
//     "What is the capital of Turkey?",
//     "What is the capital of Egypt?",
// ])

// console.log(responseBatch)


const streamResponse = await model.stream("What is the capital of France?")

for await (const chunk of streamResponse) {
    console.log(chunk)
}



