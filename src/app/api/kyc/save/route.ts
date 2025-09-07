import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { kycPartySchema } from "@/src/lib/validators";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const json = await req.json();
  const parse = kycPartySchema.safeParse(json);
  if (!parse.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  const {
    projectId,
    role,
    name,
    email,
    phone,
    rfc,
    address,
    isCompany = false,
    idFrontPath,
    idBackPath,
    proofPath,
    signatureDataUrl,
  } = parse.data;

  const party = await prisma.kYCParty.create({
    data: { projectId, role, name, email, phone, rfc, address, isCompany },
  });

  if (idFrontPath || idBackPath) {
    await prisma.iDDocument.create({
      data: { partyId: party.id, type: "INE", frontPath: idFrontPath, backPath: idBackPath },
    });
  }

  if (proofPath) {
    await prisma.proofOfAddress.create({
      data: { partyId: party.id, imagePath: proofPath },
    });
  }

  if (signatureDataUrl) {
    await prisma.signature.create({ data: { partyId: party.id, imageData: signatureDataUrl } });
  }

  return NextResponse.json({ ok: true, partyId: party.id });
}

