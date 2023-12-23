import React from "react";
import Image from "next/image";

interface CardContentProps {
  streak: number;
  totalXp: number;
  league: string;
  podiums: number;
}

const CardContent = ({
  streak,
  totalXp,
  league,
  podiums,
}: CardContentProps) => {
  return (
    <>
      <hr className="my-4 border-gray-300" />
      <div className="grid grid-cols-2 gap-4">
        <div className="text-xl font-medium text-white">Streak: {streak}</div>
        <div className="text-xl font-medium text-white">
          Total XP: {totalXp}
        </div>
        <div className="text-xl font-medium text-white">League: {league}</div>
        <div className="text-xl font-medium text-white">Podiums: {podiums}</div>
      </div>
    </>
  );
};

export default CardContent;
