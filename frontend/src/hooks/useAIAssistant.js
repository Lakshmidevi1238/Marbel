import { useState } from "react";
import { getAISuggestion } from "../services/aiSuggestionService";
import { parseAISummary } from "../utils/parseAISummary";

/* -------- STATES -------- */
export const STATES = {
  CONVERSATION: "conversation",
};

/* -------- INTENT DETECTION -------- */
function detectIntent(text) {
  const t = text.toLowerCase().trim();

  if (
    t.includes("too many") ||
    t.includes("dont know") ||
    t.includes("don't know") ||
    t.includes("stuck") ||
    t.includes("overwhelmed")
  )
    return "OVERWHELMED";

  if (
    t.includes("change") ||
    t.includes("edit") ||
    t.includes("move") ||
    t.includes("swap")
  )
    return "EDIT";

  if (
  t === "yes" ||
  t === "ok" ||
  t === "okay" ||
  t === "y" ||
  t.includes("looks good") ||
  t.includes("looks perfect") ||
  t.includes("add it") ||
  t.includes("add them")
) return "YES";


  return "NORMAL";
}

export function useAIAssistant(onConfirmTask) {
  const [state] = useState(STATES.CONVERSATION);

  const [messages, setMessages] = useState([
    {
      role: "ai",
      text:
        "Hi. Tell me all your tasks or what is confusing you. I’ll help sort them into High, Medium and Low.",
    },
  ]);

  // full text conversation (for summary calls)
  const [conversationText, setConversationText] = useState("");

  // latest structured preview text from AI (High/Medium/Low list)
  const [latestSummary, setLatestSummary] = useState("");

  const addAI = text =>
    setMessages(m => [...m, { role: "ai", text: text.trim() }]);

  const addUser = text =>
    setMessages(m => [...m, { role: "user", text: text.trim() }]);

  const handleUserInput = async input => {
    if (!input.trim()) return;

    addUser(input);
    setConversationText(prev =>
      (prev ? prev + "\n" : "") + input.trim()
    );

    const intent = detectIntent(input);

    /* ---- USER IS OVERWHELMED OR FIRST BIG DUMP OF TASKS ---- */
    if (intent === "OVERWHELMED" || !latestSummary) {
      // short acknowledgement
      const empathy = await getAISuggestion(input, "overwhelmed");
      if (empathy) addAI(empathy);

      // create / refresh preview or ask clarify question
      const summary = await getAISuggestion(
        conversationText + "\n" + input,
        "summary"
      );

      if (summary) {
        setLatestSummary(summary);
        addAI(summary);
      }
      return;
    }

    /* ---- USER EDITS PREVIEW ---- */
    if (intent === "EDIT" && latestSummary) {
      const edited = await getAISuggestion(
        latestSummary + "\nUser change: " + input,
        "edit"
      );

      if (edited) {
        setLatestSummary(edited);
        addAI(edited);
      }
      return;
    }

    /* ---- FINAL YES → ADD TO FRONTEND TASK PANEL ---- */
    if (intent === "YES" && latestSummary) {
      const tasks = parseAISummary(latestSummary);

      tasks.forEach(t => {
        onConfirmTask(t.text, t.priority);
      });

      addAI(
        "Done. Your tasks are in the panel. You can tweak them there anytime."
      );

      setConversationText("");
      setLatestSummary("");
      return;
    }

    // NORMAL follow‑ups: refresh summary or answer clarifying question
    // Look at last AI message; if it was a question, don't resend it
    const lastAi = [...messages].reverse().find(m => m.role === "ai");
    const wasClarifyingQuestion =
      lastAi &&
      lastAi.text.endsWith("?") &&
      !lastAi.text.includes("High (do now)");

    const inputForSummary = wasClarifyingQuestion
      ? conversationText.replace(lastAi.text, "") // strip last question text
      : conversationText;

    const refreshed = await getAISuggestion(inputForSummary, "summary");
    if (refreshed) {
      setLatestSummary(refreshed);
      addAI(refreshed);
    }
  };

  return {
    messages,
    state,
    handleUserInput,
    hasPreview: !!latestSummary,
  };
}
