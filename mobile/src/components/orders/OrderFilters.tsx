import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";

export type OrderFilter =
  | "All"
  | "To Pay"
  | "To Receive"
  | "Completed"
  | "Canceled";

interface OrderFiltersProps {
  selected: OrderFilter;
  onSelect: (filter: OrderFilter) => void;
}

const filters: OrderFilter[] = [
  "All",
  "To Pay",
  "To Receive",
  "Completed",
  "Canceled",
];

export default function OrderFilters({
  selected,
  onSelect,
}: OrderFiltersProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {filters.map((filter) => {
        const active = selected === filter;

        return (
          <TouchableOpacity
            key={filter}
            activeOpacity={0.8}
            onPress={() => onSelect(filter)}
            style={[
              styles.filter,
              active && styles.activeFilter,
            ]}
          >
            <Text
              style={[
                styles.text,
                active && styles.activeText,
              ]}
            >
              {filter}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },

  filter: {
    height: 40,
    paddingHorizontal: 17,

    borderRadius: 22,

    backgroundColor: "#FFFFFF",

    alignItems: "center",
    justifyContent: "center",

    borderWidth: 1,
    borderColor: "#E3E3E3",
  },

  activeFilter: {
    backgroundColor: "#D90000",
    borderColor: "#D90000",
  },

  text: {
    fontSize: 12,
    color: "#303946",
    fontWeight: "600",
  },

  activeText: {
    color: "#FFFFFF",
  },
});