"use client";

import { motion } from "framer-motion";

export default function FeaturedVideo() {
  const video = {
    title: "Cirglob Launch Vision",
    description:
      "An overview of the Cirglob platform and its mission to support founders solving real-world problems.",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    date: "April 2026",
    category: "Announcement",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="group"
    >
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl">
        <div className="aspect-video overflow-hidden">
          <iframe
            src={video.videoUrl}
            title={video.title}
            className="h-full w-full"
            allowFullScreen
          />
        </div>

        <div className="p-5">
          <div className="text-xs uppercase tracking-[0.2em] text-white/35">
            {video.category} • {video.date}
          </div>

          <h3 className="mt-2 text-[20px] text-white">
            {video.title}
          </h3>

          <p className="mt-2 text-[14px] leading-[1.7] text-white/55">
            {video.description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}