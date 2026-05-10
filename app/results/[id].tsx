import { db } from "@/lib/db";
import { rankInfluencers } from "@/lib/claude";
import { AppSchema } from "@/instant.schema";
import { InstaQLEntity, id } from "@instantdb/react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";

type MatchResult = InstaQLEntity<AppSchema, "matchResults", { influencer: {} }>;

const RANK_COLORS = ["#f59e0b", "#9ca3af", "#d97706", "#6366f1", "#6366f1"];
const RANK_LABELS = ["#1", "#2", "#3", "#4", "#5"];

function formatCount(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
  return String(n);
}

export default function ResultsScreen() {
  const { id: submissionId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const hasTriggered = useRef(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Always query both — no conditional hooks
  const { isLoading, error, data } = db.useQuery({
    appSubmissions: {
      $: { where: { id: submissionId } },
      matches: { influencer: {} },
    },
  });

  const { data: infData } = db.useQuery({ influencers: {} });

  const submission = data?.appSubmissions?.[0];
  const influencers = infData?.influencers ?? [];

  useEffect(() => {
    if (
      !submission ||
      submission.status !== "pending" ||
      influencers.length === 0 ||
      hasTriggered.current
    ) return;

    hasTriggered.current = true;
    runMatching();

    async function runMatching() {
      try {
        setErrorMsg(null);

        const ranked = await rankInfluencers(
          submission!.appName,
          submission!.appDescription,
          submission!.category,
          submission!.targetAudience,
          influencers
        );

        const matchTxs = ranked.map((match) =>
          db.tx.matchResults[id()]
            .update({
              rank: match.rank,
              score: match.score,
              reasoning: match.reasoning,
            })
            .link({ submission: submissionId, influencer: match.influencerId })
        );

        await db.transact([
          db.tx.appSubmissions[submissionId].update({ status: "complete" }),
          ...matchTxs,
        ]);
      } catch (err: any) {
        console.error("Matching error:", err);
        setErrorMsg(err?.message ?? "Unknown error");
        await db.transact(
          db.tx.appSubmissions[submissionId].update({ status: "error" })
        ).catch(() => {});
      }
    }
  }, [submission?.status, influencers.length]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f5f5f5" }}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 24 }}>
        <Text style={{ color: "#ef4444", fontSize: 15, textAlign: "center" }}>
          {error.message}
        </Text>
      </View>
    );
  }

  if (!submission) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "#666" }}>Submission not found.</Text>
      </View>
    );
  }

  const matches = [...(submission.matches ?? [])].sort((a, b) => a.rank - b.rank);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#f5f5f5" }}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
    >
      <TouchableOpacity
        onPress={() => router.back()}
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 16, marginTop: 4 }}
      >
        <Text style={{ color: "#4f46e5", fontSize: 15, fontWeight: "600" }}>← Back</Text>
      </TouchableOpacity>

      {/* App summary */}
      <View style={{ backgroundColor: "#4f46e5", borderRadius: 12, padding: 16, marginBottom: 20 }}>
        <Text style={{ color: "#c7d2fe", fontSize: 12, fontWeight: "600", marginBottom: 4 }}>
          RESULTS FOR
        </Text>
        <Text style={{ color: "#fff", fontSize: 22, fontWeight: "800" }}>
          {submission.appName}
        </Text>
        <Text style={{ color: "#c7d2fe", fontSize: 13, marginTop: 4 }}>
          {submission.category} • {submission.targetAudience}
        </Text>
        <Text style={{ color: "#e0e7ff", fontSize: 13, marginTop: 8, lineHeight: 18 }}>
          {submission.appDescription}
        </Text>
      </View>

      <Text style={{ fontSize: 16, fontWeight: "700", color: "#1a1a1a", marginBottom: 12 }}>
        Top 5 TikTok Influencer Matches
      </Text>

      {submission.status === "error" ? (
        <View style={{ backgroundColor: "#fff", borderRadius: 12, padding: 24, alignItems: "center" }}>
          <Text style={{ fontSize: 28, marginBottom: 8 }}>⚠️</Text>
          <Text style={{ color: "#ef4444", fontWeight: "700", fontSize: 15, marginBottom: 6 }}>
            Something went wrong
          </Text>
          {errorMsg && (
            <Text style={{ color: "#666", fontSize: 12, textAlign: "center", marginBottom: 8 }}>
              {errorMsg}
            </Text>
          )}
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ backgroundColor: "#4f46e5", borderRadius: 8, paddingHorizontal: 20, paddingVertical: 10, marginTop: 4 }}
          >
            <Text style={{ color: "#fff", fontWeight: "600" }}>Go back and retry</Text>
          </TouchableOpacity>
        </View>
      ) : matches.length === 0 ? (
        <View style={{ backgroundColor: "#fff", borderRadius: 12, padding: 24, alignItems: "center" }}>
          <ActivityIndicator color="#4f46e5" size="large" />
          <Text style={{ color: "#1a1a1a", fontWeight: "600", marginTop: 12 }}>
            Analysing influencers...
          </Text>
          <Text style={{ color: "#999", fontSize: 13, marginTop: 4 }}>
            Claude is finding your best matches
          </Text>
        </View>
      ) : (
        matches.map((match) => <InfluencerCard key={match.id} match={match} />)
      )}
    </ScrollView>
  );
}

function InfluencerCard({ match }: { match: MatchResult }) {
  const inf = match.influencer;
  const rankIndex = match.rank - 1;
  const rankColor = RANK_COLORS[rankIndex] ?? "#6366f1";

  if (!inf) return null;

  const scoreColor =
    match.score >= 85 ? "#16a34a" : match.score >= 70 ? "#d97706" : "#dc2626";

  return (
    <View
      style={{
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
        borderLeftWidth: match.rank === 1 ? 4 : 0,
        borderLeftColor: "#f59e0b",
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: 12 }}>
        <View
          style={{
            backgroundColor: rankColor,
            width: 36,
            height: 36,
            borderRadius: 18,
            justifyContent: "center",
            alignItems: "center",
            marginRight: 12,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "800", fontSize: 14 }}>
            {RANK_LABELS[rankIndex]}
          </Text>
        </View>

        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Text style={{ fontSize: 16, fontWeight: "700", color: "#1a1a1a", flex: 1 }}>
              {inf.displayName}
            </Text>
            <View
              style={{
                backgroundColor: scoreColor + "20",
                borderRadius: 20,
                paddingHorizontal: 10,
                paddingVertical: 3,
                marginLeft: 8,
              }}
            >
              <Text style={{ color: scoreColor, fontWeight: "700", fontSize: 13 }}>
                {match.score}% match
              </Text>
            </View>
          </View>
          <Text style={{ fontSize: 13, color: "#6366f1", fontWeight: "500", marginTop: 2 }}>
            @{inf.username}
          </Text>
        </View>
      </View>

      <View
        style={{
          backgroundColor: "#f0f0ff",
          alignSelf: "flex-start",
          paddingHorizontal: 10,
          paddingVertical: 4,
          borderRadius: 20,
          marginBottom: 10,
        }}
      >
        <Text style={{ fontSize: 12, color: "#4f46e5", fontWeight: "600" }}>{inf.niche}</Text>
      </View>

      <View
        style={{
          flexDirection: "row",
          backgroundColor: "#f9f9f9",
          borderRadius: 8,
          padding: 10,
          marginBottom: 12,
        }}
      >
        <StatItem label="Followers" value={formatCount(inf.followerCount)} />
        <View style={{ width: 1, backgroundColor: "#e5e7eb" }} />
        <StatItem label="Avg Views" value={formatCount(inf.avgViews)} />
        <View style={{ width: 1, backgroundColor: "#e5e7eb" }} />
        <StatItem label="Engagement" value={`${inf.engagementRate}%`} />
      </View>

      <View
        style={{
          backgroundColor: "#f8faff",
          borderRadius: 8,
          padding: 10,
          borderLeftWidth: 3,
          borderLeftColor: "#c7d2fe",
        }}
      >
        <Text style={{ fontSize: 11, fontWeight: "700", color: "#6366f1", marginBottom: 4 }}>
          WHY THIS MATCH
        </Text>
        <Text style={{ fontSize: 13, color: "#374151", lineHeight: 19 }}>
          {match.reasoning}
        </Text>
      </View>
    </View>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1, alignItems: "center", paddingVertical: 2 }}>
      <Text style={{ fontSize: 15, fontWeight: "700", color: "#1a1a1a" }}>{value}</Text>
      <Text style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{label}</Text>
    </View>
  );
}
