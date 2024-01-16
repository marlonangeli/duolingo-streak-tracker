import { Course } from "./course";

export interface User {
  picture: string;
  name: string;
  totalXp: number;
  username: string;
  courses: Course[];
  streak: number;
  currentCourseId: string;
  creationDate: number;
  id: number;
}

export interface UserData {
  users: User[];
}
