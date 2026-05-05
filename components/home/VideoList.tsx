"use client";

import { motion } from "framer-motion";

export default function VideoList() {
  const videos = [
    {
      id: "1",
      title: "How Cirglob Selects Startups",
      thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    },
    {
      id: "2",
      title: "Investor Onboarding Process",
      thumbnail: "https://img.youtube.com/vi/ysz5S6PUM-U/hqdefault.jpg",
    },
    {
      id: "3",
      title: "Problem-First Startup Philosophy",
      thumbnail: "https://img.youtube.com/vi/jNQXAC9IVRw/hqdefault.jpg",
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      {videos.map((video, index) => (
        <motion.div
          key={video.id}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.08 }}
          viewport={{ once: true }}
          className="group cursor-pointer"
        >
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
            <div className="aspect-video overflow-hidden">
              <img
                src={video.thumbnail}
                alt={video.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              />
            </div>
          </div>

          <p className="mt-3 text-[14px] text-white/60 transition group-hover:text-white">
            {video.title}
          </p>
        </motion.div>
      ))}
    </div>
  );
}