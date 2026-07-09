export interface KnowledgeChunk {
  id: string;
  category: "gates" | "transit" | "accessibility" | "facilities" | "emergency" | "general";
  title: string;
  content: string;
  keywords: string[];
}

export const KNOWLEDGE_BASE: KnowledgeChunk[] = [
  {
    id: "gate-locations",
    category: "gates",
    title: "Stadium Gates Locations and Entrances",
    content: "Gate 1 is on the North side, closest to the Light Rail Station. Gate 2 is in the Northeast. Gate 3 is on the East side near the Bus Terminal. Gate 4 is in the Southeast. Gate 5 is on the South side, close to the Shuttle Stop. Gate 6 is in the Southwest near the West pedestrian entrance. Gates open 3 hours before kickoff.",
    keywords: ["gate", "entrance", "north", "east", "south", "west", "rail", "shuttle", "open"]
  },
  {
    id: "gate-policies",
    category: "gates",
    title: "Security and Re-entry Policies",
    content: "All gates have security checks including metal detectors and bag inspection. Re-entry is strictly prohibited. Permitted bags must be clear plastic, vinyl, or PVC, not exceeding 12x6x12 inches. One-gallon clear freezer bags are allowed.",
    keywords: ["security", "bag", "size", "reentry", "policy", "clear", "metal detector"]
  },
  {
    id: "light-rail-transit",
    category: "transit",
    title: "Light Rail Stadium Transit Info",
    content: "The Light Rail Stadium Station is located just outside Gate 1. Trains run every 5 minutes on match day. Ticket holders ride free by scanning their digital match ticket. The last train departs 2 hours after final whistle.",
    keywords: ["rail", "train", "transit", "station", "gate 1", "ticket", "free", "schedule"]
  },
  {
    id: "bus-shuttle-transit",
    category: "transit",
    title: "Metro Bus and Shuttle Service Terminal",
    content: "The Metro Bus Terminal is situated near Gate 3. Express Bus lines serve downtown every 10 minutes. The Stadium Express Shuttle Terminal is located outside Gate 5, providing free connections to outlying park-and-ride lots.",
    keywords: ["bus", "shuttle", "transit", "terminal", "gate 3", "gate 5", "parking", "park"]
  },
  {
    id: "wheelchair-access",
    category: "accessibility",
    title: "Wheelchair Accessibility and Step-Free Routing",
    content: "Step-free wheelchair routes bypass stairs at Gate 2 and Gate 6. Use elevators located inside Gate 1, Gate 3, and Gate 5 to reach upper tiers. ADA seating is located in Zones 1, 2, and 3. Touch points are lowered to 40 inches. Volunteer accessibility guides can be requested at any information booth.",
    keywords: ["wheelchair", "stairs", "elevator", "access", "ada", "stewards", "step-free", "disabled"]
  },
  {
    id: "sensory-facilities",
    category: "accessibility",
    title: "Sensory Rooms and Quiet Zones",
    content: "Sensory-friendly rooms are located on the main concourse near Section 104 (Concourse A) and Section 218 (Concourse D). Noise-canceling headphones, weighted lap pads, and sensory bags can be checked out free of charge with ID at the Guest Services booths in Concourse A and D.",
    keywords: ["sensory", "quiet", "noise", "autism", "headphone", "concourse a", "concourse d", "section 104", "section 218"]
  },
  {
    id: "first-aid-stations",
    category: "facilities",
    title: "First Aid Stations and Emergency Care",
    content: "Main First Aid stations are located near Gate 1 (Concourse A) and Gate 5 (Concourse D). Medical volunteers patrol the stands. In an emergency, locate a steward or volunteer immediately, or dial 911. Do not try to move an injured person.",
    keywords: ["medical", "first aid", "doctor", "injury", "sick", "emergency", "gate 1", "gate 5", "nurse"]
  },
  {
    id: "sustainability-operations",
    category: "general",
    title: "Stadium Waste and Energy Sustainability Program",
    content: "The stadium targets zero-waste. Blue bin clusters are for compostable food packaging and paper. Green bin clusters are for recyclable cups, plastic, and aluminum. Red bin clusters are for trash only. The solar panel canopy meets 40% of the venue's peak energy demand.",
    keywords: ["recycling", "sustainability", "eco", "trash", "waste", "compost", "bin", "solar", "energy"]
  },
  {
    id: "lost-and-found",
    category: "general",
    title: "Lost and Found Claims",
    content: "The Central Lost and Found office is located in the Stadium Command Center near Gate 3. Found items are logged digitally. Spectators can file claims online or check with Guest Services. Unclaimed items are held for 30 days before donation.",
    keywords: ["lost", "found", "keys", "wallet", "phone", "bag", "gate 3", "claim"]
  }
];

// In-memory simple keyword RAG retrieval search
export function queryKnowledgeBase(queryText: string, topK: number = 3): KnowledgeChunk[] {
  const queryWords = queryText.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter(w => w.length > 2);
  
  if (queryWords.length === 0) {
    // Return general info if search query is empty
    return KNOWLEDGE_BASE.slice(0, topK);
  }

  // Score each chunk
  const scoredChunks = KNOWLEDGE_BASE.map(chunk => {
    let score = 0;
    
    // Exact word matches in keywords
    chunk.keywords.forEach(kw => {
      if (queryText.toLowerCase().includes(kw)) score += 5;
    });

    // Substring matches in title
    if (chunk.title.toLowerCase().includes(queryText.toLowerCase())) score += 10;

    // Word counts in text
    queryWords.forEach(word => {
      if (chunk.content.toLowerCase().includes(word)) score += 2;
      if (chunk.title.toLowerCase().includes(word)) score += 4;
    });

    return { chunk, score };
  });

  // Sort by score descending and return top K
  return scoredChunks
    .filter(sc => sc.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(sc => sc.chunk)
    .slice(0, topK);
}
