import { select, text } from "@clack/prompts";
import { Week } from "./week.js";

class StepCache {
  description?: string;
  timeSpentSeconds?: string;

  constructor() {}
}
const cache = new StepCache();

export const getDescription = async () => {
  const result = await text({
    message: "What did you do?",
    initialValue: cache.description,
    validate: (value) => {
      if (value === "") return "Please enter a description";
    },
  });
  cache.description = result;
  return result;
};

export const getTimeSpentSeconds = async () => {
  const result = await text({
    message: "How many hours?",
    initialValue: cache.timeSpentSeconds,
    validate: (value) => {
      if (value === "" || isNaN(Number(value))) return "Please enter a number";
    },
  });
  cache.timeSpentSeconds = result;

  return Number(result) * 60 * 60;
};
