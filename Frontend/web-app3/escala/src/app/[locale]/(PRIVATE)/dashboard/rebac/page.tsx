import { redirect } from 'next/navigation';
import { RebacService } from '@/core/application/services/rebac.service';
import { UserService } from '@/core/application/services/user.service';
import { OrganizationService } from '@/core/application/services/organization.service';
import { WorkPostService } from '@/core/application/services/workPost.service';
import { RebacAdminView } from '@/features/rebac/components/RebacAdminView';
import { ManagerScopeType } from '@/core/domain/models/rebac.model';
import { getRequiredServerAuth } from '@/lib/auth/server-auth';

async function safe<T>(promise: Promise<T>, fallback: T) {
  try {
    return await promise;
  } catch {
    return fallback;
  }
}

export default async function RebacAdminPage() {
  const { session, accessToken } = await getRequiredServerAuth();

  const roles = session.user.roles ?? [];
  if (!RebacService.canAdminister(roles)) {
    redirect('/dashboard');
  }

  const [currentUser, users, assignments, edges, closure, scopeTypes, roleLevels, sectors, projects, workPosts] =
    await Promise.all([
      safe(UserService.getCurrentProfile(accessToken), null),
      safe(UserService.listUsers(accessToken), []),
      safe(RebacService.listAssignments(accessToken), []),
      safe(RebacService.listEdges(accessToken), []),
      safe(RebacService.listClosure(accessToken), []),
      safe(RebacService.listScopeTypes(accessToken), []),
      safe(RebacService.listRoleLevels(accessToken), []),
      safe(OrganizationService.listSectors(accessToken), []),
      safe(OrganizationService.listProjects(accessToken), []),
      safe(WorkPostService.list(accessToken), []),
    ]);

  const scopeOptions = [
    ...(currentUser?.company?.id
      ? [{ type: 'COMPANY' as ManagerScopeType, id: String(currentUser.company.id), label: currentUser.company.name ?? 'Empresa atual' }]
      : []),
    ...sectors.map((sector) => ({ type: 'SECTOR' as ManagerScopeType, id: String(sector.id), label: sector.name })),
    ...projects.map((project) => ({ type: 'PROJECT' as ManagerScopeType, id: String(project.id), label: project.name })),
    ...workPosts
      .filter((workPost) => workPost.id)
      .map((workPost) => ({ type: 'WORK_POST' as ManagerScopeType, id: String(workPost.id), label: workPost.name })),
    ...users.map((user) => ({ type: 'EMPLOYEE' as ManagerScopeType, id: String(user.id), label: user.username || user.email })),
  ];

  return (
    <RebacAdminView
      users={users}
      assignments={assignments}
      edges={edges}
      closure={closure}
      scopeTypes={scopeTypes}
      roleLevels={roleLevels}
      scopeOptions={scopeOptions}
    />
  );
}
