import { DataSource } from 'typeorm';
import { generateSlug } from '../../../common/utils/slug.util';
import { contentAlreadySeeded, escapeSQL } from './shared';

interface VenueData {
  name: string;
  district: string;
  address: string;
  capacity: number;
  lat: number;
  lng: number;
  website: string;
}

const VENUES: VenueData[] = [
  { name: 'Berghain', district: 'Friedrichshain', address: 'Am Wriezener Bahnhof, 10243 Berlin', capacity: 1500, lat: 52.5112, lng: 13.4430, website: 'https://www.berghain.berlin' },
  { name: 'SO36', district: 'Kreuzberg', address: 'Oranienstrasse 190, 10999 Berlin', capacity: 600, lat: 52.5005, lng: 13.4310, website: 'https://www.so36.com' },
  { name: 'Tempodrom', district: 'Kreuzberg', address: 'Moeckernstrasse 10, 10963 Berlin', capacity: 3800, lat: 52.4985, lng: 13.3825, website: 'https://www.tempodrom.de' },
  { name: 'Mercedes-Benz Arena', district: 'Friedrichshain', address: 'Mercedes-Platz 1, 10243 Berlin', capacity: 17000, lat: 52.5075, lng: 13.4424, website: 'https://www.mercedes-benz-arena-berlin.de' },
  { name: 'Admiralspalast', district: 'Mitte', address: 'Friedrichstrasse 101, 10117 Berlin', capacity: 1700, lat: 52.5198, lng: 13.3879, website: 'https://www.admiralspalast.theater' },
  { name: 'Columbia Theater', district: 'Neukoelln', address: 'Columbiadamm 9-11, 10965 Berlin', capacity: 800, lat: 52.4844, lng: 13.3817, website: 'https://www.columbia-theater.de' },
  { name: 'Festsaal Kreuzberg', district: 'Kreuzberg', address: 'Am Flutgraben 2, 12435 Berlin', capacity: 500, lat: 52.4953, lng: 13.4431, website: 'https://www.festsaal-kreuzberg.de' },
  { name: 'Lido', district: 'Kreuzberg', address: 'Cuvrystrasse 7, 10997 Berlin', capacity: 400, lat: 52.4980, lng: 13.4400, website: 'https://www.lido-berlin.de' },
  { name: 'Astra Kulturhaus', district: 'Friedrichshain', address: 'Revaler Strasse 99, 10245 Berlin', capacity: 1500, lat: 52.5083, lng: 13.4537, website: 'https://www.astra-kulturhaus.de' },
  { name: 'Heimathafen Neukoelln', district: 'Neukoelln', address: 'Karl-Marx-Strasse 141, 12043 Berlin', capacity: 350, lat: 52.4770, lng: 13.4360, website: 'https://www.heimathafen-neukoelln.de' },
  { name: 'Arena Berlin', district: 'Treptow', address: 'Eichenstrasse 4, 12435 Berlin', capacity: 8000, lat: 52.4951, lng: 13.4530, website: 'https://www.arena.berlin' },
  { name: 'Huxleys Neue Welt', district: 'Neukoelln', address: 'Hasenheide 107-113, 10967 Berlin', capacity: 2000, lat: 52.4861, lng: 13.4205, website: 'https://www.huxleysneuewelt.com' },
  { name: 'Frannz Club', district: 'Prenzlauer Berg', address: 'Schoenhauser Allee 36, 10435 Berlin', capacity: 600, lat: 52.5310, lng: 13.4130, website: 'https://www.frannz.de' },
  { name: 'Clarchens Ballhaus', district: 'Mitte', address: 'Auguststrasse 24, 10117 Berlin', capacity: 300, lat: 52.5263, lng: 13.3938, website: 'https://www.ballhaus.de' },
  { name: 'Sage Club', district: 'Mitte', address: 'Koepenicker Strasse 76, 10179 Berlin', capacity: 600, lat: 52.5113, lng: 13.4185, website: 'https://www.sage-club.de' },
  { name: 'Holzmarkt 25', district: 'Friedrichshain', address: 'Holzmarktstrasse 25, 10243 Berlin', capacity: 500, lat: 52.5098, lng: 13.4265, website: 'https://www.holzmarkt.com' },
  { name: 'Kulturbrauerei', district: 'Prenzlauer Berg', address: 'Schoenhauser Allee 36, 10435 Berlin', capacity: 1000, lat: 52.5318, lng: 13.4135, website: 'https://www.kulturbrauerei.de' },
  { name: 'Kesselhaus', district: 'Prenzlauer Berg', address: 'Knaackstrasse 97, 10435 Berlin', capacity: 600, lat: 52.5320, lng: 13.4137, website: 'https://www.kesselhaus.net' },
  { name: 'Passionskirche', district: 'Kreuzberg', address: 'Marheinekeplatz 1, 10961 Berlin', capacity: 400, lat: 52.4896, lng: 13.3920, website: 'https://www.passionskirche.de' },
  { name: 'Zenner', district: 'Treptow', address: 'Alt-Treptow 14-17, 12435 Berlin', capacity: 500, lat: 52.4877, lng: 13.4726, website: 'https://www.zenner.berlin' },
];

export async function seedVenues(dataSource: DataSource): Promise<void> {
  const qr = dataSource.createQueryRunner();
  await qr.connect();

  if (await contentAlreadySeeded(qr, 'venues', 10)) {
    console.log('  Venues already seeded, skipping.');
    await qr.release();
    return;
  }

  await qr.startTransaction();
  try {
    for (const v of VENUES) {
      const slug = generateSlug(v.name);
      const desc = `${v.name} is a popular venue in ${v.district}, Berlin, with a capacity of ${v.capacity}. It hosts concerts, cultural events, and performances throughout the year.`;
      await qr.query(
        `INSERT INTO venues (name, slug, address, district, latitude, longitude, website, capacity, description)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (slug) DO NOTHING`,
        [v.name, slug, v.address, v.district, v.lat, v.lng, v.website, v.capacity, desc],
      );
    }
    await qr.commitTransaction();
    console.log(`  Seeded ${VENUES.length} venues.`);
  } catch (err) {
    await qr.rollbackTransaction();
    throw err;
  } finally {
    await qr.release();
  }
}
