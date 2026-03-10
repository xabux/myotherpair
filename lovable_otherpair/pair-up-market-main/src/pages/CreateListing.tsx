import CreateListingForm from "@/components/CreateListingForm";
import BottomNav from "@/components/BottomNav";

const CreateListing = () => {
  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-40 glass-nav border-b border-border/50 px-4 py-3.5">
        <h1 className="font-display text-lg font-bold text-foreground">List a shoe</h1>
        <p className="text-[11px] text-muted-foreground mt-0.5">Upload a photo, set your price, and find your match.</p>
      </header>
      <div className="max-w-lg mx-auto px-4 py-5 animate-fade-in">
        <CreateListingForm />
      </div>
      <BottomNav />
    </div>
  );
};

export default CreateListing;
