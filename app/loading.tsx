import LoadingBar from '@/components/LoadingBar'

export default function Loading() {
    return (
        <>
            <LoadingBar />
            <div className="loader h-[calc(100vh-290px)] md:h-[calc(100vh-271px)] grid place-items-center">
                <div data-glitch="Loading..." className="glitch">
                    Loading...
                </div>
            </div>
        </>
    )
}
