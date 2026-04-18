import type { Employee, IDP, Position, Readiness, SuccessionEntry } from "@/data/types";
import type { KnowledgeTransferPlan } from "@/data/knowledgeTransfer";
import type { MentoringPair } from "@/data/mentoring";
import { mentoringPairs } from "@/data/mentoring";
import { idps, successionMap } from "@/data/succession";
import { knowledgeTransferPlans } from "@/data/knowledgeTransfer";

/** Ứng viên kế thừa đúng vị trí mà `focused` đang giữ (theo succession map). */
export type NetworkPositionSuccessor = {
  employee: Employee;
  readiness: Readiness;
};

export type NetworkNodesResolved = {
  targetPosition: Position | undefined;
  /** Người đang giữ vị trí mục tiêu của focused (TOP node) — khác focused. */
  targetHolder: Employee | undefined;
  focusedCurrentPosition: Position | undefined;
  positionSuccessors: NetworkPositionSuccessor[];
  pairAsMentee: MentoringPair | undefined;
  mentor: Employee | undefined;
  idp: IDP | undefined;
};

export type NetworkResolvedContext = NetworkNodesResolved & {
  /** Alias lịch sử — cùng ý nghĩa với `targetHolder`. */
  targetPositionHolder: Employee | undefined;
  ktp: KnowledgeTransferPlan | undefined;
  prevNavEmployee: Employee | undefined;
  successorNames: string[];
};

function emptyNetworkResolvedContext(): NetworkResolvedContext {
  return {
    pairAsMentee: undefined,
    mentor: undefined,
    targetPosition: undefined,
    targetHolder: undefined,
    targetPositionHolder: undefined,
    focusedCurrentPosition: undefined,
    positionSuccessors: [],
    idp: undefined,
    ktp: undefined,
    prevNavEmployee: undefined,
    successorNames: [],
  };
}

function asEmployeeArray(v: Employee[] | undefined): Employee[] {
  return Array.isArray(v) ? v : [];
}

function asPositionArray(v: Position[] | undefined): Position[] {
  return Array.isArray(v) ? v : [];
}

function asStringArray(v: string[] | undefined): string[] {
  return Array.isArray(v) ? v : [];
}

function asSuccessionArray(v: SuccessionEntry[] | undefined): SuccessionEntry[] {
  return Array.isArray(v) ? v : [];
}

/**
 * Lõi topology mạng lưới: TOP = người giữ vị trí mục tiêu của focused,
 * BOTTOM = ứng viên kế thừa vị trí hiện tại của focused (succession entry khớp positionId + currentHolderId).
 */
export function resolveNetworkNodes(
  focusedEmployee: Employee | undefined,
  employees: Employee[] = [],
  positions: Position[] = [],
  mentoringData: MentoringPair[] = mentoringPairs,
  idpData: IDP[] = idps,
  successionData: SuccessionEntry[] = successionMap,
): NetworkNodesResolved {
  const emps = asEmployeeArray(employees);
  const pos = asPositionArray(positions);
  const pairs = Array.isArray(mentoringData) ? mentoringData : [];
  const idpList = Array.isArray(idpData) ? idpData : [];
  const succMap = asSuccessionArray(successionData);

  if (!focusedEmployee) {
    return {
      pairAsMentee: undefined,
      mentor: undefined,
      targetPosition: undefined,
      targetHolder: undefined,
      focusedCurrentPosition: undefined,
      positionSuccessors: [],
      idp: undefined,
    };
  }

  const pairAsMentee =
    pairs.find((p) => p.menteeId === focusedEmployee.id && p.status === "active") ??
    pairs.find((p) => p.menteeId === focusedEmployee.id);

  const mentor =
    (focusedEmployee.mentorId ? emps.find((e) => e.id === focusedEmployee.mentorId) : undefined) ??
    (pairAsMentee ? emps.find((e) => e.id === pairAsMentee.mentorId) : undefined);

  const targetPosition = focusedEmployee.targetPositionId
    ? pos.find((p) => p.id === focusedEmployee.targetPositionId)
    : undefined;

  const holderId = targetPosition?.currentHolderId;
  const holderEmp = holderId ? emps.find((e) => e.id === holderId) : undefined;
  const targetHolder =
    holderEmp && holderEmp.id !== focusedEmployee.id ? holderEmp : undefined;

  const focusedCurrentPosition = pos.find((p) => p.id === focusedEmployee.positionId);

  const successionForHeldRole = succMap.find(
    (s) => s.positionId === focusedEmployee.positionId && s.currentHolderId === focusedEmployee.id,
  );

  const positionSuccessors: NetworkPositionSuccessor[] = successionForHeldRole
    ? successionForHeldRole.candidates
        .map((c) => {
          const emp = emps.find((e) => e.id === c.employeeId);
          if (!emp || emp.id === focusedEmployee.id) return null;
          return { employee: emp, readiness: c.readiness };
        })
        .filter(Boolean) as NetworkPositionSuccessor[]
    : [];

  const idp = idpList.find((i) => i.employeeId === focusedEmployee.id);

  return {
    targetPosition,
    targetHolder,
    focusedCurrentPosition,
    positionSuccessors,
    pairAsMentee,
    mentor,
    idp,
  };
}

/** Gap kế thừa (0–100) theo ứng viên trên vị trí mục tiêu. */
export function gapScoreForEmployee(emp: Employee | undefined): number | undefined {
  if (!emp?.targetPositionId) return undefined;
  const map = Array.isArray(successionMap) ? successionMap : [];
  const entry = map.find((s) => s.positionId === emp.targetPositionId);
  return entry?.candidates.find((c) => c.employeeId === emp.id)?.gapScore;
}

/**
 * Dữ liệu mạng lưới theo nhân viên đang focus (explorer).
 * `navHistory` dùng để suy ra `prevNavEmployee` (bước trước trong trail).
 */
export function resolveNetworkContext(
  focusedEmployee: Employee | undefined,
  navHistory: string[] | undefined,
  allEmployees: Employee[] | undefined,
  positions: Position[] | undefined,
): NetworkResolvedContext {
  const emps = asEmployeeArray(allEmployees);
  const pos = asPositionArray(positions);
  const history = asStringArray(navHistory);
  const pairs = Array.isArray(mentoringPairs) ? mentoringPairs : [];
  const idpList = Array.isArray(idps) ? idps : [];
  const succMap = Array.isArray(successionMap) ? successionMap : [];
  const ktps = Array.isArray(knowledgeTransferPlans) ? knowledgeTransferPlans : [];

  if (!focusedEmployee) {
    return emptyNetworkResolvedContext();
  }

  const core = resolveNetworkNodes(focusedEmployee, emps, pos, pairs, idpList, succMap);

  const ktp = ktps.find(
    (k) => k.holderId === focusedEmployee.id || k.successorId === focusedEmployee.id,
  );

  const predecessorId = history.length >= 2 ? history[history.length - 2] : undefined;
  const prevNavEmployee = predecessorId ? emps.find((e) => e.id === predecessorId) : undefined;

  const successorNames = core.positionSuccessors.map((p) => p.employee.name);

  return {
    ...core,
    targetPositionHolder: core.targetHolder,
    ktp,
    prevNavEmployee,
    successorNames,
  };
}
