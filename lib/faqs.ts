/**
 * Questions the gallery page answers, above the footer.
 *
 * Every answer here is built only from details already confirmed for this
 * project — the layouts, the acreage, the tower and unit counts, the amenity
 * list, the Kanakapura Road location and the company's 1973 founding. Nothing
 * claims a price, a date, a payment plan or an approval that has not been
 * supplied.
 *
 * ⚠️ Buyers will read these as commitments. Have the client check them, and
 * add the questions they are actually asked on the phone.
 */
export type Faq = { question: string; answer: string };

export const faqsBySlug: Record<string, readonly Faq[]> = {
  "hara-vijaya-heights": [
    {
      question: "What layouts are available at Hara Vijaya Heights?",
      answer:
        "Two, three and four bedroom homes, across three towers on three and a half acres, and 242 homes in total. The 2 BHK is 1,450 sq ft and the 3 BHK units are 1,885 and 2,015 sq ft; the four-bedroom penthouses run from 3,200 to 3,340 sq ft, each with a private terrace. Every plan, with its facing and built-up area, is on the Floor Plans page.",
    },
    {
      question: "Where exactly is the project?",
      answer:
        "On Kanakapura Road at Talaghattapura, about 500 metres from the Metro station, in the extension of the Banashankari 6th Stage BDA layout. The Location page has a live map, and we will gladly meet you at the site.",
    },
    {
      question: "What is included in the development?",
      answer:
        "A clubhouse and multi-purpose hall, a swimming pool, a gymnasium, a cafe, a landscaped garden, a children's play area, a seating area for senior residents, a jogger's track, volleyball, table tennis, billiards and indoor games. Security and power backup run around the clock, with intercom to every home and a lift sized for goods and for a stretcher.",
    },
    {
      question: "Can I visit before deciding?",
      answer:
        "Yes, and we would rather you did. Photographs and drawings only go so far: come and see the finish, the light in the rooms and what is around the site. Get in touch and we will arrange a time that suits you.",
    },
    {
      question: "Who is building it?",
      answer:
        "Vijaya Enterprises, building in Karnataka since 1973. Over five decades we have worked across residential, commercial, industrial and institutional projects, and the same in-house construction experience goes into this one.",
    },
  ],
};
