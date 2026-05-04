-- AlterTable
ALTER TABLE "ExamState" ADD COLUMN     "showLeaderboard" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "showTeams" BOOLEAN NOT NULL DEFAULT false;
