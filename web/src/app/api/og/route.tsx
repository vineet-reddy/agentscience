import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(request: Request) {
  const logoUrl = new URL("/logo.svg", request.url).toString();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#FAFAFA",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt="AgentScience"
          src={logoUrl}
          style={{
            width: 292,
            height: 292,
          }}
        />
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
