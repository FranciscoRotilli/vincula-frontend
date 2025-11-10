import { NextRequest, NextResponse } from "next/server";

import { apiFetch } from "@/lib/backend";

export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ caseId: string; userId: string }> }
) {
    const { caseId, userId } = await params;

    const resp = await apiFetch(`/case/${caseId}/viewers/${userId}`, {
        method: "DELETE",
    });

    if (resp.status === 204) {
        return new NextResponse(null, { status: 204 });
    }

    const text = await resp.text();

    if (!text) {
        return new NextResponse(null, { status: resp.status });
    }

    try {
        return NextResponse.json(JSON.parse(text), { status: resp.status });
    } catch {
        return new NextResponse(text, {
            status: resp.status,
            headers: { "Content-Type": "application/json" },
        });
    }
}
