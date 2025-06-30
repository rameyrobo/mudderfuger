import { useRef, useState } from 'react';
import { SpeakerWaveIcon, SpeakerXMarkIcon } from '@heroicons/react/24/solid';

const videos = [
  { id: 1, title: 'ep1: INTRO', url:'https://mudderfuger.b-cdn.net/_vids/1_mudderfuger_intro.mp4' },
  { id: 2, title: 'ep2: walking to the park', url: 'https://mudderfuger.b-cdn.net/_vids/2_walking_to_the_park.mp4' },
  { id: 3, title: 'ep3: skatepark', url: 'https://mudderfuger.b-cdn.net/_vids/3_skatepark.mp4' },
  { id: 4, title: 'ep4: dinner', url: 'https://mudderfuger.b-cdn.net/_vids/3.5_dinner.mp4' },
  { id: 5, title: 'ep5: walking to work', url: 'https://mudderfuger.b-cdn.net/_vids/4_photogrpher_walking_to_work.mp4' },
  { id: 6, title: 'ep6: donut shop', url: 'https://mudderfuger.b-cdn.net/_vids/5_donut_shop.mp4' },
  { id: 7, title: 'ep7: jail', url: 'https://mudderfuger.b-cdn.net/_vids/6_jail_mudderfuger.mp4' },
  { id: 8, title: 'ep8: phone in jail', url: 'https://mudderfuger.b-cdn.net/_vids/7_jail_phone_cops.mp4' },
  { id: 9, title: 'ep9: out of jail', url: 'https://mudderfuger.b-cdn.net/_vids/8_mudderfuger_out_of_jail.mp4' },
  { id: 10, title: 'ep10: out of jail pt2', url: 'https://mudderfuger.b-cdn.net/_vids/9_out_of_jail_selfi-hevc.mp4' },
  { id: 11, title: 'ep11: police station', url: 'https://mudderfuger.b-cdn.net/_vids/10_police_station_skate.mp4' },
  { id: 12, title: 'ep12: skatepark pt2', url: 'https://mudderfuger.b-cdn.net/_vids/11_mudderfuger_skate_part.mp4' },
  { id: 13, title: 'ep13: wake up', url: 'https://mudderfuger.b-cdn.net/_vids/12_wake_up_mudderfuger.mp4' }
];

export default function VideoGrid({
    isMuted,
  }: {
    isMuted: boolean;
  }) {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [hoverTimeMap, setHoverTimeMap] = useState<{ [key: number]: number }>({});
  const hoverRefs = useRef<{ [key: number]: HTMLVideoElement | null }>({});
  const [localIsMuted, setLocalIsMuted] = useState<boolean>(isMuted);

  const handleMuteToggle = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setLocalIsMuted(!localIsMuted);
  };

  const handleMouseEnter = (videoId: number) => {
    const el = hoverRefs.current[videoId];
    if (el) {
      el.play().catch(() => {});
    }
  };

  const handleMouseLeave = (videoId: number) => {
    const el = hoverRefs.current[videoId];
    if (el) {
      setHoverTimeMap(prev => ({ ...prev, [videoId]: el.currentTime }));
      el.pause();
    }
  };

  const handleClick = (videoId: number, url: string) => {
    const time = hoverRefs.current[videoId]?.currentTime || 0;
    setHoverTimeMap(prev => ({ ...prev, [videoId]: time }));
    setSelectedVideo(url);
  };

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 px-4 lg:px-20 sm:px-6 xl:px-52">
        {videos.map(video => (
          <div
            key={video.id}
            className="relative group cursor-pointer"
            onClick={() => handleClick(video.id, video.url)}
            onMouseEnter={() => handleMouseEnter(video.id)}
            onMouseLeave={() => handleMouseLeave(video.id)}
          >
            <div className="aspect-[4/5] w-full relative">
              <video
                ref={el => {
                  hoverRefs.current[video.id] = el;
                }}
                muted={localIsMuted}
                preload="auto"
                playsInline
                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
              >
                <source src={video.url.replace('.mp4', '.webm')} type="video/webm" />
                <source src={video.url} type="video/mp4" />
              </video>
              <div className="absolute top-2 right-2 z-20 cursor-pointer" onClick={handleMuteToggle}>
                {localIsMuted ? (
                  <SpeakerXMarkIcon className="h-6 w-6 text-white" />
                ) : (
                  <SpeakerWaveIcon className="h-6 w-6 text-white" />
                )}
              </div>
              <div className="font-arial-bold absolute top-2 left-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-sm">
                {video.title}
              </div>
            </div>
          </div>
        ))}
      </div>
      {selectedVideo && (
        <div
          className="fixed max-w-[100vw] inset-0 bg-black bg-opacity-70 z-60 flex items-center justify-center"
          onClick={() => {
            const modalVideo = document.querySelector('#modalVideo') as HTMLVideoElement;
            modalVideo?.pause();
            setSelectedVideo(null);
          }}
        >
          <video
            id="modalVideo"
            controls
            autoPlay
            muted={localIsMuted}
            className="max-h-[80vh] max-w-[90vw] border-4 border-white rounded"
            onLoadedMetadata={(e) => {
              const index = videos.findIndex(v => v.url === selectedVideo);
              const time = hoverTimeMap[videos[index]?.id] || 0;
              e.currentTarget.currentTime = time;
            }}
          >
            <source src={selectedVideo?.replace('.mp4', '.webm')} type="video/webm" />
            <source src={selectedVideo} type="video/mp4" />
          </video>
        </div>
      )}
    </>
  );
}