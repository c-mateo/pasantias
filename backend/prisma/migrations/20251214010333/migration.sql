-- CreateTable
CREATE TABLE "_CourseToOffer" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_CourseToOffer_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_CourseToOffer_B_index" ON "_CourseToOffer"("B");

-- AddForeignKey
ALTER TABLE "_CourseToOffer" ADD CONSTRAINT "_CourseToOffer_A_fkey" FOREIGN KEY ("A") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CourseToOffer" ADD CONSTRAINT "_CourseToOffer_B_fkey" FOREIGN KEY ("B") REFERENCES "Offer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
