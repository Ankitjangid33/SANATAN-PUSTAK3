import "./globals.css";
import ClientLayout from "./components/ClientLayout";

export const metadata = {
  title: "Sacred Texts Library",
  description:
    "Explore ancient wisdom - Vedas, Upanishads, Bhagavad Gita and more",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
