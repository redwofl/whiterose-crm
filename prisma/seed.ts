import { PrismaClient, LeadStatus, LeadPriority, ServiceCategory } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { DEFAULT_ROLE_PERMISSIONS, PERMISSIONS, ROLE_LABELS, type RoleName } from "../src/lib/rbac";

import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding WhiteRose CRM...");

  // 1. Permissions
  const permissionRecords = await Promise.all(
    PERMISSIONS.map((key) =>
      prisma.permission.upsert({
        where: { key },
        update: {},
        create: { key, label: key },
      })
    )
  );
  const permissionByKey = new Map(permissionRecords.map((p) => [p.key, p]));

  // 2. Roles
  const roleNames: RoleName[] = ["SUPER_ADMIN", "ADMIN", "SALES_EXECUTIVE", "DEVELOPER"];
  const roles: Record<string, { id: string }> = {};
  for (const name of roleNames) {
    const perms = DEFAULT_ROLE_PERMISSIONS[name].map((k) => permissionByKey.get(k)!.id);
    const role = await prisma.role.upsert({
      where: { name },
      update: { permissions: { set: perms.map((id) => ({ id })) } },
      create: {
        name,
        label: ROLE_LABELS[name],
        permissions: { connect: perms.map((id) => ({ id })) },
      },
    });
    roles[name] = role;
  }

  // 3. Users
  const passwordHash = await bcrypt.hash("Admin@123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@whiterose.in" },
    update: {},
    create: {
      name: "WhiteRose Admin",
      email: "admin@whiterose.in",
      phone: "9820012345",
      passwordHash,
      roleId: roles.SUPER_ADMIN.id,
      department: "Founder",
    },
  });

  const salesPassword = await bcrypt.hash("Sales@123", 10);
  const salesExec = await prisma.user.upsert({
    where: { email: "sales@whiterose.in" },
    update: {},
    create: {
      name: "Priya Nair",
      email: "sales@whiterose.in",
      phone: "9820098765",
      passwordHash: salesPassword,
      roleId: roles.SALES_EXECUTIVE.id,
      department: "Sales",
    },
  });

  // 4. Lookups: Industries
  const industryNames = [
    "Dentist", "Clinic", "Hospital", "School", "Coaching Classes", "Café", "Restaurant",
    "Gym", "Salon", "Hotel", "Retail Shop", "Real Estate", "Manufacturer", "Corporate Office",
    "Pharmacy", "Laboratory",
  ];
  const industries = await Promise.all(
    industryNames.map((name) => prisma.industry.upsert({ where: { name }, update: {}, create: { name } }))
  );
  const industryByName = new Map(industries.map((i) => [i.name, i]));

  // 5. Lookups: Lead Sources
  const sourceNames = [
    "Direct Visit", "Visiting Card", "Referral", "WhatsApp", "Website", "Instagram",
    "Facebook", "Google", "Phone Call", "Email", "Advertisement", "Existing Client",
    "Event", "Networking",
  ];
  const sources = await Promise.all(
    sourceNames.map((name) => prisma.leadSource.upsert({ where: { name }, update: {}, create: { name } }))
  );
  const sourceByName = new Map(sources.map((s) => [s.name, s]));

  // 6. Lookups: Areas
  const areaNames = ["Vasai", "Virar", "Nalasopara", "Bhayandar", "Mira Road", "Mumbai"];
  const areas = await Promise.all(
    areaNames.map((name) => prisma.area.upsert({ where: { name }, update: {}, create: { name } }))
  );
  const areaByName = new Map(areas.map((a) => [a.name, a]));

  // 7. Services
  const services: { name: string; category: ServiceCategory; price: number }[] = [
    { name: "Business Website", category: "SOFTWARE_DEVELOPMENT", price: 25000 },
    { name: "E-commerce Website", category: "SOFTWARE_DEVELOPMENT", price: 60000 },
    { name: "Mobile Application", category: "SOFTWARE_DEVELOPMENT", price: 120000 },
    { name: "Appointment Booking System", category: "SOFTWARE_DEVELOPMENT", price: 35000 },
    { name: "Clinic Management System", category: "SOFTWARE_DEVELOPMENT", price: 75000 },
    { name: "WhatsApp Automation", category: "AUTOMATION", price: 15000 },
    { name: "AI Voice Agent", category: "AI_SERVICES", price: 45000 },
    { name: "Vulnerability Assessment", category: "CYBERSECURITY", price: 30000 },
    { name: "Penetration Testing", category: "CYBERSECURITY", price: 50000 },
    { name: "Website Security Audit", category: "CYBERSECURITY", price: 20000 },
  ];
  const serviceRecords = await Promise.all(
    services.map((s) =>
      prisma.service.upsert({
        where: { name: s.name },
        update: {},
        create: { name: s.name, category: s.category, defaultPrice: s.price },
      })
    )
  );

  // 8. WhatsApp Templates
  await prisma.whatsAppTemplate.createMany({
    data: [
      {
        name: "After Meeting",
        category: "After Meeting",
        message:
          "Hello {{name}}, this is {{salesperson}} from WhiteRose. It was nice meeting you today. As discussed, WhiteRose provides software development and cybersecurity solutions. I'll share the proposed solution shortly.",
      },
      {
        name: "Follow-up",
        category: "Follow-up",
        message:
          "Hello {{name}}, just following up regarding the {{service}} solution we discussed. Please let me know a convenient time to connect.",
      },
      {
        name: "Demo Reminder",
        category: "Demo Reminder",
        message:
          "Hello {{name}}, this is a reminder regarding our WhiteRose software demo scheduled for {{date}} at {{time}}.",
      },
    ],
    skipDuplicates: true,
  });

  // 9. Company Settings
  const existingSettings = await prisma.companySetting.findFirst();
  if (!existingSettings) {
    await prisma.companySetting.create({
      data: {
        companyName: "WhiteRose",
        email: "hello@whiterose.in",
        phone: "9820012345",
        website: "https://whiterose.in",
        currency: "INR",
      },
    });
  }

  // 10. Sample leads
  const sampleLeads: {
    businessName: string;
    contactPerson: string;
    mobile: string;
    industry: string;
    area: string;
    source: string;
    status: LeadStatus;
    priority: LeadPriority;
    dealValue: number;
    score: number;
  }[] = [
    { businessName: "Smile Dental Clinic", contactPerson: "Dr. Anjali Shah", mobile: "9821011111", industry: "Dentist", area: "Vasai", source: "Direct Visit", status: "NEGOTIATION", priority: "HOT", dealValue: 75000, score: 82 },
    { businessName: "Platinum Hospital", contactPerson: "Dr. Suresh Rao", mobile: "9821022222", industry: "Hospital", area: "Mumbai", source: "Referral", status: "DEMO_SCHEDULED", priority: "HOT", dealValue: 250000, score: 75 },
    { businessName: "ABC International School", contactPerson: "Mrs. Kavita Joshi", mobile: "9821033333", industry: "School", area: "Virar", source: "Visiting Card", status: "PROPOSAL_SENT", priority: "WARM", dealValue: 150000, score: 68 },
    { businessName: "FitZone Gym", contactPerson: "Rahul Mehta", mobile: "9821044444", industry: "Gym", area: "Nalasopara", source: "Instagram", status: "INTERESTED", priority: "WARM", dealValue: 35000, score: 55 },
    { businessName: "Cafe 24", contactPerson: "Aman Kapoor", mobile: "9821055555", industry: "Café", area: "Bhayandar", source: "WhatsApp", status: "CONTACTED", priority: "COLD", dealValue: 20000, score: 30 },
    { businessName: "Vision Eye Clinic", contactPerson: "Dr. Neha Iyer", mobile: "9821066666", industry: "Clinic", area: "Mira Road", source: "Google", status: "NEW_LEAD", priority: "WARM", dealValue: 45000, score: 40 },
    { businessName: "Sunrise Coaching Classes", contactPerson: "Vikram Singh", mobile: "9821077777", industry: "Coaching Classes", area: "Vasai", source: "Referral", status: "FOLLOW_UP", priority: "WARM", dealValue: 40000, score: 48 },
    { businessName: "Golden Spoon Restaurant", contactPerson: "Sanjay Patil", mobile: "9821088888", industry: "Restaurant", area: "Virar", source: "Direct Visit", status: "WON", priority: "HOT", dealValue: 55000, score: 90 },
    { businessName: "Glamour Salon & Spa", contactPerson: "Pooja Verma", mobile: "9821099999", industry: "Salon", area: "Nalasopara", source: "Facebook", status: "LOST", priority: "COLD", dealValue: 18000, score: 20 },
    { businessName: "Coastal Real Estate", contactPerson: "Imran Sheikh", mobile: "9821010101", industry: "Real Estate", area: "Mumbai", source: "Networking", status: "DEMO_COMPLETED", priority: "HOT", dealValue: 90000, score: 78 },
  ];

  for (const l of sampleLeads) {
    const existing = await prisma.lead.findFirst({ where: { mobile: l.mobile } });
    if (existing) continue;

    const lead = await prisma.lead.create({
      data: {
        businessName: l.businessName,
        contactPerson: l.contactPerson,
        mobile: l.mobile,
        whatsapp: l.mobile,
        industryId: industryByName.get(l.industry)?.id,
        areaId: areaByName.get(l.area)?.id,
        sourceId: sourceByName.get(l.source)?.id,
        status: l.status,
        priority: l.priority,
        dealValue: l.dealValue,
        probability: 50,
        leadScore: l.score,
        assignedToId: salesExec.id,
        createdById: admin.id,
        city: "Mumbai",
        state: "Maharashtra",
        services: {
          create: [{ serviceId: serviceRecords[Math.floor(Math.random() * serviceRecords.length)].id }],
        },
        activities: {
          create: [{ type: "created", description: "Lead created during business visit.", createdById: admin.id }],
        },
      },
    });

    if (l.status === "WON") {
      const client = await prisma.client.create({
        data: {
          leadId: lead.id,
          businessName: lead.businessName,
          contactPerson: lead.contactPerson,
          mobile: lead.mobile,
          whatsapp: lead.whatsapp,
          finalDealValue: l.dealValue,
          startDate: new Date(),
          accountManagerId: salesExec.id,
        },
      });

      const project = await prisma.project.create({
        data: {
          name: `${lead.businessName} — Website & Booking System`,
          clientId: client.id,
          serviceType: "Software Development",
          projectValue: l.dealValue,
          status: "DEVELOPMENT",
          progress: 40,
          projectManagerId: admin.id,
        },
      });

      const payment = await prisma.payment.create({
        data: {
          clientId: client.id,
          projectId: project.id,
          totalAmount: l.dealValue,
          paidAmount: l.dealValue * 0.3,
          status: "PARTIALLY_PAID",
          dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        },
      });

      await prisma.paymentInstallment.createMany({
        data: [
          { paymentId: payment.id, label: "Advance", amount: l.dealValue * 0.3, status: "PAID", paidDate: new Date() },
          { paymentId: payment.id, label: "Second Payment", amount: l.dealValue * 0.4, status: "PENDING", dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) },
          { paymentId: payment.id, label: "Final Payment", amount: l.dealValue * 0.3, status: "PENDING", dueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000) },
        ],
      });
    } else {
      // Add a follow-up for active leads so the dashboard has real data.
      const isOverdue = Math.random() > 0.7;
      await prisma.followUp.create({
        data: {
          leadId: lead.id,
          date: isOverdue ? new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) : new Date(),
          time: "11:00 AM",
          type: "PHONE_CALL",
          purpose: "Discuss requirements and next steps",
          assignedToId: salesExec.id,
        },
      });
    }
  }

  console.log("Seed complete.");
  console.log("Login with: admin@whiterose.in / Admin@123 (Super Admin)");
  console.log("            sales@whiterose.in / Sales@123 (Sales Executive)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
