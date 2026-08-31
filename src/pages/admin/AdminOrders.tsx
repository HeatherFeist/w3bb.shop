import { useOrders } from "@/hooks/useOrders";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import type { PaymentStatus } from "@/types/domain";

const STATUS_VARIANT: Record<PaymentStatus, "secondary" | "success" | "warning" | "outline"> = {
  pending: "secondary",
  paid: "success",
  failed: "warning",
  refunded: "outline",
};

export default function AdminOrders() {
  const { data: orders, isLoading } = useOrders();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Orders</h1>

      <Card>
        <CardContent className="px-0 pb-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Paid via</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={6} className="text-muted-foreground">
                    Loading…
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && (orders ?? []).length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-muted-foreground">
                    No orders yet.
                  </TableCell>
                </TableRow>
              )}
              {(orders ?? []).map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="whitespace-nowrap">{formatDateTime(order.created_at)}</TableCell>
                  <TableCell>
                    <p>{order.customer_name}</p>
                    <p className="text-xs text-muted-foreground">{order.customer_email}</p>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {order.items.map((i) => `${i.name} ×${i.quantity}`).join(", ")}
                  </TableCell>
                  <TableCell>{formatCurrency(order.total_cents)}</TableCell>
                  <TableCell className="capitalize">{order.payment_provider}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[order.payment_status]}>{order.payment_status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
