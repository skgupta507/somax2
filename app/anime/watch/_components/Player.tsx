'use client'

import Artplayer from "artplayer"
import { useEffect, useRef, useState } from "react"
import Hls from "hls.js"
import { AnilistEpisodeInterface, AnilistInfoInterface, SkipTimeInterface, SourceAnilistInterface, SourcesInterface, WatchedInterface } from "@/types"
import { setTimeout } from "timers"
import SetWatchedHistory from "./SetWatchedHistory"
import useLocalStorage from "@/utils/localStorage"

type Props = {
    info: AnilistInfoInterface
    source: SourceAnilistInterface
    currentEpisode?: AnilistEpisodeInterface
    skip?: SkipTimeInterface[]
}

export default function Player({ info, source, currentEpisode, skip }: Props) {
    const artRef = useRef<Artplayer | null>(null)
    const [ watched, setWatched ]  = useState<WatchedInterface[] | null>([])
    const [ isSkipTime, setIsSkipTime ] = useState(false)
    const [ triggeredEffect, setTriggeredEffect ] = useState(false);
    const [ intro, setIntro  ] = useState({ end: 0, start: 0 })
    const [ outro, setOutro  ] = useState({ start: 0, end: 0 })
    const [ duration, setDuration ] = useState(0)
    const [ currentTime, setCurrentTime ] = useState(0)
    const { getWatched } = useLocalStorage()

    useEffect(() => {
        const skipTime = skip?.find(s => s?.number === currentEpisode?.number)

        if (skipTime) {
            setIntro({
                start: skipTime && skipTime.intro.start < 10 ? 10 : skipTime?.intro?.start || 0,
                end: skipTime?.intro?.end || 0,
            })

            setOutro({
                start: skipTime && skipTime.outro.start < 10 ? 10 : skipTime?.intro?.start || 0,
                end: skipTime?.outro?.end || 0,
            })
        }

        const art = new Artplayer({
            container: '.artplayer-app',
            url: source?.sources?.find(source => source?.quality === '720p')?.url || '',
            customType: {
                m3u8: function (video: any, url: string, art: any) {
                    if (Hls.isSupported()) {
                        if (art.hls) art.hls.destroy()
                        const hls = new Hls()
                        hls.loadSource(url)
                        hls.attachMedia(video)
                        art.hls = hls
                        art.on("destroy", () => hls.destroy())
                    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                        video.src = url
                    } else {
                        art.notice.show = "Unsupported playback format"
                    }
                },
            },
            poster: currentEpisode?.image === info.image ? info?.cover as string : info.image as string || info?.cover,
            volume: 1,
            isLive: false,
            muted: false,
            autoplay: false,
            autoOrientation: true,
            pip: true,
            autoSize: false,
            autoMini: false,
            screenshot: true,
            setting: true,
            loop: false,
            flip: true,
            playbackRate: true,
            aspectRatio: true,
            fullscreen: true,
            fullscreenWeb: true,
            subtitleOffset: false,
            miniProgressBar: true,
            mutex: true,
            backdrop: true,
            playsInline: true,
            autoPlayback: true,
            airplay: true,
            theme: info?.color || "#67e8f9",
            moreVideoAttr: {
                crossOrigin: "anonymous",
            },
            quality:
                source && source.sources
                    ? source.sources.map((source: SourcesInterface) => ({
                        default: source.quality === "720p",
                        html: source.quality,
                        url: source.url,
                    }))
                    : [],
            thumbnails: {
                url: info?.image as string,
                number: 60,
                column: 10,
            },
            highlight: [
                {
                    time: skipTime?.intro?.start || 0,
                    text: 'Intro Start',
                },
                {
                    time: skipTime?.intro?.end || 0,
                    text: 'Intro End',
                },
                {
                    time: skipTime?.outro?.start || 0,
                    text: 'Outro Start',
                },
                {
                    time: skipTime?.outro?.end || 0,
                    text: 'Outro End',
                },
            ],
            icons: {},
        })

        artRef.current = art

        setWatched(getWatched())

        const intervalId = setInterval(() => {
            if (artRef?.current) {
                setCurrentTime(artRef?.current?.currentTime)
                setDuration(artRef?.current?.duration)
            }
        }, 5000)

        return () => {
            clearInterval(intervalId)
            art.destroy()
        }
    }, [info, source])

    useEffect(() => {
        if (artRef?.current) {
            const videoElement = artRef?.current.video

            if (videoElement) {
                videoElement.addEventListener('timeupdate', handleTimeUpdate)
            }
        }

        return () => {
            if (artRef?.current) {
                const videoElement = artRef?.current.video

                if (videoElement) {
                    videoElement.removeEventListener('timeupdate', handleTimeUpdate)
                }
            }
        }

    }, [artRef.current, currentEpisode])

    useEffect(() => {
        if(intro?.start < 10 || intro?.start === 0) return
        const playerContainer = document.querySelector('.artplayer-app .art-video-player')
        playerContainer?.classList.add('relative')

        const buttonElement = document.createElement('button')
        buttonElement.className = `skip-intro-button w-fit absolute bottom-20 px-2 md:px-5 py-2 uppercase font-semibold tracking-wider text-xs bg-gray-900/80 text-white shadow-sm transition-all duration-1000 z-[9999] ease-in-out ${isSkipTime ? 'right-2 lg:right-5 ' : '-right-[100%]'}`
        buttonElement.textContent = 'Skip Intro'
        buttonElement.addEventListener('click', handleSkipIntro)

        playerContainer && playerContainer.appendChild(buttonElement)

        return () => {
            const existingButton = playerContainer?.querySelector('.skip-intro-button')
            existingButton && playerContainer?.removeChild(existingButton)
        }
    }, [isSkipTime])

    const handleTimeUpdate = () => {
        if (artRef?.current) {
            if (intro?.start === Math.ceil(artRef?.current?.currentTime)) {
                setIsSkipTime(true)
                setTimeout(() => {
                    setIsSkipTime(false)
                }, 10000)
            }
        }
    }

    const handleSkipIntro = () => {
        if (artRef?.current && artRef?.current?.currentTime) {
            artRef.current.currentTime = intro.end
            setIsSkipTime(false)
        }
    }

    useEffect(() => {
        if (artRef?.current && artRef?.current.currentTime > 0 && watched && !triggeredEffect ) {
            const anime = watched.find(anime => anime?.id === info?.id)
            if(anime && anime?.ep) {
                const episode = anime?.ep?.find(ep => ep?.id === currentEpisode?.id)
                artRef.current.currentTime = episode?.timeWatched as number
                setTriggeredEffect(true)    
            }
        }
    }, [artRef?.current?.currentTime])

    return (    
        <>
            <div className="artplayer-app h-[320px] sm:h-[500px] xl:h-[70vh] w-full overflow-hidden" />
            <SetWatchedHistory 
                info={info} 
                currentEpisode={currentEpisode} 
                duration={duration}
                currentTime={currentTime}
            />
        </>
    ) 
}
