import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TIC / TAC / TOE — The Grid Awaits",
  description: "One mind. Nine squares. Can you outplay the machine?",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
