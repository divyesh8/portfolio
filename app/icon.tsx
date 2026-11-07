import { SITE } from "@/constants/site";
import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/** Favicon: DK editorial monogram with crimson accent mark on #090909. */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#090909",
          border: "1px solid #262524",
          borderRadius: 6,
          color: "#F2EFEB",
          fontSize: 15,
          fontWeight: 700,
          letterSpacing: -0.5,
        }}
      >
        <span>{SITE.initials}</span>
        <span style={{ color: "#E32B3C", marginLeft: 1 }}>.</span>
      </div>
    ),
    { ...size },
  );
}
