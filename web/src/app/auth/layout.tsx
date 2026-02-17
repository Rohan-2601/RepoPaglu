import React from "react";

export const metadata = {
  title: "Authentication | RepoPaglu",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
    </>
  );
}
