import { init, id } from "@instantdb/admin";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const db = init({
  appId: process.env.EXPO_PUBLIC_INSTANT_APP_ID!,
  adminToken: process.env.INSTANT_APP_ADMIN_TOKEN!,
});

const influencers = [
  {
    username: "techwithtara",
    displayName: "Tara Tech",
    followerCount: 2100000,
    avgViews: 890000,
    engagementRate: 7.2,
    niche: "Tech & Apps",
    tags: "apps,tech,gadgets,software,smartphones,productivity",
    bio: "Breaking down the best apps and tech gadgets so you don't have to. App reviews, comparisons, and hidden gems every week.",
  },
  {
    username: "appreviewer_mike",
    displayName: "Mike Reviews Apps",
    followerCount: 890000,
    avgViews: 420000,
    engagementRate: 9.1,
    niche: "Tech & Apps",
    tags: "apps,reviews,ios,android,mobile,appstore",
    bio: "Honest app reviews. No sponsorships without disclosure. Helping you find apps that actually change your life.",
  },
  {
    username: "devlife.daily",
    displayName: "Dev Life Daily",
    followerCount: 650000,
    avgViews: 310000,
    engagementRate: 8.4,
    niche: "Developer Lifestyle",
    tags: "coding,developer,startup,software,programming,tech",
    bio: "A developer's life behind the screen. Side projects, productivity hacks, and the tools that keep me sane.",
  },
  {
    username: "startupstories_hq",
    displayName: "Startup Stories",
    followerCount: 1400000,
    avgViews: 670000,
    engagementRate: 6.8,
    niche: "Entrepreneurship",
    tags: "startup,entrepreneurship,business,founder,apps,saas",
    bio: "Real stories from startup founders. How they built it, what broke, and what tools they swear by.",
  },
  {
    username: "mobilegameking",
    displayName: "Mobile Game King",
    followerCount: 3200000,
    avgViews: 1800000,
    engagementRate: 11.3,
    niche: "Mobile Gaming",
    tags: "mobilegames,gaming,ios,android,gameplay,gacha",
    bio: "The biggest mobile gaming channel on TikTok. Reviews, tips, tier lists, and first looks at new releases.",
  },
  {
    username: "fitnesstechguru",
    displayName: "Fitness Tech Guru",
    followerCount: 1100000,
    avgViews: 520000,
    engagementRate: 8.9,
    niche: "Health & Fitness Tech",
    tags: "fitness,health,workout,wearables,fitnessapp,wellness",
    bio: "Merging fitness and tech. Best workout apps, wearables, and health trackers reviewed weekly.",
  },
  {
    username: "productivitypro_ai",
    displayName: "Productivity Pro",
    followerCount: 780000,
    avgViews: 360000,
    engagementRate: 7.6,
    niche: "Productivity",
    tags: "productivity,notetaking,organization,workflow,apps,ai",
    bio: "I try every productivity app so you can skip the bad ones. Obsidian to Notion to the weird niche stuff.",
  },
  {
    username: "financewithali",
    displayName: "Finance with Ali",
    followerCount: 2300000,
    avgViews: 1100000,
    engagementRate: 9.4,
    niche: "Personal Finance",
    tags: "finance,money,investing,budgeting,fintech,savings",
    bio: "Making money simple. Best finance apps, budgeting tips, and investment tools for regular people.",
  },
  {
    username: "edutech_pro",
    displayName: "EduTech Pro",
    followerCount: 560000,
    avgViews: 240000,
    engagementRate: 6.5,
    niche: "Education Technology",
    tags: "education,learning,edtech,studying,apps,students",
    bio: "The best learning apps and study tools. From language learning to coding bootcamps, reviewed honestly.",
  },
  {
    username: "socialstrategy_queen",
    displayName: "Social Strategy Queen",
    followerCount: 4100000,
    avgViews: 2200000,
    engagementRate: 10.2,
    niche: "Social Media",
    tags: "socialmedia,tiktok,instagram,creators,contentcreator,growth",
    bio: "Teaching creators how to go viral. Social media tools, content strategy, and creator apps demystified.",
  },
  {
    username: "musicappreviews",
    displayName: "Music App Reviews",
    followerCount: 430000,
    avgViews: 190000,
    engagementRate: 7.8,
    niche: "Music & Audio",
    tags: "music,audio,dj,producer,musicapp,beatmaking",
    bio: "Every music and audio app reviewed by an actual musician. Recording, mixing, composition, and streaming apps.",
  },
  {
    username: "traveltechy_jake",
    displayName: "Travel Techy",
    followerCount: 890000,
    avgViews: 430000,
    engagementRate: 8.1,
    niche: "Travel Tech",
    tags: "travel,travelapp,nomad,wanderlust,trips,booking",
    bio: "Travelling the world one app at a time. The best apps for flights, hotels, maps, and local experiences.",
  },
  {
    username: "foodtechlisa",
    displayName: "Food Tech Lisa",
    followerCount: 670000,
    avgViews: 310000,
    engagementRate: 9.6,
    niche: "Food & Restaurants",
    tags: "food,foodie,restaurants,cooking,recipe,deliveryapp",
    bio: "Testing every food app so you eat better. From recipe apps to delivery, restaurant finders, and meal planners.",
  },
  {
    username: "healthtech_hub",
    displayName: "Health Tech Hub",
    followerCount: 1200000,
    avgViews: 580000,
    engagementRate: 8.3,
    niche: "Health Tech",
    tags: "health,wellness,mentalhealth,meditation,sleep,healthapp",
    bio: "Your guide to health and wellness apps. Meditation, sleep tracking, therapy platforms, and more.",
  },
  {
    username: "gamedevjourney",
    displayName: "Game Dev Journey",
    followerCount: 340000,
    avgViews: 160000,
    engagementRate: 10.8,
    niche: "Game Development",
    tags: "gamedev,indiegame,unity,coding,gamedeveloper,mobilegame",
    bio: "Indie game developer building in public. Tools, engines, and apps that every game dev should know.",
  },
  {
    username: "cryptoapp_reviews",
    displayName: "Crypto App Reviews",
    followerCount: 1800000,
    avgViews: 850000,
    engagementRate: 7.9,
    niche: "Crypto & Web3",
    tags: "crypto,web3,blockchain,defi,nft,coinbase,wallet",
    bio: "Reviewing every crypto and Web3 app so you don't get rugged. Wallets, exchanges, and DeFi tools tested.",
  },
  {
    username: "designerspotlight",
    displayName: "Designer Spotlight",
    followerCount: 520000,
    avgViews: 245000,
    engagementRate: 7.1,
    niche: "Design & Creative",
    tags: "design,ux,ui,figma,creative,graphicdesign,designapp",
    bio: "A designer's essential toolkit. Best design, photo editing, and creative apps for professionals and hobbyists.",
  },
  {
    username: "parentingtech_mom",
    displayName: "Parenting Tech Mom",
    followerCount: 760000,
    avgViews: 350000,
    engagementRate: 9.9,
    niche: "Parenting & Family",
    tags: "parenting,kids,family,education,kidsapp,momlife",
    bio: "Mom of 3 testing apps so other parents don't have to. Kids education, family organizers, and parental tools.",
  },
  {
    username: "shoppingtechguru",
    displayName: "Shopping Tech Guru",
    followerCount: 1300000,
    avgViews: 620000,
    engagementRate: 8.7,
    niche: "Shopping & E-commerce",
    tags: "shopping,deals,cashback,ecommerce,fashion,bargains",
    bio: "The best shopping apps, deal finders, and cashback tools. I save thousands every year — let me show you how.",
  },
  {
    username: "aiappreviewer",
    displayName: "AI App Reviewer",
    followerCount: 2500000,
    avgViews: 1300000,
    engagementRate: 10.5,
    niche: "AI & Machine Learning",
    tags: "ai,artificialintelligence,chatgpt,aitools,automation,tech",
    bio: "Testing every AI app that drops. From ChatGPT wrappers to genuinely useful tools — I find the real gems.",
  },
];

async function seed() {
  console.log("Checking for existing influencers...");

  const existing = await db.query({ influencers: {} });
  if (existing.influencers.length > 0) {
    console.log(
      `Found ${existing.influencers.length} existing influencers. Skipping seed.`
    );
    console.log("To re-seed, delete existing influencers first.");
    return;
  }

  console.log(`Seeding ${influencers.length} influencers...`);

  const txs = influencers.map((inf) =>
    db.tx.influencers[id()].update(inf)
  );

  await db.transact(txs);
  console.log(`Successfully seeded ${influencers.length} influencers!`);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
