const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$transaction(async (tx) => {
      await Promise.all([
        tx.candidate.update({
          where: { id: "9461e3a2-f0b3-4741-be50-6d55759d85fc" },
          data: { candidateNumber: 2 },
        }),
        tx.candidate.update({
          where: { id: "8fee90a1-ec62-4462-9d88-7007df21317e" },
          data: { candidateNumber: 2 },
        }),
      ]);

      throw new Error("ROLLBACK_TEST");
    });
  } catch (error) {
    console.log("TEST RESULT:", error.code || error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
