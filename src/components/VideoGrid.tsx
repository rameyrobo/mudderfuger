
'use client';

import { useState } from 'react';

const videos = [
  { id: 1, title: 'ep1: INTRO', url:'https://mudderfuger.b-cdn.net/1_mudderfuger_INTRO.mp4' },
  { id: 2, title: 'ep2: walking to the park', url: 'https://mudderfuger.b-cdn.net/2_walking%20to%20the%20park4x5_.mp4' },
  { id: 3, title: 'ep3: skatepark', url: 'https://mudderfuger.b-cdn.net/3_skatepark4x5_ v3.mp4' },
  { id: 4, title: 'ep4: dinner', url: 'https://mudderfuger.b-cdn.net/3.5_dinner_4x5_ Copy 01.mp4' },
  { id: 5, title: 'ep5: walking to work', url: 'https://mudderfuger.b-cdn.net/4_photogrpher_walking_to_work_4x5_2.mp4' },
  { id: 6, title: 'ep6: donut shop', url: 'https://mudderfuger.b-cdn.net/5_donut_shop_4x5.mp4' },
  { id: 7, title: 'ep7: jail', url: 'https://mudderfuger.b-cdn.net/6_jail_mudderfuger_v1.mp4' },
  { id: 8, title: 'ep8: phone in jail', url: 'https://mudderfuger.b-cdn.net/7_jail_phone_cops_4x5.mp4' },
  { id: 9, title: 'ep9: out of jail', url: 'https://mudderfuger.b-cdn.net/8_mudderfuger_out_of_jail_v1.mp4' },
  { id: 10, title: 'ep10: out of jail pt2', url: 'https://mudderfuger.b-cdn.net/9_out%20of%20jail%20selfi_4x5.mp4' },
  { id: 11, title: 'ep11: police station', url: 'https://mudderfuger.b-cdn.net/10_police_station_skate_4x5_.mp4' },
  { id: 12, title: 'ep12: skatepark pt2', url: 'https://mudderfuger.b-cdn.net/11_MUDDERFUGER_SKATE_PART_V1.mp4' },
  { id: 13, title: 'ep13: wake up', url: 'https://mudderfuger.b-cdn.net/12_wake_up_mudderfuger_v1_1.mp4' },
];



export default function VideoGrid() {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {videos.map((video) => (
          <div key={video.id} className="cursor-pointer" onClick={() => setSelectedVideo(video.url)}>
            <video muted className="w-full h-60 object-cover rounded">
              <source src={video.url} type="video/webm" />
            </video>
            <p className="mt-2 text-lg">{video.title}</p>
          </div>
        ))}
      </div>

      {selectedVideo && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center"
          onClick={() => setSelectedVideo(null)}
        >
          <video src={selectedVideo} controls autoPlay className="max-w-6xl max-h-[80vh] border-4 border-white rounded" />
        </div>
      )}
    </>
  );
}
