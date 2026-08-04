import { OrderStatus } from '@/lib/api';
import { cn } from '@/lib/utils';

const styles: Record<OrderStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  FULFILLED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-700',
};

export default function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full', styles[status])}>
      {status}
    </span>
  );
}
