"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent } from "react";

import Field from "../ui/Field";
import VideoUpload from "../ui/VideoUpload";

const MAX_VIDEO_SIZE_MB = 100;
const MAX_VIDEO_DURATION_SECONDS = 90;
const ACCEPTED_VIDEO_MIME_TYPES = new Set(["video/mp4", "video/quicktime"]);
const ACCEPTED_VIDEO_EXTENSIONS = [".mp4", ".mov"];
const FOUNDER_VIDEO_ASSET_ROUTE = "/api/application/application-video-assets";

type FounderVideoUploadStatus =
  | "idle"
  | "selected"
  | "validated"
  | "uploaded"
  | "error";

type FounderVideoSectionValue = {
  video_url: string | null;
  asset_id: string | null;
  storage_path: string | null;
  file_name: string | null;
  mime_type: string | null;
  file_size_bytes: number | null;
  duration_seconds: number | null;
  upload_status: FounderVideoUploadStatus;
  title: string | null;
  provider: string | null;
  transcript: string | null;
  notes: string | null;
};

type FounderVideoProps = {
  value: unknown;
  onChange: (value: unknown) => void;
  locked: boolean;
  disabled: boolean;
};

type FounderVideoAssetResponse = {
  asset: {
    video_url: string | null;
    asset_id: string;
    storage_path: string;
    file_name: string;
    mime_type: string;
    file_size_bytes: number;
    duration_seconds: number;
    upload_status: "uploaded";
  } | null;
};

type UploadHandle = {
  promise: Promise<FounderVideoAssetResponse["asset"]>;
  abort: () => void;
};

function safeString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function safeNumber(value: unknown): number | null {
  const num = typeof value === "number" ? value : Number(value);
  return Number.isFinite(num) ? num : null;
}

function stripExtension(fileName: string): string {
  const trimmed = fileName.trim();
  const dotIndex = trimmed.lastIndexOf(".");
  return dotIndex > 0 ? trimmed.slice(0, dotIndex) : trimmed;
}

function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const video = document.createElement("video");

    const cleanup = () => {
      URL.revokeObjectURL(objectUrl);
    };

    video.preload = "metadata";
    video.src = objectUrl;

    video.onloadedmetadata = () => {
      const duration = video.duration;
      cleanup();

      if (!Number.isFinite(duration) || duration <= 0) {
        reject(new Error("Unable to read the video duration."));
        return;
      }

      resolve(duration);
    };

    video.onerror = () => {
      cleanup();
      reject(new Error("Unable to read the video metadata."));
    };
  });
}

async function parseFounderVideoAssetResponse(
  response: Response,
): Promise<FounderVideoAssetResponse["asset"]> {
  const payload = (await response.json().catch(() => null)) as
    | FounderVideoAssetResponse
    | { error?: string }
    | null;

  if (!response.ok) {
    const errorMessage =
      payload && "error" in payload && payload.error
        ? payload.error
        : "VIDEO_ASSET_REQUEST_FAILED";

    throw new Error(errorMessage);
  }

  const asset = payload && "asset" in payload ? payload.asset : null;
  if (!asset) return null;

  return asset;
}

function uploadFounderVideoAssetWithProgress(input: {
  file: File;
  durationSeconds: number;
  title: string | null;
  provider: string | null;
  transcript: string | null;
  notes: string | null;
  onProgress: (percent: number) => void;
}): UploadHandle {
  const formData = new FormData();
  formData.append("file", input.file);
  formData.append("duration_seconds", String(input.durationSeconds));
  formData.append("title", input.title ?? "");
  formData.append("provider", input.provider ?? "");
  formData.append("transcript", input.transcript ?? "");
  formData.append("notes", input.notes ?? "");

  const xhr = new XMLHttpRequest();

  const promise = new Promise<FounderVideoAssetResponse["asset"]>(
    (resolve, reject) => {
      xhr.open("POST", FOUNDER_VIDEO_ASSET_ROUTE, true);
      xhr.responseType = "json";

      xhr.upload.onprogress = (event) => {
        if (!event.lengthComputable || event.total <= 0) return;

        const percent = Math.max(
          1,
          Math.min(99, Math.round((event.loaded / event.total) * 100)),
        );

        input.onProgress(percent);
      };

      xhr.onerror = () => {
        reject(new Error("VIDEO_ASSET_REQUEST_FAILED"));
      };

      xhr.onabort = () => {
        reject(new Error("VIDEO_ASSET_REQUEST_ABORTED"));
      };

      xhr.onload = async () => {
        try {
          const response = {
            ok: xhr.status >= 200 && xhr.status < 300,
            status: xhr.status,
            json: async () =>
              xhr.response ?? JSON.parse(xhr.responseText || "{}"),
          } as Response;

          const asset = await parseFounderVideoAssetResponse(response);
          resolve(asset);
        } catch (error) {
          reject(error);
        }
      };

      xhr.send(formData);
    },
  );

  return {
    promise,
    abort: () => {
      if (xhr.readyState !== XMLHttpRequest.DONE) {
        xhr.abort();
      }
    },
  };
}

async function loadFounderVideoAsset(): Promise<
  FounderVideoAssetResponse["asset"]
> {
  const response = await fetch(FOUNDER_VIDEO_ASSET_ROUTE, {
    method: "GET",
    cache: "no-store",
  });

  return await parseFounderVideoAssetResponse(response);
}

async function deleteFounderVideoAsset(): Promise<void> {
  const response = await fetch(FOUNDER_VIDEO_ASSET_ROUTE, {
    method: "DELETE",
    cache: "no-store",
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as
      | { error?: string }
      | null;
    throw new Error(payload?.error ?? "VIDEO_ASSET_REMOVE_FAILED");
  }
}

function normalizeFounderVideoValue(value: unknown): FounderVideoSectionValue {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {
      video_url: null,
      asset_id: null,
      storage_path: null,
      file_name: null,
      mime_type: null,
      file_size_bytes: null,
      duration_seconds: null,
      upload_status: "idle",
      title: null,
      provider: null,
      transcript: null,
      notes: null,
    };
  }

  const candidate = value as Record<string, unknown>;
  const uploadStatus = safeString(candidate.upload_status);

  return {
    video_url: safeString(candidate.video_url),
    asset_id: safeString(candidate.asset_id),
    storage_path: safeString(candidate.storage_path),
    file_name: safeString(candidate.file_name),
    mime_type: safeString(candidate.mime_type),
    file_size_bytes: safeNumber(candidate.file_size_bytes),
    duration_seconds: safeNumber(candidate.duration_seconds),
    upload_status:
      uploadStatus === "idle" ||
      uploadStatus === "selected" ||
      uploadStatus === "validated" ||
      uploadStatus === "uploaded" ||
      uploadStatus === "error"
        ? uploadStatus
        : "idle",
    title: safeString(candidate.title),
    provider: safeString(candidate.provider),
    transcript: safeString(candidate.transcript),
    notes: safeString(candidate.notes),
  };
}

export default function FounderVideo({
  value,
  onChange,
  locked,
  disabled,
}: FounderVideoProps) {
  const introRef = useRef<HTMLInputElement | null>(null);
  const validationSeqRef = useRef(0);
  const rehydrateSeqRef = useRef(0);
  const uploadAbortRef = useRef<(() => void) | null>(null);

  const current = useMemo(() => normalizeFounderVideoValue(value), [value]);
  const currentRef = useRef<FounderVideoSectionValue>(current);

  const [introFile, setIntroFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    current.video_url,
  );
  const [fileError, setFileError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [removing, setRemoving] = useState(false);

  const objectUrlRef = useRef<string | null>(null);
  const hydratedStoragePathRef = useRef<string | null>(null);

  useEffect(() => {
    currentRef.current = current;
  }, [current]);

  const commitValue = useCallback(
    (next: FounderVideoSectionValue) => {
      onChange(next);
    },
    [onChange],
  );

  const revokeObjectPreview = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  const setPreviewFromFile = useCallback(
    (file: File) => {
      revokeObjectPreview();

      const objectUrl = URL.createObjectURL(file);
      objectUrlRef.current = objectUrl;
      setPreviewUrl(objectUrl);
    },
    [revokeObjectPreview],
  );

  useEffect(() => {
    if (introFile) return;

    setPreviewUrl(current.video_url);
  }, [current.video_url, introFile]);

  useEffect(() => {
    return () => {
      revokeObjectPreview();
      uploadAbortRef.current?.();
      uploadAbortRef.current = null;
    };
  }, [revokeObjectPreview]);

  useEffect(() => {
    let cancelled = false;

    const shouldHydrateFromServer =
      !locked &&
      !disabled &&
      current.upload_status === "uploaded" &&
      Boolean(current.storage_path) &&
      hydratedStoragePathRef.current !== current.storage_path;

    if (!shouldHydrateFromServer) {
      return () => {
        cancelled = true;
      };
    }

    hydratedStoragePathRef.current = current.storage_path;
    const seq = ++rehydrateSeqRef.current;

    void (async () => {
      try {
        const asset = await loadFounderVideoAsset();

        if (cancelled || seq !== rehydrateSeqRef.current || !asset) {
          return;
        }

        const nextValue: FounderVideoSectionValue = {
          ...currentRef.current,
          video_url: asset.video_url,
          asset_id: asset.asset_id,
          storage_path: asset.storage_path,
          file_name: asset.file_name,
          mime_type: asset.mime_type,
          file_size_bytes: asset.file_size_bytes,
          duration_seconds: asset.duration_seconds,
          upload_status: asset.upload_status,
        };

        commitValue(nextValue);
        setPreviewUrl(asset.video_url);
      } catch {
        // Non-fatal. The saved draft still remains usable.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [commitValue, current, disabled, locked]);

  const handleIntroFile = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      if (locked || disabled) {
        e.target.value = "";
        return;
      }

      const file = e.target.files?.[0];
      e.target.value = "";

      if (!file) return;

      const maxBytes = MAX_VIDEO_SIZE_MB * 1024 * 1024;
      const fileName = file.name.toLowerCase();

      const isAcceptedType =
        ACCEPTED_VIDEO_MIME_TYPES.has(file.type) ||
        ACCEPTED_VIDEO_EXTENSIONS.some((extension) =>
          fileName.endsWith(extension),
        );

      if (!isAcceptedType) {
        setFileError("Only MP4 or MOV videos are accepted.");
        commitValue({
          ...currentRef.current,
          upload_status: "error",
        });
        return;
      }

      if (file.size > maxBytes) {
        setFileError("Video must be smaller than 100 MB.");
        commitValue({
          ...currentRef.current,
          upload_status: "error",
        });
        return;
      }

      const validationSeq = ++validationSeqRef.current;

      try {
        setIsValidating(true);
        setIsUploading(false);
        setUploadProgress(0);
        setFileError(null);

        const duration = await getVideoDuration(file);

        if (validationSeq !== validationSeqRef.current) return;

        const durationSeconds = Math.round(duration);

        if (durationSeconds > MAX_VIDEO_DURATION_SECONDS) {
          setFileError("Video must be 90 seconds or shorter.");
          commitValue({
            ...currentRef.current,
            upload_status: "error",
          });
          return;
        }

        const nextDraft: FounderVideoSectionValue = {
          ...currentRef.current,
          video_url: null,
          asset_id: null,
          storage_path: null,
          file_name: file.name,
          mime_type: file.type || null,
          file_size_bytes: file.size,
          duration_seconds: durationSeconds,
          upload_status: "validated",
          title: currentRef.current.title ?? stripExtension(file.name),
        };

        setIntroFile(file);
        commitValue(nextDraft);

        setIsValidating(false);
        setIsUploading(true);
        setUploadProgress(1);
        setPreviewFromFile(file);

        const upload = uploadFounderVideoAssetWithProgress({
          file,
          durationSeconds,
          title: nextDraft.title ?? null,
          provider: nextDraft.provider ?? null,
          transcript: nextDraft.transcript ?? null,
          notes: nextDraft.notes ?? null,
          onProgress: (percent) => {
            if (validationSeq !== validationSeqRef.current) return;
            setUploadProgress(percent);
          },
        });

        uploadAbortRef.current = upload.abort;

        const savedAsset = await upload.promise;

        if (validationSeq !== validationSeqRef.current) return;

        if (!savedAsset) {
          throw new Error("VIDEO_ASSET_SAVE_FAILED");
        }

        hydratedStoragePathRef.current = savedAsset.storage_path;
        setUploadProgress(100);

        const nextValue: FounderVideoSectionValue = {
          ...currentRef.current,
          video_url: savedAsset.video_url,
          asset_id: savedAsset.asset_id,
          storage_path: savedAsset.storage_path,
          file_name: savedAsset.file_name,
          mime_type: savedAsset.mime_type,
          file_size_bytes: savedAsset.file_size_bytes,
          duration_seconds: savedAsset.duration_seconds,
          upload_status: savedAsset.upload_status,
          title: currentRef.current.title ?? stripExtension(file.name),
        };

        commitValue(nextValue);
        revokeObjectPreview();
        setPreviewUrl(savedAsset.video_url);
        setIntroFile(null);
      } catch (error) {
        if (validationSeq !== validationSeqRef.current) return;

        setFileError(
          error instanceof Error
            ? error.message
            : "That video could not be saved. Please try again.",
        );

        commitValue({
          ...currentRef.current,
          upload_status: "error",
        });
      } finally {
        if (validationSeq === validationSeqRef.current) {
          setIsValidating(false);
          setIsUploading(false);
          uploadAbortRef.current = null;
        }
      }
    },
    [commitValue, currentRef, disabled, locked, revokeObjectPreview, setPreviewFromFile],
  );

  const removeIntroFile = useCallback(async () => {
    validationSeqRef.current += 1;
    rehydrateSeqRef.current += 1;
    hydratedStoragePathRef.current = null;

    if (isUploading) {
      uploadAbortRef.current?.();
      uploadAbortRef.current = null;
    }

    revokeObjectPreview();

    setRemoving(false);
    setIntroFile(null);
    setPreviewUrl(null);
    setFileError(null);
    setIsValidating(false);
    setIsUploading(false);
    setUploadProgress(0);

    const shouldDeletePersistedAsset =
      currentRef.current.upload_status === "uploaded" &&
      Boolean(currentRef.current.storage_path);

    if (shouldDeletePersistedAsset) {
      try {
        await deleteFounderVideoAsset();
      } catch {
        // Local state still clears so the section stays usable.
      }
    }

    commitValue({
      ...currentRef.current,
      video_url: null,
      asset_id: null,
      storage_path: null,
      file_name: null,
      mime_type: null,
      file_size_bytes: null,
      duration_seconds: null,
      upload_status: "idle",
    });

    if (introRef.current) {
      introRef.current.value = "";
    }
  }, [commitValue, currentRef, isUploading, revokeObjectPreview]);

  const preview = previewUrl;
  const isReadOnly = locked || disabled;
  const fileName =
    introFile?.name ?? current.file_name ?? (current.upload_status === "uploaded"
      ? "Saved video"
      : null);

  return (
    <div className="space-y-10">
      <div>
        <h3 className="text-xl font-medium tracking-tight text-white">
          2. Founder Video
        </h3>

        <p className="mt-1 max-w-2xl text-sm leading-6 text-white/50">
          Short videos help us understand how the founders think, communicate,
          and explain what they are building in a more direct and human way.
        </p>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-white/50">
          Production quality does not matter. Clear thinking, authenticity,
          and communication do.
        </p>
      </div>

      <Field label="Founder introduction video *">
        <div className="space-y-4">
          <div className="space-y-3 text-sm leading-6 text-white/50">
            <p>
              Record a short video introducing the founders and the company.
            </p>

            <div>
              <p className="mb-2">Explain:</p>

              <ul className="space-y-1 pl-5 text-white/45">
                <li className="list-disc">what you are building</li>
                <li className="list-disc">
                  why you are working on this problem
                </li>
                <li className="list-disc">
                  why this team is well positioned to solve it
                </li>
              </ul>
            </div>

            <p>
              The video should primarily feature the founders speaking directly.
            </p>

            <p>
              Keep the video natural and conversational. Do not create a
              promotional or highly edited video.
            </p>

            <p>
              If there are multiple founders, all founders should appear in the
              video.
            </p>
          </div>

          <div className="space-y-1 text-xs text-white/40">
            <div>Recommended length: 60–90 seconds</div>
            <div>Accepted formats: MP4, MOV</div>
            <div>Maximum file size: 100 MB</div>
          </div>

          <div className="space-y-2">
            {fileError ? (
              <p className="text-sm leading-6 text-red-400" role="alert">
                {fileError}
              </p>
            ) : null}

            {isValidating ? (
              <p className="text-xs text-white/40" aria-live="polite">
                Checking video metadata…
              </p>
            ) : null}

            {isUploading ? (
              <p className="text-xs text-white/40" aria-live="polite">
                Uploading… {uploadProgress}%
              </p>
            ) : null}

            <VideoUpload
              inputRef={introRef}
              file={introFile}
              fileName={fileName}
              preview={preview}
              onClick={() => {
                if (isReadOnly) return;
                introRef.current?.click();
              }}
              onPick={handleIntroFile}
              onRemove={() => {
                void removeIntroFile();
              }}
              label="Upload video"
              accept="video/mp4,video/quicktime,.mp4,.mov"
              variant="founder"
              uploading={isUploading}
              uploadProgress={uploadProgress}
              canRemove={!isReadOnly}
              uploaded={current.upload_status === "uploaded"}
            />
          </div>
        </div>
      </Field>
    </div>
  );
}