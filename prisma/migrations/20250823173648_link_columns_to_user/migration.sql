-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Columns" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "ownerId" INTEGER,
    CONSTRAINT "Columns_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Columns" ("id", "title") SELECT "id", "title" FROM "Columns";
DROP TABLE "Columns";
ALTER TABLE "new_Columns" RENAME TO "Columns";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
