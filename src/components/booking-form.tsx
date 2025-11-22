"use client";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import type { Station } from "@/lib/data";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number."),
  vehicleNumber: z.string().min(3, "Vehicle number must be at least 3 characters."),
  slotId: z.string().min(1, "Please select a slot."),
});

export function BookingForm({ station }: { station: Station }) {
  const { toast } = useToast();
  const availableSlots = station.slots.filter(s => s.status === "available");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      vehicleNumber: "",
      slotId: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    toast({
      title: "Booking Successful!",
      description: `Slot ${values.slotId.split('-')[1]} at ${station.name} has been booked for you.`,
      variant: 'default',
      className: 'bg-accent text-accent-foreground border-accent'
    });
    form.reset();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
        <FormField
          control={form.control}
          name="vehicleNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vehicle Number</FormLabel>
              <FormControl>
                <Input placeholder="EV-12345" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="slotId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Available Slot</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={availableSlots.length === 0}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={availableSlots.length > 0 ? "Select an available slot" : "No slots available"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availableSlots.map(slot => (
                     <SelectItem key={slot.id} value={slot.id}>
                       Slot {slot.id.split('-')[1]} ({slot.charger.connector} - {slot.charger.power})
                     </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={availableSlots.length === 0}>Book Now</Button>
      </form>
    </Form>
  );
}
