export interface UserData {
    id: string;
    ingameName: string;
    reputation: number;
    platform: string;
    locale: string;
    status: string;
    activity: {
      type: string;
      details: string;
      startedAt: string;
    };
    lastSeen: string;
  }