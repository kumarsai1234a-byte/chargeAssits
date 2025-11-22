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

const emergencyFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number."),
  vehicle: z.string().min(3, { message: "Vehicle details must be at least 3 characters." }),
  location: z.string().min(10, { message: "Please provide a more detailed location." }),
  description: z.string().optional(),
});

export default function EmergencyPage() {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof emergencyFormSchema>>({
    resolver: zodResolver(emergencyFormSchema),
    defaultValues: {
      name: "",
      phone: "",
      vehicle: "",
      location: "",
      description: "",
    },
  });

  function onSubmit(values: z.infer<typeof emergencyFormSchema>) {
    console.log(values);
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
              <div className="grid md:grid-cols-2 gap-8">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="+1 234 567 890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
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
