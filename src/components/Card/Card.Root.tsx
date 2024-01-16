import React, { ReactNode } from "react";

interface CardRootProps {
  children: ReactNode;
}

const CardRoot = ({ children }: CardRootProps) => {
  return <div>{children}</div>;
};

export default CardRoot;
