import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  markOrderAsReceived,
  uploadOrderReceipt,
  type ApiOrder,
} from "@/services/orders";
import { normalizeImageUrl } from "@/services/products";

type OrderDetailsModalProps = {
  visible: boolean;
  order: ApiOrder | null;
  onClose: () => void;
  onOrderUpdated?: (updated: ApiOrder) => void;
};

export default function OrderDetailsModal({
  visible,
  order,
  onClose,
  onOrderUpdated,
}: OrderDetailsModalProps) {
  const [uploading, setUploading] = useState(false);
  const [markingReceived, setMarkingReceived] = useState(false);
  const [proofPreviewVisible, setProofPreviewVisible] = useState(false);

  if (!order) {
    return null;
  }

  const items = order.order_items ?? [];
  const total =
    Number(order.order_total) ||
    items.reduce(
      (sum, item) =>
        sum + Number(item.subtotal || Number(item.price) * item.quantity),
      0,
    );

  const normalizedStatus = (order.order_status ?? "")
    .toLowerCase()
    .replace(/[\s_]+/g, "-");

  const isReadyForPickup =
    normalizedStatus === "ready-for-pickup" ||
    normalizedStatus.includes("ready") ||
    normalizedStatus.includes("pickup");

  const isCompleted = normalizedStatus === "completed";
  const isCancelled =
    normalizedStatus === "cancelled" || normalizedStatus === "canceled";

  const isToPay =
    !isReadyForPickup &&
    !isCompleted &&
    !isCancelled;

  const handleMarkReceived = () => {
    if (markingReceived) return;

    Alert.alert(
      "Confirm Order Receipt",
      "Have you received all items in this order in good condition?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Order Received",
          onPress: async () => {
            setMarkingReceived(true);
            try {
              const res = await markOrderAsReceived(order.order_id);
              const newStatus =
                res.order_status || res.order?.status || "Completed";

              const updatedOrder: ApiOrder = {
                ...order,
                order_status: newStatus,
              };

              onOrderUpdated?.(updatedOrder);
              Alert.alert(
                "Order Completed",
                "Thank you! Your order status is now Completed.",
              );
            } catch (err: any) {
              Alert.alert(
                "Error",
                err.message ||
                  "Failed to mark order as received. Please try again.",
              );
            } finally {
              setMarkingReceived(false);
            }
          },
        },
      ],
    );
  };

  const executeUpload = async (source: any) => {
    setUploading(true);
    try {
      const res = await uploadOrderReceipt(order.order_id, source);

      const updatedOrder: ApiOrder = {
        ...order,
        receipt_form: res.receipt_form || res.file_path || order.receipt_form,
        order_status: res.new_status || order.order_status,
      };

      onOrderUpdated?.(updatedOrder);
      Alert.alert("Success", "Proof of payment uploaded successfully!");
    } catch (err: any) {
      Alert.alert(
        "Upload Failed",
        err.message || "Failed to upload proof of payment. Please try again.",
      );
    } finally {
      setUploading(false);
    }
  };

  const pickWebFile = () => {
    if (typeof document === "undefined") return;
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/jpeg,image/png,image/jpg,application/pdf";
    input.onchange = async (e: any) => {
      const file = e.target?.files?.[0];
      if (file) {
        await executeUpload(file);
      }
    };
    input.click();
  };

  const pickFromLibrary = async () => {
    try {
      if (Platform.OS === "web") {
        pickWebFile();
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.85,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        await executeUpload(result.assets[0]);
      }
    } catch (err: any) {
      Alert.alert("Error", err.message || "Could not select image.");
    }
  };

  const takePhoto = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          "Permission Denied",
          "Permission to access camera is required to take a picture of proof of payment.",
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.85,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        await executeUpload(result.assets[0]);
      }
    } catch (err: any) {
      Alert.alert("Error", err.message || "Could not open camera.");
    }
  };

  const handlePickUpload = () => {
    if (uploading) return;

    if (Platform.OS === "web") {
      pickWebFile();
      return;
    }

    Alert.alert(
      "Proof of Payment",
      "Choose a method to submit your receipt",
      [
        { text: "Take Photo", onPress: takePhoto },
        { text: "Choose from Library", onPress: pickFromLibrary },
        { text: "Cancel", style: "cancel" },
      ],
    );
  };

  const receiptImageSource = order.receipt_form
    ? normalizeImageUrl(order.receipt_form)
    : null;

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={onClose}
      >
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>Order Details</Text>
                <Text style={styles.orderNumber}>#{order.order_id}</Text>
              </View>
              <TouchableOpacity
                accessibilityLabel="Close order details"
                style={styles.closeButton}
                onPress={onClose}
              >
                <Ionicons name="close" size={24} color="#173D68" />
              </TouchableOpacity>
            </View>

            <ScrollView
              contentContainerStyle={styles.content}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.statusCard}>
                <View
                  style={[
                    styles.statusIcon,
                    isReadyForPickup && styles.statusIconReady,
                    isCompleted && styles.statusIconCompleted,
                    isCancelled && styles.statusIconCancelled,
                  ]}
                >
                  <Ionicons
                    name={
                      isReadyForPickup
                        ? "bag-check-outline"
                        : isCompleted
                          ? "checkmark-circle-outline"
                          : isCancelled
                            ? "close-circle-outline"
                            : "time-outline"
                    }
                    size={25}
                    color={
                      isReadyForPickup
                        ? "#16A34A"
                        : isCompleted
                          ? "#16843A"
                          : isCancelled
                            ? "#DC2626"
                            : "#D77A00"
                    }
                  />
                </View>
                <View style={styles.statusInfo}>
                  <Text style={styles.statusLabel}>Order Status</Text>
                  <Text
                    style={[
                      styles.statusValue,
                      isReadyForPickup && styles.statusValueReady,
                      isCompleted && styles.statusValueCompleted,
                      isCancelled && styles.statusValueCancelled,
                    ]}
                  >
                    {isReadyForPickup
                      ? "Ready for Pickup | Awaiting Pickup"
                      : isCompleted
                        ? "Completed"
                        : order.order_status || "Pending"}
                  </Text>
                </View>
              </View>

              <Text style={styles.fulfillment}>
                {order.fulfillment_method === "pickup" ? "Pick-Up" : "Delivery"}
                {order.campus ? ` | ${order.campus}` : ""}
              </Text>

              <Text style={styles.sectionTitle}>Ordered Products</Text>

              {items.map((item, index) => (
                <View key={`${order.order_id}-${index}`}>
                  <View style={styles.productRow}>
                    <Image
                      source={
                        normalizeImageUrl(item.product?.product_image) ??
                        require("../../assets/images/umerch-logo.png")
                      }
                      style={styles.productImage}
                    />
                    <View style={styles.productInfo}>
                      <Text style={styles.productName} numberOfLines={2}>
                        {item.product?.product_name ?? "Product"}
                      </Text>
                      <Text style={styles.productDetail}>
                        {item.variant || "No variety"}
                      </Text>
                      <Text style={styles.productDetail}>
                        Qty: {item.quantity}
                      </Text>
                    </View>
                    <Text style={styles.productPrice}>
                      ₱
                      {Number(
                        item.subtotal || Number(item.price) * item.quantity,
                      ).toFixed(2)}
                    </Text>
                  </View>
                  {index < items.length - 1 && <View style={styles.divider} />}
                </View>
              ))}

              <View style={styles.totalCard}>
                <Text style={styles.totalLabel}>Order Total:</Text>
                <Text style={styles.totalValue}>₱{total.toFixed(2)}</Text>
              </View>

              {/* Ready for Pickup Action: Order Received Button (matches screenshot) */}
              {isReadyForPickup && (
                <View style={styles.orderReceivedRow}>
                  <TouchableOpacity
                    style={[
                      styles.orderReceivedButton,
                      markingReceived && styles.btnDisabled,
                    ]}
                    onPress={handleMarkReceived}
                    disabled={markingReceived}
                    activeOpacity={0.8}
                  >
                    {markingReceived ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.orderReceivedButtonText}>
                        Order Received
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}

              {/* Completed Status Badge */}
              {isCompleted && (
                <View style={styles.completedBadgeRow}>
                  <View style={styles.completedBadge}>
                    <Ionicons name="checkmark-circle" size={18} color="#16843A" />
                    <Text style={styles.completedBadgeText}>Order Completed</Text>
                  </View>
                </View>
              )}

              {/* To Pay / Upload Receipt Action */}
              {isToPay && (
                <View style={styles.proofContainer}>
                  <View style={styles.uploadRow}>
                    <TouchableOpacity
                      onPress={() => {
                        if (order.receipt_form) {
                          setProofPreviewVisible(true);
                        } else {
                          handlePickUpload();
                        }
                      }}
                      disabled={uploading}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.uploadLinkText,
                          order.receipt_form ? styles.uploadLinkUploaded : null,
                        ]}
                      >
                        {order.receipt_form
                          ? "File Uploaded"
                          : "Upload Proof of Payment Here"}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.uploadButton,
                        uploading && styles.uploadButtonDisabled,
                      ]}
                      onPress={() => {
                        if (order.receipt_form) {
                          setProofPreviewVisible(true);
                        } else {
                          handlePickUpload();
                        }
                      }}
                      disabled={uploading}
                      activeOpacity={0.8}
                    >
                      {uploading ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <Text style={styles.uploadButtonText}>
                          {order.receipt_form ? "✓ Uploaded" : "Upload File"}
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Proof of Payment Thumbnail Card (available whenever receipt_form exists) */}
              {order.receipt_form && receiptImageSource && (
                <TouchableOpacity
                  style={styles.proofCard}
                  onPress={() => setProofPreviewVisible(true)}
                  activeOpacity={0.8}
                >
                  <Image
                    source={receiptImageSource}
                    style={styles.proofThumbnail}
                    resizeMode="cover"
                  />
                  <View style={styles.proofCardInfo}>
                    <Text style={styles.proofCardTitle}>
                      Proof of Payment
                    </Text>
                    <Text style={styles.proofCardSubtitle}>
                      Tap to view full receipt
                    </Text>
                  </View>
                  <Ionicons
                    name="eye-outline"
                    size={20}
                    color="#173D68"
                  />
                </TouchableOpacity>
              )}
            </ScrollView>

            <TouchableOpacity style={styles.doneButton} onPress={onClose}>
              <Text style={styles.doneText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Fullscreen Proof of Payment Preview Modal */}
      <Modal
        visible={proofPreviewVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setProofPreviewVisible(false)}
      >
        <View style={styles.previewOverlay}>
          <View style={styles.previewContainer}>
            <View style={styles.previewHeader}>
              <Text style={styles.previewTitle}>Proof of Payment</Text>
              <TouchableOpacity
                accessibilityLabel="Close proof preview"
                style={styles.previewCloseBtn}
                onPress={() => setProofPreviewVisible(false)}
              >
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {receiptImageSource ? (
              <Image
                source={receiptImageSource}
                style={styles.previewImage}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.previewPlaceholder}>
                <Ionicons
                  name="image-outline"
                  size={48}
                  color="rgba(255, 255, 255, 0.4)"
                />
                <Text style={styles.previewPlaceholderText}>
                  No image available
                </Text>
              </View>
            )}

            <View style={styles.previewFooter}>
              <TouchableOpacity
                style={styles.reuploadButton}
                onPress={() => {
                  setProofPreviewVisible(false);
                  setTimeout(() => handlePickUpload(), 300);
                }}
              >
                <Ionicons
                  name="cloud-upload-outline"
                  size={18}
                  color="#FFFFFF"
                />
                <Text style={styles.reuploadButtonText}>
                  Replace / Re-upload
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    justifyContent: "flex-end",
  },
  modal: {
    maxHeight: "88%",
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 18,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF0F3",
  },
  title: { color: "#173D68", fontSize: 21, fontWeight: "800" },
  orderNumber: { color: "#71819A", fontSize: 13, marginTop: 3 },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#F3F5F7",
    alignItems: "center",
    justifyContent: "center",
  },
  content: { paddingVertical: 16 },
  fulfillment: {
    color: "#71819A",
    fontSize: 13,
    marginBottom: 16,
  },
  statusCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF2DC",
    borderRadius: 15,
    padding: 13,
    marginBottom: 20,
  },
  statusIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#FFE5B0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  statusIconReady: {
    backgroundColor: "#E7F7EA",
  },
  statusIconCompleted: {
    backgroundColor: "#E7F7EA",
  },
  statusIconCancelled: {
    backgroundColor: "#FEE2E2",
  },
  statusInfo: { flex: 1 },
  statusLabel: { color: "#71819A", fontSize: 13 },
  statusValue: {
    color: "#D77A00",
    fontSize: 20,
    fontWeight: "800",
    marginTop: 2,
  },
  statusValueReady: {
    color: "#16A34A",
    fontSize: 16,
  },
  statusValueCompleted: {
    color: "#16843A",
  },
  statusValueCancelled: {
    color: "#DC2626",
  },
  sectionTitle: {
    color: "#173D68",
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 10,
  },
  productRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  productImage: {
    width: 70,
    height: 70,
    borderRadius: 11,
    backgroundColor: "#F2F3F4",
  },
  productInfo: { flex: 1, marginHorizontal: 11 },
  productName: {
    color: "#173D68",
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 20,
  },
  productDetail: { color: "#71819A", fontSize: 13, marginTop: 3 },
  productPrice: { color: "#B00000", fontSize: 14, fontWeight: "800" },
  divider: { height: 1, backgroundColor: "#EEF0F3", marginVertical: 5 },
  totalCard: {
    borderTopWidth: 1,
    borderTopColor: "#E7EBEF",
    marginTop: 15,
    paddingTop: 16,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 8,
  },
  totalLabel: { color: "#5C5C5C", fontSize: 15, fontWeight: "600" },
  totalValue: { color: "#9C0306", fontSize: 22, fontWeight: "800" },
  orderReceivedRow: {
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  orderReceivedButton: {
    backgroundColor: "#9C0306",
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 22,
    minWidth: 140,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  orderReceivedButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  completedBadgeRow: {
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  completedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E7F7EA",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
    gap: 6,
  },
  completedBadgeText: {
    color: "#16843A",
    fontSize: 14,
    fontWeight: "700",
  },
  btnDisabled: {
    opacity: 0.65,
  },
  proofContainer: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  uploadRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  uploadLinkText: {
    color: "#031A9C",
    fontSize: 13,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  uploadLinkUploaded: {
    color: "#16A34A",
  },
  uploadButton: {
    backgroundColor: "#9C0306",
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: 20,
    minWidth: 105,
    alignItems: "center",
    justifyContent: "center",
  },
  uploadButtonDisabled: {
    opacity: 0.7,
  },
  uploadButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  proofCard: {
    marginTop: 10,
    backgroundColor: "#F7FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  proofThumbnail: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: "#E2E8F0",
  },
  proofCardInfo: {
    flex: 1,
    marginHorizontal: 12,
  },
  proofCardTitle: {
    color: "#173D68",
    fontSize: 14,
    fontWeight: "700",
  },
  proofCardSubtitle: {
    color: "#71819A",
    fontSize: 12,
    marginTop: 2,
  },
  doneButton: {
    height: 52,
    borderRadius: 26,
    backgroundColor: "#B00000",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  doneText: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" },
  previewOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  previewContainer: {
    width: "100%",
    height: "100%",
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 16,
    justifyContent: "space-between",
  },
  previewHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  previewTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },
  previewCloseBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  previewImage: {
    flex: 1,
    width: "100%",
    marginVertical: 16,
  },
  previewPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  previewPlaceholderText: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 14,
    marginTop: 8,
  },
  previewFooter: {
    alignItems: "center",
  },
  reuploadButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#9C0306",
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 24,
  },
  reuploadButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
});
