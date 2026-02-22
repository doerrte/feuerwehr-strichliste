export async function POST(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json(
      { error: "Nicht erlaubt" },
      { status: 403 }
    );
  }

  const {
    name,
    unitsPerCase,
    cases,
    singleBottles,
  } = await req.json();

  const totalStock =
    Number(unitsPerCase) * Number(cases) +
    Number(singleBottles);

  const drink = await prisma.drink.create({
    data: {
      name,
      unitsPerCase: Number(unitsPerCase),
      stock: totalStock,
    },
  });

  return NextResponse.json(drink);
}