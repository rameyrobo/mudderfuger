export const products = [
  {
    id: "sponsor-me",
    title: "Sponsor Me",
    itemPrice: 0,
    description: "Pick your sponsor level and get Mudderfuged.",
    includes: [],
    category: "sponsor-me"
  },
  {
    id: "add-yourself",
    title: "Add Yourself Into an Episode",
    price: 100,
    description: "Submit a photo. We’ll build you (or a friend) into a real Mudderfuger scene as a skater, partygoer, cop, or background freak.",
    includes: [
      "Custom AI version of your face",
      "Name or @handle used in the skit",
      "Tag in caption + option for a collab post - add on"
    ]
  },
  {
    id: "submit-song",
    title: "Submit a Song / Artwork",
    price: 150,
    description: "Submit a song or custom artwork (like a PNG, logo, or shirt design). If Mudderfuger likes your submission, he'll wear it in an episode and feature it on his merch store.",
    includes: [
      "You'll get a shoutout as the artist",
      "Get your design included for sale on the website",
      "The shirt will be listed for a full month, so your own promo and shoutouts can help boost sales and your chances of getting paid.",
      "At least 8–10 seconds of your music in a real skit",
      "Tag in caption + option for a collab post - add on"
    ]
  },
  {
    id: "product-commercial",
    title: "PRODUCT COMMERCIAL",
    price: 500,
    description: "A standalone, high-quality Mudderfuger-style ad — no monthly commitment.",
    includes: [
        "1 custom AI skit/ad  (15-40 sec)",
        "Product is clearly featured with Mudderfuger’s signature chaos and humor",
        "Vertical (9:16) and Horizontal (16:9) versions included ",
        "Ready for TikTok, Reels, YouTube, or paid campaigns",
        "Creative handled by us",
        "You can submit a product, short blurb, and key message — we take it from there",
        "Repost rights included",
        "Use the video on your own channels (must tag @mudderfuger when reposting)",
    ],
    customFields: [
      {
        name: "Share on my Stories",
        description: "",
        type: "checkbox",
        options: "false|true[+100.00]"
      },
      {
        name: "Revisions",
        type: "dropdown",
        options: "0|1[+75.00]|2[+150.00]|3[+225.00]"
      }
    ]
  },
  // --- NEW SPONSOR PRODUCTS ---
  {
    id: "starter-sponsor",
    title: "Starter Sponsor",
    price: 500,
    category: "sponsor-me",
    description: "Great for indie brands or first-time collabs.",
    includes: [
      "🎥 1 skit or reel/month featuring your product - collab post optional",
      "📲 2 story posts/month w/ call to action",
      "🛍️ Optional product link in story",
      "🎯 Tag in post + mention in caption",
      "⚠️ Non-exclusive: Mudderfuger may feature similar product categories (e.g., another clothing brand) during the same month."
    ]
  },
  {
    id: "monthly-main-sponsor",
    title: "Monthly Main Sponsor",
    itemPrice: 1500,
    category: "sponsor-me",
    description: "Ideal for brands who want real visibility.",
    includes: [
      "🎥 4 custom AI skits/month (product in use or on display)",
      "📲 6 story posts/month with strong CTAs",
      "🤝 Optional collab post for double reach",
      "🛍️ Product featured in Mudderfuger merch shop - optional",
      "🔗 Optional brand link or tag in bio",
      "✅ Category exclusive: Only your brand (e.g., clothing) will be featured in that category for the full month."
    ]
  },
  {
    id: "official-brand-partner",
    title: "Official Brand Partner",
    category: "sponsor-me",
    itemPrice: 15000,
    description: "Locked-in brand collab. Premium exposure. Real impact. Price is negotiable based on deliverables.",
    includes: [
      "📅 12-month contract with priority scheduling",
      "🎥 Up to 6 high-quality skits/month",
      "📲 10+ story posts/month",
      "🎬 Ability to help shape custom storylines/skits",
      "🛒 Exclusive co-branded merch drops (profit split or flat fee)",
      "🔗 Brand name in bio year-round",
      "🎯 Featured placement on Sponsor Me page",
      "📝 Signed content plan + reporting",
      "✅ Full category exclusivity across all channels during term"
    ]
  },
];
