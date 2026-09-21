import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    username: v.string(),
    fullName: v.string(),
    email: v.string(),

    role: v.optional(v.string()), // student, parent, admininstrator, or superAdmin in the code. this isnt hardcoded due to TypeSciript conflictions
    requestedParents: v.optional(v.array(v.id("users"))),
    approvedParents: v.optional(v.array(v.id("users"))),
    requestedChildren: v.optional(v.array(v.id("users"))), // parent users can add other student users as their child
    approvedChildren: v.optional(v.array(v.id("users"))), // parent users can add other student users as their child
    approvedAdmin: v.optional(v.boolean()), //true = approved, false = not approved, undefined = user isnt an admin
    gradeLevel: v.optional(v.number()),
    school: v.optional(v.id("schools")),

    requestedClubs: v.optional(v.array(v.id("clubs"))),
    clubs: v.array(v.id("clubs")),
    numClubs: v.number(),

    chats: v.optional(v.array(v.id("groupChats"))),
    newMessages: v.optional(v.array(v.id("groupChats"))),
    currentChat: v.optional(v.id("groupChats")),
    eventList: v.optional(v.array(v.id("events"))),
    profilePicture: v.string(),
    clerkId: v.string(),
  }).index("by_clerk_id", ["clerkId"]),

  clubs: defineTable({
    name: v.string(),
    description: v.string(),

    tags: v.array(v.string()),
    clubColor: v.optional(v.string()),
    meetingLocation: v.optional(v.string()),
    meetingDayTime: v.optional(v.string()),

    meetingFreq: v.optional(v.number()), // 0 = weekly, 1 = biweekly, 2 = monthly, 3 = as needed, 4 = daily

    restricted: v.boolean(), // if a club is available to join without requesting, in other words open to all students
    restrictedType: v.optional(v.number()), // 0 = application, 1 = tryouts, 2 = prerequisites

    restricted0: v.optional(
      v.object({
        applicationDesc: v.string(),
        applicationLink: v.optional(v.string()),
        hasDeadline: v.boolean(),
        applicationDeadline: v.optional(v.string()),
      }),
    ),
    restricted1: v.optional(
      v.object({
        tryoutDesc: v.string(),
        tryoutDate: v.optional(v.array(v.string())),
        tryoutIds: v.optional(v.array(v.id("events"))),
      }),
    ),
    restricted2: v.optional(
      v.object({
        prerequisites: v.array(v.string()),
      }),
    ),
    restricted3: v.optional(
      v.object({
        applicationDesc: v.string(),
        applicationLink: v.optional(v.string()),
        hasDeadline: v.boolean(),
        applicationDeadline: v.optional(v.string()),
        prerequisites: v.array(v.string()),
      }),
    ),
    school: v.id("schools"),

    members: v.array(
      v.object({
        userId: v.id("users"),
        dateJoined: v.string(),
        role: v.optional(v.string()), // an undefined role means normal member
      }),
    ),
    pendingMembers: v.optional(v.array(v.id("users"))),
    numMembers: v.number(),
    advisors: v.optional(v.array(v.id("users"))),
    officers: v.optional(v.array(v.id("users"))),

    pendingAdvisors: v.optional(v.array(v.id("users"))),
    officerRoles: v.optional(v.array(v.string())),

    groupChat: v.optional(v.id("groupChats")),
    eventList: v.array(v.id("events")),
    announcementList: v.array(v.id("announcements")),
    nextMeeting: v.optional(v.string()),

    clubPublic: v.boolean(), // if a club can be joined by students at all

    expandedDescription: v.optional(v.string()),
    clubRules: v.optional(v.string()),

    logoImage: v.optional(v.string()),
    bannerImage: v.optional(v.string()),
    configurations: v.optional(
      v.object({
        adminsNeedApproval: v.boolean(),
      }),
    ),
  }).index("by_school_and_name", ["school", "name"]),

  events: defineTable({
    clubId: v.optional(v.id("clubs")),
    global: v.optional(v.boolean()),
    title: v.string(),
    description: v.optional(v.string()),
    startTime: v.optional(v.string()),
    endTime: v.optional(v.string()),
    dateString: v.string(),
    dateNumber: v.string(), // MMDDYYYY
    location: v.optional(v.string()),
    school: v.id("schools"),
    studentList: v.optional(v.array(v.id("users"))),
    creator: v.id("users"),
    eventType: v.string(),
    canceled: v.optional(v.boolean()),
    canRsvp: v.optional(v.boolean()),
  }).index("by_club", ["clubId"]),

  announcements: defineTable({
    clubId: v.optional(v.id("clubs")),
    global: v.optional(v.boolean()),
    title: v.optional(v.string()),
    message: v.string(),
    pinned: v.optional(v.boolean()),
    postedBy: v.id("users"),
    creatorName: v.string(),
    creatorPFP: v.string(),
    datePosted: v.string(),
    image: v.optional(v.string()),
    event: v.optional(v.id("events")),
  }).index("by_club", ["clubId"]),

  joinRequests: defineTable({
    userId: v.id("users"),
    clubId: v.id("clubs"),
  }).index("by_club", ["clubId"]),

  schools: defineTable({
    name: v.string(),
    shortName: v.string(),
    clubList: v.array(v.id("clubs")),
    userList: v.array(v.id("users")),
    adminList: v.optional(v.array(v.id("users"))),
    pendingAdminList: v.optional(v.array(v.id("users"))),
    joinCode: v.string(),
    eventList: v.optional(v.array(v.id("events"))),
    announcementList: v.optional(v.array(v.id("announcements"))),
    configurations: v.optional(
      v.object({
        adminsNeedApproval: v.boolean(),
        clubAdminsNeedApproval: v.boolean(),
        globalSchoolPage: v.optional(v.boolean()),
      }),
    ),
  }).index("by_joinCode", ["joinCode"]),
  keys: defineTable({
    key: v.string(),
    used: v.boolean(),
    schoolId: v.optional(v.id("schools")),
  }).index("by_key", ["key"]),
  groupChats: defineTable({
    members: v.array(
      v.object({ user: v.id("users"), lastRead: v.optional(v.string()) }),
    ),
    name: v.string(),
    messages: v.array(
      v.object({
        sender: v.id("users"),

        message: v.string(),
        dateSent: v.string(),
      }),
    ),
    club: v.optional(v.id("clubs")),
  }),
});
