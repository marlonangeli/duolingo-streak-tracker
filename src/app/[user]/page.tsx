"use client";

import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import Card from "@/components/Card";
import { User } from "@/models/user";

export default function User() {
  const [username, setUsername] = React.useState("");
  const [userData, setUserData] = React.useState<User | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const pathName = usePathname();
  const user = pathName.replace("/", "");

  useEffect(() => {
    setUsername(user);
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [username]);

  const fetchData = async () => {
    setError(null);
    setUserData(null);

    try {
      const response = await fetch(`/api/stats/${username}`);

      if (!response.ok) {
        setError("Usuário não encontrado");
        return;
      }

      const data: User = await response.json();
      setUserData(data);
    } catch (error) {
      console.error(error);
    }
  };

  return userData ? (
    <svg>
      <Card.Root>
        <Card.Header
          name={userData.name}
          imageUrl={userData.picture}
          languageFlags={userData.courses.map(
            (course) => course.learningLanguage
          )}
          key={userData.id}
        />
        <Card.Content
          streak={userData.streak}
          totalXp={userData.totalXp}
          league="Teste"
          podiums={3}
        />
      </Card.Root>
    </svg>
  ) : (
    <svg>None</svg>
  );
}
