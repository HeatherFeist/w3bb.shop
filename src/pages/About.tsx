import { Link } from "react-router-dom";
import { Heart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function About() {
  return (
    <div className="mx-auto max-w-3xl space-y-10 py-4">
      <div className="space-y-3 text-center">
        <Heart className="mx-auto size-6 text-primary" />
        <h1 className="text-3xl font-semibold sm:text-4xl">Our story</h1>
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
            in the shop — a small-batch craft business, built from your own kitchen table. It's a
            genuinely great way for stay-at-home parents and students to turn a few hours of
            hands-on time into real income, on their own schedule.
          </p>
          <p className="text-sm text-muted-foreground">
            We're building this out — reach out if you'd like to be one of the first to try it.
          </p>
        </CardContent>
      </Card>

      <div className="text-center">
        <Button asChild>
          <Link to="/">Shop the collection</Link>
        </Button>
      </div>
    </div>
  );
}
