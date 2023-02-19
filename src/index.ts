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
dotenv.config();

intro("Welcome to Tracky !");
let timeToAllocate = 40;

const defaultStartOfWeek = startOfWeek(new Date(), {
  weekStartsOn: 1,
});

class Week {
  #monday?: Date;
  #tuesday?: Date;
  #wednesday?: Date;
  #thursday?: Date;
  #friday?: Date;

  constructor() {}

  public async init() {
    const date = await text({
      message: "Start of Week (YYYY-MM-DD)",
      placeholder: lightFormat(defaultStartOfWeek, "yyyy-MM-dd"),
      initialValue: lightFormat(defaultStartOfWeek, "yyyy-MM-dd"),
      validate: (value) => {
        const date = parse(value, "yyyy-MM-dd", new Date());
        if (!isMonday(date)) {
          return "Week must start on a Monday";
        }
      },
    });

    this.#monday = parse(String(date), "yyyy-MM-dd", new Date());
    this.#tuesday = nextTuesday(this.#monday);
    this.#wednesday = nextWednesday(this.#monday);
    this.#thursday = nextThursday(this.#monday);
    this.#friday = nextFriday(this.#monday);
  }

  get monday() {
    if (this.#monday === undefined) {
      throw new Error("Week not initialised");
    }
    return lightFormat(this.#monday, "yyyy-MM-dd");
  }

  get tuesday() {
    if (this.#tuesday === undefined) {
      throw new Error("Week not initialised");
    }
    return lightFormat(this.#tuesday, "yyyy-MM-dd");
  }

  get wednesday() {
    if (this.#wednesday === undefined) {
      throw new Error("Week not initialised");
    }
    return lightFormat(this.#wednesday, "yyyy-MM-dd");
  }

  get thursday() {
    if (this.#thursday === undefined) {
      throw new Error("Week not initialised");
    }
    return lightFormat(this.#thursday, "yyyy-MM-dd");
  }

  get friday() {
    if (this.#friday === undefined) {
      throw new Error("Week not initialised");
    }
    return lightFormat(this.#friday, "yyyy-MM-dd");
  }
}

const week = new Week();
await week.init();

while (timeToAllocate > 0) {
  console.log("Time to allocate: " + green(timeToAllocate));

  const { issues } = await getIssues();

  const issue = await select({
    message: "Select an issue",
    options: issues.map((issue) => ({
      value: issue.id,
      label: issue.title,
      hint: issue.title,
    })),
  });

  const day = await select({
    message: "Select a day",
    options: [
      { value: week.monday, label: "Monday", hint: `${week.monday}` },
      { value: week.tuesday, label: "Tuesday", hint: `${week.tuesday}` },
      { value: week.wednesday, label: "Wednesday", hint: `${week.wednesday}` },
      { value: week.thursday, label: "Thursday", hint: `${week.thursday}` },
      { value: week.friday, label: "Friday", hint: `${week.friday}` },
    ],
  });

  const hours = await text({
    message: "How many hours?",
  });

  const description = await text({
    message: "What did you do?",
  });

  const s = spinner();

  s.start("Creating worklog");
  await createWorklog({
    description: String(description),
    issueId: Number(issue),
    startDate: String(day),
    timeSpentSeconds: Number(hours) * 60 * 60,
  });
  s.stop();

  timeToAllocate -= Number(hours);
}

outro("Goodbye, see you next week !");
