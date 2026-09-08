import PeopleManager from '@/components/dashboard/PeopleManager';

export default function DashboardUsersPage() {
  return (
    <PeopleManager
      kind="user"
      title="Users"
      description="People who work in this workspace — teammates, operators, and anyone you want to keep next to the sites."
    />
  );
}
