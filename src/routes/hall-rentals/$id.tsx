import { createFileRoute } from "@tanstack/react-router";
import {
  ListingDetail,
  ListingNotFound,
  listingHead,
  loadListing,
} from "@/components/ListingDetail";

export const Route = createFileRoute("/hall-rentals/$id")({
  loader: ({ params }) => loadListing("hall", params.id),
  head: ({ loaderData }) => listingHead("hall", loaderData),
  component: HallPage,
  notFoundComponent: () => <ListingNotFound kind="hall" />,
});

function HallPage() {
  return <ListingDetail listing={Route.useLoaderData()} />;
}
