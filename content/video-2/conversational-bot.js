// Ejemplo donde ChatPromptTemplate es superior a PromptTemplate
// Caso de uso: Chatbot con memoria conversacional

import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatDeepSeek } from "@langchain/deepseek";
import inquirer from "inquirer";

const model = new ChatDeepSeek({
  modelName: "deepseek-chat",
  temperature: 0.7,
  maxTokens: 200,
  apiKey: process.env.DEEPSEEK_API_KEY,
});

// 🌟 ChatPromptTemplate permite manejar múltiples tipos de mensajes
// y mantener el contexto conversacional
const conversationalTemplate = ChatPromptTemplate.fromMessages([
  ["system", "Eres un asistente personal amigable llamado Alex. Tienes personalidad divertida y recuerdas todo lo que el usuario te dice durante la conversación. Siempre haces referencias a conversaciones anteriores cuando es relevante."],
  // ⭐ Esta es la clave: podemos agregar mensajes dinámicamente al historial
  ["placeholder", "{chat_history}"],
  ["human", "{input}"]
]);

// Crear la cadena de procesamiento
const conversationChain = conversationalTemplate.pipe(model).pipe(new StringOutputParser());

// Array para mantener el historial de la conversación
let chatHistory = [];

// Función para agregar mensajes al historial
function addToHistory(role, content) {
  chatHistory.push([role, content]);
}

// Función principal del chat conversacional
async function startConversationalChat() {
  console.log("🤖 ¡Hola! Soy Alex, tu asistente personal con memoria.\n");
  console.log("💭 Puedo recordar todo lo que hablemos en esta sesión.\n");
  console.log("💬 Escribe 'salir' para terminar la conversación.\n");
  
  while (true) {
    const { input } = await inquirer.prompt([
      {
        type: 'input',
        name: 'input',
        message: 'Tú:',
      }
    ]);
    
    if (input.toLowerCase() === 'salir') {
      console.log("🤖 Alex: ¡Fue genial hablar contigo! Espero que nos veamos pronto. 👋");
      break;
    }
    
    if (input.trim() === '') {
      console.log("⚠️  Por favor, escribe algo para continuar la conversación.\n");
      continue;
    }
    
    try {
      console.log("🤖 Alex está pensando...");
      
      // ⭐ Aquí es donde ChatPromptTemplate brilla:
      // Pasamos todo el historial de la conversación
      const response = await conversationChain.invoke({
        chat_history: chatHistory,
        input: input
      });
      
      // Agregar la pregunta del usuario y la respuesta del bot al historial
      addToHistory("human", input);
      addToHistory("assistant", response.trim());
      
      console.log(`🤖 Alex: ${response.trim()}\n`);
      
    } catch (error) {
      console.error("❌ Error en la conversación:", error.message);
      console.log("🔄 Intenta de nuevo.\n");
    }
  }
}

// Función para demostrar por qué PromptTemplate NO funcionaría aquí
function explainWhyPromptTemplateWouldntWork() {
  console.log(`
🎯 ¿Por qué ChatPromptTemplate es superior aquí?

❌ Con PromptTemplate:
- Solo maneja un string simple
- No puede estructurar conversaciones con roles (system, human, assistant)
- No puede insertar historial dinámico de mensajes
- Perdería todo el contexto conversacional

✅ Con ChatPromptTemplate:
- Maneja múltiples tipos de mensajes (system, human, assistant)
- El placeholder {chat_history} permite insertar mensajes dinámicamente
- Mantiene la estructura conversacional que los LLM necesitan
- El modelo entiende el contexto completo de la conversación

🧠 Resultado: El bot recuerda todo y puede hacer referencias a conversaciones anteriores!
  `);
}

// Mostrar explicación y luego iniciar el chat
explainWhyPromptTemplateWouldntWork();
console.log("Presiona Enter para comenzar la demostración...");
await inquirer.prompt([{ type: 'input', name: 'continue', message: '' }]);

startConversationalChat().catch(console.error);
