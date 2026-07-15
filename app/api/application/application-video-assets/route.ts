import "server-only";

import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createServerSupabaseServiceClient } from "@/lib/supabase/server-service";
import {
  getApplicationRecordIdByPublicId,
} from "@/lib/cirglob-runtime/application-invitations.server";
import {
  loadWorkspaceRuntime,
  WorkspaceRuntimeError,
} from "@/lib/workspace-runtime.server";
import { assertCanEditApplication } from "@/lib/workspace-runtime.shared";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

const BUCKET_ID = "application-videos";
const SECTION = "founder_video";
const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024;
const MAX_DURATION_SECONDS = 90;
const SIGNED_URL_TTL_SECONDS = 60 * 60 * 24;

type VideoAssetRow = {
  id: string;
  application_id: string;
  section: string;
  asset_id: string;
  bucket_id: string;
  storage_path: string;
  file_name: string;
  mime_type: string;
  file_size_bytes: number;
  duration_seconds: number;
  upload_status: string;
  created_by: string | null;
  video_url: string | null;
  video_url_expires_at: string | null;
  created_at: string;
  updated_at: string;
};

type VideoAssetPayload = {
  video_url: string | null;
  asset_id: string;
  storage_path: string;
  file_name: string;
  mime_type: string;
  file_size_bytes: number;
  duration_seconds: number;
  upload_status: "uploaded";
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;

  try {
    return JSON.stringify(error);
  } catch {
    return "Unknown error";
  }
}

function normalizeFileName(fileName: string): string {
  const trimmed = fileName.trim();
  const safe = trimmed
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  return safe.length > 0 ? safe : "video.mp4";
}

function buildStoragePath(applicationPublicId: string, assetId: string, fileName: string): string {
  return `${applicationPublicId}/founder-video/${assetId}/${normalizeFileName(fileName)}`;
}

function isValidDuration(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value > 0 &&
    value <= MAX_DURATION_SECONDS
  );
}

async function resolveRequestContext(): Promise<{
  userId: string;
  applicationPublicId: string;
  applicationRecordId: string;
}> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("UNAUTHORIZED");
  }

  let workspace;
  try {
    workspace = await loadWorkspaceRuntime(user.id);
  } catch (error) {
    if (error instanceof WorkspaceRuntimeError && error.code === "UNAUTHORIZED") {
      throw new Error("UNAUTHORIZED");
    }

    throw new Error(`WORKSPACE_LOAD_FAILED:${getErrorMessage(error)}`);
  }

  assertCanEditApplication(workspace);

  if (!workspace.activeApplicationId) {
    throw new Error("NO_ACTIVE_APPLICATION");
  }

  const applicationRecordId = await getApplicationRecordIdByPublicId(
    supabase,
    workspace.activeApplicationId,
  );

  if (!applicationRecordId) {
    throw new Error("APPLICATION_NOT_FOUND");
  }

  return {
    userId: user.id,
    applicationPublicId: workspace.activeApplicationId,
    applicationRecordId,
  };
}

async function buildSignedAssetPayload(
  serviceSupabase: ReturnType<typeof createServerSupabaseServiceClient>,
  row: VideoAssetRow | null,
): Promise<VideoAssetPayload | null> {
  if (!row) return null;

  const { data: signed, error: signedError } = await serviceSupabase.storage
    .from(BUCKET_ID)
    .createSignedUrl(row.storage_path, SIGNED_URL_TTL_SECONDS);

  if (signedError) {
    throw new Error(
      `Failed to create signed video URL: ${getErrorMessage(signedError)}`,
    );
  }

  return {
    video_url: signed?.signedUrl ?? null,
    asset_id: row.asset_id,
    storage_path: row.storage_path,
    file_name: row.file_name,
    mime_type: row.mime_type,
    file_size_bytes: row.file_size_bytes,
    duration_seconds: row.duration_seconds,
    upload_status: "uploaded",
  };
}

export async function GET(): Promise<NextResponse> {
  try {
    const { applicationRecordId } = await resolveRequestContext();
    const serviceSupabase = createServerSupabaseServiceClient();

    const { data, error } = await serviceSupabase
      .from("application_video_assets")
      .select(
        "id, application_id, section, asset_id, bucket_id, storage_path, file_name, mime_type, file_size_bytes, duration_seconds, upload_status, created_by, video_url, video_url_expires_at, created_at, updated_at",
      )
      .eq("application_id", applicationRecordId)
      .eq("section", SECTION)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: "VIDEO_ASSET_LOAD_FAILED" },
        { status: 500 },
      );
    }

    const payload = await buildSignedAssetPayload(
      serviceSupabase,
      (data ?? null) as VideoAssetRow | null,
    );

    return NextResponse.json(
      { asset: payload },
      { status: 200 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    if (message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    if (message === "NO_ACTIVE_APPLICATION") {
      return NextResponse.json(
        { error: "NO_ACTIVE_APPLICATION" },
        { status: 400 },
      );
    }

    if (message === "APPLICATION_NOT_FOUND") {
      return NextResponse.json(
        { error: "APPLICATION_NOT_FOUND" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { error: "VIDEO_ASSET_LOAD_FAILED" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { userId, applicationPublicId, applicationRecordId } =
      await resolveRequestContext();

    const formData = await request.formData();
    const fileValue = formData.get("file");

    if (!(fileValue instanceof File)) {
      return NextResponse.json({ error: "INVALID_FILE" }, { status: 400 });
    }

    if (!fileValue.name) {
      return NextResponse.json({ error: "INVALID_FILE_NAME" }, { status: 400 });
    }

    if (!["video/mp4", "video/quicktime"].includes(fileValue.type)) {
      return NextResponse.json({ error: "INVALID_FILE_TYPE" }, { status: 400 });
    }

    if (fileValue.size <= 0 || fileValue.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json({ error: "FILE_TOO_LARGE" }, { status: 413 });
    }

    const durationRaw = Number(formData.get("duration_seconds"));
    if (!isValidDuration(durationRaw)) {
      return NextResponse.json(
        { error: "INVALID_DURATION" },
        { status: 400 },
      );
    }

    const assetId = randomUUID();
    const storagePath = buildStoragePath(
      applicationPublicId,
      assetId,
      fileValue.name,
    );

    const serviceSupabase = createServerSupabaseServiceClient();

    const existingDelete = await serviceSupabase
      .from("application_video_assets")
      .select("storage_path")
      .eq("application_id", applicationRecordId)
      .eq("section", SECTION)
      .maybeSingle();

    const uploadBuffer = Buffer.from(await fileValue.arrayBuffer());

    const { error: uploadError } = await serviceSupabase.storage
      .from(BUCKET_ID)
      .upload(storagePath, uploadBuffer, {
        contentType: fileValue.type,
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json(
        { error: "VIDEO_UPLOAD_FAILED" },
        { status: 500 },
      );
    }

    const { error: upsertError } = await serviceSupabase
      .from("application_video_assets")
      .upsert(
        {
          application_id: applicationRecordId,
          section: SECTION,
          asset_id: assetId,
          bucket_id: BUCKET_ID,
          storage_path: storagePath,
          file_name: normalizeFileName(fileValue.name),
          mime_type: fileValue.type,
          file_size_bytes: fileValue.size,
          duration_seconds: durationRaw,
          upload_status: "uploaded",
          created_by: userId,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "application_id,section",
        },
      );

    if (upsertError) {
      return NextResponse.json(
        { error: "VIDEO_ASSET_SAVE_FAILED" },
        { status: 500 },
      );
    }

    if (
      existingDelete.data?.storage_path &&
      existingDelete.data.storage_path !== storagePath
    ) {
      void serviceSupabase.storage
        .from(BUCKET_ID)
        .remove([existingDelete.data.storage_path])
        .catch(() => undefined);
    }

    const { data: insertedRow, error: fetchError } = await serviceSupabase
      .from("application_video_assets")
      .select(
        "id, application_id, section, asset_id, bucket_id, storage_path, file_name, mime_type, file_size_bytes, duration_seconds, upload_status, created_by, video_url, video_url_expires_at, created_at, updated_at",
      )
      .eq("application_id", applicationRecordId)
      .eq("section", SECTION)
      .maybeSingle();

    if (fetchError || !insertedRow) {
      return NextResponse.json(
        { error: "VIDEO_ASSET_SAVE_FAILED" },
        { status: 500 },
      );
    }

    const payload = await buildSignedAssetPayload(
      serviceSupabase,
      insertedRow as VideoAssetRow,
    );

    return NextResponse.json(
      { asset: payload },
      { status: 201 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    if (message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    if (message === "NO_ACTIVE_APPLICATION") {
      return NextResponse.json(
        { error: "NO_ACTIVE_APPLICATION" },
        { status: 400 },
      );
    }

    if (message === "APPLICATION_NOT_FOUND") {
      return NextResponse.json(
        { error: "APPLICATION_NOT_FOUND" },
        { status: 404 },
      );
    }

    if (message.startsWith("WORKSPACE_LOAD_FAILED:")) {
      return NextResponse.json(
        { error: "WORKSPACE_LOAD_FAILED" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { error: "VIDEO_UPLOAD_FAILED" },
      { status: 500 },
    );
  }
}

export async function DELETE(): Promise<NextResponse> {
  try {
    const { applicationRecordId } = await resolveRequestContext();
    const serviceSupabase = createServerSupabaseServiceClient();

    const { data, error } = await serviceSupabase
      .from("application_video_assets")
      .select("id, storage_path")
      .eq("application_id", applicationRecordId)
      .eq("section", SECTION)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: "VIDEO_ASSET_REMOVE_FAILED" },
        { status: 500 },
      );
    }

    if (data?.storage_path) {
      void serviceSupabase.storage
        .from(BUCKET_ID)
        .remove([data.storage_path])
        .catch(() => undefined);
    }

    if (data?.id) {
      const { error: deleteError } = await serviceSupabase
        .from("application_video_assets")
        .delete()
        .eq("id", data.id);

      if (deleteError) {
        return NextResponse.json(
          { error: "VIDEO_ASSET_REMOVE_FAILED" },
          { status: 500 },
        );
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    if (message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    if (message === "NO_ACTIVE_APPLICATION") {
      return NextResponse.json(
        { error: "NO_ACTIVE_APPLICATION" },
        { status: 400 },
      );
    }

    if (message === "APPLICATION_NOT_FOUND") {
      return NextResponse.json(
        { error: "APPLICATION_NOT_FOUND" },
        { status: 404 },
      );
    }

    if (message.startsWith("WORKSPACE_LOAD_FAILED:")) {
      return NextResponse.json(
        { error: "WORKSPACE_LOAD_FAILED" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { error: "VIDEO_ASSET_REMOVE_FAILED" },
      { status: 500 },
    );
  }
}