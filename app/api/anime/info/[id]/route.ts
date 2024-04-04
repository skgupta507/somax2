import { NextRequest, NextResponse } from "next/server"
import { config } from "@/config"

const { authorization_key, anilist } = config

type Props = {
    params: {
        id: string
    }
}

export async function GET(req: NextRequest, { params: { id } }: Props) {
    const authorization = req.headers.get("Authorization")
    
    try {
        if (!authorization || authorization_key !== authorization.split(" ")[1]) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }
        
        const [ response, episodes  ] = await Promise.all([
            anilist.fetchAnimeInfo(id),
            anilist.fetchEpisodesListById(id)
        ])

        const result = {
            ...response,
            mappings: undefined,
            artwork: undefined,
            episodes: episodes,
        }

        return NextResponse.json(result)
    } catch (error) {
        return NextResponse.json({ error, message: `This just happened in /anime/info/[id] route ${error}` })
    }
}