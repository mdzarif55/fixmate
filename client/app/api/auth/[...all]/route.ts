import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";

async function proxyAuthRequest(request: NextRequest) {
  const url = new URL(request.url);
  const targetUrl = `${BACKEND_URL.replace(/\/$/, "")}${url.pathname}${url.search}`;

  const headers = new Headers();
  const forwardHeaderNames = [
    "content-type",
    "cookie",
    "authorization",
    "origin",
    "referer",
    "user-agent",
    "accept",
  ];

  for (const name of forwardHeaderNames) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }

  headers.set("x-forwarded-host", url.host);
  headers.set("x-forwarded-proto", url.protocol.replace(":", ""));

  const hasBody = !["GET", "HEAD"].includes(request.method.toUpperCase());
  const body = hasBody ? await request.arrayBuffer() : undefined;

  try {
    const upstream = await fetch(targetUrl, {
      method: request.method,
      headers,
      body: body && body.byteLength > 0 ? body : undefined,
      redirect: "manual",
    });

    const responseHeaders = new Headers();
    upstream.headers.forEach((value, key) => {
      const lower = key.toLowerCase();
      if (lower !== "set-cookie" && lower !== "content-encoding" && lower !== "content-length") {
        responseHeaders.set(key, value);
      }
    });

    if (typeof upstream.headers.getSetCookie === "function") {
      for (const cookie of upstream.headers.getSetCookie()) {
        responseHeaders.append("set-cookie", cookie);
      }
    } else {
      const setCookie = upstream.headers.get("set-cookie");
      if (setCookie) responseHeaders.append("set-cookie", setCookie);
    }

    const resBody = await upstream.arrayBuffer();
    return new NextResponse(resBody, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("[Auth Proxy Error]:", error);
    return NextResponse.json(
      { error: "Authentication service unavailable." },
      { status: 502 }
    );
  }
}

export async function GET(request: NextRequest) {
  return proxyAuthRequest(request);
}

export async function POST(request: NextRequest) {
  return proxyAuthRequest(request);
}

export async function PUT(request: NextRequest) {
  return proxyAuthRequest(request);
}

export async function PATCH(request: NextRequest) {
  return proxyAuthRequest(request);
}

export async function DELETE(request: NextRequest) {
  return proxyAuthRequest(request);
}

export async function OPTIONS(request: NextRequest) {
  return proxyAuthRequest(request);
}
