import type { NextConfig } from "next";

const buildCharacterRemotePatterns = (): NonNullable<
  NonNullable<NextConfig["images"]>["remotePatterns"]
> => {
  const baseUrl = process.env.CHARACTER_CDN_BASE_URL;
  if (!baseUrl) {
    return [];
  }

  try {
    const parsed = new URL(baseUrl);
    const pathname = parsed.pathname.endsWith("/")
      ? `${parsed.pathname}**`
      : `${parsed.pathname}/**`;

    return [new URL(`${parsed.protocol}//${parsed.host}${pathname}`)];
  } catch {
    return [];
  }
};

const nextConfig: NextConfig = {
  images: {
    remotePatterns: buildCharacterRemotePatterns(),
  },
};

export default nextConfig;
