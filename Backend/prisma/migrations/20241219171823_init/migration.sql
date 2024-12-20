-- DropIndex
DROP INDEX "ProjectSubmission_githubUrl_key";

-- AlterTable
ALTER TABLE "ProjectSubmission" ALTER COLUMN "deployUrl" DROP NOT NULL;
