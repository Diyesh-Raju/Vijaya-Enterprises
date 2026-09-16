/**
 * Questions the gallery page answers, above the footer.
 *
 * Every answer here is built only from details already confirmed for the
 * project — the layouts, the acreage, the block and unit counts, the amenity
 * list, the location and the company's 1973 founding, all off the project's
 * own brochure. Nothing claims a price, a date, a payment plan or an approval
 * that has not been supplied.
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
  "vijaya-luxo": [
    {
      question: "What layouts are available at Vijaya Luxo?",
      answer:
        "One, two and three bedroom homes, six to a floor. The 1 BHK is 510 sq ft; the 2 BHKs are 1,125, 1,150 and 1,265 sq ft; the 3 BHKs are 1,500 and 1,525 sq ft, with the second-floor copies of two units a little larger. Every plan, with its facing and built-up area, is on the Floor Plans page.",
    },
    {
      question: "Is the project approved?",
      answer:
        "Yes. Vijaya Luxo is BBMP approved, holds its Completion and Occupancy Certificates, and is registered with Karnataka RERA under PRM/KA/RERA/1251/310/PR/041122/005393.",
    },
    {
      question: "Where exactly is the project?",
      answer:
        "In the heart of Rajarajeshwari Nagar, a street in from the main road: a kilometre from the Nimishamba and Rajarajeshwari temples, two from the Mysore Road junction and its Metro station, and close to Global Village tech park, BGS Hospital and Gopalan Mall. The Location page has a live map, and we will gladly meet you at the site.",
    },
    {
      question: "What is included in the development?",
      answer:
        "An equipped gym, a party hall, an indoor play area and a children's play area outside; car parking and an automatic lift; and CCTV surveillance, intercom, rain water harvesting and power backup around the clock.",
    },
    {
      question: "Can I visit before deciding?",
      answer:
        "Yes, and we would rather you did. Photographs and drawings only go so far: come and see the finish, the light in the rooms and what is around the site. Get in touch and we will arrange a time that suits you.",
    },
  ],
  "vijaya-aquagreen": [
    {
      question: "What layouts are available at Vijaya Aquagreen?",
      answer:
        "One and two bedroom homes, 196 of them across six blocks on two acres. The 1 BHKs run from 615 to 680 sq ft and the 2 BHKs are 880 sq ft. Every plan, with its built-up area, is on the Floor Plans page.",
    },
    {
      question: "Where exactly is the project?",
      answer:
        "At Somshettyhalli in North Bengaluru, two kilometres from Chikkabanavara railway station and six from BEL Circle, Tumkur Road and the Dasarahalli Metro station. The Location page has a live map, and we will gladly meet you at the site.",
    },
    {
      question: "What is included in the development?",
      answer:
        "A clubhouse, a swimming pool, a gym, indoor games and a children's play area; security and DG power backup around the clock, with intercom and CCTV coverage; and rain water harvesting, a sewage treatment plant and an organic waste composter. The layout is BDA approved and vastu compliant.",
    },
    {
      question: "Who is building it?",
      answer:
        "Digvijaya Shelters LLP, a sister concern of Vijaya Enterprises, which has been building in Karnataka since 1973. The same five decades of construction experience go into this one.",
    },
    {
      question: "Can I visit before deciding?",
      answer:
        "Yes, and we would rather you did. Photographs and drawings only go so far: come and see the finish, the light in the rooms and what is around the site. Get in touch and we will arrange a time that suits you.",
    },
  ],
  "vijaya-springwoods": [
    {
      question: "What layouts are available at Vijaya Springwoods?",
      answer:
        "Two and three bedroom homes: the 2 BHK is 1,040 sq ft and the 3 BHK is 1,370 sq ft, each with every room dimensioned on the Floor Plans page. No two homes share a wall, so every flat has three sides of natural light and air.",
    },
    {
      question: "Where exactly is the project?",
      answer:
        "At Singasandra, off Hosur Road at Begur, 1.2 kilometres in from Hosur Road, 3.2 from Electronic City and 6 from the Silk Board junction, facing a sixty-foot main road. The Location page has a live map, and we will gladly meet you at the site.",
    },
    {
      question: "What is included in the development?",
      answer:
        "A pool, a gymnasium, a clubhouse, a party hall, a twenty-seat auditorium and a children's play area, with more than half the site kept open and landscaped. Security with intercom runs around the clock, there is visitors' parking, an automatic lift with power backup for it and the common areas, and rain water harvesting.",
    },
    {
      question: "Is the project approved?",
      answer:
        "Yes. Vijaya Springwoods is BBMP approved, and each flat has its own independent electricity meter and a 24-hour water supply from overhead tanks and sumps.",
    },
    {
      question: "Can I visit before deciding?",
      answer:
        "Yes, and we would rather you did. Photographs and drawings only go so far: come and see the finish, the light in the rooms and what is around the site. Get in touch and we will arrange a time that suits you.",
    },
  ],
};
