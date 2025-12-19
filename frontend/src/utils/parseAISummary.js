export function parseAISummary(text) {
  if (!text) return [];

  const lines = text.split("\n");
  let currentPriority = null;
  const tasks = [];

  for (let line of lines) {
    const l = line.trim();

    if (l.toLowerCase().startsWith("high")) {
      currentPriority = "high";
    } else if (l.toLowerCase().startsWith("medium")) {
      currentPriority = "medium";
    } else if (l.toLowerCase().startsWith("low")) {
      currentPriority = "low";
    } else if (l.startsWith("-") && currentPriority) {
      const taskText = l.replace("-", "").trim();

      // NEW: ignore placeholder bullets
      if (
        !taskText ||
        taskText.toLowerCase() === "no tasks" ||
        taskText.toLowerCase() === "none"
      ) {
        continue;
      }

      tasks.push({
        text: taskText,
        priority: currentPriority,
      });
    }
  }

  return tasks;
}
