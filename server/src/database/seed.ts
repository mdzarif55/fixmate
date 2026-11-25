import { initAuth } from "../config/auth.js";
import { env } from "../config/env.js";
import {
  bookingsCollection,
  closeDatabase,
  connectToDatabase,
  getDb,
  getMongoClient,
  paymentsCollection,
  servicesCollection,
  usersCollection,
} from "./mongo.js";
import type { ServiceCategory, ServiceMode, UserRole } from "../utils/constants.js";

interface SeedUserSpec {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone: string;
  area: string;
  bio: string;
  image: string;
  plan?: "free" | "pro";
}

const DEMO_USERS: SeedUserSpec[] = [
  {
    name: "FixMate Admin",
    email: "admin@fixmate.app",
    password: "Admin@1234",
    role: "admin",
    phone: "+1 555-100-0001",
    area: "Austin, TX",
    bio: "Platform administrator overseeing service quality, technician approvals, and transactions.",
    image:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Marcus Vance",
    email: "tech1@fixmate.app",
    password: "Tech@1234",
    role: "technician",
    phone: "+1 555-201-4400",
    area: "Downtown Austin & North Loop",
    bio: "Certified micro-soldering and mobile/laptop hardware specialist with 8+ years of repair bench experience.",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    plan: "pro",
  },
  {
    name: "Priya Nair",
    email: "tech2@fixmate.app",
    password: "Tech@1234",
    role: "technician",
    phone: "+1 555-202-8811",
    area: "South Congress & East Austin",
    bio: "EPA-certified HVAC and major home appliance engineer specializing in inverter AC, refrigerators, and washers.",
    image:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
    plan: "pro",
  },
  {
    name: "Jordan Blake",
    email: "tech3@fixmate.app",
    password: "Tech@1234",
    role: "technician",
    phone: "+1 555-203-7722",
    area: "Round Rock & Cedar Park",
    bio: "Licensed residential electrician and smart TV display technician focused on safe, clean diagnostics.",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    plan: "free",
  },
  {
    name: "Sophia Lin",
    email: "customer@fixmate.app",
    password: "Customer@1234",
    role: "customer",
    phone: "+1 555-309-1122",
    area: "Westlake, Austin, TX",
    bio: "Homeowner and remote product designer.",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
  },
];

interface SeedServiceSpec {
  title: string;
  category: ServiceCategory;
  description: string;
  image: string;
  basePrice: number;
  estimatedDuration: string;
  serviceMode: ServiceMode;
  serviceArea: string;
  technicianEmail: string;
  approvalStatus: "approved" | "pending";
}

const DEMO_SERVICES: SeedServiceSpec[] = [
  {
    title: "iPhone & Flagship OLED Screen Replacement",
    category: "Smartphone",
    description:
      "Precision OLED display assembly replacement with True Tone calibration, dust-seal gasket renewal, and full touch & Face ID diagnostics.",
    image:
      "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=900&q=80",
    basePrice: 89,
    estimatedDuration: "1-2 hours",
    serviceMode: "Shop Drop-off",
    serviceArea: "Downtown Austin & North Loop",
    technicianEmail: "tech1@fixmate.app",
    approvalStatus: "approved",
  },
  {
    title: "Smartphone Battery & Charging Port Restoration",
    category: "Smartphone",
    description:
      "Replace degraded lithium batteries or oxidized USB-C/Lightning charging ports with OEM-grade components and full wattage load testing.",
    image:
      "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=900&q=80",
    basePrice: 55,
    estimatedDuration: "45-60 mins",
    serviceMode: "Shop Drop-off",
    serviceArea: "Downtown Austin & North Loop",
    technicianEmail: "tech1@fixmate.app",
    approvalStatus: "approved",
  },
  {
    title: "MacBook & Ultrabook Thermal Repaste & Fan Cleaning",
    category: "Laptop & PC",
    description:
      "Eliminate thermal throttling and loud fan noise with ultrasonic dust removal, heatsink cleaning, and high-conductivity thermal compound application.",
    image:
      "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=900&q=80",
    basePrice: 75,
    estimatedDuration: "2 hours",
    serviceMode: "Shop Drop-off",
    serviceArea: "Downtown Austin & North Loop",
    technicianEmail: "tech1@fixmate.app",
    approvalStatus: "approved",
  },
  {
    title: "Laptop SSD Upgrade, RAM Expansion & OS Recovery",
    category: "Laptop & PC",
    description:
      "Clone your existing drive safely to a fast NVMe SSD, upgrade memory, and resolve boot loop or driver issues without losing your files.",
    image:
      "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=900&q=80",
    basePrice: 65,
    estimatedDuration: "2-3 hours",
    serviceMode: "Home Visit",
    serviceArea: "Greater Austin Metro",
    technicianEmail: "tech1@fixmate.app",
    approvalStatus: "approved",
  },
  {
    title: "Split AC Deep Jet Cleaning & Cooling Tune-Up",
    category: "AC",
    description:
      "Complete indoor coil pressure wash, drain line flushing, blower sanitization, and airflow temperature verification for peak summer efficiency.",
    image:
      "https://images.unsplash.com/photo-1631545806609-52b898e75f9f?auto=format&fit=crop&w=900&q=80",
    basePrice: 79,
    estimatedDuration: "1.5 hours",
    serviceMode: "Home Visit",
    serviceArea: "South Congress & East Austin",
    technicianEmail: "tech2@fixmate.app",
    approvalStatus: "approved",
  },
  {
    title: "Inverter AC Refrigerant Leak Check & Gas Refill",
    category: "AC",
    description:
      "Nitrogen pressure leak detection, flare nut resealing, vacuum evacuation, and weighed refrigerant recharge (R32 / R410A).",
    image:
      "https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=900&q=80",
    basePrice: 115,
    estimatedDuration: "2-3 hours",
    serviceMode: "Home Visit",
    serviceArea: "Austin Metro",
    technicianEmail: "tech2@fixmate.app",
    approvalStatus: "approved",
  },
  {
    title: "Double-Door Refrigerator No-Cooling Diagnostics",
    category: "Refrigerator",
    description:
      "Inspect compressor relay, defrost heater, evaporator fan, and thermostat sensors to restore reliable fresh & freezer cooling.",
    image:
      "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=900&q=80",
    basePrice: 85,
    estimatedDuration: "1-2 hours",
    serviceMode: "Home Visit",
    serviceArea: "South Congress & East Austin",
    technicianEmail: "tech2@fixmate.app",
    approvalStatus: "approved",
  },
  {
    title: "Refrigerator Door Gasket & Compressor Relay Replacement",
    category: "Refrigerator",
    description:
      "Stop cold air leaks, frost buildup, and clicking compressor starts with new magnetic door seals and OEM overload relays.",
    image:
      "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?auto=format&fit=crop&w=900&q=80",
    basePrice: 70,
    estimatedDuration: "1.5 hours",
    serviceMode: "Home Visit",
    serviceArea: "Austin & Round Rock",
    technicianEmail: "tech2@fixmate.app",
    approvalStatus: "approved",
  },
  {
    title: "4K Smart TV Backlight & Power Board Repair",
    category: "TV",
    description:
      "Resolve dark screen with sound, flickering LEDs, or standby power failure on Samsung, LG, and Sony smart TVs.",
    image:
      "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=900&q=80",
    basePrice: 95,
    estimatedDuration: "2-3 hours",
    serviceMode: "Shop Drop-off",
    serviceArea: "Round Rock & Cedar Park",
    technicianEmail: "tech3@fixmate.app",
    approvalStatus: "approved",
  },
  {
    title: "LED TV HDMI Port & Mainboard Diagnostics",
    category: "TV",
    description:
      "Fix damaged HDMI ports, Wi-Fi module drops, and boot-loop firmware issues with board-level diagnostics.",
    image:
      "https://images.unsplash.com/photo-1461151304267-38535e780c79?auto=format&fit=crop&w=900&q=80",
    basePrice: 80,
    estimatedDuration: "1.5 hours",
    serviceMode: "Home Visit",
    serviceArea: "Round Rock & North Austin",
    technicianEmail: "tech3@fixmate.app",
    approvalStatus: "approved",
  },
  {
    title: "Front-Load Washing Machine Drain & Spin Repair",
    category: "Washing Machine",
    description:
      "Clear drain pump blockages, replace worn shock absorbers or door latch interlocks, and eliminate spin-cycle vibration.",
    image:
      "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=900&q=80",
    basePrice: 75,
    estimatedDuration: "1.5 hours",
    serviceMode: "Home Visit",
    serviceArea: "South Congress & East Austin",
    technicianEmail: "tech2@fixmate.app",
    approvalStatus: "approved",
  },
  {
    title: "Top-Load Washer Water Inlet Valve & PCB Service",
    category: "Washing Machine",
    description:
      "Diagnose slow fill errors, sensor calibration faults, and water level pressure switch replacements.",
    image:
      "https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?auto=format&fit=crop&w=900&q=80",
    basePrice: 68,
    estimatedDuration: "1-2 hours",
    serviceMode: "Home Visit",
    serviceArea: "Austin Metro",
    technicianEmail: "tech2@fixmate.app",
    approvalStatus: "approved",
  },
  {
    title: "Home Circuit Breaker, GFCI & Outlet Troubleshooting",
    category: "Electrical",
    description:
      "Licensed electrical diagnostics for tripping breakers, faulty wall outlets, ceiling fan wiring, and surge protection.",
    image:
      "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=900&q=80",
    basePrice: 85,
    estimatedDuration: "1-2 hours",
    serviceMode: "Home Visit",
    serviceArea: "Round Rock & Cedar Park",
    technicianEmail: "tech3@fixmate.app",
    approvalStatus: "approved",
  },
  {
    title: "Smart Thermostat & Wi-Fi Switch Installation",
    category: "Electrical",
    description:
      "Safe installation and C-wire configuration for smart thermostats, dimmers, and home automation switches.",
    image:
      "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=900&q=80",
    basePrice: 60,
    estimatedDuration: "1 hour",
    serviceMode: "Home Visit",
    serviceArea: "Austin & Round Rock",
    technicianEmail: "tech3@fixmate.app",
    approvalStatus: "pending",
  },
];

export async function runSeed() {
  console.log("Connecting to MongoDB for seeding...");
  await connectToDatabase(env.MONGODB_URI);
  const auth = initAuth(getDb(), getMongoClient());

  const users = usersCollection();
  const services = servicesCollection();
  const bookings = bookingsCollection();
  const payments = paymentsCollection();

  // 1. Seed Users via BetterAuth so password hashing & account records are valid
  for (const spec of DEMO_USERS) {
    const existing = await users.findOne({ email: spec.email.toLowerCase() });
    if (!existing) {
      await auth.api.signUpEmail({
        body: {
          name: spec.name,
          email: spec.email.toLowerCase(),
          password: spec.password,
          role: spec.role === "admin" ? "customer" : spec.role,
        },
      });
      console.log(`Created user: ${spec.email}`);
    }

    await users.updateOne(
      { email: spec.email.toLowerCase() },
      {
        $set: {
          name: spec.name,
          role: spec.role,
          phone: spec.phone,
          area: spec.area,
          bio: spec.bio,
          image: spec.image,
          plan: spec.plan || "free",
          updatedAt: new Date(),
        },
      }
    );
  }

  // 2. Seed Services
  const userDocs = await users.find().toArray();
  const userByEmail = new Map(userDocs.map((u) => [u.email, u]));

  for (let i = 0; i < DEMO_SERVICES.length; i++) {
    const spec = DEMO_SERVICES[i];
    const existing = await services.findOne({
      title: spec.title,
      technicianEmail: spec.technicianEmail,
    });
    if (!existing) {
      const tech = userByEmail.get(spec.technicianEmail);
      const createdAt = new Date(Date.now() - (DEMO_SERVICES.length - i) * 3600_000);
      await services.insertOne({
        title: spec.title,
        category: spec.category,
        description: spec.description,
        image: spec.image,
        basePrice: spec.basePrice,
        estimatedDuration: spec.estimatedDuration,
        serviceMode: spec.serviceMode,
        serviceArea: spec.serviceArea,
        technicianName: tech?.name || "FixMate Technician",
        technicianEmail: spec.technicianEmail,
        technicianIsPro: tech?.plan === "pro",
        approvalStatus: spec.approvalStatus,
        isAvailable: true,
        ratingAverage: spec.approvalStatus === "approved" ? 4.9 : 0,
        reviewCount: spec.approvalStatus === "approved" ? 1 : 0,
        createdAt,
        updatedAt: createdAt,
      } as never);
      console.log(`Created service: ${spec.title}`);
    }
  }

  // 3. Seed Sample Bookings & Payments if none exist
  const existingBookingsCount = await bookings.countDocuments();
  if (existingBookingsCount === 0) {
    const seededServices = await services
      .find({ approvalStatus: "approved" })
      .toArray();
    const customer = userByEmail.get("customer@fixmate.app");

    if (customer && seededServices.length >= 5) {
      const futureDate = new Date(Date.now() + 3 * 86400_000)
        .toISOString()
        .slice(0, 10);
      const now = new Date();
      const yesterday = new Date(Date.now() - 86400_000);
      const twoDaysAgo = new Date(Date.now() - 2 * 86400_000);

      // Completed & Paid booking + Payment record + Review
      const s0 = seededServices[0];
      const paidBookingRes = await bookings.insertOne({
        serviceId: String(s0._id),
        serviceTitle: s0.title,
        serviceImage: s0.image,
        category: s0.category,
        basePrice: s0.basePrice,
        technicianName: s0.technicianName,
        technicianEmail: s0.technicianEmail,
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone || "+1 555-309-1122",
        address: customer.area || "Westlake, Austin, TX",
        preferredDate: futureDate,
        problemDescription:
          "Screen cracked after drop and touch response lags near the top corner.",
        status: "completed",
        finalAmount: 99,
        paymentStatus: "paid",
        statusHistory: [
          { status: "requested", changedAt: twoDaysAgo },
          { status: "accepted", changedAt: twoDaysAgo },
          { status: "in-progress", changedAt: yesterday },
          { status: "completed", changedAt: yesterday },
          { status: "paid", changedAt: now },
        ],
        review: {
          rating: 5,
          comment:
            "Fast, spotless OLED swap and True Tone works perfectly. Highly recommended!",
          createdAt: now,
        },
        createdAt: twoDaysAgo,
        updatedAt: now,
      } as never);

      await payments.insertOne({
        bookingId: String(paidBookingRes.insertedId),
        serviceTitle: s0.title,
        customerName: customer.name,
        customerEmail: customer.email,
        technicianName: s0.technicianName,
        technicianEmail: s0.technicianEmail,
        amount: 99,
        currency: "USD",
        transactionId: "pi_seed_demo_0001",
        stripeSessionId: "cs_test_seed_demo_0001",
        paymentStatus: "paid",
        paidAt: now,
      } as never);

      // Completed & Unpaid (Ready to test Stripe Pay Now!)
      const s1 = seededServices[4];
      await bookings.insertOne({
        serviceId: String(s1._id),
        serviceTitle: s1.title,
        serviceImage: s1.image,
        category: s1.category,
        basePrice: s1.basePrice,
        technicianName: s1.technicianName,
        technicianEmail: s1.technicianEmail,
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone || "+1 555-309-1122",
        address: customer.area || "Westlake, Austin, TX",
        preferredDate: futureDate,
        problemDescription:
          "Living room split AC is blowing warm air and dripping near the indoor drain pipe.",
        status: "completed",
        finalAmount: 89,
        paymentStatus: "unpaid",
        statusHistory: [
          { status: "requested", changedAt: twoDaysAgo },
          { status: "accepted", changedAt: yesterday },
          { status: "in-progress", changedAt: yesterday },
          { status: "completed", changedAt: now },
        ],
        review: null,
        createdAt: twoDaysAgo,
        updatedAt: now,
      } as never);

      // In-Progress booking
      const s2 = seededServices[6];
      await bookings.insertOne({
        serviceId: String(s2._id),
        serviceTitle: s2.title,
        serviceImage: s2.image,
        category: s2.category,
        basePrice: s2.basePrice,
        technicianName: s2.technicianName,
        technicianEmail: s2.technicianEmail,
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone || "+1 555-309-1122",
        address: customer.area || "Westlake, Austin, TX",
        preferredDate: futureDate,
        problemDescription:
          "Refrigerator fresh food section feels warm while freezer is still frosty.",
        status: "in-progress",
        finalAmount: s2.basePrice,
        paymentStatus: "unpaid",
        statusHistory: [
          { status: "requested", changedAt: yesterday },
          { status: "accepted", changedAt: yesterday },
          { status: "in-progress", changedAt: now },
        ],
        review: null,
        createdAt: yesterday,
        updatedAt: now,
      } as never);

      // Requested booking (can be cancelled by customer or accepted/rejected by tech)
      const s3 = seededServices[10];
      await bookings.insertOne({
        serviceId: String(s3._id),
        serviceTitle: s3.title,
        serviceImage: s3.image,
        category: s3.category,
        basePrice: s3.basePrice,
        technicianName: s3.technicianName,
        technicianEmail: s3.technicianEmail,
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone || "+1 555-309-1122",
        address: customer.area || "Westlake, Austin, TX",
        preferredDate: futureDate,
        problemDescription:
          "Front-load washer stops mid-rinse with water remaining inside the drum.",
        status: "requested",
        finalAmount: s3.basePrice,
        paymentStatus: "unpaid",
        statusHistory: [{ status: "requested", changedAt: now }],
        review: null,
        createdAt: now,
        updatedAt: now,
      } as never);

      console.log("Created sample bookings and payment history.");
    }
  }

  console.log("FixMate database seeding complete!");
  console.log("Demo Accounts:");
  console.log("  Admin:      admin@fixmate.app / Admin@1234");
  console.log("  Tech (Pro): tech1@fixmate.app / Tech@1234");
  console.log("  Tech (Pro): tech2@fixmate.app / Tech@1234");
  console.log("  Tech (Free):tech3@fixmate.app / Tech@1234");
  console.log("  Customer:   customer@fixmate.app / Customer@1234");
}

if (
  process.argv[1] &&
  import.meta.url.endsWith(process.argv[1].replace(/\\/g, "/"))
) {
  runSeed()
    .then(() => closeDatabase())
    .then(() => process.exit(0))
    .catch(async (err) => {
      console.error("Seed error:", err);
      await closeDatabase();
      process.exit(1);
    });
}
