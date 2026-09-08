import PeopleManager from '@/components/dashboard/PeopleManager';

export default function DashboardClientsPage() {
  return (
    <PeopleManager
      kind="client"
      title="Clients"
      description="Business contacts for the sites you build. Emails can pull a client address when you compose."
    />
  );
}
