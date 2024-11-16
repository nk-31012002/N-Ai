import prismadb from "@/lib/prismadb";
import { checkSubscription } from "@/lib/subscription";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const user = await currentUser();
        // what we have in the form , we have to take all the attributes with same spelling 
        const { src, name, description, instructions, seed, categoryId } = body;
        if (!user || !user.id || !user.firstName) {
            return new NextResponse("Unauthorized", { status: 401 });
        }
        if (!src || !name || !description || !seed || !categoryId || !instructions) {
            return new NextResponse("Missing required Fields", { status: 400 });
        }
        // for pro subscription

        const isPro= await checkSubscription();
        if(!isPro){
            return new NextResponse("Pro subscription required",{status:403});
        }

        const companion = await prismadb.companion.create({
            data: {
                categoryId,
                userId: user.id,
                userName: user.firstName,
                src,
                name,
                description,
                instructions,
                seed,

            }
        });
        return NextResponse.json(companion);

    } catch (error) {
        console.log("[COMPANION_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }

}