import { VocabAssessmentRepository } from "./vocabAssessmentRepository";
import { PrismaError } from "@/errors/PrismaError";

describe("VocabAssessmentRepository.getWords", () => {
  it("queries by languages with ascending frequencyRank and returns rows", async () => {
    const rows = [{ id: 1 }, { id: 2 }];
    const prisma: any = {
      wordRanking: {
        findMany: jest.fn().mockResolvedValue(rows),
      },
    };
    const repo = new VocabAssessmentRepository(prisma);

    const res = await repo.getWords("en", "de");

    expect(res).toBe(rows);
    expect(prisma.wordRanking.findMany).toHaveBeenCalledWith({
      where: { target_language: "de", source_language: "en" },
      orderBy: { frequencyRank: "asc" },
    });
  });

  it("wraps errors into PrismaError", async () => {
    const prisma: any = {
      wordRanking: {
        findMany: jest.fn().mockRejectedValue(new Error("db")),
      },
    };
    const repo = new VocabAssessmentRepository(prisma);

    await expect(repo.getWords("en", "de")).rejects.toBeInstanceOf(PrismaError);
  });
});
