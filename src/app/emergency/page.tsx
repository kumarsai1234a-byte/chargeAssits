"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useFirestore, useUser, addDocumentNonBlocking } from "@/firebase";
import { collection, serverTimestamp } from "firebase/firestore";

const emergencyFormSchema = z.object({
  vehicle: z.string().min(3, { message: "Vehicle details must be at least 3 characters." }),
  location: z.string().min(10, { message: "Please provide a more detailed location." }),
  description: z.string().optional(),
});

export default function EmergencyPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();

  const form = useForm<z.infer<typeof emergencyFormSchema>>({
    resolver: zodResolver(emergencyFormSchema),
    defaultValues: {
      vehicle: "",
      location: "",
      description: "",
    },
  });

  function onSubmit(values: z.infer<typeof emergencyFormSchema>) {
    if (!user || !firestore) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "You must be logged in to make a request.",
      });
      return;
    }

    const requestsRef = collection(firestore, 'emergency_charging_requests');
    addDocumentNonBlocking(requestsRef, {
        userId: user.uid,
        userName: user.displayName || user.email,
        vehicle: values.vehicle,
        location: values.location,
        description: values.description,
        requestTime: serverTimestamp(),
        status: 'pending'
    });

    toast({
      title: "Emergency Request Sent",
      description: "Our team will review your request and contact you shortly.",
      variant: 'default',
      className: 'bg-accent text-accent-foreground border-accent'
    });
    form.reset();
  }

  return (
    <AppLayout>
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-headline">Emergency Charging Service</CardTitle>
          <CardDescription>
            Ran out of charge? Fill out the form below and we'll dispatch a mobile charging unit to your location.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="vehicle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vehicle (Make and Model)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Tesla Model Y" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Location</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Please be as specific as possible. e.g., 'Corner of 5th Ave and 34th St, near the Empire State Building'."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Provide your current address or nearest landmark.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Details (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any other information that might be helpful."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" size="lg">Request Help Now</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
