
import React from 'react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

interface LessonPlan {
  id: string;
  title: string;
  subject: string;
  class_level: string;
}

interface LessonPlanTableProps {
  data: LessonPlan[] | undefined;
  isLoading: boolean;
}

export const LessonPlanTable = ({ data, isLoading }: LessonPlanTableProps) => {
  if (isLoading) {
    return (
      <div className="flex flex-col space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
        <Skeleton className="h-4 w-[150px]" />
      </div>
    );
  }

  return (
    <Table>
      <TableCaption>Vos plans de leçon créés.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Titre</TableHead>
          <TableHead>Matière</TableHead>
          <TableHead>Niveau</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data?.map((plan) => (
          <TableRow key={plan.id}>
            <TableCell className="font-medium">{plan.title}</TableCell>
            <TableCell>{plan.subject}</TableCell>
            <TableCell>{plan.class_level}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
