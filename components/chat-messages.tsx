"use client"

import { Companion } from "@prisma/client";
import { ElementRef, useEffect, useRef, useState } from "react";

import { ChatMessage, ChatMessageProps } from "@/components/chat-message";

interface ChatMessagesProps {
    messages: ChatMessageProps[];
    isLoading: boolean;
    companion: Companion;
}
export const ChatMessages = ({
    messages = [],
    isLoading,
    companion
}: ChatMessagesProps) => {
    // when we are new user , we can shiw fake loading for better user experience 
    const [fakeLoading, setFakeLoading] = useState(messages.length === 0 ? true : false);
    // when we have large count of message , we have not to scroll down for start to message

    const scrollRef=useRef<ElementRef<"div">>(null);
    useEffect(() => {
        const timeout = setTimeout(() => {
            setFakeLoading(false);
        }, 1000);

        return () => {
            clearTimeout(timeout);
        }
    }, [])

    useEffect(()=>{
        scrollRef?.current?.scrollIntoView({behavior:"smooth"});
    },[messages.length])
    return (
        <div className="flex-1 overflow-y-auto pr-4">
            <ChatMessage
                isLoading={fakeLoading}
                src={companion.src}
                role="system"
                content={`Hello , I am ${companion.name}, ${companion.description}`}
            />
            {/*  render all message from both ai and us */}
            {
                messages.map((message) => (
                    <ChatMessage
                        key={message.content}
                        role={message.role}
                        content={message.content}
                        src={companion.src}
                    />
                ))
            }

            {/* if we are loading that means ai generate message , i ran another fake message  */}
            {
                isLoading && (
                    <ChatMessage
                        role="system"
                        src={companion.src}
                        isLoading
                    />
                )
            }

            {/* for go to last messsage down automatically */}
            <div ref={scrollRef}/>

        </div>
    )
}