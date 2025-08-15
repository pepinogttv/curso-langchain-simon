// Ejemplo AVANZADO: Chatbot de soporte técnico con múltiples roles
// Aquí ChatPromptTemplate es IMPRESCINDIBLE

import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatDeepSeek } from "@langchain/deepseek";
import inquirer from "inquirer";

const model = new ChatDeepSeek({
  modelName: "deepseek-chat",
  temperature: 0.3,
  maxTokens: 300,
  apiKey: process.env.DEEPSEEK_API_KEY,
});

// 🎯 ChatPromptTemplate con múltiples roles y contexto dinámico
const supportTemplate = ChatPromptTemplate.fromMessages([
  ["system", "Eres un agente de soporte técnico experto. Tu nombre es {agent_name} y trabajas en el departamento de {department}."],
  ["assistant", "Hola, soy {agent_name} del departamento de {department}. ¿En qué puedo ayudarte hoy?"],
  ["human", "Tengo un problema con mi {product_type}"],
  ["assistant", "Entiendo que tienes problemas con tu {product_type}. Déjame revisar tu información..."],
  ["system", "El cliente {customer_name} tiene un plan {plan_type}. Historial de tickets: {ticket_history}"],
  ["placeholder", "{conversation_history}"],
  ["human", "{current_issue}"]
]);

const supportChain = supportTemplate.pipe(model).pipe(new StringOutputParser());

// Función para simular información del cliente
async function getCustomerInfo() {
  const questions = [
    {
      type: 'input',
      name: 'customer_name',
      message: '¿Cuál es tu nombre?',
      default: 'Juan Pérez'
    },
    {
      type: 'list',
      name: 'product_type',
      message: '¿Con qué producto tienes problemas?',
      choices: ['Laptop', 'Smartphone', 'Router', 'Impresora']
    },
    {
      type: 'list',
      name: 'plan_type',
      message: '¿Qué tipo de plan tienes?',
      choices: ['Básico', 'Premium', 'Enterprise']
    }
  ];
  
  return await inquirer.prompt(questions);
}

// Función principal del soporte técnico
async function startSupportChat() {
  console.log("🏢 Sistema de Soporte Técnico TechCorp\n");
  
  // Obtener información del cliente
  const customerInfo = await getCustomerInfo();
  
  // Información del agente y contexto
  const context = {
    agent_name: "María González",
    department: "Soporte Técnico",
    customer_name: customerInfo.customer_name,
    product_type: customerInfo.product_type,
    plan_type: customerInfo.plan_type,
    ticket_history: "2 tickets resueltos en los últimos 6 meses (conexión wifi, actualización software)"
  };
  
  let conversationHistory = [];
  
  console.log(`\n📋 Cliente: ${context.customer_name}`);
  console.log(`📦 Producto: ${context.product_type}`);
  console.log(`💎 Plan: ${context.plan_type}\n`);
  console.log("💬 Describe tu problema (o escribe 'finalizar' para terminar):\n");
  
  while (true) {
    const { current_issue } = await inquirer.prompt([
      {
        type: 'input',
        name: 'current_issue',
        message: `${context.customer_name}:`,
      }
    ]);
    
    if (current_issue.toLowerCase() === 'finalizar') {
      console.log(`\n🤖 ${context.agent_name}: Gracias por contactarnos, ${context.customer_name}. Que tengas un buen día.`);
      break;
    }
    
    if (current_issue.trim() === '') {
      console.log("⚠️  Por favor, describe tu problema.\n");
      continue;
    }
    
    try {
      console.log(`🤖 ${context.agent_name} está analizando tu caso...`);
      
      // 🌟 Aquí es donde ChatPromptTemplate demuestra su poder:
      // Múltiples roles, contexto dinámico, historial conversacional
      const response = await supportChain.invoke({
        ...context,
        conversation_history: conversationHistory,
        current_issue: current_issue
      });
      
      // Agregar al historial
      conversationHistory.push(["human", current_issue]);
      conversationHistory.push(["assistant", response.trim()]);
      
      console.log(`\n🤖 ${context.agent_name}: ${response.trim()}\n`);
      
    } catch (error) {
      console.error("❌ Error en el sistema:", error.message);
      console.log("🔄 Intenta describir tu problema de nuevo.\n");
    }
  }
}

// Demostración de por qué esto es imposible con PromptTemplate
function explainComplexity() {
  console.log(`
🎯 ¿Por qué este ejemplo REQUIERE ChatPromptTemplate?

❌ PromptTemplate NO puede:
- Manejar múltiples roles (system, assistant, human) en secuencia
- Insertar contexto dinámico en diferentes puntos de la conversación
- Simular una conversación previa entre assistant y human
- Mantener la estructura de mensajes que requieren los LLMs modernos

✅ ChatPromptTemplate SÍ puede:
- Definir un flujo conversacional complejo con múltiples turnos
- Inyectar variables en diferentes tipos de mensajes
- Simular conversaciones previas y contexto histórico
- Mantener roles específicos para cada mensaje
- Crear experiencias conversacionales realistas

🏆 Resultado: Un sistema de soporte que parece real y contextualizado!
  `);
}

// Ejecutar demostración
explainComplexity();
console.log("Presiona Enter para iniciar la simulación de soporte técnico...");
await inquirer.prompt([{ type: 'input', name: 'continue', message: '' }]);

startSupportChat().catch(console.error);
