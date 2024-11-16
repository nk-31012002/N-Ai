import { auth, redirectToSignIn } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import prismadb from "@/lib/prismadb";
import { ChatClient } from "./components/client";


interface ChatIdPageProps {
    // when http://localhost:3000/chat/a114e4a8-2cbb-4c08-abe2-73e8429cbc25
    // a114e4a8-2cbb-4c08-abe2-73e8429cbc25-- dynamic chatId --> then it is stored in params
    //  when http://localhost:3000/chat/a114e4a8-2cbb-4c08-abe2-73e8429cbc25?name=lola
    // then name is in search Params
    params: {
        chatId: string;
    }
}
const ChatIdPage = async ({
    params
}: ChatIdPageProps) => {

    const { userId } = auth();
    if (!userId) {
        return redirectToSignIn();
    }
    const companion = await prismadb.companion.findUnique({
        where: {
            id: params.chatId
        },
        include: {
            messages: {
                orderBy: {
                    createdAt: "asc",
                },
                where: {
                    userId,
                }
            },
            _count: {
                select: {
                    messages: true
                }
            }
        }
    });
    if(!companion)
    {
        return redirect("/");
    }
    return (
        <ChatClient companion={companion}/>

    );
}
export default ChatIdPage;