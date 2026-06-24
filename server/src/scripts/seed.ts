/**
 * Seed Script for MovieBooking Platform
 *
 * Populates: Movies, Theatres, Screens, Showtimes, Seats
 * Skips: Users (already exist), Bookings, Payments, Reviews (created via app flow)
 *
 * Relationship chain:
 *   Theatre → Screen (theatreId)
 *   Movie (standalone)
 *   Showtime → Movie, Theatre, Screen (movieId, theatreId, screenId)
 *   Seat → Showtime, Screen (showtimeId, screenId)
 *
 * Run: npx tsx src/scripts/seed.ts
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Load .env from server root
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import Movie, { MovieStatus } from "../models/Movie.model";
import Theatre from "../models/Theatre.model";
import Screen, { SeatType } from "../models/Screen.model";
import Showtime, { ShowtimeStatus } from "../models/Showtime.model";
import Seat, { SeatStatus } from "../models/Seat.model";

// ─────────────────────────────────────────────────
// Helper: Build a seat matrix for a screen
// ─────────────────────────────────────────────────
function buildSeatMatrix(
  rows: string[],
  columns: number,
  premiumRows: string[] = []
) {
  const seats = rows.flatMap((rowLabel) =>
    Array.from({ length: columns }, (_, i) => ({
      rowLabel,
      seatNumber: i + 1,
      type: premiumRows.includes(rowLabel) ? SeatType.PREMIUM : SeatType.REGULAR,
      isAccessible: false,
    }))
  );
  return { rows: rows.length, columns, seats };
}

// ─────────────────────────────────────────────────
// Helper: Create Seat documents for a showtime
// ─────────────────────────────────────────────────
function buildSeatDocs(
  showtimeId: mongoose.Types.ObjectId,
  screenId: mongoose.Types.ObjectId,
  seatMatrix: { seats: { rowLabel: string; seatNumber: number }[] }
) {
  return seatMatrix.seats.map((s) => ({
    showtimeId,
    screenId,
    seatNumber: `${s.rowLabel}${s.seatNumber}`,
    rowLabel: s.rowLabel,
    columnNumber: s.seatNumber,
    status: SeatStatus.AVAILABLE,
  }));
}

// ─────────────────────────────────────────────────
// Helper: Get show dates (today + next 3 days)
// ─────────────────────────────────────────────────
function getShowDates(count: number): Date[] {
  const dates: Date[] = [];
  const today = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    d.setHours(0, 0, 0, 0);
    dates.push(d);
  }
  return dates;
}

// ═══════════════════════════════════════════════════
//  SEED DATA DEFINITIONS
// ═══════════════════════════════════════════════════

const MOVIES_DATA = [
  {
    title: "Inception: The Dream Collapse",
    description:
      "Dom Cobb is a thief who steals corporate secrets through dream-sharing technology. He is offered a chance to have his criminal history erased if he can successfully perform inception.",
    genre: ["Action", "Sci-Fi", "Thriller"],
    releaseDate: new Date("2026-06-10"),
    duration: 148,
    rating: "UA" as const,
    cast: ["Leonardo DiCaprio", "Tom Hardy", "Joseph Gordon-Levitt", "Elliot Page", "Ken Watanabe"],
    director: "Christopher Nolan",
    language: ["English", "Hindi"],
    posterUrl: "https://image.tmdb.org/t/p/w500/ljsZTbVsrQSqZgWeep2B1QiDKuh.jpg",
    bannerUrl: "https://image.tmdb.org/t/p/original/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg",
    trailerUrl: "https://www.youtube.com/watch?v=YoHD9XEInc0",
    status: MovieStatus.NOW_SHOWING,
    avgRating: 4.5,
    reviewCount: 342,
  },
  {
    title: "The Dark Horizon",
    description:
      "A lone astronaut stranded on a desolate exoplanet must find a way to signal Earth before her oxygen runs out, while uncovering ancient alien ruins that hold the key to faster-than-light travel.",
    genre: ["Sci-Fi", "Drama", "Adventure"],
    releaseDate: new Date("2026-06-15"),
    duration: 135,
    rating: "UA" as const,
    cast: ["Zendaya", "Oscar Isaac", "Florence Pugh", "John Boyega"],
    director: "Denis Villeneuve",
    language: ["English", "Hindi", "Telugu"],
    posterUrl: "https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg",
    bannerUrl: "https://image.tmdb.org/t/p/original/oAt6OtpwYCdJI76AVtVKW1eorYA.jpg",
    trailerUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    status: MovieStatus.NOW_SHOWING,
    avgRating: 4.2,
    reviewCount: 189,
  },
  {
    title: "Midnight in Mumbai",
    description:
      "A hard-boiled detective races against time through the neon-lit streets of Mumbai to stop a serial bomber before the city's biggest festival.",
    genre: ["Thriller", "Crime", "Drama"],
    releaseDate: new Date("2026-06-20"),
    duration: 142,
    rating: "A" as const,
    cast: ["Ranveer Singh", "Alia Bhatt", "Nawazuddin Siddiqui", "Radhika Apte"],
    director: "Anurag Kashyap",
    language: ["Hindi", "English"],
    posterUrl: "https://image.tmdb.org/t/p/w500/lCanGgsqF4xD2WA5t1oAoZ1MhIR.jpg",
    bannerUrl: "https://image.tmdb.org/t/p/original/suaEOtk1N1sgg2MTM7oZd2cfVp3.jpg",
    status: MovieStatus.NOW_SHOWING,
    avgRating: 4.0,
    reviewCount: 95,
  },
  {
    title: "Guardians of the Celestial Realm",
    description:
      "A group of misfits from across the galaxy must unite to defend a powerful cosmic artifact from a ruthless warlord who seeks to rewrite reality itself.",
    genre: ["Action", "Fantasy", "Comedy"],
    releaseDate: new Date("2026-07-04"),
    duration: 152,
    rating: "UA" as const,
    cast: ["Chris Pratt", "Deepika Padukone", "Idris Elba", "Karen Gillan"],
    director: "James Gunn",
    language: ["English", "Hindi"],
    posterUrl: "https://image.tmdb.org/t/p/w500/r2J02Z2OpNTctfOSN1Ydgii51I3.jpg",
    bannerUrl: "https://image.tmdb.org/t/p/original/h8gHn0OzBoKcXnCYDhSgR4YBKYM.jpg",
    trailerUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    status: MovieStatus.COMING_SOON,
    avgRating: 0,
    reviewCount: 0,
  },
  {
    title: "Shadow Protocol",
    description:
      "An elite intelligence agent goes rogue after discovering her own agency is behind a global conspiracy. With no allies and every government hunting her, she has 48 hours to expose the truth.",
    genre: ["Action", "Espionage", "Thriller"],
    releaseDate: new Date("2026-07-18"),
    duration: 128,
    rating: "UA" as const,
    cast: ["Gal Gadot", "Henry Cavill", "Hrithik Roshan", "Ana de Armas"],
    director: "Siddharth Anand",
    language: ["English", "Hindi"],
    posterUrl: "https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QI4S2t0POvT.jpg",
    bannerUrl: "https://image.tmdb.org/t/p/original/iQFcwSGbZXMkeyKrxbPnwnRo5fl.jpg",
    status: MovieStatus.COMING_SOON,
    avgRating: 0,
    reviewCount: 0,
  },
  {
    title: "The Last Monsoon",
    description:
      "In a near-future India where monsoons have stopped, a young climate scientist discovers an underground river system that could save millions—but powerful corporations want to control it.",
    genre: ["Drama", "Sci-Fi"],
    releaseDate: new Date("2026-08-01"),
    duration: 138,
    rating: "UA" as const,
    cast: ["Rajkummar Rao", "Sanya Malhotra", "Pankaj Tripathi"],
    director: "Shoojit Sircar",
    language: ["Hindi", "English"],
    posterUrl: "https://image.tmdb.org/t/p/w500/9cqNcoGqRfv9N4asSQfOfWKKIF0.jpg",
    bannerUrl: "https://image.tmdb.org/t/p/original/2rmK7mnchw9Xr3XdiTFSxTTLXqv.jpg",
    status: MovieStatus.COMING_SOON,
    avgRating: 0,
    reviewCount: 0,
  },
];

const THEATRES_DATA = [
  {
    name: "The Grandview Cinemas",
    city: "Delhi",
    address: "Plot 12, Connaught Place, New Delhi",
    latitude: 28.6315,
    longitude: 77.2167,
    phoneNumber: "+91-11-23456789",
    amenities: ["Parking", "Food Court", "Dolby Atmos", "Wheelchair Access"],
    basePrice: 320,
  },
  {
    name: "Play Loft Multiplex",
    city: "Mumbai",
    address: "Link Road, Andheri West, Mumbai",
    latitude: 19.1364,
    longitude: 72.8296,
    phoneNumber: "+91-22-98765432",
    amenities: ["Parking", "IMAX", "4DX", "Lounge"],
    basePrice: 350,
  },
  {
    name: "CinemaOne Royal",
    city: "Bangalore",
    address: "100 Feet Road, Indiranagar, Bangalore",
    latitude: 12.9716,
    longitude: 77.6412,
    phoneNumber: "+91-80-55667788",
    amenities: ["Parking", "Dolby Atmos", "Recliner Seats", "Cafe"],
    basePrice: 280,
  },
  {
    name: "Cinemount Arena",
    city: "Delhi",
    address: "Sector 18, Noida",
    latitude: 28.5707,
    longitude: 77.3256,
    phoneNumber: "+91-120-1234567",
    amenities: ["Parking", "3D", "Food Court"],
    basePrice: 250,
  },
];

// ─────────────────────────────────────────────────
// Screen configs per theatre
// ─────────────────────────────────────────────────
// Screen 1: 10 rows (A-H standard, J-K premium), 10 cols  => 100 seats
// Screen 2: 12 rows (A-H standard, J-M premium), 12 cols  => 144 seats
// Screen 3: 8 rows (A-H standard), 10 cols                => 80 seats

const SCREEN_CONFIGS = [
  {
    screenNumber: 1,
    screenName: "Screen 1",
    rows: ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K"],
    columns: 10,
    premiumRows: ["J", "K"],
    formats: ["2D", "3D"],
  },
  {
    screenNumber: 2,
    screenName: "Screen 2",
    rows: ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K", "L", "M"],
    columns: 12,
    premiumRows: ["J", "K", "L", "M"],
    formats: ["2D", "3D", "IMAX"],
  },
  {
    screenNumber: 3,
    screenName: "Screen 3",
    rows: ["A", "B", "C", "D", "E", "F", "G", "H"],
    columns: 10,
    premiumRows: [],
    formats: ["2D"],
  },
];

const SHOW_TIMES = ["10:00 AM", "01:30 PM", "04:45 PM", "08:00 PM"];

// ═══════════════════════════════════════════════════
//  MAIN SEED FUNCTION
// ═══════════════════════════════════════════════════
async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("❌ MONGODB_URI is not set in .env");
    process.exit(1);
  }

  console.log("🔗 Connecting to MongoDB...");
  await mongoose.connect(uri);
  console.log("✅ Connected!\n");

  // ── Step 0: Wipe all existing data (except Users) ──
  console.log("🧹 Clearing existing data (Movies, Theatres, Screens, Showtimes, Seats)...");
  await Promise.all([
    Movie.deleteMany({}),
    Theatre.deleteMany({}),
    Screen.deleteMany({}),
    Showtime.deleteMany({}),
    Seat.deleteMany({}),
  ]);
  console.log("   ✓ Collections cleared\n");

  // ── Step 1: Seed Movies ──
  console.log("🎬 Seeding Movies...");
  const movies = await Movie.insertMany(MOVIES_DATA);
  console.log(`   ✓ Inserted ${movies.length} movies`);
  movies.forEach((m) => console.log(`     - ${m.title} (${m.status}) [${m._id}]`));
  console.log();

  // ── Step 2: Seed Theatres ──
  console.log("🏛️  Seeding Theatres...");
  const theatres = await Theatre.insertMany(THEATRES_DATA);
  console.log(`   ✓ Inserted ${theatres.length} theatres`);
  theatres.forEach((t) => console.log(`     - ${t.name}, ${t.city} [${t._id}]`));
  console.log();

  // ── Step 3: Seed Screens (linked to Theatres) ──
  console.log("🖥️  Seeding Screens...");
  const allScreens: mongoose.Document[] = [];
  for (const theatre of theatres) {
    // Each theatre gets 2 screens (first 2 configs)
    const screensForTheatre = SCREEN_CONFIGS.slice(0, 2);
    for (const cfg of screensForTheatre) {
      const seatMatrix = buildSeatMatrix(cfg.rows, cfg.columns, cfg.premiumRows);
      const screen = await Screen.create({
        theatreId: theatre._id,
        screenNumber: cfg.screenNumber,
        screenName: cfg.screenName,
        capacity: seatMatrix.seats.length,
        seatMatrix,
        formats: cfg.formats,
      });
      allScreens.push(screen);
      console.log(
        `     - ${theatre.name} → ${cfg.screenName} (${seatMatrix.seats.length} seats) [${screen._id}]`
      );

      // Also push screen ref into the theatre's screens array
      await Theatre.findByIdAndUpdate(theatre._id, {
        $push: { screens: screen._id },
      });
    }
  }
  console.log(`   ✓ Inserted ${allScreens.length} screens\n`);

  // ── Step 4: Seed Showtimes + Seats ──
  console.log("🕐 Seeding Showtimes & Seats...");
  const showDates = getShowDates(4); // today + next 3 days
  const nowShowingMovies = movies.filter((m) => m.status === MovieStatus.NOW_SHOWING);

  let showtimeCount = 0;
  let seatCount = 0;

  for (const theatre of theatres) {
    // Find screens for this theatre
    const theatreScreens = allScreens.filter(
      (s: any) => s.theatreId.toString() === theatre._id.toString()
    );

    for (const screen of theatreScreens) {
      const screenDoc = screen as any;

      // Each screen gets showtimes for each now_showing movie, on each date
      for (const movie of nowShowingMovies) {
        for (const date of showDates) {
          // 2 showtimes per movie per screen per day (to keep data manageable)
          const timesForThisSlot = SHOW_TIMES.slice(0, 2);

          for (const time of timesForThisSlot) {
            const showtime = await Showtime.create({
              screenId: screenDoc._id,
              movieId: movie._id,
              theatreId: theatre._id,
              showDate: date,
              showTime: time,
              format: screenDoc.formats[0], // use first format
              language: movie.language[0],
              totalSeats: screenDoc.capacity,
              availableSeats: screenDoc.capacity,
              ticketPrice: (theatre as any).basePrice + (time === "08:00 PM" ? 50 : 0),
              status: ShowtimeStatus.UPCOMING,
            });
            showtimeCount++;

            // Create seat documents for this showtime
            const seatDocs = buildSeatDocs(
              showtime._id as mongoose.Types.ObjectId,
              screenDoc._id,
              screenDoc.seatMatrix
            );
            await Seat.insertMany(seatDocs);
            seatCount += seatDocs.length;
          }
        }
      }
    }
  }

  console.log(`   ✓ Inserted ${showtimeCount} showtimes`);
  console.log(`   ✓ Inserted ${seatCount} seat documents\n`);

  // ── Summary ──
  console.log("═══════════════════════════════════════════");
  console.log("  🎉 SEED COMPLETE!");
  console.log("═══════════════════════════════════════════");
  console.log(`  Movies:    ${movies.length}`);
  console.log(`  Theatres:  ${theatres.length}`);
  console.log(`  Screens:   ${allScreens.length}`);
  console.log(`  Showtimes: ${showtimeCount}`);
  console.log(`  Seats:     ${seatCount}`);
  console.log("═══════════════════════════════════════════\n");

  await mongoose.disconnect();
  console.log("🔌 Disconnected from MongoDB. Done!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
