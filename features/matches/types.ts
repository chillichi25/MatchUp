export type MatchTeam = {
  id: string;
  name: string;
  clubs:
    | {
        name: string;
      }
    | {
        name: string;
      }[];
};