"use client";

import type { MissionCategory, MissionInput } from "@/lib/supabase-missions";

export const eventTypes = [
  "Birthday",
  "School",
  "Church",
  "Team Building",
  "Community Event",
  "Conference",
  "Family Reunion",
  "Friendship Gathering"
] as const;

export type EventType = (typeof eventTypes)[number];

export type EventTemplate = {
  type: EventType;
  suggestedMissions: MissionInput[];
  icebreakers: MissionInput[];
  participationActivities: MissionInput[];
  hostPrompts: MissionInput[];
};

function mission(prompt: string, category: MissionCategory): MissionInput {
  return {
    prompt,
    category,
    isTemplate: true,
    isActive: true
  };
}

export const eventTemplates: Record<EventType, EventTemplate> = {
  Birthday: {
    type: "Birthday",
    suggestedMissions: [
      mission("Find someone who has known the birthday person for a different length of time than you.", "Friendship"),
      mission("Share one specific thing you appreciate about the birthday person.", "Kindness")
    ],
    icebreakers: [
      mission("Ask someone for their favorite birthday memory.", "Icebreaker"),
      mission("Find someone who shares your favorite party food.", "Icebreaker")
    ],
    participationActivities: [
      mission("Create a three-person birthday cheer and perform it together.", "Friendship"),
      mission("Introduce two guests who should take a photo together tonight.", "Friendship")
    ],
    hostPrompts: [
      mission("Invite guests to share quick birthday wishes before the raffle.", "Kindness"),
      mission("Ask the room to point out one hidden helper who made the celebration happen.", "Kindness")
    ]
  },
  School: {
    type: "School",
    suggestedMissions: [
      mission("Meet someone from a different class, grade, or program.", "Community"),
      mission("Find someone who can teach you one study or organization tip.", "Team Building")
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
    ]
  },
  Church: {
    type: "Church",
    suggestedMissions: [
      mission("Meet someone from a different ministry, group, or service time.", "Community"),
      mission("Ask someone what brought them joy this week.", "Kindness")
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
    ]
  },
  "Team Building": {
    type: "Team Building",
    suggestedMissions: [
      mission("Find someone whose role supports yours in a way you did not know.", "Team Building"),
      mission("Ask a teammate what makes their workday easier.", "Team Building")
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
    ]
  },
  "Community Event": {
    type: "Community Event",
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
    ]
  },
  Conference: {
    type: "Conference",
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
    ]
  },
  "Family Reunion": {
    type: "Family Reunion",
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
    ]
  },
  "Friendship Gathering": {
    type: "Friendship Gathering",
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
    ]
  }
};

export const defaultEventType: EventType = "Birthday";

export function isEventType(value?: string | null): value is EventType {
  return eventTypes.includes(value as EventType);
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
