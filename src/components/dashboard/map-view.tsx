
"use client";

import type { Station } from "@/lib/data";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Image from "next/image";
import Link from "next/link";
import { Fuel } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export function MapView({ stations, isLoading }: { stations: Station[], isLoading: boolean }) {
  const mapBg = PlaceHolderImages.find(p => p.id === 'map-background');

  const latToPercent = (lat: number) => {
    const minLat = 17.35;
    const maxLat = 17.40;
    return ((maxLat - lat) / (maxLat - minLat)) * 100;
  }
  const lngToPercent = (lng: number) => {
    const minLng = 78.30;
    const maxLng = 78.35;
    return ((lng - minLng) / (maxLng - minLng)) * 100;
  }

  return (
    <TooltipProvider>
      <div className="relative w-full h-[600px] rounded-lg overflow-hidden">
        {isLoading && <Skeleton className="w-full h-full" />}
        {mapBg && !isLoading && (
          <Image
            src={mapBg.imageUrl}
            alt={mapBg.description}
            data-ai-hint={mapBg.imageHint}
            fill
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black/40" />

        {!isLoading && stations.map(station => {
          const availableSlots = station.slots?.filter(s => s.status === 'available').length > 0;
          const top = latToPercent(station.location.lat);
          const left = lngToPercent(station.location.lng);

          // Skip rendering if station is out of bounds for the simplified map view
          if (top < 0 || top > 100 || left < 0 || left > 100) {
            return null;
          }

          return (
            <Tooltip key={station.id}>
              <TooltipTrigger asChild>
                <Link
                  href={`/station/${station.id}`}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2"
                  style={{ top: `${top}%`, left: `${left}%` }}
                >
                  <div className="relative">
                    <Fuel className={cn(
                        "size-8 drop-shadow-lg transition-transform hover:scale-125",
                        availableSlots ? "text-accent" : "text-destructive"
                    )} />
                    <div className={cn(
                        "absolute -top-1 -right-1 size-3 rounded-full border-2 border-card",
                        availableSlots ? "bg-accent" : "bg-destructive"
                    )}></div>
                  </div>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-bold">{station.name}</p>
                <p className="text-sm text-muted-foreground">{station.slots?.filter(s => s.status === 'available').length || 0} available slots</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
