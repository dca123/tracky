import { lightFormat } from "date-fns";
import { myself } from "./jira.js";
import { tempoRequest } from "./tempo.js";

export class Worklog {
  authorAccountId: string;
  issueId: number;
  startDate: Date;
  startTime: string;
  timeSpentSeconds: number;
  description: string;
  acccount: string;

  constructor({
    issueId,
    startDate,
    timeSpentSeconds,
    description,
    acccount = "KPMG-FUNDS",
    startTime = "08:00:00",
  }: {
    issueId: number;
    startDate: Date;
    timeSpentSeconds: number;
    description: string;
    acccount?: "KPMG-FUNDS" | "INTERNAL";
    startTime?: string;
  }) {
    this.authorAccountId = myself.accountId;
    this.issueId = issueId;
    this.startDate = startDate;
    this.startTime = startTime;
    this.timeSpentSeconds = timeSpentSeconds;
    this.description = description;
    this.acccount = acccount;
  }

  get hours() {
    return this.timeSpentSeconds / 60 / 60;
  }

  public async push() {
    const log = await tempoRequest("worklogs", "POST", {
      authorAccountId: myself.accountId,
      issueId: this.issueId,
      startDate: lightFormat(this.startDate, "yyyy-MM-dd"),
      startTime: this.startTime,
      timeSpentSeconds: this.timeSpentSeconds,
      description: this.description,
      attributes: [
        {
          key: "_Account_",
          value: this.acccount,
        },
      ],
    });
    console.log(await log.json());
  }
}

export class InternalTechnicalWorklog extends Worklog {
  constructor({
    startDate,
    timeSpentSeconds,
    description,
  }: {
    startDate: Date;
    timeSpentSeconds: number;
    description: string;
  }) {
    super({
      issueId: 11855,
      startDate,
      timeSpentSeconds,
      description,
      acccount: "INTERNAL",
    });
  }
}
