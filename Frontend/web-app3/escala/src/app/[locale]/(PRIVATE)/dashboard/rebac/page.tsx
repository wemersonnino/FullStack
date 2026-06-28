import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { RebacService } from '@/core/application/services/rebac.service';
import { UserService } from '@/core/application/services/user.service';
import { OrganizationService } from '@/core/application/services/organization.service';
import { WorkPostService } from '@/core/application/services/workPost.service';
import { RebacAdminView } from '@/features/rebac/components/RebacAdminView';
import { ManagerScopeType } from '@/core/domain/models/rebac.model';

async function safe<T>(promise: Promise<T>, fallback: T) {
  try {
    return await promise;
  } catch {
    return fallback;
  }
}

export default async function RebacAdminPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.token) {
    redirect('/login');
  }

  const roles = session.user.roles ?? [];
  if (!RebacService.canAdminister(roles)) {
    redirect('/dashboard');
  }

  const token = session.user.token;
  const [currentUser, users, assignments, edges, closure, scopeTypes, roleLevels, sectors, projects, workPosts] =
    await Promise.all([
      safe(UserService.getCurrentProfile(token), null),
      safe(UserService.listUsers(token), []),
      safe(RebacService.listAssignments(token), []),
      safe(RebacService.listEdges(token), []),
      safe(RebacService.listClosure(token), []),
      safe(RebacService.listScopeTypes(token), []),
      safe(RebacService.listRoleLevels(token), []),
      safe(OrganizationService.listSectors(token), []),
      safe(OrganizationService.listProjects(token), []),
      safe(WorkPostService.list(token), []),
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
      token={token}
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
