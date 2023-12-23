"use client";

import React, { useState } from "react";
import Card from "./components/Card";

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

        {userData && (
          <Card.Root>
            <Card.Header
              name={userData.users[0].name}
              // imageUrl={userData.users[0].picture}
              imageUrl={userData.users[0].picture}
              languageFlags={userData.users[0].courses.map(
                (course) => course.learningLanguage
              )}
              key={userData.users[0].id}
            />
            <Card.Content
              streak={userData.users[0].streak}
              totalXp={userData.users[0].totalXp}
              league="Teste"
              podiums={3}
            />
          </Card.Root>
        )}

        {userData && <Preview data={userData} />}
      </div>
    </div>
  );
};

export default Home;
