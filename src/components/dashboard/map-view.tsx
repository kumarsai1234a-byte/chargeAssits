"use client";

import type { Station } from "@/lib/data";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Image from "next/image";
import Link from "next/link";
import { Fuel } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function MapView({ stations }: { stations: Station[] }) {
  const mapBg = PlaceHolderImages.find(p => p.id === 'map-background');

  const latToPercent = (lat: number) => ((40.8 - lat) / (40.8 - 40.7)) * 100;
  const lngToPercent = (lng: number) => ((lng - (-74.02)) / ((-73.96) - (-74.02))) * 100;

  return (
    <div className="relative w-full h-[600px] rounded-lg overflow-hidden">
      {mapBg && (
        <Image
          src={mapBg.imageUrl}
          alt={mapBg.description}
          data-ai-hint={mapBg.imageHint}
          fill
          className="object-cover"
        />
      )}
      <div className="absolute inset-0 bg-black/40" />

      {stations.map(station => {
        const availableSlots = station.slots.filter(s => s.status === 'available').length > 0;
        const top = latToPercent(station.location.lat);
        const left = lngToPercent(station.location.lng);

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
              <p className="text-sm text-muted-foreground">{station.slots.filter(s => s.status === 'available').length} available slots</p>
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}
