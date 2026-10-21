import { createFileRoute } from "@tanstack/react-router";
import {
  ListingDetail,
  ListingNotFound,
  listingHead,
  loadListing,
} from "@/components/ListingDetail";

export const Route = createFileRoute("/services/$id")({
  // Loaded on the server so search engines and link previews see the real service.
  loader: ({ params }) => loadListing("service", params.id),
  head: ({ loaderData }) => listingHead("service", loaderData),
  component: ServicePage,
  notFoundComponent: () => <ListingNotFound kind="service" />,
});

function ServicePage() {
  return <ListingDetail listing={Route.useLoaderData()} />;
}
