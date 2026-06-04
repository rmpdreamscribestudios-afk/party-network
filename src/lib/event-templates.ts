"use client";

import type { MissionCategory, MissionInput } from "@/lib/supabase-missions";
import type {
  ConnectionMission,
  ConnectionMissionCategory
} from "@/lib/connection-engine";

export const eventTypes = [
  "Party",
  "School",
  "Church",
  "Team Building",
  "Community Event",
  "Family Gathering",
  "Friendship Gathering",
  "Conference"
] as const;

export type EventType = (typeof eventTypes)[number];

export type EventTemplate = {
  type: EventType;
  suggestedTitle: string;
  suggestedDescription: string;
  suggestedMissions: MissionInput[];
  icebreakers: MissionInput[];
  participationActivities: MissionInput[];
  hostPrompts: MissionInput[];
  connectionMissions: ConnectionMission[];
};

function mission(prompt: string, category: MissionCategory): MissionInput {
  return {
    prompt,
    category,
    isTemplate: true,
    isActive: true
  };
}

function connectionMission(
  id: string,
  prompt: string,
  category: ConnectionMissionCategory
): ConnectionMission {
  return {
    id,
    prompt,
    category
  };
}

export const eventTemplates: Record<EventType, EventTemplate> = {
  Party: {
    type: "Party",
    suggestedTitle: "Party Network",
    suggestedDescription:
      "A warm gathering that helps guests meet across tables, share stories, and make the room feel more connected.",
    suggestedMissions: [
      mission("Meet someone from another table.", "Friendship"),
      mission("Share a favorite event memory.", "Kindness")
    ],
    icebreakers: [
      mission("Ask someone for a favorite celebration memory.", "Icebreaker"),
      mission("Find someone who shares your favorite party food.", "Icebreaker")
    ],
    participationActivities: [
      mission("Create a three-person cheer and perform it together.", "Friendship"),
      mission("Introduce two guests who should take a photo together tonight.", "Friendship")
    ],
    hostPrompts: [
      mission("Invite guests to share quick good wishes before the raffle.", "Kindness"),
      mission("Ask the room to point out one hidden helper who made the celebration happen.", "Kindness")
    ],
    connectionMissions: [
      connectionMission("party-other-table", "Meet someone from another table.", "Meet Someone New"),
      connectionMission("party-memory", "Share a favorite event memory.", "Story Exchange")
    ]
  },
  School: {
    type: "School",
    suggestedTitle: "School Community Mixer",
    suggestedDescription:
      "A student-friendly experience for meeting across grades, sharing goals, and making the school community feel more connected.",
    suggestedMissions: [
      mission("Meet someone from another grade.", "Community"),
      mission("Learn one future goal.", "Team Building")
    ],
    icebreakers: [
      mission("Ask someone which subject or activity they enjoy most.", "Icebreaker"),
      mission("Find someone with the same favorite school snack.", "Icebreaker")
    ],
    participationActivities: [
      mission("Form a group of three and invent a quick team name.", "Team Building"),
      mission("Thank someone who helped you learn something this year.", "Kindness")
    ],
    hostPrompts: [
      mission("Invite guests to recognize a teacher, student, or volunteer by name.", "Kindness"),
      mission("Ask each table to choose one word for the school year.", "Community")
    ],
    connectionMissions: [
      connectionMission("school-other-grade", "Meet someone from another grade.", "Meet Someone New"),
      connectionMission("school-future-goal", "Learn one future goal.", "Story Exchange")
    ]
  },
  Church: {
    type: "Church",
    suggestedTitle: "Church Community Gathering",
    suggestedDescription:
      "A welcoming gathering that helps attendees connect across groups, greet newer people, and share gratitude.",
    suggestedMissions: [
      mission("Welcome a new attendee.", "Community"),
      mission("Share one thing you're grateful for.", "Kindness")
    ],
    icebreakers: [
      mission("Find someone who shares a favorite meal after service.", "Icebreaker"),
      mission("Ask someone how long they have been connected to the community.", "Icebreaker")
    ],
    participationActivities: [
      mission("Introduce a newer guest to someone who can welcome them well.", "Community"),
      mission("Share one encouraging sentence with someone you just met.", "Kindness")
    ],
    hostPrompts: [
      mission("Invite a short gratitude moment for volunteers and helpers.", "Kindness"),
      mission("Ask the room to greet someone outside their usual circle.", "Community")
    ],
    connectionMissions: [
      connectionMission("church-new-attendee", "Welcome a new attendee.", "Community Builder"),
      connectionMission("church-gratitude", "Share one thing you're grateful for.", "Story Exchange")
    ]
  },
  "Team Building": {
    type: "Team Building",
    suggestedTitle: "Team Building Mixer",
    suggestedDescription:
      "A workplace-ready experience for cross-functional introductions, hidden talents, and practical team connection.",
    suggestedMissions: [
      mission("Meet someone from another department.", "Team Building"),
      mission("Learn one hidden talent.", "Team Building")
    ],
    icebreakers: [
      mission("Find someone who starts their morning the same way you do.", "Icebreaker"),
      mission("Ask someone for one non-work skill they are proud of.", "Icebreaker")
    ],
    participationActivities: [
      mission("Form a trio and solve one tiny event challenge together.", "Team Building"),
      mission("Introduce two teammates who should collaborate more often.", "Team Building")
    ],
    hostPrompts: [
      mission("Ask teams to name one win from the last month.", "Team Building"),
      mission("Invite people to shout out a behind-the-scenes teammate.", "Kindness")
    ],
    connectionMissions: [
      connectionMission("team-other-department", "Meet someone from another department.", "Team Connector"),
      connectionMission("team-hidden-talent", "Learn one hidden talent.", "Story Exchange")
    ]
  },
  "Community Event": {
    type: "Community Event",
    suggestedTitle: "Community Event Mixer",
    suggestedDescription:
      "A local gathering that helps neighbors, volunteers, and attendees meet new people and build shared momentum.",
    suggestedMissions: [
      mission("Meet someone from a different street, group, or neighborhood.", "Community"),
      mission("Ask someone what local place they recommend.", "Community")
    ],
    icebreakers: [
      mission("Find someone attending this event for the first time.", "Icebreaker"),
      mission("Ask someone what they hope happens more often in the community.", "Icebreaker")
    ],
    participationActivities: [
      mission("Introduce two people who care about the same local issue.", "Community"),
      mission("Gather three people and choose one small way to support the next event.", "Community")
    ],
    hostPrompts: [
      mission("Invite guests to thank a volunteer or organizer.", "Kindness"),
      mission("Ask the room to name one thing they love about this community.", "Community")
    ],
    connectionMissions: [
      connectionMission("community-new-neighbor", "Meet someone from a different street, group, or neighborhood.", "Meet Someone New"),
      connectionMission("community-welcome", "Welcome someone attending for the first time.", "Community Builder")
    ]
  },
  "Family Gathering": {
    type: "Family Gathering",
    suggestedTitle: "Family Gathering",
    suggestedDescription:
      "A family-centered experience for sharing stories, connecting generations, and making the gathering feel personal.",
    suggestedMissions: [
      mission("Ask a relative for a family story you have never heard.", "Family"),
      mission("Find someone from another branch or generation of the family.", "Family")
    ],
    icebreakers: [
      mission("Ask someone which family recipe they would protect forever.", "Icebreaker"),
      mission("Find someone who shares a childhood memory location with you.", "Icebreaker")
    ],
    participationActivities: [
      mission("Introduce a younger family member to an elder and learn one story together.", "Family"),
      mission("Gather three relatives and recreate an old family pose.", "Family")
    ],
    hostPrompts: [
      mission("Invite guests to honor the people who kept the family connected.", "Kindness"),
      mission("Ask each table to share one family tradition worth continuing.", "Family")
    ],
    connectionMissions: [
      connectionMission("family-story", "Ask a relative for a family story you have never heard.", "Story Exchange"),
      connectionMission("family-generations", "Introduce someone from a younger generation to an elder.", "Community Builder")
    ]
  },
  "Friendship Gathering": {
    type: "Friendship Gathering",
    suggestedTitle: "Friendship Gathering",
    suggestedDescription:
      "A casual experience for helping friends mix beyond their usual circles, share recommendations, and create easy moments together.",
    suggestedMissions: [
      mission("Introduce two friends who have not had a real conversation yet.", "Friendship"),
      mission("Ask someone what they are looking forward to this season.", "Friendship")
    ],
    icebreakers: [
      mission("Find someone who shares your favorite comfort food.", "Icebreaker"),
      mission("Ask someone for a song, show, or place they recommend.", "Icebreaker")
    ],
    participationActivities: [
      mission("Create a tiny group toast with two people you know least.", "Friendship"),
      mission("Give someone a specific compliment they can take home.", "Kindness")
    ],
    hostPrompts: [
      mission("Invite guests to thank someone who made the gathering warmer.", "Kindness"),
      mission("Ask everyone to meet one person outside their usual circle before the raffle.", "Community")
    ],
    connectionMissions: [
      connectionMission("friends-introduce-two", "Introduce two friends who have not had a real conversation yet.", "Community Builder"),
      connectionMission("friends-compliment", "Give someone a specific compliment they can take home.", "Kindness Challenge")
    ]
  },
  Conference: {
    type: "Conference",
    suggestedTitle: "Conference Networking Session",
    suggestedDescription:
      "A conference experience for meeting across organizations, exchanging useful ideas, and surfacing shared goals.",
    suggestedMissions: [
      mission("Meet someone from a different organization or industry.", "Community"),
      mission("Ask someone what session or topic they are most excited about.", "Icebreaker")
    ],
    icebreakers: [
      mission("Find someone who traveled from a different city.", "Icebreaker"),
      mission("Ask someone for one tool, book, or idea they recommend.", "Icebreaker")
    ],
    participationActivities: [
      mission("Introduce two attendees who have overlapping goals.", "Team Building"),
      mission("Form a pair and trade one practical takeaway from today.", "Team Building")
    ],
    hostPrompts: [
      mission("Ask attendees to share one takeaway with someone beside them.", "Community"),
      mission("Invite the room to recognize sponsors, speakers, or volunteers.", "Kindness")
    ],
    connectionMissions: [
      connectionMission("conference-different-org", "Meet someone from a different organization or industry.", "Meet Someone New"),
      connectionMission("conference-overlap-goals", "Introduce two attendees who have overlapping goals.", "Community Builder")
    ]
  }
};

export const defaultEventType: EventType = "Party";

export function isEventType(value?: string | null): value is EventType {
  return eventTypes.includes(value as EventType);
}

export function getSafeEventType(
  value?: string | null,
  fallback: EventType = defaultEventType
): EventType {
  if (isEventType(value)) {
    return value;
  }

  if (value === "Corporate") {
    return "Team Building";
  }

  if (value === "Family Reunion") {
    return "Family Gathering";
  }

  return fallback;
}

export function getEventTemplate(eventType: EventType): EventTemplate {
  return eventTemplates[eventType];
}

export function getEventTemplateMissions(eventType: EventType): MissionInput[] {
  const template = getEventTemplate(eventType);

  return [
    ...template.suggestedMissions,
    ...template.icebreakers,
    ...template.participationActivities,
    ...template.hostPrompts
  ];
}

export function getEventTemplateConnectionMissions(
  eventType: EventType
): ConnectionMission[] {
  return getEventTemplate(eventType).connectionMissions;
}
