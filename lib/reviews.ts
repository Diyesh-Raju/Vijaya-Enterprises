/**
 * Reviews from the company's Google listing.
 *
 * Quotes are verbatim. Two of them were truncated by Google's own "…More"
 * fold when they were collected; those are cut back to their last complete
 * sentence rather than paraphrased, so nothing here is words we wrote.
 *
 * ⚠️ `when` is the relative age Google displayed when these were collected
 * (18 August 2026). It does not recalculate, so it drifts — refresh these
 * strings whenever the list is next updated.
 *
 * ⚠️ `rating` was not captured alongside the text; every entry here is set to
 * 5 on the owner's word that all five are five-star reviews. Check any newly
 * added review against the listing rather than copying the 5 down — these are
 * real named people, and the card prints the count under the name. Omitting
 * `rating` renders the card with no stars at all.
 */
export type Review = {
  name: string;
  when: string;
  quote: string;
  rating?: 1 | 2 | 3 | 4 | 5;
};

export const reviews: readonly Review[] = [
  {
    name: "Santosh",
    when: "5 months ago",
    rating: 5,
    quote:
      "Excellent experience working with all team members. Very happy to buy this property. Special thanks to Mr Rajesh, Kumar and Deepak. Also very good team they have. Delivered on time and very good quality work.",
  },
  {
    name: "Yoganarasimhan G N",
    when: "9 years ago",
    rating: 5,
    quote: "A honest Builder with quality and speed",
  },
  {
    name: "Sai Vrushabh",
    when: "5 months ago",
    rating: 5,
    quote:
      "We are very happy with our experience at Vijaya Aqua Green. One of the biggest advantages of this project is the location. It is well connected to the main roads, yet the surroundings are calm and peaceful.",
  },
  {
    name: "rudresha y.o",
    when: "6 years ago",
    rating: 5,
    quote:
      "I am extremely happy and satisfied to be associated with Vijaya Enterprises. The quality of work is commendable, also the possession was timely. Initially I had to face some problems but was amazed by the support provided by Vijaya Enterprises.",
  },
  {
    name: "Shenoy Vivekanand",
    when: "10 years ago",
    rating: 5,
    quote:
      "I had booked a property with Vijaya group. I found them very cooperative and helpful from day1. I am pretty happy, having made a right choice of builder, considering the current state of some of the other builder. Reliable and professional company.",
  },
];
