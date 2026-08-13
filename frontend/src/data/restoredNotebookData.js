export const restoredMemories = [
  {
    id: 1,
    title: "Our First Meeting",
    summary: "Finally meeting for the first time after ages",
    location: "DLF, Sec-18, Teashop, Arun Vihar,BP Market, Sec 46 Market.",
    chapter_date: "26 June 2026",
    created_at: "2026-07-02 13:44:05",
    arjun_mood: "Nervous ,Happy ,Peaceful",
    arjun_story:
      "So firstly She has been ignoring the shit out of me for 3 years and when we finally meet WTF WHY IS SHE SO PRETTY SHE LITERALLY MADE ME NERVOUS like I remember i saw her once during our internship meeting there she looked really nice also first time I saw her in school i mean obviously she was pretty back then too thats why i followed her in the first place also on her insta too she looks beautiful BUT SAAMNE SE ITNA ACHA KON LAGTA HAI?????? it was probably the most peaceful i have ever found myself her talking non stop for some reasons gave me immense pleasure and happiness and for the first time i was not using my phone while being in someone's company or should i say for the first time I felt like I am free to feel emotions. I mean I told her about my father first meeting pe I havent told it to many of my close friends. First day was so good so much walking so much talking although i was late kinda still feel bad about it or else we would have got 1 more hour and then second day when our plan of gaming got cancelled we walked till 46 ka market and had coffee and the kids forcing her for the interview I found her to be very adorable at that moment but the best part was her trying to make me laugh watching those reels like wtf why is she laughing at literally everything and why is her laughs making me so happy probably because how pure her laughs were or because it was new for me, genuinely laughing with someone. Cant wait to be back in Noida. Already trying to find excuses",
    arjun_favourite: "Sitting near the fountain talking",
    bhoomi_mood: "",
    bhoomi_story: "",
    bhoomi_favourite: "",
    photos: [
      "/uploads/photos/b9cee5b0-1820-4125-b2f6-18b238a37698_WhatsApp_Image_2026-07-02_at_12.20.37_AM.jpeg"
    ],
    videos: [
      "/uploads/videos/4f7f1303-fe75-43a6-a9e5-e5be875d3a7e_WhatsApp_Video_2026-07-02_at_1.50.11_PM.mp4",
      "/uploads/videos/cd33a5d0-8da8-454e-982c-104f416bd30b_WhatsApp_Video_2026-07-02_at_12.12.46_AM.mp4"
    ]
  }
];

export const restoredPlannerItems = [
  {
    id: 1,
    title: "Visit Mumbai",
    description: "A 3-4 day trip to Mumbai ",
    location: "",
    target_date: "",
    category: "Travel",
    priority: "Dream Goal",
    status: "Planning",
    favourite: false,
    completed: false
  },
  {
    id: 3,
    title: "MKT Trip",
    description: "Trying MKT's Food",
    location: "",
    target_date: "soon",
    category: "Food",
    priority: "High",
    status: "Not Started",
    favourite: false,
    completed: false
  }
];

export function restoreMemoriesWhenMissing(data) {
  if (!Array.isArray(data) || data.length === 0) {
    return restoredMemories;
  }

  const hasOnlyOldPlaceholder =
    data.length === 1 &&
    data[0]?.title === "Our saved memory" &&
    data[0]?.summary === "A page kept available even when the database is waking up.";

  if (hasOnlyOldPlaceholder) {
    return restoredMemories;
  }

  return data.map((memory) =>
    memory?.title === "Our saved memory" ? restoredMemories[0] : memory
  );
}

export function restorePlannerWhenMissing(data) {
  return Array.isArray(data) && data.length > 0 ? data : restoredPlannerItems;
}

export function restoreMemoryWhenMissing(memory, id) {
  if (!memory || memory.title === "Our saved memory") {
    return {
      ...restoredMemories[0],
      id: Number(id) || restoredMemories[0].id
    };
  }

  return memory;
}
