export interface InfluencerData {
  id: string;
  username: string;
  displayName: string;
  followerCount: number;
  avgViews: number;
  engagementRate: number;
  niche: string;
  tags: string;
  bio: string;
}

export interface RankedMatch {
  influencerId: string;
  rank: number;
  score: number;
  reasoning: string;
}

export async function rankInfluencers(
  appName: string,
  appDescription: string,
  category: string,
  targetAudience: string,
  influencers: InfluencerData[]
): Promise<RankedMatch[]> {
  const apiKey = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("EXPO_PUBLIC_ANTHROPIC_API_KEY is not set in .env");

  const influencerList = influencers
    .map(
      (inf) =>
        `ID: ${inf.id}
Username: @${inf.username}
Display Name: ${inf.displayName}
Followers: ${inf.followerCount.toLocaleString()}
Avg Views: ${inf.avgViews.toLocaleString()}
Engagement Rate: ${inf.engagementRate}%
Niche: ${inf.niche}
Tags: ${inf.tags}
Bio: ${inf.bio}`
    )
    .join("\n\n---\n\n");

  const prompt = `You are an expert influencer marketing analyst specializing in mobile app distribution. Given a mobile app and a list of TikTok influencers, identify the top 5 influencers who would be the best fit to promote this app to maximize downloads and user acquisition.

App Details:
- Name: ${appName}
- Description: ${appDescription}
- Category: ${category}
- Target Audience: ${targetAudience}

Available TikTok Influencers:
${influencerList}

Select the top 5 best-fit influencers and rank them. Consider:
1. Content niche alignment with the app's category
2. Audience demographics matching the target audience
3. Engagement rate (higher = more authentic audience)
4. Reach (follower count and average views)
5. Likelihood of audience converting to app downloads

Respond ONLY with valid JSON in this exact format (no markdown, no explanation outside JSON):
{
  "matches": [
    {
      "influencerId": "<exact influencer ID from the list>",
      "rank": 1,
      "score": 95,
      "reasoning": "2-3 sentences explaining why this influencer is a strong match for this app."
    }
  ]
}

Return exactly 5 matches, ranked 1 (best) through 5.`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Claude API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const content = data.content[0].text;

  const parsed = JSON.parse(content);
  return parsed.matches as RankedMatch[];
}
