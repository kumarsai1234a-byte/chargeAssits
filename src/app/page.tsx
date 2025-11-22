import { Button } from "@/components/ui/button";
import { Zap, BatteryCharging, ShieldCheck } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b">
        <Link href="/" className="flex items-center justify-center">
          <Zap className="h-6 w-6 text-primary" />
          <span className="ml-2 text-xl font-headline font-bold">ChargeAssist</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link
            href="/login"
            className="text-sm font-medium hover:underline underline-offset-4"
          >
            Login
          </Link>
          <Button asChild>
            <Link href="/signup">Sign Up</Link>
          </Button>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_500px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4 text-center lg:text-left">
                <div className="space-y-2">
                  <h1 className="text-4xl font-headline font-bold tracking-tighter sm:text-5xl xl:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary">
                    Future-Proof Your Journey
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl mx-auto lg:mx-0">
                    ChargeAssist provides a seamless EV charging experience. Find stations, book slots, and get emergency support, all in one place.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row justify-center lg:justify-start">
                  <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                    <Link href="/dashboard">
                      Find a Station
                    </Link>
                  </Button>
                  <Button asChild variant="secondary" size="lg">
                    <Link href="/emergency">
                      Emergency Service
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-center">
                 <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md">
                    <div className="absolute inset-0.5 bg-gradient-to-r from-primary via-accent to-primary rounded-full blur-xl opacity-50"></div>
                    <Zap className="relative w-full h-auto text-primary/30" strokeWidth={0.5}/>
                 </div>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-secondary">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Key Features</div>
                <h2 className="text-3xl font-headline font-bold tracking-tighter sm:text-5xl">Everything You Need for Your EV</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our platform is packed with features to make owning an electric vehicle easier and more convenient than ever.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 lg:gap-16 mt-12">
              <div className="grid gap-1 text-center">
                <div className="flex justify-center items-center">
                    <div className="flex items-center justify-center rounded-full bg-background/50 p-4 border border-primary/20">
                        <Zap className="w-8 h-8 text-primary" />
                    </div>
                </div>
                <h3 className="text-lg font-bold font-headline">Station Locator</h3>
                <p className="text-sm text-muted-foreground">Quickly find available charging stations near you with our real-time map.</p>
              </div>
              <div className="grid gap-1 text-center">
                <div className="flex justify-center items-center">
                    <div className="flex items-center justify-center rounded-full bg-background/50 p-4 border border-primary/20">
                        <BatteryCharging className="w-8 h-8 text-primary" />
                    </div>
                </div>
                <h3 className="text-lg font-bold font-headline">Seamless Booking</h3>
                <p className="text-sm text-muted-foreground">Book your charging slot in advance and avoid waiting times.</p>
              </div>
              <div className="grid gap-1 text-center">
                <div className="flex justify-center items-center">
                    <div className="flex items-center justify-center rounded-full bg-background/50 p-4 border border-primary/20">
                        <ShieldCheck className="w-8 h-8 text-primary" />
                    </div>
                </div>
                <h3 className="text-lg font-bold font-headline">Emergency Service</h3>
                <p className="text-sm text-muted-foreground">Stranded? Request an emergency mobile charging unit to your location.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; 2024 ChargeAssist. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4">
            Terms of Service
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
