import prismadb from "@/lib/prismadb";
import { auth, redirectToSignIn } from "@clerk/nextjs/server";

import { CompanionForm } from "./components/companion-form";


interface CompanionIdPageProps{
    params:{
        // companionId is match with the spelling of foldername
        companionId: string;
    };
};
const CompanionPage = async({
    params
}:CompanionIdPageProps) => {
    const {userId}= auth();

    // here the companion should be same as we stated in schema.prisma 
    // we are attempting to fetch  an existing companion using  a id 
    // from our url but if we click on our side bar , our id will be to be New
    // meaning companion is not going to be exist 
    // we can use that info in order to determine whthere it is an edit page or create

    if(!userId)
    {
        return redirectToSignIn();
    }
    const companion= await prismadb.companion.findUnique({
        where:{
            id: params.companionId,
            userId
        }
    });

    const categories= await prismadb.category.findMany(); 
    return ( 
        <CompanionForm
        initialData={companion}
        categories={categories}
        />
    );
}
export default CompanionPage;