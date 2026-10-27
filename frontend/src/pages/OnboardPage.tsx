import { OnboardingWizard } from '@/components/features/wizard/OnboardingWizard';
import { PageHeader } from '@/components/layout/PageHeader';

export default function OnboardPage() {
  return (
    <>
      <PageHeader title="Onboard a team member" description="Three quick steps: profile, access, and review." />
      <OnboardingWizard />
    </>
  );
}
