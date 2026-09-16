/**
 * Map locations for the project location pages.
 *
 * `embed` is framed on the page; `link` opens Google Maps in a new tab. Both
 * are plain Google Maps URLs — the query embed needs no API key, so no key is
 * shipped to the browser and nothing needs billing.
 */
export type MapLocation = {
  /** Heading for this half of the page. */
  title: string;
  /** The place as we state it, matching what the pin shows. */
  address: string;
  /** Two or three sentences on where it is. */
  body: string;
  /** The `?q=` value; a place name and address rather than coordinates. */
  query: string;
  /**
   * Where to centre the map, as "lat,lng". Without it Google matches the query
   * across the whole city — searching a common company name drops a pin on
   * every branch rather than on this one.
   */
  center?: string;
  /** Where the button goes. Defaults to a Maps search for `query`. */
  link?: string;
};

export type ProjectLocations = {
  project: MapLocation;
  office: MapLocation;
};

/** The one office, the same on every project's page. */
const office: MapLocation = {
  title: "Location of the Office",
  address: "Vijaya Enterprises, Basavanagudi, Bengaluru",
  body: "The office is where every enquiry is answered and every drawing is talked through in person. Come by to see plans, discuss a layout, or arrange a visit to the site itself. We would rather show you the work than describe it.",
  query: "Vijaya Enterprises",
  // Taken from the company's own Maps listing, so the pin is this office
  // and not one of the other businesses sharing the name.
  center: "12.9446071,77.5679966",
  link: "https://maps.app.goo.gl/16Vp8ebWMc7ECVRN7",
};

export const locationsBySlug: Record<string, ProjectLocations> = {
  "hara-vijaya-heights": {
    project: {
      title: "Location of the Project",
      address:
        "Kanakapura Road, Talaghattapura, 500 metres from the Metro Station",
      body: "Hara Vijaya Heights stands on Kanakapura Road at Talaghattapura, one of the arterial roads running south out of Bengaluru. The Metro station is 500 metres away, so the city is reachable without depending on the road. Everyday needs — schools, hospitals and markets — are along the same stretch.",
      // ⚠️ The pin is a name-and-address search. Send the project's own Google
      // Maps link if there is one and it will drop on the exact plot.
      query: "Hara Vijaya Heights, Kanakapura Road, Talaghattapura, Bengaluru",
    },
    office,
  },
  "vijaya-luxo": {
    project: {
      title: "Location of the Project",
      address: "Rajarajeshwari Nagar, off Rajarajeshwarinagar Main Road",
      body: "Vijaya Luxo stands in the heart of Rajarajeshwari Nagar, a street in from the main road — a kilometre from the Nimishamba and Rajarajeshwari temples and two from the Mysore Road junction, with the Rajarajeshwari Nagar Metro station on that road. Global Village tech park, BGS Hospital, the RNS and JSS colleges and Gopalan Mall are all within a short drive.",
      // ⚠️ The pin is a name-and-address search. Send the project's own Google
      // Maps link if there is one and it will drop on the exact plot.
      query: "Vijaya Luxo, Rajarajeshwari Nagar, Bengaluru",
    },
    office,
  },
  "vijaya-aquagreen": {
    project: {
      title: "Location of the Project",
      address: "Somshettyhalli, near Chikkabanavara, North Bengaluru",
      body: "Vijaya Aquagreen is at Somshettyhalli, a fast-growing and well-planned locale in North Bengaluru. Chikkabanavara railway station is two kilometres away; BEL Circle, the Bengaluru–Pune highway at Tumkur Road and the Dasarahalli Metro station are each six. Yeshwanthpur station is ten kilometres, the City station fifteen, and the airport thirty-five.",
      // ⚠️ The pin is a name-and-address search. Send the project's own Google
      // Maps link if there is one and it will drop on the exact plot.
      query: "Vijaya Aquagreen, Somshettyhalli, Chikkabanavara, Bengaluru",
    },
    office,
  },
  "vijaya-springwoods": {
    project: {
      title: "Location of the Project",
      address: "#81 Singasandra Main Road, off Hosur Road, Begur, Bengaluru 560 068",
      body: "Vijaya Springwoods faces a sixty-foot main road at Singasandra, 1.2 kilometres in from Hosur Road and 400 metres from Manipal County Resort. Electronic City is 3.2 kilometres on, the NICE Road 2.5, Bannerghatta Road 5 and the Silk Board junction 6 — with supermarkets, colleges, the bus terminal and restaurants along the same stretch.",
      // ⚠️ The pin is a name-and-address search. Send the project's own Google
      // Maps link if there is one and it will drop on the exact plot.
      query: "Vijaya Springwoods, 81 Singasandra Main Road, Begur, Bengaluru 560068",
    },
    office,
  },
};

/** The framed map. `output=embed` is the keyless embed Google serves. */
export const embedUrl = ({ query, center }: Pick<MapLocation, "query" | "center">) =>
  `https://www.google.com/maps?q=${encodeURIComponent(query)}` +
  (center ? `&ll=${encodeURIComponent(center)}&z=17` : "") +
  "&output=embed";

/** Where "Open in Maps" goes when a place has no listing link of its own. */
export const searchUrl = (query: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
