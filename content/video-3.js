// https://js.langchain.com/docs/concepts/output_parsers/
// https://js.langchain.com/docs/how_to/#output-parsers (ir a output parsers)
//https://js.langchain.com/docs/how_to/structured_output/#using-jsonoutputparser

import {
    CommaSeparatedListOutputParser,
    StringOutputParser,
    StructuredOutputParser,
    
  } from "@langchain/core/output_parsers";
  import { PromptTemplate } from "@langchain/core/prompts";
  import { ChatDeepSeek } from "@langchain/deepseek";
  import { ChatOpenAI } from "@langchain/openai";
  import { OutputFixingParser } from "langchain/output_parsers";
  import { z } from "zod"
  
  const model = new ChatOpenAI({
    model: "gpt-4.1-nano",
    // model: "deepseek-chat",
    temperature: 0.5,
  });
  
  async function callStringoutParser() {
    const promptTemplate = PromptTemplate.fromTemplate(
      "Quien fue el primer presidente del siguiente pais: {country}?"
    );
    const chain = promptTemplate.pipe(model).pipe(new StringOutputParser());
    return await chain.invoke({ country: "colombia" });
  }
  
  async function callCommaSeparatedListOutputParser() {
    const promptTemplate = PromptTemplate.fromTemplate(
      "Responde unicamente con una lista de ingredientes separada por coma de la siguiente comida: {food}."
    );
    // .split(',')
  
    const chain = promptTemplate
      .pipe(model)
      .pipe(new CommaSeparatedListOutputParser());
  
    return await chain.invoke({
      food: "milanesa de pollo argentina",
    });
  }
  
  async function callStructuredOutputParser() {
    const promptTemplate = PromptTemplate.fromTemplate(
      `Analiza este mensaje de un usuario: {message}. Responde en el siguiente formato: {format_instructions}`
    );
    const parser = StructuredOutputParser.fromNamesAndDescriptions({
      nombre: "el primer nombre de la persona",
      apellido: "el apellido de la persona",
      edad: "la edad de la persona",
    });
  
    const partialedPrompt = await promptTemplate.partial({
      format_instructions: parser.getFormatInstructions(),
    });
  
    console.log(parser.getFormatInstructions());
  
    const chain = partialedPrompt.pipe(model).pipe(parser);
  
    return await chain.invoke({
      message: "Hola mi nombre es Juan Cruz y tengo 34 anios",
    });
  }
  
  async function callStructuredOutputParserZod() {
    const promptTemplate = PromptTemplate.fromTemplate(
      `Analiza detalladamente este mensaje de un usuario y extrae toda la información posible: 
  
  MENSAJE DEL USUARIO: {message}
  
  Instrucciones:
  - Extrae información personal, profesional, preferencias y contexto del mensaje
  - Si no encuentras cierta información, marca esos campos como null o usa valores por defecto
  - Analiza el sentimiento y la intención del mensaje
  - Determina qué tan confiable es la extracción de información (0.0 a 1.0)
  - Lista qué campos específicos pudiste detectar en el mensaje
  
  FORMATO DE RESPUESTA:
  {format_instructions}`
    );
  
    const zodSchema = z.object({
      // Información personal básica
      nombre: z.string().min(1, "El nombre es requerido"),
      apellido: z.string().min(1, "El apellido es requerido"),
      edad: z.number().int().min(0).max(120, "Edad debe estar entre 0 y 120 años"),
      
      // Información de contacto
      contacto: z.object({
        email: z.string().email("Debe ser un email válido").optional(),
        telefono: z.string().regex(/^\+?[\d\s\-\(\)]{7,15}$/, "Formato de teléfono inválido").optional(),
        pais: z.string().min(2, "País debe tener al menos 2 caracteres").optional(),
        ciudad: z.string().optional()
      }).optional(),
      
      // Preferencias y características
      preferencias: z.object({
        idiomas: z.array(z.enum(["español", "inglés", "portugués", "francés", "alemán", "italiano", "otro"])).default([]),
        intereses: z.array(z.string()).max(10, "Máximo 10 intereses").default([]),
        nivel_experiencia: z.enum(["principiante", "intermedio", "avanzado", "experto"]).optional(),
        disponibilidad: z.enum(["mañana", "tarde", "noche", "fin_de_semana", "flexible"]).optional()
      }).optional(),
      
      // Información profesional
      perfil_profesional: z.object({
        profesion: z.string().optional(),
        empresa: z.string().optional(),
        años_experiencia: z.number().int().min(0).max(60).optional(),
        sector: z.enum([
          "tecnología", "educación", "salud", "finanzas", "marketing", 
          "ventas", "recursos_humanos", "ingeniería", "diseño", "otro"
        ]).optional(),
        habilidades: z.array(z.string()).max(15, "Máximo 15 habilidades").default([])
      }).optional(),
      
      // Metadata del análisis
      analisis_sentimiento: z.enum(["positivo", "neutral", "negativo"]).optional(),
      confianza_extraccion: z.number().min(0).max(1, "Confianza debe estar entre 0 y 1").optional(),
      campos_detectados: z.array(z.string()).default([]),
      
      // Información adicional extraída
      contexto_mensaje: z.object({
        intencion: z.enum(["presentacion", "consulta", "queja", "solicitud", "otro"]).optional(),
        urgencia: z.enum(["baja", "media", "alta"]).optional(),
        requiere_seguimiento: z.boolean().default(false)
      }).optional()
    })
  
    const parser = StructuredOutputParser.fromZodSchema(zodSchema)
  
    const partialedPrompt = await promptTemplate.partial({
      format_instructions: parser.getFormatInstructions(),
    });
  
    console.log(parser.getFormatInstructions());
  
    const chain = partialedPrompt.pipe(model).pipe(parser);
  
    return await chain.invoke({
      message: "¡Hola! Mi nombre es María Elena Rodríguez, tengo 28 años y soy desarrolladora frontend senior en TechCorp Argentina. Llevo 5 años trabajando en el sector tecnológico, principalmente con React, JavaScript y diseño UX/UI. Mi email corporativo es maria.rodriguez@techcorp.com y mi celular es +54 11 4567-8901. Vivo en Buenos Aires pero trabajo remoto para clientes internacionales. Domino español nativo, inglés avanzado y estoy aprendiendo portugués para expandir al mercado brasileño. Me apasionan las nuevas tecnologías, especialmente IA, blockchain y desarrollo mobile. Tengo habilidades en Node.js, TypeScript, Figma y metodologías ágiles. Generalmente estoy disponible por las tardes y fines de semana para proyectos freelance. Estoy muy entusiasmada porque quiero colaborar en proyectos innovadores que tengan impacto social. ¿Podrían contactarme urgentemente para discutir una oportunidad laboral?",
    });
  }
  
  async function callStructuredOutputParserWithFixing(){
    const zodSchema = z.object({
      name: z.string().describe("name of an actor"),
      film_names: z
        .array(z.string())
        .describe("list of names of films they starred in"),
    });
    const parser = StructuredOutputParser.fromZodSchema(zodSchema);
    
    // fake wrong response 
    const misformatted = "{'name': 'Tom Hanks', 'film_names': ['Forrest Gump']}";
    // await parser.parse(misformatted);
  
    const parserWithFix = OutputFixingParser.fromLLM(model, parser);
    
    // OutputFixingParser
    return await parserWithFix.parse(misformatted);
  
  
  }
  
  // const response = await callStringoutParser();
  // const response = await callCommaSeparatedListOutputParser();
  // const response = await callStructuredOutputParser();
  // const response = await callStructuredOutputParserZod();
  const response = await callStructuredOutputParserWithFixing()
  console.log(response);
  