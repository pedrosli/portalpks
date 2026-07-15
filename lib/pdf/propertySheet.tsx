import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Property } from "@/lib/types";

const BRAND_COLOR = "#6d28d9";

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 11, fontFamily: "Helvetica" },
  brandBar: {
    backgroundColor: BRAND_COLOR,
    marginHorizontal: -32,
    marginTop: -32,
    marginBottom: 20,
    paddingHorizontal: 32,
    paddingVertical: 10,
  },
  brandText: {
    color: "#ffffff",
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1,
  },
  title: { fontSize: 18, marginBottom: 4, fontFamily: "Helvetica-Bold", color: BRAND_COLOR },
  subtitle: { fontSize: 12, color: "#525252", marginBottom: 16 },
  grid: { flexDirection: "row", flexWrap: "wrap", marginBottom: 16 },
  cell: { width: "50%", marginBottom: 8 },
  label: { fontSize: 9, color: "#737373" },
  value: { fontSize: 12, fontFamily: "Helvetica-Bold" },
  sectionTitle: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    marginBottom: 6,
    color: BRAND_COLOR,
  },
  paragraph: { fontSize: 11, lineHeight: 1.5 },
});

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.cell}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

export function PropertySheetDocument({ property }: { property: Property }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.brandBar}>
          <Text style={styles.brandText}>PKS PORTAL</Text>
        </View>

        <Text style={styles.title}>{property.title}</Text>
        <Text style={styles.subtitle}>{property.neighborhood || "-"}</Text>

        <View style={styles.grid}>
          <Cell label="Aluguel" value={formatCurrency(property.price)} />
          <Cell
            label="Área"
            value={property.area_m2 ? `${property.area_m2} m²` : "-"}
          />
          <Cell label="Quartos" value={property.bedrooms?.toString() ?? "-"} />
          <Cell label="Banheiros" value={property.bathrooms?.toString() ?? "-"} />
          <Cell label="Vagas" value={property.parking_spots?.toString() ?? "-"} />
          <Cell label="Mobiliado" value={property.furnished ? "Sim" : "Não"} />
          <Cell label="Aceita pet" value={property.pets_allowed ? "Sim" : "Não"} />
          <Cell label="Andar" value={property.floor || "-"} />
          <Cell label="Condomínio" value={formatCurrency(property.condo_fee)} />
          <Cell label="IPTU" value={formatCurrency(property.iptu)} />
          <Cell
            label="Disponível a partir de"
            value={formatDate(property.available_from)}
          />
          <Cell
            label="Status"
            value={property.status === "available" ? "Disponível" : "Alugado"}
          />
        </View>

        {property.description && (
          <View style={{ marginBottom: 16 }}>
            <Text style={styles.sectionTitle}>Descrição</Text>
            <Text style={styles.paragraph}>{property.description}</Text>
          </View>
        )}

        {(property.contact_name || property.contact_phone) && (
          <View>
            <Text style={styles.sectionTitle}>Contato</Text>
            <Text style={styles.paragraph}>
              {[property.contact_name, property.contact_phone]
                .filter(Boolean)
                .join(" - ")}
            </Text>
          </View>
        )}
      </Page>
    </Document>
  );
}
