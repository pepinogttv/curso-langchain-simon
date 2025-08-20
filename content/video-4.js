import { PromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { createRetrievalChain } from "langchain/chains/retrieval";

// MemoryVectorStore

const loader = new CheerioWebBaseLoader(
  "https://js.langchain.com/docs/concepts/lcel/"
);
const [bigDocument] = await loader.load();

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 200,
  chunkOverlap: 20,
});

const splittedDocs = await splitter.splitDocuments([bigDocument]);

const model = new ChatOpenAI({
  model: "gpt-3.5-turbo",
  temperature: 0.7,
});

const promptTemplate = PromptTemplate.fromTemplate(
  `Responde la pregunta del usuario: 
    Contexto: {context}.
    Question: {input}.
    `
);

const chain = await createStuffDocumentsChain({
  llm: model,
  prompt: promptTemplate,
});


const embeddings = new OpenAIEmbeddings();
const vectorStore = await MemoryVectorStore.fromDocuments(
    splittedDocs,
    embeddings
)

const retrievalChain = await createRetrievalChain({
    combineDocsChain: chain,
    retriever: vectorStore.asRetriever({ k: 3 })
})

console.log(
    await retrievalChain.invoke({
        input: "Should I use LCEL??",
    })
)