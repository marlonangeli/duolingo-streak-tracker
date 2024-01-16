import React from "react";
import Image from "next/image";

export interface CardHeaderProps {
  name: string;
  imageUrl: string;
  languageFlags: string[];
}

const CardHeader = ({ name, imageUrl, languageFlags }: CardHeaderProps) => {
  return (
    <div className="flex items-center">
      <Image
        src={"https:" + imageUrl + "/xlarge"}
        width={96}
        height={96}
        alt="profile icon"
      />
      <div className="text-xl font-medium text-white">{name}</div>
      {/* {languageFlags.map((flag) => (
        <Image
          key={flag}
          src={flag}
          width={32}
          height={32}
          alt="language flag"
        />
      ))} */}
    </div>
  );
};

export default CardHeader;
