import { z } from "zod";
import * as dotenv from "dotenv";
dotenv.config();

const IssueSchema = z
  .object({
    key: z.string(),
    id: z.string(),
    fields: z.object({
      summary: z.string(),
    }),
  })
  .transform((issue) => {
    const { fields, ...rest } = issue;
    return {
      ...rest,
      title: issue.fields.summary,
    };
  });

const IssuesSchema = z.object({
  issues: z.array(IssueSchema),
});

export const getIssues = async () => {
  const response = await jiraRequest(
    'search?jql=project="KPMG - Funds Automation - Delivery" AND assignee=6271b8502db3080070245a6f AND key = "KPFAD-1003"'
  );
  const data = await response.json();
  return IssuesSchema.parseAsync(data);
};

const jiraRequest = async (
  api: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET"
) => {
  if (!process.env.JIRA) {
    throw new Error("JIRA environment variable not set");
  }

  return fetch(`https://parklaneit.atlassian.net/rest/api/3/${api}`, {
    headers: {
      Authorization: `Basic ${Buffer.from(
        `devinda.senanayaka@parklane.com.au:${process.env.JIRA}`
      ).toString("base64")}`,
      Accept: "application/json",
    },
    method,
  });
};

const MyselfSchema = z.object({
  accountId: z.string(),
  emailAddress: z.string(),
  displayName: z.string(),
});

const getMyself = async () => {
  const response = await jiraRequest("myself");
  const data = await response.json();
  return MyselfSchema.parseAsync(data);
};

export const myself = await getMyself();
