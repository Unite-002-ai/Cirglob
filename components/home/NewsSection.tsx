"use client";

import FeaturedVideo from "./FeaturedVideo";
import VideoList from "./VideoList";
import NewsFeed from "./NewsFeed";

export default function NewsSection() {
  return (
    <section className="relative py-28 text-white">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="mb-20 flex flex-col items-center text-center">
          <h2 className="text-[36px] font-semibold tracking-tight md:text-[44px]">
            News & Updates
          </h2>

          <p className="mt-5 max-w-[640px] text-[16px] leading-[1.7] text-white/55 md:text-[18px]">
            A live view into the Cirglob ecosystem — announcements, founder stories,
            and platform updates.
          </p>
        </div>

        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-3">
          <div>
            <VideoList />
          </div>

          <div>
            <FeaturedVideo />
          </div>

          <div>
            <NewsFeed />
          </div>
        </div>
      </div>
    </section>
  );
}