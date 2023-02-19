import { select, text } from "@clack/prompts";
import {} from "@clack/core";
import {
  isEqual,
  isMonday,
  lightFormat,
  nextFriday,
  nextThursday,
  nextTuesday,
  nextWednesday,
  parse,
  startOfWeek,
} from "date-fns";
import { Worklog } from "./worklog.js";

export class Week {
  #monday?: Date;

  static #startOfWeek = startOfWeek(new Date(), {
    weekStartsOn: 1,
  });
  #workTime = 40;
  worklogs: Worklog[] = [];

  constructor() {}

  public async init() {
    const date = await text({
      message: "Start of Week (YYYY-MM-DD)",
      placeholder: lightFormat(Week.#startOfWeek, "yyyy-MM-dd"),
      initialValue: lightFormat(Week.#startOfWeek, "yyyy-MM-dd"),
      validate: (value) => {
        if (value === "") return "Please enter a date";
        const date = parse(value, "yyyy-MM-dd", new Date());
        if (!isMonday(date)) {
          return "Week must start on a Monday";
        }
      },
    });

    this.#monday = parse(date, "yyyy-MM-dd", new Date());
  }

  public addWorklog(worklog: Worklog) {
    this.worklogs.push(worklog);
    this.#workTime -= worklog.hours;
    this.print();
  }

  get remainingWorkTime() {
    return this.#workTime;
  }

  public print() {
    const mondayLogs = this.worklogs.filter((worklog) =>
      isEqual(worklog.startDate, this.monday)
    );
    const tuesdayLogs = this.worklogs.filter((worklog) =>
      isEqual(worklog.startDate, this.tuesday)
    );
    const wednesdayLogs = this.worklogs.filter((worklog) =>
      isEqual(worklog.startDate, this.wednesday)
    );
    const thursdayLogs = this.worklogs.filter((worklog) =>
      isEqual(worklog.startDate, this.thursday)
    );
    const fridayLogs = this.worklogs.filter((worklog) =>
      isEqual(worklog.startDate, this.friday)
    );

    console.table({
      Monday: mondayLogs.map(
        (worklog) => `${worklog.description} - ${worklog.hours}`
      ),
      Tuesday: tuesdayLogs.map(
        (worklog) => `${worklog.description} - ${worklog.hours}`
      ),
      Wednesday: wednesdayLogs.map(
        (worklog) => `${worklog.description} - ${worklog.hours}`
      ),
      Thursday: thursdayLogs.map(
        (worklog) => `${worklog.description} - ${worklog.hours}`
      ),
      Friday: fridayLogs.map(
        (worklog) => `${worklog.description} - ${worklog.hours}`
      ),
    });
  }

  public pushWorklogs() {
    return Promise.all(this.worklogs.map((worklog) => worklog.push()));
  }

  async getDay() {
    const monday = this.formatDay(this.monday);
    const tuesday = this.formatDay(this.tuesday);
    const wednesday = this.formatDay(this.wednesday);
    const thursday = this.formatDay(this.thursday);
    const friday = this.formatDay(this.friday);

    const response = await select({
      message: "Select a day",
      options: [
        { value: monday, label: "Monday", hint: `${monday}` },
        { value: tuesday, label: "Tuesday", hint: `${tuesday}` },
        {
          value: wednesday,
          label: "Wednesday",
          hint: `${wednesday}`,
        },
        { value: thursday, label: "Thursday", hint: `${thursday}` },
        { value: friday, label: "Friday", hint: `${friday}` },
      ],
    });
    return parse(String(response), "yyyy-MM-dd", new Date());
  }

  formatDay(day: Date) {
    return lightFormat(day, "yyyy-MM-dd");
  }

  get monday() {
    if (this.#monday === undefined) {
      throw new Error("Week not initialised");
    }
    return this.#monday;
  }

  get tuesday() {
    if (this.#monday === undefined) {
      throw new Error("Week not initialised");
    }
    return nextTuesday(this.#monday);
  }

  get wednesday() {
    if (this.#monday === undefined) {
      throw new Error("Week not initialised");
    }
    return nextWednesday(this.#monday);
  }

  get thursday() {
    if (this.#monday === undefined) {
      throw new Error("Week not initialised");
    }
    return nextThursday(this.#monday);
  }

  get friday() {
    if (this.#monday === undefined) {
      throw new Error("Week not initialised");
    }
    return nextFriday(this.#monday);
  }
}
