export interface AdminApplicationQueryParams {
  Keyword?: string;
  RecruitmentId?: string;
  Status?:
    | "Submitted"
    | "Reviewed"
    | "InterviewScheduled"
    | "Approved"
    | "Rejected"
    | "Cancelled"
    | "";
  FromDate?: string;
  ToDate?: string;
  Page?: number;
  PageSize?: number;
}

export interface ScheduleInterviewPayload {
  interviewDate: string; // ISO Date
  startTime: string;
  endTime: string;
  address: string;
  room: string;
  message?: string;
}
