import clsx from 'clsx';
import { SEVERITY_COLORS } from '../../utils/constants';

export default function SeverityBadge({ severity }) {
  return (
    <span
      className={clsx(
        'inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase',
        SEVERITY_COLORS[severity] || SEVERITY_COLORS.medium
      )}
    >
      {severity}
    </span>
  );
}
