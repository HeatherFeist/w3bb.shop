import { Link } from "react-router-dom";
import { Heart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function About() {
  return (
    <div className="space-y-10 pb-4">
      {/* Full-bleed hero: breaks out of the layout's centered max-width so
          the video spans the whole viewport, even though the rest of this
          page's content stays comfortably narrow to read. */}
      <div className="relative left-1/2 right-1/2 -mx-[50vw] -mt-6 h-[420px] w-screen overflow-hidden sm:-mt-8 sm:h-[520px]">
        <video
          className="absolute inset-0 size-full object-cover"
          src="/hero-video.mp4"
          autoPlay
          loop
          muted
          playsInline
        />
        {/* Dims the video so the white text stays readable over any frame. */}
        <div className="absolute inset-0 bg-black/45" />
        <div className="relative flex h-full flex-col items-center justify-center gap-4 px-4 text-center text-white">
          <h1 className="text-3xl font-semibold drop-shadow-sm sm:text-4xl">Handmade, with heart</h1>
          <p className="max-w-xl text-white/90">
            Dream catchers, tie-dye, and DIY kits — each one made by hand.
          </p>
          <Button asChild size="lg" className="mt-2">
            <Link to="/shop">Shop the collection</Link>
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-3xl space-y-10">
        <div className="space-y-3 text-center">
          <Heart className="mx-auto size-6 text-primary" />
          <h2 className="text-3xl font-semibold">Our story</h2>
          <p className="mx-auto max-w-xl text-muted-foreground">
            Every piece in this shop was made by hand, by people who genuinely love making it.
          </p>
        </div>

        <div className="space-y-4 leading-relaxed">
          <p>
            W3BB Shop started at a kitchen table, not a factory. Elizabeth has spent countless
            hours hand-crafting every dream catcher you'll find here — choosing each feather,
            bead, and weave by hand, one at a time, the same way it's been done for generations.
            It's slow work, and that's exactly the point.
          </p>
          <p>
            Alongside her, her husband Jeff brings the color — many of the tie-dyed shirts and
            pieces in the shop are his, dyed and folded by hand right beside her. What started as
            something they made for family and friends slowly grew into something they wanted to
            share more widely, and that's how this shop came to be.
          </p>
          <p>
            Now, Elizabeth and Jeff want to share what they've learned with you, too. Every DIY
            kit in the shop is exactly what they use themselves — the same materials, the same
            process, just packaged up so you can make it your own from home.
          </p>
        </div>

        <Card className="bg-secondary/40">
          <CardContent className="space-y-3 py-6 text-center">
            <Sparkles className="mx-auto size-5 text-primary" />
            <h2 className="text-xl font-semibold">Make it, then sell it</h2>
            <p className="mx-auto max-w-lg text-muted-foreground">
              Buy a DIY kit, make something beautiful, and bring it back to us to sell right here
              in the shop — a small-batch craft business, built from your own kitchen table. It's
              a genuinely great way for stay-at-home parents and students to turn a few hours of
              hands-on time into real income, on their own schedule.
            </p>
            <p className="text-sm text-muted-foreground">
              We're building this out — reach out if you'd like to be one of the first to try it.
            </p>
          </CardContent>
        </Card>

        <div className="text-center">
          <Button asChild>
            <Link to="/shop">Shop the collection</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
