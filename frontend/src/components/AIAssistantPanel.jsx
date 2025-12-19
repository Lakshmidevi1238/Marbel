import { useState } from "react";
import { useAIAssistant, STATES } from "../hooks/useAIAssistant";

export default function AIAssistantPanel({ onConfirmTask }) {
  const [input, setInput] = useState("");

  const { messages, state, handleUserInput, hasPreview } =
    useAIAssistant(onConfirmTask);

  const onSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    handleUserInput(trimmed);
    setInput("");
  };

  return (
    <div className="h-full max-h-[650px] w-full max-w-[540px] flex flex-col  rounded-xl bg-white shadow-lg p-6">
      <h2 className="font-semibold text-lg mb-4">Task Assistant</h2>

      {/* CHAT */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-8 pr-1">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`p-5 rounded-lg text-sm max-w-[85%] leading-relaxed ${
              m.role === "ai"
                ? "bg-gray-100 text-left"
                : "bg-black text-white ml-auto text-right"
            }`}
          >
            {m.text.split("\n").map((line, idx) => (
              <div key={idx}>{line}</div>
            ))}
          </div>
        ))}
      </div>

      {/* INPUT */}
      {state === STATES.CONVERSATION && (
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            className="flex-1 border rounded px-3 py-2 text-sm"
            placeholder={
              hasPreview
                ? "Type “change” to adjust tasks or “yes” to add them…"
                : "List your tasks or answer the question…"
            }
            onKeyDown={e => e.key === "Enter" && onSend()}
          />
          <button onClick={onSend} className="bg-black text-white px-4 rounded">
            Send
          </button>
        </div>
      )}
    </div>
  );
}
