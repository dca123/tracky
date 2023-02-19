import { myself } from "./jira.js";

export const createWorklog = async ({
  issueId,
  startDate,
  startTime = "08:00:00",
  timeSpentSeconds,
  description,
}: {
  issueId: number;
  startDate: string;
  startTime?: string;
  timeSpentSeconds: number;
  description: string;
}) => {
  const log = await tempoRequest("worklogs", "POST", {
    authorAccountId: myself.accountId,
    issueId,
    startDate,
    startTime,
    timeSpentSeconds,
    description,
    attributes: [
      {
        key: "_Account_",
        value: "KPMG-FUNDS",
      },
    ],
  });
  console.log(await log.json());
};

const tempoRequest = async (
  api: "worklogs",
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  body?: any
) => {
  if (!process.env.TEMPO) {
    throw new Error("TEMP environment variable not set");
  }
  return fetch(`https://api.tempo.io/4/${api}`, {
    headers: {
      Authorization: `Bearer ${process.env.TEMPO}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    method,
    body: JSON.stringify(body),
  });
};
