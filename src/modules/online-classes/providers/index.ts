// modules/online-classes/providers/index.ts
export interface MeetingProvider {
  createMeeting(input: { topic: string; startsAt: Date; endsAt: Date }): Promise<{ meetingUrl: string; meetingId: string }>;
}
// pick via env.ONLINE_CLASS_PROVIDER = 'jitsi' | 'zoom' | 'meet'