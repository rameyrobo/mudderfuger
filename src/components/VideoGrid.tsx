import React, { useRef, useState, useEffect, useLayoutEffect } from 'react';
import Image from 'next/image';
import { SpeakerWaveIcon, SpeakerXMarkIcon } from '@heroicons/react/24/solid';
import type { Video } from '../types/video';

export type VideoGridProps = {
  isMuted: boolean;
  videos: Video[];
};

const VideoGrid: React.FC<VideoGridProps> = ({
    isMuted,
    videos
  }) => {
  const thumbFormat = 'webp' as const;
  const thumbnailsLoaded = true;
  const thumbSize = 1280;
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [hoverTimeMap, setHoverTimeMap] = useState<{ [key: number]: number }>({});
  const hoverRefs = useRef<{ [key: number]: HTMLVideoElement | null }>({});
  const [localIsMuted, setLocalIsMuted] = useState<boolean>(isMuted);
  const [preferWebm, setPreferWebm] = useState(false);
  const [videoActivated, setVideoActivated] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    const ua = navigator.userAgent;
    const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
    const isFirefox = ua.toLowerCase().includes('firefox');
    if (isSafari || isFirefox) {
      setPreferWebm(true);
    }
  }, []);

  useEffect(() => {
    if (!selectedVideo) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        const modalVideo = document.querySelector('#modalVideo') as HTMLVideoElement;
        modalVideo?.pause();
        setSelectedVideo(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedVideo]);

  useLayoutEffect(() => {
    Object.values(hoverRefs.current).forEach(video => {
      if (video) {
        video.muted = true;
      }
    });
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;
          if (!entry.isIntersecting) {
            video.pause();
            console.log('Paused video', video.dataset.videoid);
          }
        });
      },
      {
        rootMargin: '40px',
        threshold: 0.1,
      }
    );

    // Observe all current video elements
    Object.values(hoverRefs.current).forEach((video) => {
      if (video) observer.observe(video);
    });

    // Clean up on unmount or when videos change
    return () => observer.disconnect();
  }, [videos, videoActivated]);

  const handleMuteToggle = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setLocalIsMuted(!localIsMuted);
  };

  const handleMouseEnter = (videoId: number) => {
    Object.entries(hoverRefs.current).forEach(([id, el]) => {
      if (el && parseInt(id) !== videoId) {
        el.pause();
      }
    });

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
    const el = hoverRefs.current[videoId];
    if (el) {
      setHoverTimeMap(prev => ({ ...prev, [videoId]: el.currentTime }));
      el.pause(); // pause thumbnail video before opening modal
    }
    setSelectedVideo(url);
  };

  const handleActivateVideo = (videoId: number) => {
    // Pause all other videos, but don't reset their thumbnail state
    Object.entries(hoverRefs.current).forEach(([id, el]) => {
      if (el && parseInt(id) !== videoId) {
        el.pause();
        // Do NOT set videoActivated to false here
      }
    });

    setVideoActivated(prev => ({ ...prev, [videoId]: true }));
    const el = hoverRefs.current[videoId];
    if (el) el.play().catch(() => {});
  };

  useEffect(() => {
    if (selectedVideo) {
      setTimeout(() => {
        const modalVideo = document.querySelector('#modalVideo') as HTMLVideoElement;
        if (modalVideo) {
          modalVideo.play().catch(() => {});
        }
      }, 100); // slight delay to ensure the element is mounted
    }
  }, [selectedVideo]);

  return (
    <>
      <div className="grid grid-cols-3 md:grid-cols-3 gap-1 px-7 sm:px-10 md:px-9 lg:px-20 xl:px-52 max-w-[1530px] mx-auto">
        {videos.map((video, idx) => {
          // Derive the base thumbnail URL for each video
          const fileName = video.url.split('/').pop()?.replace(/\.(mp4|webm)$/i, '') || '';
          const thumbBase = `https://mudderfuger.b-cdn.net/_thumbs/${fileName}`;
          const format = thumbFormat;

          // If there are exactly 4 videos and this is the last one, span all columns and use 16:9 aspect
          const isFourthSpanning =
            videos.length === 4 && idx === 3
              ? "col-span-3"
              : "";

          const aspectClass =
            videos.length === 4 && idx === 3
              ? "aspect-video" // Tailwind's aspect-[16/9] utility
              : "aspect-[4/5]";

          return (
            <div
              key={video.id}
              className={`relative group cursor-pointer ${isFourthSpanning}`}
              onClick={() => handleClick(video.id, video.url)}
              onMouseEnter={() => handleMouseEnter(video.id)}
              onMouseLeave={() => handleMouseLeave(video.id)}
            >
              <div className={`${aspectClass} w-full relative`}>
                {/* Thumbnail: show until activated and after page load, only best format loaded */}
                {thumbnailsLoaded && format && !videoActivated[video.id] && (
                  <Image
                    src={`${thumbBase}.webp`}
                    alt={video.title}
                    fill
                    sizes="(max-width:450px) 150px, (max-width: 640px) 320px, (max-width: 1024px) 640px, (max-width: 1536px) 1280px, 1920px"
                    className="absolute inset-0 w-full h-full object-cover"
                    draggable={false}
                    priority={false}
                    unoptimized={false}
                  />
                )}
                <video
                  ref={el => { hoverRefs.current[video.id] = el; }}
                  data-videoid={video.id}
                  muted={localIsMuted}
                  preload="auto"
                  playsInline
                  poster={`${thumbBase}-${thumbSize}.webp`}
                  onContextMenu={e => e.preventDefault()}
                  className={`absolute inset-0 w-full h-full object-cover ${videoActivated[video.id] ? 'opacity-100' : 'opacity-0'}`}
                  onTouchStart={() => handleActivateVideo(video.id)}
                  onMouseEnter={() => handleActivateVideo(video.id)}
                >
                  <source
                    src={video.url.replace('.mp4', '.webm')}
                    type="video/webm"
                  />
                  <source
                    src={video.url}
                    type="video/mp4"
                  />
                </video>
                <div className="absolute bottom-2 right-2 z-20 cursor-pointer bg-neutral-800 p-0.5 rounded-full " onClick={handleMuteToggle}>
                  {localIsMuted ? (
                    <SpeakerXMarkIcon className="h-4 w-4 md:h-5 md:w-5 text-white" />
                  ) : (
                    <SpeakerWaveIcon className="h-4 w-4 md:h-5 md:w-5 text-white" />
                  )}
                </div>
              </div>
            </div>
          );
        })}
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
            controlsList="nodownload"
            autoPlay
            preload="auto"
            muted={localIsMuted}
            playsInline
            onContextMenu={(e) => e.preventDefault()}
            className="max-h-[80dvh] max-w-90vw border-4 border-white rounded"
            onLoadedMetadata={(e) => {
              const index = videos.findIndex(v => v.url === selectedVideo);
              const time = hoverTimeMap[videos[index]?.id] || 0;
              e.currentTarget.currentTime = time;
            }}
          >
            <source
              src={
                preferWebm
                  ? selectedVideo?.replace('.mp4', '.webm')
                  : selectedVideo
              }
              type={preferWebm ? 'video/webm' : 'video/mp4'}
            />
            
          </video>
        </div>
      )}
    </>
  );
}

export default VideoGrid;