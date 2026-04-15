import Link from "next/link";
import { redirect } from "next/navigation";

import { employees } from "@/data/employees";
import { assessments } from "@/data/assessments";
import { idps, projects, successionMap } from "@/data/succession";
import { knowledgeTransferPlans } from "@/data/knowledgeTransfer";
import { marketIntelData } from "@/data/marketIntelligence";

import { EmployeeProfileClient } from "@/components/EmployeeProfileClient";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function TalentProfilePage({ params }: PageProps) {
  const { id } = await params;
  const employee = employees.find((e) => e.id === id);
  if (!employee) redirect("/talent");

  const assessment = assessments.find((a) => a.employeeId === employee.id);
  const idp = idps.find((i) => i.employeeId === employee.id);
  const ktp =
    knowledgeTransferPlans.find((k) => k.successorId === employee.id) ??
    knowledgeTransferPlans.find((k) => k.holderId === employee.id);
  const project = employee.currentProjectId
    ? projects.find((p) => p.id === employee.currentProjectId)
    : undefined;
  const successionEntry = employee.targetPositionId
    ? successionMap.find((s) => s.positionId === employee.targetPositionId)
    : undefined;
  const marketData = marketIntelData.find((m) => m.employeeId === employee.id);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* BREADCRUMB */}
      <div className="flex items-center gap-2 text-[13px] text-[#6B7280]">
        <Link href="/talent" className="hover:underline">
          Nhân tài
        </Link>
        <span>&gt;</span>
        <span className="text-[#374151] font-medium">{employee.name}</span>
      </div>

      <EmployeeProfileClient
        employee={employee}
        assessment={assessment}
        idp={idp}
        ktp={ktp}
        project={project}
        successionEntry={successionEntry}
        marketIntelData={marketData}
      />
    </div>
  );
}

