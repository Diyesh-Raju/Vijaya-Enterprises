import type { Metadata } from "next";
import { SiteBookingPage } from "./site-booking-page";

export const metadata: Metadata = {
  title: "Site Booking",
  description:
    "Book a site visit to a Vijaya Enterprises project. Pick a day and a time of day, and we will meet you at the site.",
  alternates: { canonical: "/site-booking" },
};

export default function Page() {
  return <SiteBookingPage />;
}
