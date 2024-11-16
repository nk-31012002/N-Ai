import { StreamingTextResponse } from "ai";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Replicate from "replicate";

import { MemoryManager } from "@/lib/memory";
import { rateLimit } from "@/lib/rate-limit";
import prismadb from "@/lib/prismadb";

export async function POST(
  request: Request,
  { params }: { params: { chatId: string } }
) {
  try {
    const { prompt } = await request.json();
    const user = await currentUser();

    // Check if user is authenticated
    if (!user || !user.firstName || !user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Log the received chatId
    console.log("Received Chat ID:", params.chatId);

    // Check if chatId is present
    if (!params.chatId) {
      return new NextResponse("Chat ID missing", { status: 400 });
    }

    const identifier = request.url + "-" + user.id;

    // Check rate limit for the request
    const { success } = await rateLimit(identifier);
    if (!success) {
      return new NextResponse("Rate Limit Exceeded", { status: 429 });
    }

    // Check if the Companion exists
    const companion = await prismadb.companion.findUnique({
      where: {
        id: params.chatId,
      },
    });

    // Log the result of the companion lookup
    console.log("Companion found:", companion);

    if (!companion) {
      return new NextResponse("Companion not found", { status: 404 });
    }

    // Proceed with the update since the Companion exists
    await prismadb.companion.update({
      where: {
        id: params.chatId,
      },
      data: {
        messages: {
          create: {
            content: prompt,
            role: "user",
            userId: user.id,
          },
        },
      },
    });

    const name = companion.id;
    const companion_file_name = name + ".txt";

    const companionKey = {
      companionName: name,
      userId: user.id,
      modelName: "llama2-13b",
    };

    const memoryManager = await MemoryManager.getInstance();
    const records = await memoryManager.readlatestHistory(companionKey);

    if (records.length === 0) {
      await memoryManager.seedChatHistory(companion.seed, "\n\n", companionKey);
    }

    await memoryManager.writeToHistory("User:" + prompt + "\n", companionKey);

    const recentChatHistory = await memoryManager.readlatestHistory(companionKey);

    const similarDocs = await memoryManager.vectorSearch(
      recentChatHistory,
      companion_file_name
    );

    let relevantHistory = "";
    if (Array.isArray(similarDocs) && similarDocs.length > 0) {
      relevantHistory = similarDocs
        .map((doc) => {
          if (doc && "pageContent" in doc) {
            return doc.pageContent;
          }
          return "";
        })
        .join("\n");
    }

    const model = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    const resp = String(
      await model
        .run(
          "a16z-infra/llama-2-13b-chat:df7690f1994d94e96ad9d568eac121aecf50684a0b0963b25a41cc40061269e5",
          {
            input: {
              max_length: 2048,
            },
          }
        )
        .catch(console.error)
    );

    const cleaned = resp.replaceAll(",", "");
    const chunks = cleaned.split("\n");
    const response = chunks[0];

    await memoryManager.writeToHistory("" + response.trim(), companionKey);
    var Readable = require("stream").Readable();

    let s = new Readable();
    s.push(response);
    s.push(null);

    if (response !== undefined && response.length > 1) {
      memoryManager.writeToHistory("" + response.trim(), companionKey);

      await prismadb.companion.update({
        where: {
          id: params.chatId,
        },
        data: {
          messages: {
            create: {
              content: response.trim(),
              role: "system",
              userId: user.id,
            },
          },
        },
      });
    }
    return new StreamingTextResponse(s);
  } catch (error) {
    console.log("[CHAT_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
