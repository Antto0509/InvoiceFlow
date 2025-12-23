import * as React from "react";
import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import type { DocumentPdfData } from "@/schemas/pdf.schema";
import path from "path";
import { fr } from "date-fns/locale";
import { format } from "date-fns";
import { formatDateYMD, formatMoney } from "@/lib/utils";

const PAGE_PADDING = 36;
const FOOTER_HEIGHT = 42;

// Fonts Lexend & Inter
Font.register({
  family: "Inter",
  fonts: [
    { src: path.resolve("public/fonts/inter/Inter-Regular.ttf") },
    { src: path.resolve("public/fonts/inter/Inter-Bold.ttf"), fontWeight: "bold" },
  ],
});

Font.register({
  family: "Lexend",
  fonts: [
    { src: path.resolve("public/fonts/lexend/Lexend-Regular.ttf") },
    { src: path.resolve("public/fonts/lexend/Lexend-Bold.ttf"), fontWeight: "bold" },
  ],
});

// Styles
const styles = StyleSheet.create({
  page: {
    paddingTop: PAGE_PADDING,
    paddingLeft: PAGE_PADDING,
    paddingRight: PAGE_PADDING,
    paddingBottom: PAGE_PADDING,
    fontSize: 11,
    lineHeight: 1.4,
    fontFamily: "Inter",
    color: "#111",
  },

  header: {
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
    paddingBottom: 10,
    marginBottom: 12,
  },

  title: { 
    fontSize: 20, 
    fontWeight: "bold", 
    fontFamily: "Lexend",
    marginBottom: 4
  },

  metaLine: {
    fontSize: 9,
    color: "#666",
    marginTop: 6,
  },

  content: {
    paddingBottom: FOOTER_HEIGHT + 10,
  },

  partiesRow: {
    flexDirection: "row",
    marginTop: 10,
  },

  box: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
    flex: 1,
  },

  boxLeft: {
    marginRight: 16,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },

  sectionTitle: {
    fontWeight: "bold",
    marginBottom: 4,
  },

  tableHead: {
    flexDirection: "row",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    marginTop: 10,
  },

  th: { flex: 1, fontWeight: "bold" },

  tableRow: {
    flexDirection: "row",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
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
    left: PAGE_PADDING,
    right: PAGE_PADDING,
    bottom: PAGE_PADDING,
    height: FOOTER_HEIGHT,
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
    paddingTop: 6,
    fontSize: 9,
    color: "#666",
    backgroundColor: "#fff",
  },

  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  footerLeft: {
    textAlign: "left",
    paddingRight: 120,
  },

  pageNumber: {
    position: "absolute",
    right: 0,
    top: 6,
    textAlign: "right",
    minWidth: 100,
  },
});

/**
 * Footer fixe en bas de page
 * @returns {JSX.Element} Footer PDF
 */
function Footer() {
  return (
    <View style={styles.footer} fixed>
      <View style={styles.footerRow}>
        <Text style={styles.footerLeft}>Généré via InvoiceFlow</Text>
        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) => `Page ${pageNumber} / ${totalPages}`}
        />
      </View>
    </View>
  );
}

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

  const generationDate = format(new Date(), "dd/MM/yyyy à HH:mm", { locale: fr });

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            {titlePrefix} {number ?? ""}
          </Text>
          <Text style={styles.metaLine}>Généré le : {generationDate}</Text>
        </View>

        {/* Content (réserve place footer) */}
        <View style={styles.content}>
          {/* Parties */}
          <View style={styles.partiesRow}>
            {issuer && (
              <View style={client ? [styles.box, styles.boxLeft] : styles.box}>
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

          {/* Dates */}
          <View style={styles.row}>
            <Text>Date d’émission : {formatDateYMD(issueDate)}</Text>
            {!!dueDate && <Text>Échéance : {formatDateYMD(dueDate)}</Text>}
          </View>

          {/* Table */}
          <View style={styles.tableHead}>
            <Text style={styles.th}>Description</Text>
            <Text style={[styles.th, styles.right]}>Qté</Text>
            <Text style={[styles.th, styles.right]}>PU HT</Text>
            <Text style={[styles.th, styles.right]}>Montant HT</Text>
          </View>

          {items.map((it, i) => {
            const rowStyle = i % 2 === 1 ? { backgroundColor: "#fafafa" } : {};
            return (
              <View key={i} style={[styles.tableRow, rowStyle]}>
                <Text style={styles.td}>{it.description}</Text>
                <Text style={[styles.td, styles.right]}>{it.qty}</Text>
                <Text style={[styles.td, styles.right]}>
                  {formatMoney(it.unitPrice, currencyCode)}
                </Text>
                <Text style={[styles.td, styles.right]}>
                  {formatMoney(it.lineTotal, currencyCode)}
                </Text>
              </View>
            );
          })}

          {/* Totals */}
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

          {/* Notes */}
          {notes && (
            <View style={styles.notes}>
              {notes.split("\n").map((line, idx) => (
                <Text key={idx}>{line}</Text>
              ))}
            </View>
          )}
        </View>

        {/* Footer (fixed, toujours visible) */}
        <Footer />
      </Page>
    </Document>
  );
}
