import { createFileRoute } from "@tanstack/react-router";
import {
  ListingDetail,
  ListingNotFound,
  listingHead,
  loadListing,
} from "@/components/ListingDetail";

export const Route = createFileRoute("/accommodation/$id")({
  loader: ({ params }) => loadListing("stay", params.id),
  head: ({ loaderData }) => listingHead("stay", loaderData),
  component: StayPage,
  notFoundComponent: () => <ListingNotFound kind="stay" />,
});

function StayPage() {
  return <ListingDetail listing={Route.useLoaderData()} />;
}
