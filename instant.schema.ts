// Docs: https://www.instantdb.com/docs/modeling-data

import { i } from "@instantdb/react-native";

const _schema = i.schema({
  entities: {
    $files: i.entity({
      path: i.string().unique().indexed(),
      url: i.string(),
    }),
    $users: i.entity({
      email: i.string().unique().indexed().optional(),
      imageURL: i.string().optional(),
      type: i.string().optional(),
    }),
    influencers: i.entity({
      username: i.string().unique().indexed(),
      displayName: i.string(),
      followerCount: i.number(),
      avgViews: i.number(),
      engagementRate: i.number(),
      niche: i.string().indexed(),
      tags: i.string(),
      bio: i.string(),
    }),
    appSubmissions: i.entity({
      appName: i.string(),
      appDescription: i.string(),
      category: i.string(),
      targetAudience: i.string(),
      status: i.string().indexed(),
      createdAt: i.number().indexed(),
    }),
    matchResults: i.entity({
      rank: i.number(),
      score: i.number(),
      reasoning: i.string(),
    }),
  },
  rooms: {},
  links: {
    $usersLinkedPrimaryUser: {
      forward: {
        on: "$users",
        has: "one",
        label: "linkedPrimaryUser",
        onDelete: "cascade",
      },
      reverse: {
        on: "$users",
        has: "many",
        label: "linkedGuestUsers",
      },
    },
    submissionMatches: {
      forward: { on: "appSubmissions", has: "many", label: "matches" },
      reverse: { on: "matchResults", has: "one", label: "submission" },
    },
    matchInfluencer: {
      forward: { on: "matchResults", has: "one", label: "influencer" },
      reverse: { on: "influencers", has: "many", label: "matchResults" },
    },
  },
});

// This helps TypeScript display nicer intellisense
type _AppSchema = typeof _schema;
interface AppSchema extends _AppSchema {}
const schema: AppSchema = _schema;

export type { AppSchema };
export default schema;
