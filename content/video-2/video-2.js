// documentacion relacionada:
// (LangChain Expression Language (LCEL)): https://js.langchain.com/docs/concepts/lcel/
// Runnable Interface: https://js.langchain.com/docs/concepts/runnables
// Prompt Templates: https://js.langchain.com/docs/concepts/prompt_templates
// The Pipe method (how to chain runnables): https://js.langchain.com/docs/how_to/sequence

import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate, PromptTemplate } from "@langchain/core/prompts";
import { RunnableLambda, RunnableSequence } from "@langchain/core/runnables";
import { ChatDeepSeek } from "@langchain/deepseek";

const model = new ChatDeepSeek({
  modelName: "deepseek-chat",
  temperature: 0.5,
  maxTokens: 100,
  apiKey: process.env.DEEPSEEK_API_KEY,
});

const promptTemplate = PromptTemplate.fromTemplate(
  "Traduci esta frase del {language1} al {language2}: {text}. Responde solo y unicamente la traduccion."
);

// sin usar chains / pipe

// console.log(
//   await model.invoke(
//     await promptTemplate.invoke({
//       language1: "es",
//       language2: "en",
//       text: "Hola, como estas?",
//     })
//   )
// );

// usando chains / pipe

// const chain = promptTemplate
//   .pipe(model)
//   .pipe(new StringOutputParser())
//   .pipe(
//     new RunnableLambda({
//       func: async (input) => {
//         return "La traduccion es: " + input;
//       },
//     })
//   );

// console.log(
//   await chain.invoke({
//     language1: "es",
//     language2: "en",
//     text: "Hola, como estas?",
//   })
// );


// ejecutando una secuencia de runnables con RunnableSequence

// const chain = RunnableSequence.from([
//     promptTemplate,
//     model,
//     new StringOutputParser(),
//     new RunnableLambda({
//         func: async (input) => {
//             return "La traduccion es: " + input;
//         }
//     })
// ])




// const chatPromptTemplate = ChatPromptTemplate.fromMessages([
//     ["system", "Sos un traductor de idiomas."],
//     ["user", "Traduce esta frase del {language1} al {language2}: {text}. Responde solo y unicamente la traduccion."]
//   ]);
  