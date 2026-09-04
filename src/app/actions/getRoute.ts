"use server";

import https from "https";

export interface RouteParams {
  start_lat: number;
  start_lon: number;
  end_lat: number;
  end_lon: number;
  excluded_surfaces: string[];
  excluded_highways: string[];
  only_roads: boolean;
  cyclability_factor_weight: number;
  hills: number;
  loop_around: boolean;
  angle_weight: number;
}

function httpsPost(url: string, body: object): Promise<{ status: number; text: string }> {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const parsed = new URL(url);
    const req = https.request(
      {
        hostname: parsed.hostname,
        path: parsed.pathname,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(data),
        },
        rejectUnauthorized: false,
      },
      (res) => {
        let text = "";
        res.on("data", (chunk) => { text += chunk; });
        res.on("end", () => resolve({ status: res.statusCode ?? 0, text }));
      }
    );
    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

export async function getRoute(params: RouteParams) {
  const { status, text } = await httpsPost(
    "https://routescout.tennisbowling.com/api/get_route_public",
    { ...params, heatmap_weight: null }
  );

  if (status < 200 || status >= 300) {
    throw new Error(
      `Route service returned ${status}. The service may be temporarily unavailable — please try again later.`
    );
  }

  return JSON.parse(text);
}
