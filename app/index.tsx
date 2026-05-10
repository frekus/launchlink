import { db } from "@/lib/db";
import { AppSchema } from "@/instant.schema";
import { InstaQLEntity, id } from "@instantdb/react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

type AppSubmission = InstaQLEntity<AppSchema, "appSubmissions">;

const CATEGORIES = [
  "Social Media",
  "Gaming",
  "Health & Fitness",
  "Finance",
  "Education",
  "Entertainment",
  "Productivity",
  "Food & Drink",
  "Travel",
  "Shopping",
  "Music",
  "Photography",
  "AI Tools",
  "Utilities",
  "Crypto & Web3",
];

export default function HomeScreen() {
  const router = useRouter();
  const [appName, setAppName] = useState("");
  const [appDescription, setAppDescription] = useState("");
  const [category, setCategory] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showCategories, setShowCategories] = useState(false);

  const { data } = db.useQuery({
    appSubmissions: {
      $: { order: { createdAt: "desc" } },
    },
  });

  const recentSubmissions = data?.appSubmissions ?? [];

  async function handleFindInfluencers() {
    if (!appName.trim() || !appDescription.trim() || !category || !targetAudience.trim()) {
      Alert.alert("Missing info", "Please fill in all fields before searching.");
      return;
    }

    setIsLoading(true);
    try {
      const submissionId = id();
      await db.transact(
        db.tx.appSubmissions[submissionId].update({
          appName: appName.trim(),
          appDescription: appDescription.trim(),
          category,
          targetAudience: targetAudience.trim(),
          status: "pending",
          createdAt: Date.now(),
        })
      );
      // Results screen handles the Claude call and saves matches
      router.push(`/results/${submissionId}`);
    } catch (err: any) {
      Alert.alert("Error", err.message ?? "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={{ flex: 1, backgroundColor: "#f5f5f5" }}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={{ marginBottom: 24, marginTop: 8 }}>
          <Text style={{ fontSize: 28, fontWeight: "800", color: "#1a1a1a" }}>
            LaunchLink
          </Text>
          <Text style={{ fontSize: 14, color: "#666", marginTop: 4 }}>
            Find TikTok influencers who match your app
          </Text>
        </View>

        {/* Form Card */}
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 12,
            padding: 16,
            marginBottom: 24,
            shadowColor: "#000",
            shadowOpacity: 0.06,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 2 },
            elevation: 2,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "700", color: "#1a1a1a", marginBottom: 16 }}>
            Tell us about your app
          </Text>

          <Text style={labelStyle}>App Name</Text>
          <TextInput
            style={inputStyle}
            placeholder="e.g. FitTrack Pro"
            placeholderTextColor="#aaa"
            value={appName}
            onChangeText={setAppName}
            editable={!isLoading}
          />

          <Text style={labelStyle}>App Description</Text>
          <TextInput
            style={[inputStyle, { height: 90, textAlignVertical: "top" }]}
            placeholder="Describe what your app does and who it's for..."
            placeholderTextColor="#aaa"
            value={appDescription}
            onChangeText={setAppDescription}
            multiline
            numberOfLines={3}
            editable={!isLoading}
          />

          <Text style={labelStyle}>Category</Text>
          <TouchableOpacity
            style={[inputStyle, { justifyContent: "center" }]}
            onPress={() => setShowCategories(!showCategories)}
            disabled={isLoading}
          >
            <Text style={{ color: category ? "#1a1a1a" : "#aaa", fontSize: 15 }}>
              {category || "Select a category"}
            </Text>
          </TouchableOpacity>

          {showCategories && (
            <View
              style={{
                borderWidth: 1,
                borderColor: "#e0e0e0",
                borderRadius: 8,
                marginBottom: 12,
                overflow: "hidden",
              }}
            >
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={{
                    padding: 12,
                    backgroundColor: category === cat ? "#f0f0ff" : "#fff",
                    borderBottomWidth: 1,
                    borderBottomColor: "#f0f0f0",
                  }}
                  onPress={() => {
                    setCategory(cat);
                    setShowCategories(false);
                  }}
                >
                  <Text
                    style={{
                      fontSize: 15,
                      color: category === cat ? "#4f46e5" : "#1a1a1a",
                      fontWeight: category === cat ? "600" : "400",
                    }}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Text style={labelStyle}>Target Audience</Text>
          <TextInput
            style={inputStyle}
            placeholder="e.g. fitness enthusiasts aged 18-35"
            placeholderTextColor="#aaa"
            value={targetAudience}
            onChangeText={setTargetAudience}
            editable={!isLoading}
          />

          <TouchableOpacity
            style={{
              backgroundColor: isLoading ? "#a5b4fc" : "#4f46e5",
              borderRadius: 10,
              paddingVertical: 14,
              alignItems: "center",
              marginTop: 8,
            }}
            onPress={handleFindInfluencers}
            disabled={isLoading}
          >
            {isLoading ? (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>
                  Finding influencers...
                </Text>
              </View>
            ) : (
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>
                Find Influencers
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Recent Searches */}
        {recentSubmissions.length > 0 && (
          <View>
            <Text style={{ fontSize: 16, fontWeight: "700", color: "#1a1a1a", marginBottom: 12 }}>
              Recent Searches
            </Text>
            {recentSubmissions.map((submission) => (
              <RecentCard
                key={submission.id}
                submission={submission}
                onPress={() => router.push(`/results/${submission.id}`)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function RecentCard({
  submission,
  onPress,
}: {
  submission: AppSubmission;
  onPress: () => void;
}) {
  const date = new Date(submission.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <TouchableOpacity
      style={{
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 14,
        marginBottom: 10,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 1 },
        elevation: 1,
      }}
      onPress={onPress}
    >
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 15, fontWeight: "600", color: "#1a1a1a" }}>
          {submission.appName}
        </Text>
        <Text style={{ fontSize: 12, color: "#999", marginTop: 2 }}>
          {submission.category} • {date}
        </Text>
      </View>
      <View
        style={{
          backgroundColor:
            submission.status === "complete" ? "#dcfce7" : "#fef9c3",
          paddingHorizontal: 8,
          paddingVertical: 3,
          borderRadius: 20,
        }}
      >
        <Text
          style={{
            fontSize: 11,
            fontWeight: "600",
            color: submission.status === "complete" ? "#16a34a" : "#ca8a04",
          }}
        >
          {submission.status === "complete" ? "Done" : "Pending"}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const labelStyle = {
  fontSize: 13,
  fontWeight: "600" as const,
  color: "#444",
  marginBottom: 6,
  marginTop: 12,
};

const inputStyle = {
  borderWidth: 1,
  borderColor: "#e0e0e0",
  borderRadius: 8,
  paddingHorizontal: 12,
  paddingVertical: 10,
  fontSize: 15,
  color: "#1a1a1a",
  backgroundColor: "#fafafa",
  marginBottom: 4,
};
