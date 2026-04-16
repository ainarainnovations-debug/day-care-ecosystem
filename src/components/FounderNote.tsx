const FounderNote = () => {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Letter */}
          <div className="bg-popover rounded-xl p-8 md:p-12 shadow-sm border border-border">
            <h2 className="text-2xl md:text-3xl text-foreground mb-6">A note from Arserno</h2>

            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p>
                As a parent, sometimes it's hard to prioritize myself — my self-care, my interests, me-time. I love the crap out of my two boys. And yet, personally, I don't actually want to be with them all day every day. It feels pretty weird to admit it though.
              </p>
              <p>
                What I actually want is really good child care. I want to know that every day they're getting the socialization, stimulation, and support they need to learn and grow. That their child care provider wakes up every morning excited to spend the day teaching and loving on these tiny humans.
              </p>
              <p>
                That's what child care is all about to me. It's about me being the best version of myself when I am with my sons, and then having the freedom to be fully present when I drop them off and go to work.
              </p>
              <p>
                And that's why we created NeighborSchools. To help moms and dads find child care that is really good for our children, our precious, tiny bundles of joy and stress, and good for us too, as parents, and as people.
              </p>
            </div>

            <div className="mt-8 flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center text-foreground font-heading font-bold text-lg">
                AA
              </div>
              <div>
                <p className="font-heading font-semibold text-foreground">Arserno Aurelus</p>
                <p className="text-xs text-muted-foreground">Co-founder of NeighborSchools</p>
                <p className="text-xs text-muted-foreground">Dad to Hudson & Brooks</p>
              </div>
            </div>

            <p className="mt-4 font-heading italic text-foreground text-lg">Arserno A.</p>
          </div>

          {/* Podcast */}
          <div className="space-y-6">
            <div className="bg-light-sage rounded-xl p-8 md:p-12">
              <h3 className="font-heading text-2xl md:text-3xl text-foreground mb-2 leading-tight">
                Work Like a<br />Mother
              </h3>
              <p className="text-xs text-muted-foreground mb-6">by NeighborSchools</p>

              <div className="bg-popover rounded-lg p-6 space-y-3">
                <p className="text-xs text-muted-foreground">Ep. 20 with</p>
                <p className="text-xl font-heading font-semibold text-foreground">Ingrid Read</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  The Fifth Trimester: Gender Equity at Work and at Home in 2020
                </p>
              </div>

              <div className="mt-6 space-y-2">
                <p className="text-sm font-semibold text-primary uppercase tracking-wider">Podcast</p>
                <p className="text-xs text-muted-foreground">Hosted by Arserno</p>
                <div className="flex items-center gap-3 mt-3">
                  <button className="w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center hover:opacity-80 transition-opacity">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                  </button>
                  <span className="text-xs text-muted-foreground">Listen on your favorite platform</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FounderNote;
