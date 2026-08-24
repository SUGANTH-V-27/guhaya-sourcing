"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import PurchaseDetails from "./PurchaseDetails";
import ModelDetails from "./ModelDetails";
import QuantityTable from "./QuantityTable";
import { SourcingShell } from "@/components/layout/SourcingShell";
import "./purchase.css";

const PurchaseOrderPage = () => {
  return (
    <SourcingShell
      breadcrumb={
        <>
          <Link href="/dashboard" className="transition-colors hover:text-teal-400">
            Dashboard
          </Link>
          <ChevronRight size={14} />
          <Link href="/finance" className="transition-colors hover:text-teal-400">
            Finance
          </Link>
          <ChevronRight size={14} />
          <span className="font-medium text-gray-200">Purchase Orders</span>
        </>
      }
    >
      <div className="po-content">
        <PurchaseDetails />
        <ModelDetails />
        <QuantityTable />
      </div>
    </SourcingShell>
  );
};

export default PurchaseOrderPage;
