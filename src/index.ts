import { intro, outro, select, note, text, spinner } from "@clack/prompts";
import { getIssues } from "./jira";
import { green } from "kolorist";
import {
  format,
  formatISO,
  isMonday,
  lightFormat,
  nextFriday,
  nextThursday,
  nextTuesday,
  nextWednesday,
  parse,
  startOfWeek,
} from "date-fns";
import * as dotenv from "dotenv";
import { createWorklog } from "./tempo.js";
import { Week } from "./week.js";
import { InternalTechnicalWorklog, Worklog } from "./worklog.js";
import { getDescription, getTimeSpentSeconds } from "./steps.js";
dotenv.config();

intro("Welcome to Tracky !");

const defaultStartOfWeek = startOfWeek(new Date(), {
  weekStartsOn: 1,
});

const week = new Week();
await week.init();

while (week.remainingWorkTime > 0) {
  console.log("Time to allocate: " + green(week.remainingWorkTime));

  const startDate = await week.getDay();

  const project = await select({
    message: "Select a project",
    initialValue: "KPMG",
    options: [
      { value: "KPMG", label: "KPMG", hint: "KPMG" },
      { value: "INT", label: "INTERNAL", hint: "INTERNAL" },
    ],
  });

  if (typeof project === "symbol") {
    outro("wtf is happening");
    break;
  }

  if (project === "INT") {
    const description = await getDescription();
    const timeSpentSeconds = await getTimeSpentSeconds();

    const worklog = new InternalTechnicalWorklog({
      description,
      startDate,
      timeSpentSeconds,
    });

    week.addWorklog(worklog);
    continue;
  }

  const s = spinner();
  s.start("Fetching issues");
  const { issues } = await getIssues();
  s.stop();

  const issue = await select({
    message: "Select an issue",
    options: issues.map((issue) => ({
      value: issue.id,
      label: issue.title,
      hint: issue.title,
    })),
  });

  const description = await getDescription();
  const timeSpentSeconds = await getTimeSpentSeconds();

  const worklog = new Worklog({
    description,
    issueId: Number(issue),
    startDate,
    timeSpentSeconds: timeSpentSeconds,
  });

  week.addWorklog(worklog);
}

const s = spinner();
s.start("Creating worklogs");
await week.pushWorklogs();
s.stop();

outro("Goodbye, see you next week !");
