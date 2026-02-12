export interface Player {
  id?: string;
  name: string;
  nickname: string;
  number?:string;
  position: string;
  photoUrl?: string;
  goals: number;
  assists: number;
  matchesPlayed: number;
  createdAt: any;
}

export interface Match {
  id?: string;
  date: Date;
  teamA: string[];
  teamB: string[];
  scoreA: number;
  scoreB: number;
}
