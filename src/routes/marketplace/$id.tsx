import { createFileRoute } from "@tanstack/react-router";
import {
  ListingDetail,
  ListingNotFound,
  listingHead,
  loadListing,
} from "@/components/ListingDetail";

export const Route = createFileRoute("/marketplace/$id")({
  // Loaded on the server so search engines and link previews see the real item.
  loader: ({ params }) => loadListing("item", params.id),
  head: ({ loaderData }) => listingHead("item", loaderData),
  component: ItemPage,
  notFoundComponent: () => <ListingNotFound kind="item" />,
});

function ItemPage() {
  return <ListingDetail listing={Route.useLoaderData()} />;
}
