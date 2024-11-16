"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { Sparkles } from "lucide-react";
import { useState } from "react";

interface SubscriptionButtonProps {
    isPro: boolean;
};

export const SubscriptionButton = ({ isPro = false }: SubscriptionButtonProps) => {
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const onClick = async () => {
        try {
            setLoading(true);
            const response = await axios.get("/api/stripe");
            window.location.href = response.data.url;



        } catch (error) {
            toast({
                variant: "destructive",
                description: "Something went Wrong."
            })


        } finally {
            setLoading(false);

        }
    }
    return (
        <Button disabled={loading} onClick={onClick} size="sm" variant={isPro ? "default" : "premiuim"}>
            {isPro ? "Manage Subscription" : "Upgrade"}
            {!isPro && <Sparkles className="h-4 w-4 ml-2 fill-white" />}
        </Button>
    );

}