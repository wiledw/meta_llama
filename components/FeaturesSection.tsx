import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export function FeaturesSection() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl px-4">
      <Card>
        <CardHeader>
          <CardTitle>Plan Your Trip</CardTitle>
          <CardDescription>
            Create detailed itineraries and organize your travel plans
            efficiently
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Save Locations</CardTitle>
          <CardDescription>
            Bookmark your favorite destinations and points of interest
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Generate Itineraries</CardTitle>
          <CardDescription>
            Share your travel plans with friends and family
          </CardDescription>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Generate Itineraries</CardTitle>
          <CardDescription>
            Share your travel plans with friends and family
          </CardDescription>
        </CardHeader>
      </Card>
    </section>
  );
}
