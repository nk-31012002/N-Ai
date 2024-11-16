This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
- Here is my deployed url [https://companion-ai-psi.vercel.app/](https://companion-ai-psi.vercel.app/).

--Here is my some notes during making of this project
npx prisma studio -localhost:5555
(for sql lite database server to check database)
-->it should be run in an new terminal and then run {node scripts/seed.ts}-->database file in another one.
--> At the time of database integration , during installation of primsa-->we have automatically created prisma folder--> which has schema.prisma , where we have defined the schema of database , then in env file , 
DATABASE_URL,DIRECT_URL,
then crete a prismadb.ts file in lib
--> then create scripts folder, where we have created seed.ts in which we have defined the database 
-->here is the link for integrate databse 
https://supabase.com/partners/integrations/prisma


-->for  searching feature we have add in generator client (schema.prisma) -->previewFeature-->"FullTextSearch",
"FullTextIndex"
and then add in modal companion ->@@fulltext([name])-->jisko search karna like name thats why -->db.text is added

--> but there is a problem prisma doesn't supported @@fulltext([name]) so ,we have added by SQL command 
Manually Define Full-Text Index: As a workaround, you could define the full-text index directly within your PostgreSQL database using a migration script:

After removing the @@fulltext attribute from your Prisma schema, you can use a raw SQL migration to create the full-text index.
For example, create a SQL migration file in prisma/migrations/ and include the following SQL command:
CREATE INDEX name_fulltext_idx ON "Companion" USING GIN (to_tsvector('english', "name"));
This approach bypasses Prisma's schema limitations while still providing full-text search capability.


--> we have add cloudinary for form cloud 
-->npx i next-cloudinary
and then add the key in my env file

NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="dqcodpfgf"

---> npm i ai gives the chat api which gives the message api for ai 
-->npm i react-spinners

--->npm  i @pinecone-database/pinecone
for , this is going to be vector database which you are going to use to create embedics inorder to make an advanced AI model.

-->nmp i @upstash/redis
for--> this is redis database for long term memory

-->npm i @upstash/ ratelimit
for --> we are going to use app stash for rate limiting so no user can  spam our AI models more than they should 

--> npm i langchain
for
PINECONE_API_KEY="56a9a996-8ede-476c-88e0-f3403fcc4972******"

-->we can use chroma instaed of pinecone vector database as it is not free now

-->open Ai key==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****


--->for database 
if we change any thing in prisma schema , we have to run 
-->always npx prisma generate
then 
npx prisma db push
npx prisma studio
-->at any time if we have deleted our database
just run node scripts/seed.ts


--> we are using stripe for subscription feature 
for that just I have add stripe in my sytem env 
then add some api and webhook in my env of project file
--> for testing of subsciption I have to run always the stripe  commands
-->stripe login
-->stripe listen --forward-to localhost:3000/api/webhook
-->then make a route.ts in app>api>webhook>route.ts
because it match with the above command which we run in our terminal

-->we have to add in middleware.ts file , becauese we do not want to protect this website from /api/webhook
export default authMiddleware({
  publicRoutes:["/api/webhook"],
});

-->npm i zustand

--->for subscription ,work properly
we have to uncomment the subscription condition in
for create companion we need to subscribe 
sidebar.tsx  in component
api-->companion-->route.ts
api-->companion--->companionId-->route.ts

- for deployment
package.json
- scripts-->postinstall: prisma generate


- we have to deploy on vercel 
- there we have to copy and paste the env variable
but the NEXT_APP_URL and stripe websocket key have to change after deployment 

- after deployment ,check build logs then 
- if all work well , then go to stripe , and then add end point 
url/api/webhook and add all need events , then we got the new secret key
and then change it in the vercel

- change the next_public_url to latest url




