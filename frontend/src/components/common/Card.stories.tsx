import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './Badge';
import { Button } from './Button';
import { Card } from './Card';

const meta = {
  title: 'Components/Card',
  component: Card,
  decorators: [(Story) => <div className="max-w-md">{Story()}</div>],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Compound component: Card.Header, Card.Body and Card.Footer are composed freely. */
export const HeaderBodyFooter: Story = {
  render: () => (
    <Card>
      <Card.Header title="Team plan" subtitle="Billed monthly" actions={<Badge tone="success">Active</Badge>} />
      <Card.Body>
        <p className="text-sm text-slate-700 dark:text-slate-300">25 seats · 18 in use. Next invoice on 1 November 2026.</p>
      </Card.Body>
      <Card.Footer>
        <Button variant="secondary" size="sm">
          Manage seats
        </Button>
        <Button size="sm">Upgrade</Button>
      </Card.Footer>
    </Card>
  ),
};

export const BodyOnly: Story = {
  render: () => (
    <Card>
      <Card.Body>
        <p className="text-sm">A minimal card with just a body slot.</p>
      </Card.Body>
    </Card>
  ),
};

export const HeaderAndBody: Story = {
  render: () => (
    <Card>
      <Card.Header title="Recent activity" />
      <Card.Body>
        <ul className="list-disc pl-5 text-sm">
          <li>Alex invited Priya</li>
          <li>Erin updated Ben's role</li>
        </ul>
      </Card.Body>
    </Card>
  ),
};
