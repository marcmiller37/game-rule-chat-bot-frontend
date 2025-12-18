
import { GoogleGenAI } from "@google/genai";
import { type RuleFile } from "./types";

const MODEL_PRO = 'gemini-3-pro-preview';
const MODEL_FLASH = 'gemini-3-flash-preview';

export const callGemini = async (
  prompt: string,
  model: string = MODEL_PRO,
  ruleFile?: RuleFile
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const contents: any[] = [{ text: prompt }];
  
  if (ruleFile) {
    contents.unshift({
      inlineData: {
        data: ruleFile.base64,
        mimeType: ruleFile.mimeType
      }
    });
  }

  const response = await ai.models.generateContent({
    model: model,
    contents: { parts: contents },
  });

  return response.text || "I'm sorry, I couldn't generate a response.";
};

export const processBoardGameQuery = async (
  query: string,
  ruleFile: RuleFile | null,
  onLog: (log: string) => void
): Promise<string> => {
  let currentIteration = 1;
  const maxIterations = 3;
  let finalAnswer = "";
  let feedback = "";

  while (currentIteration <= maxIterations) {
    const iterationLabel = `Iteration ${currentIteration}: `;
    onLog(`${iterationLabel}Parallel Analysis Initiated...`);

    // Agent A & B in parallel
    const [draftA, draftB] = await Promise.all([
      (async () => {
        onLog(`Agent A (Scholar): Drafting targeted answer...`);
        const promptA = `As an expert board game rules scholar, answer ONLY this question: "${query}". Do not add extra rules unless they are strictly necessary to answer the question. ${feedback ? `Fix these issues from previous audit: ${feedback}` : ""} Be concise. ${ruleFile ? "Base your answer on the provided rulebook." : "Since no rulebook is provided, answer based on your standard knowledge of this game."}`;
        return callGemini(promptA, MODEL_PRO, ruleFile || undefined);
      })(),
      (async () => {
        onLog(`Agent B (Sceptic): Stress-testing for exceptions...`);
        const promptB = `You are a rules tester. For the question "${query}", identify if there are any rare exceptions or edge cases that contradict a standard interpretation. Answer briefly. ${ruleFile ? "Check the provided rulebook." : "Use your internal knowledge."}`;
        return callGemini(promptB, MODEL_FLASH, ruleFile || undefined);
      })()
    ]);

    // Agent C: The Auditor
    const auditorSource = ruleFile ? "rulebook PDF" : "general ruleset knowledge";
    onLog(`Agent C (Auditor): Cross-referencing ${auditorSource} for precision...`);
    
    const auditorPrompt = `
      You are a meticulous rulebook auditor. 
      User Question: "${query}"
      Scholar's Draft: "${draftA}"
      Sceptic's Analysis: "${draftB}"
      
      Instructions:
      1. ${ruleFile ? "Check the Scholar's draft against the uploaded rulebook PDF." : "Check the Scholar's draft against your best internal knowledge of this board game's rules."}
      2. If the Scholar's draft is 100% accurate AND ONLY answers the question without fluff, respond with "VERIFIED: " followed by the final answer.
      3. If it is wrong, incomplete, or contains irrelevant extra rules, respond with "REJECTED: [Reason]" followed by what needs to change.
    `;
    const auditResult = await callGemini(auditorPrompt, MODEL_PRO, ruleFile || undefined);

    if (auditResult.startsWith("VERIFIED:")) {
      onLog(`Auditor: Response verified against ${auditorSource}. Success.`);
      finalAnswer = auditResult.replace("VERIFIED:", "").trim();
      break;
    } else {
      const reason = auditResult.replace("REJECTED:", "").split('\n')[0].trim();
      onLog(`Auditor: REJECTED - ${reason}`);
      feedback = auditResult.replace("REJECTED:", "").trim();
      currentIteration++;
      
      if (currentIteration > maxIterations) {
        onLog("System: Convergence failed. Synthesizing best effort...");
        const finalPrompt = `Strictly answer the question: "${query}". Use these verified components: ${draftA} while correcting for these errors: ${feedback}. Ensure the answer is concise and directly addresses only the user's question.`;
        finalAnswer = await callGemini(finalPrompt, MODEL_PRO, ruleFile || undefined);
      }
    }
  }

  return finalAnswer;
};
