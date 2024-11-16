import { SubscriptionButton } from "@/components/subscription-button";
import { checkSubscription } from "@/lib/subscription";

const SettingsPage=async ()=>{

    const isPro=await checkSubscription();
    return(
        <div className="h-full p-4 space-y-2">
            <h3 className="text-lg font-medium">
                <div className="text-muted-foreground text-sm">
                    {
                        isPro?"You are currently on a Pro plan.":"You are on a free Plan."
                    }

                </div>
                <SubscriptionButton isPro={isPro}/>
            </h3>
        </div>
    );
}
export default SettingsPage;