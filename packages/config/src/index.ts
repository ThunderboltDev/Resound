export const isDev = process.env.NODE_ENV === "development";

export const url = "https://something.vercel.app";

export const config = {
  name: "EchoFlow",
  description: "EchoFlow - Support Platform",
  url,
  creator: "Thunderbolt",
  themeColor: "#020202",
  gtmId: "GTM-",
  socials: {
    github: "https://github.com/ThunderboltDev",
    discord: "https://discord.com/users/855342398115414037",
    email: "echoflow999@gmail.com",
  },
  favicon: "/favicon.ico",
  logo: {
    url: "/logo.webp",
    size: 350,
  },
  preview: {
    url: "/preview.webp",
    width: 1200,
    height: 630,
  },
  landing: {
    url: "/landing-page.webp",
    width: 1200,
    height: 630,
  },
  keywords: [],
} as const;
