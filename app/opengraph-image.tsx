import { ImageResponse } from "next/og";
import { HERO } from "@/constants/content";
import { SITE } from "@/constants/site";

export const alt = SITE.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Share card matching the #090909 / #F2EFEB / #E32B3C editorial design system. */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#090909",
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 28,
              height: 2,
              background: "#E32B3C",
            }}
          />
          <div
            style={{
              color: "#A09C9A",
              fontSize: 19,
              letterSpacing: 3,
              textTransform: "uppercase",
            }}
          >
            B.Tech Cloud Computing · SRMIST Chennai
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              color: "#F2EFEB",
              fontSize: 124,
              fontWeight: 700,
              letterSpacing: -5,
              lineHeight: 0.94,
              textTransform: "uppercase",
            }}
          >
            {SITE.name.split(" ")[0]}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              color: "#A09C9A",
              fontSize: 124,
              fontWeight: 700,
              letterSpacing: -5,
              lineHeight: 0.94,
            }}
          >
            <span>{SITE.name.split(" ")[1]}</span>
            <span style={{ color: "#E32B3C" }}>.</span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid #242322",
            paddingTop: 28,
          }}
        >
          <div style={{ color: "#F2EFEB", fontSize: 26 }}>
            {HERO.headline}
          </div>
          <div style={{ color: "#E32B3C", fontSize: 22, letterSpacing: 1 }}>
            divyeshkolli.fun
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
