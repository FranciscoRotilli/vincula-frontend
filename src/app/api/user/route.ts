import { NextResponse } from "next/server";

import { apiFetch } from "@/lib/backend";

export async function GET() {
    const resp = await apiFetch("/user/", { method: "GET" });

    const text = await resp.text();
    try {
        const json = JSON.parse(text);
        return NextResponse.json(json, { status: resp.status });
    } catch {
        return new NextResponse(text, {
            status: resp.status,
            headers: { "Content-Type": "application/json" },
        });
    }
}
