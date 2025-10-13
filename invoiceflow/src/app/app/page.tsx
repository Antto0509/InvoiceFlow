export default function AppHome() {
  return (
    <section className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Factures</h1>
        <div className="text-sm text-muted-foreground">
          0 facture
        </div>
      </header>

      <div className="overflow-hidden rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr className="[&>th]:px-3 [&>th]:py-2 text-left">
              <th>Date</th>
              <th>Client</th>
              <th>Montant</th>
              <th>Statut</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t">
              <td colSpan={5} className="px-3 py-10 text-center text-muted-foreground">
                Aucune facture pour le moment.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}