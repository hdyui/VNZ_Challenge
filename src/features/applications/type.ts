export interface ApplicantProfile {
  applicantProfileId: string;
  accountId: string;
  fullName: string;
  email: string;
  phone: string;
  address?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

export interface ApplicantApplicationItem {
  applicationId: string;
  applicantProfileId?: string | null; // Bổ sung thêm theo đúng JSON BE trả về
  recruitmentId: string;
  recruitmentTitle: string;
  recruitmentSlug?: string | null;
  recruitmentLocation?: string | null;
  cvUrl: string;
  status:
    | "Submitted"
    | "Reviewed"
    | "InterviewScheduled"
    | "Approved"
    | "Rejected"
    | "Cancelled";
  rejectReason?: string | null;
  referredByEmployeeId?: string | null;

  // ─── CÁC TRƯỜNG INTERVIEW BE VỪA THÊM VÀO ───
  interviewSessionId?: string | null;
  interviewDate?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  interviewAddress?: string | null;
  interviewRoom?: string | null;
  interviewMessage?: string | null;

  createdAt: string;
  updatedAt?: string | null;
}
