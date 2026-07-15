"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { motion } from "framer-motion";
import Input from "../ui/Input";
import Textarea from "../ui/Textarea";
import Field from "../ui/Field";
import VideoUpload from "../ui/VideoUpload";

type CompanyFormState = {
  companyName: string;
  tagline: string;
  website: string;
  productUrl: string;
  login: string;
  whatBuilding: string;
  problem: string;
  customer: string;
  location: string;
  locationReason: string;
};

type StoredVideo = {
  name: string;
  type: string;
  lastModified: number;
  blob: Blob;
};

type CompanySectionRuntimeProps = {
  value: unknown;
  onChange: (value: unknown) => void;
  applicationId: string | null;
};

const COMPANY_DB_NAME = "cirglob-company-files";
const COMPANY_STORE_NAME = "videos";

const EMPTY_FORM_STATE: CompanyFormState = {
  companyName: "",
  tagline: "",
  website: "",
  productUrl: "",
  login: "",
  whatBuilding: "",
  problem: "",
  customer: "",
  location: "",
  locationReason: "",
};

function openVideoDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB is not available"));
      return;
    }

    const request = indexedDB.open(COMPANY_DB_NAME, 1);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(COMPANY_STORE_NAME)) {
        db.createObjectStore(COMPANY_STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error ?? new Error("Failed to open IndexedDB"));
  });
}

function txDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("Transaction failed"));
    tx.onabort = () => reject(tx.error ?? new Error("Transaction aborted"));
  });
}

async function saveVideoDraft(key: string, file: File) {
  const db = await openVideoDb();

  try {
    const tx = db.transaction(COMPANY_STORE_NAME, "readwrite");
    const store = tx.objectStore(COMPANY_STORE_NAME);

    const data: StoredVideo = {
      name: file.name,
      type: file.type,
      lastModified: file.lastModified,
      blob: file.slice(0, file.size, file.type),
    };

    store.put(data, key);
    await txDone(tx);
  } finally {
    db.close();
  }
}

async function loadVideoDraft(key: string): Promise<File | null> {
  const db = await openVideoDb();

  try {
    const tx = db.transaction(COMPANY_STORE_NAME, "readonly");
    const store = tx.objectStore(COMPANY_STORE_NAME);

    const stored = await new Promise<StoredVideo | undefined>((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result as StoredVideo | undefined);
      request.onerror = () =>
        reject(request.error ?? new Error("Failed to load video"));
    });

    await txDone(tx).catch(() => {
      /* ignore */
    });

    if (!stored) return null;

    return new File([stored.blob], stored.name, {
      type: stored.type,
      lastModified: stored.lastModified,
    });
  } finally {
    db.close();
  }
}

async function deleteVideoDraft(key: string) {
  const db = await openVideoDb();

  try {
    const tx = db.transaction(COMPANY_STORE_NAME, "readwrite");
    const store = tx.objectStore(COMPANY_STORE_NAME);
    store.delete(key);
    await txDone(tx);
  } finally {
    db.close();
  }
}

function normalizeCompanyState(value: unknown): CompanyFormState {
  if (!value || typeof value !== "object") return EMPTY_FORM_STATE;

  const candidate = value as Partial<CompanyFormState>;
  return {
    companyName: candidate.companyName ?? "",
    tagline: candidate.tagline ?? "",
    website: candidate.website ?? "",
    productUrl: candidate.productUrl ?? "",
    login: candidate.login ?? "",
    whatBuilding: candidate.whatBuilding ?? "",
    problem: candidate.problem ?? "",
    customer: candidate.customer ?? "",
    location: candidate.location ?? "",
    locationReason: candidate.locationReason ?? "",
  };
}

function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";

    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(video.duration);
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Unable to read video metadata"));
    };

    video.src = url;
  });
}

async function validateVideo(
  file: File,
  maxSizeMB: number,
  maxDurationSeconds: number
): Promise<string | null> {
  if (!file.type.startsWith("video/")) {
    return "Please upload a valid video file.";
  }

  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return `Video is too large. Maximum size is ${maxSizeMB} MB.`;
  }

  try {
    const duration = await getVideoDuration(file);
    if (duration > maxDurationSeconds) {
      return `Video is too long. Maximum length is ${maxDurationSeconds} seconds.`;
    }
  } catch {
    return "We could not read this video. Please try another file.";
  }

  return null;
}

function usePersistedVideo(
  storageKey: string,
  maxSizeMB: number,
  maxDurationSeconds: number
) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const saved = await loadVideoDraft(storageKey);
        if (!cancelled && saved) {
          setFile(saved);
        }
      } catch {
        // Ignore load errors
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [storageKey]);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    e.target.value = "";

    if (!selected) return;

    setChecking(true);
    setError(null);

    const validationError = await validateVideo(
      selected,
      maxSizeMB,
      maxDurationSeconds
    );

    if (validationError) {
      setError(validationError);
      setChecking(false);
      return;
    }

    setFile(selected);

    try {
      await saveVideoDraft(storageKey, selected);
    } catch {
      // Ignore save errors
    }

    setChecking(false);
  };

  const removeFile = async () => {
    setFile(null);
    setPreview(null);
    setError(null);

    try {
      await deleteVideoDraft(storageKey);
    } catch {
      // Ignore delete errors
    }
  };

  return {
    file,
    preview,
    error,
    checking,
    handleFile,
    removeFile,
  };
}

/* ================= FOUNDERS ================= */

export function FounderVideo() {
  const introInputRef = useRef<HTMLInputElement | null>(null);

  const introVideo = usePersistedVideo(
    "cirglob-founder-intro-video",
    100,
    90
  );

  return (
    <div className="space-y-10">
      <div>
        <h3 className="text-xl font-medium tracking-tight text-white">
          2. Founder Video
        </h3>
        <p className="mt-1 max-w-xl text-sm text-white/50">
          Short videos help us better understand the people behind the company
          beyond written answers.
        </p>
        <p className="mt-1 max-w-xl text-sm text-white/50">
          Production quality does not matter. Clear thinking and authenticity do.
        </p>
      </div>

      <Field label="1. Founder introduction video *">
        <div className="space-y-3">
          <div className="text-xs text-white/40">
            Record a short video introducing the founders, the company, and why
            you are working on this problem.
          </div>

          <div className="text-xs text-white/40">
            Suggested topics
            <br />
            Who are you?
            <br />
            What are you building?
            <br />
            Why this problem?
            <br />
            Why now?
            <br />
            Why are you the right team to solve it?
          </div>

          <div className="text-xs text-white/40">
            Recommended length: 60–90 seconds
          </div>
          <div className="text-xs text-white/40">Accepted formats: MP4, MOV</div>

          <VideoUpload
            inputRef={introInputRef}
            file={introVideo.file}
            preview={introVideo.preview}
            error={introVideo.error}
            checking={introVideo.checking}
            onClick={() => introInputRef.current?.click()}
            onPick={introVideo.handleFile}
            onRemove={introVideo.removeFile}
            emptyLabel="Upload video"
            limitText="Max length: 90 seconds · Max size: 100 MB"
          />
        </div>
      </Field>
    </div>
  );
}

/* ================= COMPANY ================= */

export default function Company({
  value,
  onChange,
  applicationId,
}: CompanySectionRuntimeProps) {
  const form = normalizeCompanyState(value);
  const productVideoInputRef = useRef<HTMLInputElement | null>(null);

  const videoStorageKey = useMemo(
    () => `cirglob-company-demo-video:${applicationId ?? "draft"}`,
    [applicationId],
  );

  const [productVideo, setProductVideo] = useState<{
    file: File | null;
    preview: string | null;
    error: string | null;
    checking: boolean;
  }>({
    file: null,
    preview: null,
    error: null,
    checking: false,
  });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const saved = await loadVideoDraft(videoStorageKey);
        if (!cancelled && saved) {
          const preview = URL.createObjectURL(saved);
          setProductVideo({
            file: saved,
            preview,
            error: null,
            checking: false,
          });
        }
      } catch {
        // Ignore load errors
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [videoStorageKey]);

  useEffect(() => {
    return () => {
      if (productVideo.preview) {
        URL.revokeObjectURL(productVideo.preview);
      }
    };
  }, [productVideo.preview]);

  const handleChange = (field: keyof CompanyFormState, nextValue: string) => {
    onChange({
      ...form,
      [field]: nextValue,
    });
  };

  const handlePickVideo = async (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    e.target.value = "";

    if (!selected) return;

    setProductVideo((current) => ({
      ...current,
      checking: true,
      error: null,
    }));

    const validationError = await validateVideo(selected, 250, 180);

    if (validationError) {
      setProductVideo((current) => ({
        ...current,
        checking: false,
        error: validationError,
      }));
      return;
    }

    const previousPreview = productVideo.preview;
    const preview = URL.createObjectURL(selected);

    setProductVideo({
      file: selected,
      preview,
      error: null,
      checking: false,
    });

    try {
      await saveVideoDraft(videoStorageKey, selected);
    } catch {
      // Ignore save errors
    }

    onChange({
      ...form,
      productDemoVideo: {
        name: selected.name,
        type: selected.type,
        lastModified: selected.lastModified,
        size: selected.size,
        storageKey: videoStorageKey,
      },
    });

    if (previousPreview) {
      URL.revokeObjectURL(previousPreview);
    }
  };

  const handleRemoveVideo = async () => {
    const previousPreview = productVideo.preview;

    setProductVideo({
      file: null,
      preview: null,
      error: null,
      checking: false,
    });

    try {
      await deleteVideoDraft(videoStorageKey);
    } catch {
      // Ignore delete errors
    }

    onChange({
      ...form,
      productDemoVideo: null,
    });

    if (previousPreview) {
      URL.revokeObjectURL(previousPreview);
    }
  };

  return (
    <motion.section
      id="company"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-10"
    >
      <div>
        <h3 className="text-xl font-medium tracking-tight text-white">
          3. Company
        </h3>
        <p className="mt-1 text-sm text-white/50">
          Help us understand what you are building, who needs it, and why it matters.
        </p>
      </div>

      <div className="space-y-8">
        <Input
          label="Company name *"
          placeholder="Your company name"
          value={form.companyName}
          onChange={(v) => handleChange("companyName", v)}
        />

        <Input
          label="Describe your company in one sentence (60 characters max) *"
          placeholder="Short one-line description"
          value={form.tagline}
          maxLength={60}
          onChange={(v) => handleChange("tagline", v)}
        />

        <Input
          label="Website URL"
          placeholder="https://yourcompany.com"
          value={form.website}
          onChange={(v) => handleChange("website", v)}
        />

        <Input
          label="Product URL or demo link"
          placeholder="App, prototype, Figma, GitHub, demo, or landing page"
          value={form.productUrl}
          onChange={(v) => handleChange("productUrl", v)}
        />

        <Field label="Product access instructions (optional)">
          <Textarea
            placeholder="Demo account, invite flow, access notes, or testing instructions"
            value={form.login}
            onChange={(v) => handleChange("login", v)}
            className="!min-h-[110px]"
          />
        </Field>

        <Field label="What are you building, and how does it work? *">
          <Textarea
            placeholder="Explain the product clearly, including the core workflow and what users actually do."
            value={form.whatBuilding}
            onChange={(v) => handleChange("whatBuilding", v)}
            className="!min-h-[150px]"
          />
        </Field>

        <Field label="What specific problem or inefficiency makes this company necessary? *">
          <Textarea
            placeholder="Describe the pain point, inefficiency, or unmet need that makes this company necessary."
            value={form.problem}
            onChange={(v) => handleChange("problem", v)}
            className="!min-h-[150px]"
          />
        </Field>

        <Field label="Who experiences this problem most urgently today? *">
          <Textarea
            placeholder="Describe the people, organizations, or industries that feel this problem most intensely today."
            value={form.customer}
            onChange={(v) => handleChange("customer", v)}
            className="!min-h-[150px]"
          />
        </Field>

        <Input
          label="Where is the founding team currently based, and where will the company primarily operate? *"
          placeholder="Cairo, Egypt → San Francisco, USA"
          value={form.location}
          onChange={(v) => handleChange("location", v)}
        />

        <Field label="What advantages does this operating environment provide?">
          <Textarea
            placeholder="Talent, market access, regulation, infrastructure, proximity to customers, etc."
            value={form.locationReason}
            onChange={(v) => handleChange("locationReason", v)}
            className="!min-h-[130px]"
          />
        </Field>

        <Field label="If you have a product demo or walkthrough, attach it below.">
          <div className="space-y-3">
            <VideoUpload
              inputRef={productVideoInputRef}
              file={productVideo.file}
              preview={productVideo.preview}
              error={productVideo.error}
              checking={productVideo.checking}
              onClick={() => productVideoInputRef.current?.click()}
              onPick={handlePickVideo}
              onRemove={handleRemoveVideo}
              emptyLabel="Upload video"
              limitText="Max length: 3 minutes · Max size: 250 MB"
            />

            <p className="text-xs text-white/30">
              Product demos or walkthroughs that help us understand what exists today.
            </p>
          </div>
        </Field>
      </div>
    </motion.section>
  );
}