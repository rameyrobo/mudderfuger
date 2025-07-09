export const products = [
  {
    id: "sponsor-me",
    title: "sponsor me",
    price: 300,
    description: null,
    includes: [
      "Your brand or @name on a shirt, sign, wall, or background prop",
      "Optional name drop or dialogue shoutout",
      "Tag in caption + option for a collab post (if requested) - add on",
      "1–3 high-res cinematic stills from the scene"
    ]
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
        name: "Story post add-on (+100)",
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
];
