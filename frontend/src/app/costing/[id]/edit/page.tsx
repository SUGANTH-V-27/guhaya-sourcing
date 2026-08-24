import { use } from "react";
import { CostingEditPage } from "@/components/costing/CostingEditPage";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default function EditCostingRoutePage({ params }: Props) {
  const resolvedParams = use(params);
  return <CostingEditPage costingId={resolvedParams.id} isNew={false} />;
}
