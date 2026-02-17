import { NextRequest, NextResponse } from "next/server";
import {
  verifyCloudProof,
  IVerifyResponse,
  ISuccessResult,
  VerificationLevel,
} from "@worldcoin/minikit-js";

export async function POST(req: NextRequest) {
  try {
    const { payload, action, signal } = await req.json();

    if (!payload || !action) {
      return NextResponse.json(
        { error: "Missing payload or action" },
        { status: 400 }
      );
    }

    const app_id = process.env.NEXT_PUBLIC_APP_ID as `app_${string}`;
    const verifyRes = (await verifyCloudProof(
      payload as ISuccessResult,
      app_id,
      action,
      signal
    )) as IVerifyResponse;

    if (verifyRes.success) {
      return NextResponse.json({
        success: true,
        nullifier_hash: payload.nullifier_hash,
        verification_level: payload.verification_level,
      });
    }

    return NextResponse.json(
      { success: false, error: "Verification failed", detail: verifyRes },
      { status: 400 }
    );
  } catch (error) {
    console.error("Verify error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
