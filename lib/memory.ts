import { Redis } from "@upstash/redis";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Pinecone, Index } from "@pinecone-database/pinecone"; // Use Pinecone and Index

export type CompanionKey = {
    companionName: string,
    modelName: string,
    userId: string,
};

export class MemoryManager {
    private static instance: MemoryManager;
    private history: Redis;
    private pineconeClient: Index; // Updated type to Index

    public constructor() {
        this.history = Redis.fromEnv();
        this.pineconeClient = this.initializePineconeClient();
    }

    private initializePineconeClient(): Index {
        const client = new Pinecone({
            apiKey: process.env.PINECONE_API_KEY!, // Initialize with API key
        });

        // If environment needs to be set later or differently:
        // client.setEnvironment(process.env.PINECONE_ENVIRONMENT!);

        return client.Index(process.env.PINECONE_INDEX!); // Use Index method to get the Index instance
    }

    public async vectorSearch(
        recentChatHistory: string,
        companionFileName: string,
    ) {
        // Initialize Pinecone client
        const pinecone = new Pinecone({
            apiKey: process.env.PINECONE_API_KEY!,
        });
    
        // Get the Pinecone index
        const pineconeIndex: Index = pinecone.Index(process.env.PINECONE_INDEX!);
    
        // Generate embeddings for the recent chat history
        const embeddings = new OpenAIEmbeddings({
            openAIApiKey: process.env.OPENAI_API_KEY,
        });
    
        // Create the vector representation of the chat history
        const vector = await embeddings.embedQuery(recentChatHistory);
    
        // Ensure `vector` is an array of numbers, which Pinecone requires
        if (!Array.isArray(vector)) {
            console.error("Failed to create valid embedding vector.");
            return [];
        }
    
        // Perform similarity search on Pinecone
        try {
            const queryResponse = await pineconeIndex.query({
                vector, // Pass vector (array of numbers)
                topK: 3,
                includeMetadata: true,
                filter: { fileName: companionFileName },  // Optional: Add filter for fileName
            });
    
            // Map the results to an array of documents and scores
            const similarDocs = queryResponse.matches?.map((match) => ({
                document: match.metadata,
                score: match.score,
            }));
    
            return similarDocs;
        } catch (err) {
            console.log("Failed to get vector search results", err);
            return [];
        }
    }
    


    public static async getInstance(): Promise<MemoryManager> {
        if (!MemoryManager.instance) {
            MemoryManager.instance = new MemoryManager();
        }
        return MemoryManager.instance;
    }

    private generateRedisCompanionKey(companionKey: CompanionKey): string {
        return `${companionKey.companionName}-${companionKey.modelName}-${companionKey.userId}`;
    }

    public async writeToHistory(text: string, companionKey: CompanionKey) {
        if (!companionKey || typeof companionKey.userId === "undefined") {
            console.log("Companion Key set incorrectly");
            return "";
        }
        const key = this.generateRedisCompanionKey(companionKey);
        const result = await this.history.zadd(key, {
            score: Date.now(),
            member: text,
        });
        return result;
    }

    public async readlatestHistory(companionKey: CompanionKey): Promise<string> {
        if (!companionKey || typeof companionKey.userId === "undefined") {
            console.log("Companion key set Incorrectly");
            return "";
        }

        const key = this.generateRedisCompanionKey(companionKey);

        let result = await this.history.zrange(key, 0, Date.now(), {
            byScore: true,
        });

        result = result.slice(-30).reverse();

        const recentChats = result.reverse().join("\n");
        return recentChats;
    }

    public async seedChatHistory(
        seedContent: string,
        delimiter: string = "\n",
        companionKey: CompanionKey
    ) {
        const key = this.generateRedisCompanionKey(companionKey);
        if (await this.history.exists(key)) {
            console.log("User already has chat history");
            return;
        }

        const content = seedContent.split(delimiter);
        let counter = 0;
        for (const line of content) {
            await this.history.zadd(key, { score: counter, member: line });
            counter += 1;
        }
    }
}
