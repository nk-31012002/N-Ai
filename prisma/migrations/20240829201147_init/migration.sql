-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

CREATE INDEX name_fulltext_idx ON "Companion" USING GIN (to_tsvector('english', "name"));
-- as @@fulltext([name]) is not working in schema.prisma , so we can add here  

