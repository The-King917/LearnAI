import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ profile: null });
  }

  const profile = await prisma.applicationProfile.findUnique({
    where: { userId: session.user.id },
  });

  return Response.json({ profile });
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Not signed in" }, { status: 401 });
  }

  const body = await req.json();
  const data = {
    gpa: typeof body.gpa === "number" ? body.gpa : null,
    gpaScale: typeof body.gpaScale === "string" && body.gpaScale.trim() ? body.gpaScale.trim() : null,
    satScore: typeof body.satScore === "number" ? body.satScore : null,
    actScore: typeof body.actScore === "number" ? body.actScore : null,
    intendedMajor: typeof body.intendedMajor === "string" && body.intendedMajor.trim() ? body.intendedMajor.trim() : null,
    courseRigor: typeof body.courseRigor === "string" && body.courseRigor.trim() ? body.courseRigor.trim() : null,
    extracurriculars: typeof body.extracurriculars === "string" && body.extracurriculars.trim() ? body.extracurriculars.trim() : null,
    awards: typeof body.awards === "string" && body.awards.trim() ? body.awards.trim() : null,
    essay: typeof body.essay === "string" && body.essay.trim() ? body.essay.trim() : null,
    demographics: typeof body.demographics === "string" && body.demographics.trim() ? body.demographics.trim() : null,
    schoolProfile: typeof body.schoolProfile === "string" && body.schoolProfile.trim() ? body.schoolProfile.trim() : null,
  };

  const profile = await prisma.applicationProfile.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id, ...data },
    update: data,
  });

  return Response.json({ profile });
}
