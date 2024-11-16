const {PrismaClient}= require("@prisma/client");

const db=new PrismaClient();

async function main(){
    try{
        await db.category.createMany({
            data:[
                {name: "Famous People"},
                {name: "Movies & Tv"},
                {name: "Musicians"},
                {name: "Games"},
                {name: "Animals"},
                {name: "Philosophy"},
                {name: "Scientists"},
                {name: "Entrepreneurs"},
                {name: "Super Heroes"},
                {name: "Birds"},
            ]
        })

    }catch(error){
        console.error("Error seeding default categories",error);
    } finally{
        await db.$disconnect();
    }
};
main();