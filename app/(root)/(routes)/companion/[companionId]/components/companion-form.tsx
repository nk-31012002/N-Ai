"use client";
import { Wand2 } from "lucide-react";
import  axios  from "axios"; 

import * as z from "zod";
import { Category, Companion } from "@prisma/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { ImageUpload } from "@/components/image-upload";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";


const PREAMBLE = `You are a fictional version of Elon Musk, a visionary entrepreneur known
 for your work in space exploration, electric vehicles, and cutting-edge technologies. 
 You are driven by the goal of making life multi-planetary and advancing human civilization through sustainable energy
  and innovative projects like Neuralink. Your responses should reflect ambition, optimism, and a focus on the future.`;

  const SEED_CHAT = `Human: Hi Elon, how are you today?
  Elon: Busy with pushing the boundaries of space exploration and electric vehicles.
  Human: How is the progress on Mars colonization?
  Elon: We're making significant strides. Our goal is to make life multi-planetary, with Mars as the next logical step.
  Human: Are electric vehicles part of this vision?
  Elon: Absolutely. Sustainable energy is crucial both for Earth and future colonies on Mars.
  Human: It's fascinating to see your vision unfold. Any new projects you're particularly excited about?
  Elon: Always! Right now, I'm especially excited about Neuralink, which has the potential to revolutionize human-computer interaction.`;
  


interface CompanionFormProps {
    initialData: Companion | null;
    categories: Category[];
}

const formSchema = z.object({
    name: z.string().min(1, {
        message: "Name is required!",
    }),
    description: z.string().min(1, {
        message: "Description is Required!",
    }),
    instructions: z.string().min(200, {
        message: "instruction require at least 200 char!",
    }),
    seed: z.string().min(200, {
        message: "instruction require at least 200 char!"
    }),
    src: z.string().min(1, {
        message: "Image is Required!",
    }),
    categoryId: z.string().min(1, {
        message: "Category is Required!",
    }),
})
export const CompanionForm = ({
    categories,
    initialData
}: CompanionFormProps) => {
    const router= useRouter();
    const {toast}= useToast();
    // form controller
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData || {
            name: "",
            description: "",
            instructions: "",
            seed: "",
            src: "",
            categoryId: undefined,
        },
    });

    const isLoading = form.formState.isSubmitting;

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            // we have to check whther it has initialData or not 
            // we can update the previous by axios or create new one 
            if(initialData)
            {
                // update functionality
                await axios.patch(`/api/companion/${initialData.id}`,values);
            }
            else
            {
                // create 
                await axios.post("/api/companion", values);
            }
            toast({
                description: "Success"
            });
            router.refresh();
            // by upper function , we can refresh all server components  and all server components 
            // are going to refresh the data from database and ensuring the  new companion is loaded or not

            router.push("/");
            // to home page
            
        } catch (error) {
            console.log(error,'SOMETHING WENT WRONG')
            toast({
                variant:"destructive",
                description: "Something went Wrong",
            });
            
        }
    }
    return (
        <div className="h-full p-4 space-y-2 max-w-3xl mx-auto">
            <Form{...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 pb-10">
                    <div className="space-y-2 w-full col-span-2">
                        <div>
                            <h3 className="text-lg font-medium">
                                General Information
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                General Information about your Companion
                            </p>
                        </div>
                        <Separator className="bg-primary/10" />
                    </div>
                    <FormField
                        name="src"
                        render={({ field }) => (
                            <FormItem className="flex flex-col items-center justify-center space-y-4 col-span-2">
                                <FormControl>
                                    <ImageUpload
                                        disabled={isLoading}
                                        onChange={field.onChange}
                                        value={field.value}
                                    />
                                </FormControl>
                                <FormDescription>
                                    This is how your AI Companion will be named.
                                </FormDescription>
                                <FormMessage />

                            </FormItem>
                        )}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            name="name"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem className="col-span-2 md:col-span-1">
                                    <FormLabel>
                                        Name
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            disabled={isLoading}
                                            placeholder="Elon Musk"
                                            {...field}

                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            name="description"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem className="col-span-2 md:col-span-1">
                                    <FormLabel>
                                        Description
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            disabled={isLoading}
                                            placeholder="CEO & Founder of Tesla, SpaceX"
                                            {...field}

                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Short Description for your AI Companion
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            name="categoryId"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Category</FormLabel>
                                    <Select
                                        disabled={isLoading}
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="bg-background">
                                                <SelectValue
                                                    defaultValue={field.value}
                                                    placeholder="Select a Category"
                                                />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {categories.map((category) => (
                                                <SelectItem
                                                    key={category.id}
                                                    value={category.id}
                                                >
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>
                                        Select a Category for Your AI
                                    </FormDescription>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="space-y-2 w-full">
                        <div>
                            <h3 className="text-lg font-medium">
                                Configuration
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Detailed Instructions for AI behaviour
                            </p>
                        </div>
                        <Separator className="bg-primary/10" />
                    </div>
                    <FormField
                        name="instructions"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem className="col-span-2 md:col-span-1">
                                <FormLabel>
                                    Instructions
                                </FormLabel>
                                <FormControl>
                                    <Textarea
                                        className="bg-background resize-none"
                                        rows={7}
                                        disabled={isLoading}
                                        placeholder={PREAMBLE}
                                        {...field}

                                    />
                                </FormControl>
                                <FormDescription>
                                    Describe in detail your Companion&apos;s backstory and relevant details.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        name="seed"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem className="col-span-2 md:col-span-1">
                                <FormLabel>
                                    Example Conversations
                                </FormLabel>
                                <FormControl>
                                    <Textarea
                                        className="bg-background resize-none"
                                        rows={7}
                                        disabled={isLoading}
                                        placeholder={SEED_CHAT}
                                        {...field}

                                    />
                                </FormControl>
                                <FormDescription>
                                    Describe in detail your Companion&apos;s backstory and relevant details.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="w-full flex justify-center">
                        <Button size="lg" disabled={isLoading}>
                            {
                                initialData? "Edit your companion":
                                "Create Your Companion"
                            }
                            <Wand2 className="w-4 h-4 ml-2"/>

                        </Button>

                    </div>
                </form>
            </Form>
        </div>

    );
}