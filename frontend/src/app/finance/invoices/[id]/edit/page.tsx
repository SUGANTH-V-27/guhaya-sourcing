"use client";

import { use } from "react";
import { CreateInvoicePage } from "@/components/finance/CreateInvoicePage";

type Props = {
  params: Promise<{ id: string }>;
};

export default function Page({ params }: Props) {
  const { id } = use(params);
  return <CreateInvoicePage editId={id} />;
}
