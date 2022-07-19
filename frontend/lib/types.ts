export type Credentials = {
  awsAccessKeyId: string,
  awsSecretAccessKey: string,
  endpoint: string
}

export type Payload = Record<string, any>

export type APIRes = {
  success: boolean,
  token?: string,
  message: string,
  endpoint?: string,
  data: any
}

export type Experiment = {
  _id: string
  experimentName: string,
  title: string,
  description: string,
  entrypoint: string,
  available: string,
  pending: string,
  waitingForApproval: string,
  completed: string,
  keywords: string,
  awardQualificationName: string,
  awardQualificationDescription: string,
  awardQualificationId: string,
  hitExpiresAfterDays: string,
  assignmentDurationInMinutes: string,
  assignmentsPerHit: string,
  defaultRequirements: boolean,
  guardHitByQualification: boolean,
  rewardPerAssignment: string,
  hits: any[],
  endpoint: string,
}

export type Hit = {
    id: string,
    available: number,
    pending: number,
    waitingForApproval: number,
    completed: number,
    maxAssignments: number,
    creationTime: number,
    title: string,
    status: string,
    numberOfAssignmentsAvailable: number
}

export type BaseText = {
    label: string,
    type: string,
    value: string,
}

export type WorkersData = {
  id: string,
  title: string,
  creationTime: string,
  awardQualificationID: string,
  modalRejectIsVisible: boolean,
  modalApproveIsVisible: boolean,
  rejectFeedback:
    string,
  approvalFeedback: string,
  assignmentID: string,
  workerID: string,
  route: {
    path: string,
    name: string,
  },
  submitted: any[] | null,
  approved: any[] | null,
  rejected: any[] | null,
  status: any,
  feedback?: string
}
  
export type Worker = {
  id: string
  assignmentID: string
  started: {
    time: string,
    date: string,
  },
  finished: {
    time: string,
    date: string,
  },
  rejected?: {
    time: string,
    date: string,
  },
  approved?: {
    time: string,
    date: string,
  },
}

export type Route = {
  path: string
  name: string
  params: Record<string, any>
}

