# RuleMaster AI

RuleMaster AI is an advanced, multi-agent chatbot designed to resolve board game rule disputes with high precision. By employing a "swarm" of specialized AI agents, the application cross-references multiple interpretations and verifies them against uploaded rulebook PDFs to ensure your game night stays on track and argument-free.

## Core Features

- **Swarm Intelligence**: Uses a sophisticated "Scholar-Sceptic-Auditor" pattern to process queries.
- **PDF Grounding**: Upload official rulebook PDFs to provide a "ground truth" for the AI agents.
- **Transparent Reasoning**: A dedicated "Agent Thinking" sidebar visualizes the internal verification process in real-time.
- **Iterative Accuracy**: The system automatically iterates up to 3 times if the Auditor agent detects inconsistencies or missing details.
- **Adaptive UI**: Collapsible sidebar and responsive design optimized for mobile use during actual gameplay sessions.

## The Agent Pattern

1.  **Agent A (The Scholar)**: Focuses on drafting a direct, helpful answer to the user's question.
2.  **Agent B (The Sceptic)**: Actively searches for rare exceptions, keywords, or edge cases that might contradict a standard interpretation.
3.  **Agent C (The Auditor)**: Acts as the final judge. It compares the Scholar's draft and Sceptic's findings against the PDF (if provided) and either verifies the response or sends it back for refinement.

## 🔮 Future Roadmap

- **Local LLM Support**: Integration with local inference engines (like WebLLM or Ollama) to provide near-instant responses and 100% offline functionality for remote gaming locations.
- **Multi-PDF Libraries**: Support for uploading entire game libraries (Core sets + Expansions) into a single searchable context.
- **Visual Context**: Camera integration to allow players to take photos of card text or board states for situational rule clarification.
- **Voice Interaction**: A hands-free mode using Gemini's native audio capabilities so players don't have to put down their components to ask questions.
- **Rulebook Highlighting**: Automatically point users to the exact page and paragraph in the PDF where the rule was found.

## Technical Implementation

- **Framework**: React 19 with TypeScript.
- **Styling**: Tailwind CSS for a modern, dark-themed aesthetic.
- **LLM Engine**: Google Gemini 3 (Pro for reasoning, Flash for speed).
- **Icons**: Heroicons.

---

*Designed for gamers who want to spend more time playing and less time debating the rulebook.*