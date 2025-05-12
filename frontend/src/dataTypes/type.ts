export type User = {
    _id: string // MongoDB ObjectId as string
    username: string
    password: string
    emailAddress: string
    notifications: string[] // Array of ObjectId strings
    organisedEvents: string[] // Array of ObjectId strings
    eventLimits: number
    invitationLimits: number
    admin: boolean
    sessions: string[] // Array of ObjectId strings
    avatar: string | null; // ObjectID of the user's avatar
    invitations: string[]
    requests: string[]
    joinedEvents: string[]
    avatarZoom?: number;
}

export type Event = {
    _id: string;
    public: boolean;
    invitations: string[];
    requests: string[];
    discussionBoard: string[];
    notifications: string[];
    images: string;
    organiserID: string;
    eventName: string;
    eventLocation: string;
    eventDescription: string;
    discussionDescription: string;
    eventTime: Date;
    joinedUsers: string[];
};

export type Request = {
    _id: string;
    senderId: string;
    m_oSender : User 
    "Sender username": string
    state: RequestStatus,
    eventId: string;
}

export type Invitation = {
    _id: string;
    receiverId: string;
    state: InvitationStatus,
    eventId: string;
}

export interface AvatarUploaderProps {
    onAvatarUpload: (imageId: string) => void;
    defaultAvatarUrl: string;
    defaultAvatarId: string;
  }

export enum RequestStatus {
    Accepted = "Accepted",
    Unanswered = "Unanswered",
    Rejected = "Rejected",
}

export enum InvitationStatus {
    Accepted = "Accepted",
    NotResponded = "Pending",
    Declined = "Declined"
}

export type Setting = {
    _id: string;
    eventLimit: number;
    invitationLimit: number;
}

export type Message = {
    _id: string;
    text: string;
    senderId: string;
    eventId: string;
    parentMessageId?: string;
    createdAt: Date;
    updatedAt?: Date;
    user?: {
        _id: string;
        username: string;
        avatar: string;
        avatarZoom: number;
    };
    isOrganizer?: boolean;
  }

  export type Notification = {
    _id: string;
    text: string;
    sendTime: Date;
    eventId: string; 
    reminder: boolean;
    eventName?: string; 
}