import * as React from "react";
import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import type { DocumentPdfData } from "@/schemas/pdf.schema";
import { fr } from "date-fns/locale";
import { format } from "date-fns";
import { formatDateYMD, formatMoney } from "@/lib/utils";

Font.register({
  family: "Inter",
  src: "/fonts/Inter-Regular.ttf"
});

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontSize: 11,
    lineHeight: 1.4,
    fontFamily: "Helvetica",
    position: "relative",
  },

  header: {
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
    borderBottomStyle: "solid",
    paddingBottom: 10,
    marginBottom: 12,
  },

  title: { fontSize: 20, fontWeight: "bold" },

  metaLine: {
    fontSize: 9,
    color: "#666",
    marginTop: 6,
  },

  partiesRow: {
    flexDirection: "row",
    gap: 16,
    marginTop: 10,
  },

  row: {
    flexDirection: "row",
  },

  box: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
    flex: 1,
  },

  sectionTitle: {
    fontWeight: "bold",
    marginBottom: 4,
  },

  spacer: { height: 12 },

  tableHead: {
    flexDirection: "row",
    paddingVertical: 6,
    borderBottomColor: "#000",
    borderBottomWidth: 1,
    marginTop: 10,
  },

  th: { flex: 1, fontWeight: "bold" },

  tableRow: {
    flexDirection: "row",
    paddingVertical: 6,
    borderBottomColor: "#f0f0f0",
    borderBottomWidth: 1,
  },

  td: { flex: 1 },

  right: { textAlign: "right" },

  totalsBox: {
    width: "40%",
    marginLeft: "auto",
    marginTop: 16,
  },

  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },

  totalsBold: {
    marginTop: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    fontWeight: "bold",
    fontSize: 12,
  },

  notes: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#fafafa",
    borderRadius: 4,
    fontSize: 9,
    lineHeight: 1.35,
  },

  footer: {
    position: "absolute",
    fontSize: 9,
    bottom: 20,
    left: 36,
    right: 36,
    color: "#888",
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
    borderTopStyle: "solid",
    paddingTop: 6,
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

export default function DocumentPDF({ data }: { data: DocumentPdfData }) {
  const {
    kind,
    number,
    issueDate,
    dueDate,
    currencyCode,
    issuer,
    client,
    items,
    subtotal,
    tax,
    total,
    notes,
  } = data;

  const titlePrefix =
    kind === "quote"
      ? "Devis"
      : kind === "credit_note"
      ? "Avoir"
      : kind === "proforma"
      ? "Proforma"
      : "Facture";

  const generationDate = format(new Date(), "dd/MM/yyyy HH:mm", { locale: fr });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ---------- HEADER ---------- */}
        <View style={styles.header}>
          <Text style={styles.title}>
            {titlePrefix} {number ?? ""}
          </Text>
          <Text style={styles.metaLine}>Généré le : {generationDate}</Text>
        </View>

        {/* ---------- PARTIES ---------- */}
        <View style={styles.partiesRow}>
          {issuer && (
            <View style={styles.box}>
              <Text style={styles.sectionTitle}>{issuer.label}</Text>
              {issuer.name && <Text>{issuer.name}</Text>}
              {issuer.company && issuer.company !== issuer.name && <Text>{issuer.company}</Text>}
              {issuer.address && <Text>{issuer.address}</Text>}
              {issuer.email && <Text>{issuer.email}</Text>}
              {issuer.phone && <Text>{issuer.phone}</Text>}
            </View>
          )}

          {client && (
            <View style={styles.box}>
              <Text style={styles.sectionTitle}>{client.label}</Text>
              {client.name && <Text>{client.name}</Text>}
              {client.company && client.company !== client.name && <Text>{client.company}</Text>}
              {client.address && <Text>{client.address}</Text>}
              {client.email && <Text>{client.email}</Text>}
              {client.phone && <Text>{client.phone}</Text>}
            </View>
          )}
        </View>

        {/* ---------- DATES ---------- */}
        <View style={[styles.row, { marginTop: 12 }]}>
          <Text>Date d’émission : {formatDateYMD(issueDate)}</Text>
          {!!dueDate && <Text>Échéance : {formatDateYMD(dueDate)}</Text>}
        </View>

        {/* ---------- TABLE ---------- */}
        <View style={styles.tableHead}>
          <Text style={styles.th}>Description</Text>
          <Text style={[styles.th, styles.right]}>Qté</Text>
          <Text style={[styles.th, styles.right]}>PU HT</Text>
          <Text style={[styles.th, styles.right]}>Montant HT</Text>
        </View>

        {items.map((it, i) => {
          const rowStyle = i % 2 === 1 ? { backgroundColor: "#fafafa" } : {};
          return (
            <View
              key={i}
              style={[styles.tableRow, rowStyle]}
            >
              <Text style={styles.td}>{it.description}</Text>
              <Text style={[styles.td, styles.right]}>{it.qty}</Text>
              <Text style={[styles.td, styles.right]}>{formatMoney(it.unitPrice, currencyCode)}</Text>
              <Text style={[styles.td, styles.right]}>{formatMoney(it.lineTotal, currencyCode)}</Text>
            </View>
          );
        })}

        {/* ---------- TOTALS ---------- */}
        <View style={styles.totalsBox}>
          <View style={styles.totalsRow}>
            <Text>Sous-total</Text>
            <Text>{formatMoney(subtotal, currencyCode)}</Text>
          </View>

          <View style={styles.totalsRow}>
            <Text>TVA</Text>
            <Text>{formatMoney(tax, currencyCode)}</Text>
          </View>

          <View style={styles.totalsBold}>
            <Text>Total</Text>
            <Text>{formatMoney(total, currencyCode)}</Text>
          </View>
        </View>

        {/* ---------- NOTES ---------- */}
        {notes && (
          <View style={styles.notes}>
            {notes.split("\n").map((line, idx) => (
              <Text key={idx}>{line}</Text>
            ))}
          </View>
        )}

        {/* ---------- FOOTER ---------- */}
        <View
          style={styles.footer}
          render={(props: { pageNumber: number; totalPages?: number; subPageNumber?: number }) => (
            <View style={styles.footer}>
              <Text>Généré via InvoiceFlow</Text>
              <Text>
                Page {props.pageNumber} / {props.totalPages ?? props.subPageNumber}
              </Text>
            </View>
          )}
        />
      </Page>
    </Document>
  );
}
