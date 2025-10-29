import * as React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { InvoicePdfData } from "@/schemas/invoices.schema";
import { formatDateSafe, formatMoney } from "@/lib/utils";
import { fr } from "date-fns/locale";

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 11 },
  row: { flexDirection: "row", justifyContent: "space-between" },
  h1: { fontSize: 18, marginBottom: 12, fontWeight: "bold" }, // 700 -> "bold" (plus sûr)
  box: {
    padding: 10,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#ddd",
    borderRadius: 6,
  },
  spacer: { height: 12 },
  tableHead: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    borderBottomStyle: "solid",
    paddingBottom: 6,
    marginTop: 6,
  },
  th: { flex: 1, fontWeight: "bold" },
  td: { flex: 1 },
  right: { textAlign: "right" },
  rowDivider: {
    flexDirection: "row",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f1f1",
    borderBottomStyle: "solid",
  },
  totalsCol: { width: "35%", marginLeft: "auto" },
  totalRow: { flexDirection: "row", justifyContent: "space-between" },
  totalRowBold: {
    flexDirection: "row",
    justifyContent: "space-between",
    fontWeight: "bold",
  },
});

export default function InvoicePDF({ data }: { data: InvoicePdfData }) {
  const { number, issue_date, due_date, currency_code, client, items, subtotal, tax, total } = data;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.h1}>Facture {number}</Text>

        {client && (
          <>
            <View style={[styles.box]}>
              <Text style={{ fontWeight: 700, marginBottom: 4 }}>Client</Text>
              {!!client.name && <Text>{client.name}</Text>}
              {!!client.company && <Text>{client.company}</Text>}
              {!!client.address && <Text>{client.address}</Text>}
            </View>
            <View style={styles.spacer} />
          </>
        )}

        <View style={[styles.row]}>
          <Text>Date d’émission : {formatDateSafe(issue_date, "dd/MM/yyyy", fr)}</Text>
          <Text>Échéance : {formatDateSafe(due_date, "dd/MM/yyyy", fr)}</Text>
        </View>

        <View style={styles.tableHead}>
          <Text style={[styles.th]}>Description</Text>
          <Text style={[styles.th, styles.right]}>Qté</Text>
          <Text style={[styles.th, styles.right]}>PU</Text>
          <Text style={[styles.th, styles.right]}>Montant</Text>
        </View>

        {items.map((it, i) => (
          <View
            key={i}
            style={{
              flexDirection: "row",
              paddingVertical: 6,
              borderBottom: 1,
              borderColor: "#f1f1f1",
            }}
          >
            <Text style={[styles.td]}>{it.description}</Text>
            <Text style={[styles.td, styles.right]}>{it.qty}</Text>
            <Text style={[styles.td, styles.right]}>
              {formatMoney(it.unit_price ?? 0, currency_code ?? "")}
            </Text>
            <Text style={[styles.td, styles.right]}>
              {formatMoney((it.qty ?? 0) * (it.unit_price ?? 0), currency_code ?? "")}
            </Text>
          </View>
        ))}

        <View style={styles.spacer} />

        <View style={{ width: "35%", marginLeft: "auto" }}>
          <View style={[styles.row]}>
            <Text>Sous-total</Text>
            <Text>{formatMoney(subtotal ?? 0, currency_code ?? "")}</Text>
          </View>
          <View style={[styles.row]}>
            <Text>TVA</Text>
            <Text>{formatMoney(tax ?? 0, currency_code ?? "")}</Text>
          </View>
          <View style={[styles.row]}>
            <Text style={{ fontWeight: 700 }}>Total</Text>
            <Text style={{ fontWeight: 700 }}>{formatMoney(total ?? 0, currency_code ?? "")}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
