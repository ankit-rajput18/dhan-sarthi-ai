import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import TransactionManager from "@/components/TransactionManager";

export default function Transactions() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Transactions</h1>
        <p className="text-muted-foreground">Manage your income and expenses</p>
      </div>
      
      <Card className="shadow-card border-0">
        <CardHeader>
          <CardTitle></CardTitle>
          <CardDescription></CardDescription>
        </CardHeader>
        <CardContent>
          <TransactionManager />
        </CardContent>
      </Card>
    </div>
  );
}