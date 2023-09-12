"use client";

import React, { useState } from "react";

interface Course {
  preload: boolean;
  placementTestAvailable: boolean;
  authorId: string;
  title: string;
  learningLanguage: string;
  xp: number;
  healthEnabled: boolean;
  fromLanguage: string;
  crowns: number;
  id: string;
}

interface StreakData {
  currentStreak: {
    startDate: string;
    length: number;
    endDate: string;
  };
}

interface User {
  privacySettings: any[]; // Você pode ajustar isso para um tipo específico, se necessário
  picture: string;
  name: string;
  roles: string[];
  totalXp: number;
  username: string;
  courses: Course[];
  streak: number;
  globalAmbassadorStatus: Record<string, any>; // Você pode ajustar isso para um tipo específico, se necessário
  currentCourseId: string;
  creationDate: number;
  streakData: StreakData;
  id: number;
  hasPlus: boolean;
}

interface UserData {
  users: User[];
}

const Preview: React.FC<{ data: UserData | null }> = ({ data }) => {
  return (
    <div className="mt-4 p-4 border border-gray-300 rounded-lg">
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

const Home: React.FC = () => {
  const [username, setUsername] = useState<string>("");
  const [userData, setUserData] = useState<UserData | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`/api/stats/${username}`);
      const data: UserData = await response.json();
      setUserData(data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full p-4">
        <h1 className="text-2xl font-semibold mb-4">
          Digite o nome de usuário:
        </h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="border border-gray-300 rounded-md p-2 w-full text-black"
          />
          <button
            type="submit"
            className="mt-2 bg-blue-500 text-white rounded-md p-2 w-full"
          >
            Buscar
          </button>
        </form>
        {userData && <Preview data={userData} />}
      </div>
    </div>
  );
};

export default Home;
