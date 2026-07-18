import Button from '../../../../components/buttons/Button';

interface Props {
  label: string;
  loading?: boolean;
    color?:
    | 'primary'
    | 'secondary'
    | 'success'
    | 'danger'
    | 'outline';

  onClick: () => void;
}

export default function WorkflowButton({
  label,
  loading,
  color = 'primary',
  onClick,
}: Props) {
  return (
    <Button
      size="sm"
      loading={loading}
      variant={color}
      onClick={onClick}
    >
      {label}
    </Button>
  );
}