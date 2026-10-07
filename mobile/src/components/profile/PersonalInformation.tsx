import { BottomNavbar } from "@/components/navigation/BottomNavbar";
import ProfileHeader from "@/components/profile/ProfileHeader";
import { ProfileInfo } from "@/components/profile/ProfileInfo";
import { useAuth } from "@/context/AuthContext";
import { useProfileImage } from "@/hooks/useProfileImage";
import {
  getUserProfileDetails,
  identifyRoleFromEmail,
  saveUserProfileDetails,
} from "@/services/userProfileStorage";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type EditableFieldProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  description: string;
  keyboardType?: "default" | "email-address";
  onSave: (value: string) => void;
};

function EditableField({
  icon,
  label,
  value,
  description,
  keyboardType = "default",
  onSave,
}: EditableFieldProps) {
  const [editing, setEditing] = useState(false);
  const [draftValue, setDraftValue] = useState(value);

  useEffect(() => {
    setDraftValue(value);
  }, [value]);

  const handleEdit = () => {
    setDraftValue(value);
    setEditing(true);
  };

  const handleSave = () => {
    onSave(draftValue.trim());
    setEditing(false);
  };

  return (
    <View style={styles.fieldContainer}>
      <View style={styles.labelRow}>
        <Ionicons
          name={icon}
          size={25}
          color="#D00000"
          style={styles.fieldIcon}
        />
        <Text style={styles.fieldLabel}>{label}</Text>
      </View>

      <View
        style={[styles.inputContainer, editing && styles.inputContainerActive]}
      >
        <TextInput
          value={editing ? draftValue : value}
          onChangeText={setDraftValue}
          editable={editing}
          keyboardType={keyboardType}
          autoCapitalize="none"
          placeholder={editing ? `Enter ${label.toLowerCase()}` : "Not set"}
          placeholderTextColor="#A0AEC0"
          style={[styles.input, !editing && styles.inputDisabled]}
        />
        {!editing && (
          <TouchableOpacity
            onPress={handleEdit}
            style={styles.editButton}
            activeOpacity={0.7}
          >
            <Ionicons name="pencil-outline" size={19} color="#657383" />
          </TouchableOpacity>
        )}
      </View>

      {editing && (
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          activeOpacity={0.8}
        >
          <Ionicons name="save-outline" size={16} color="#FFFFFF" />
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

export default function PersonalInformationScreen() {
  const { width } = useWindowDimensions();
  const scale = Math.min(Math.max(width / 390, 0.9), 1.12);
  const { user } = useAuth();
  const { avatarUri, changeProfileImage } = useProfileImage();

  const userKey = user?.id ?? user?.email ?? "default";
  const [email, setEmail] = useState(user?.email || "");
  const [department, setDepartment] = useState("");
  const [nickname, setNickname] = useState("");

  const role = identifyRoleFromEmail(email || user?.email);

  useEffect(() => {
    setEmail(user?.email || "");

    if (userKey) {
      getUserProfileDetails(userKey).then((details) => {
        setDepartment(details.department || "");
        setNickname(details.nickname || "");
      });
    }
  }, [userKey, user?.email]);

  const handleSaveEmail = (newEmail: string) => {
    setEmail(newEmail);
  };

  const handleSaveDepartment = async (newDept: string) => {
    setDepartment(newDept);
    await saveUserProfileDetails(userKey, { department: newDept });
  };

  const handleSaveNickname = async (newNick: string) => {
    setNickname(newNick);
    await saveUserProfileDetails(userKey, { nickname: newNick });
  };

  const displayName =
    nickname.trim() ||
    user?.user_fullname ||
    (user?.email ? user.email.split("@")[0] : "") ||
    "User";

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <View style={styles.screen}>
        <ProfileHeader scale={scale} title="Personal Information" />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <ProfileInfo
            name={displayName}
            role={role}
            university="University of Mindanao"
            avatarUri={avatarUri}
            onChangeAvatar={changeProfileImage}
          />

          <View style={styles.informationCard}>
            <Text style={styles.sectionTitle}>Edit Your Information</Text>
            <Text style={styles.sectionSubtitle}>
              Update your personal details
            </Text>

            <EditableField
              icon="mail-outline"
              label="Email Address"
              value={email}
              keyboardType="email-address"
              description="Your email address is used for notifications and account recovery."
              onSave={handleSaveEmail}
            />

            {role !== "CUSTOMER" && (
              <EditableField
                icon="business-outline"
                label="Department"
                value={department}
                description="Your department helps us provide relevant updates and offers."
                onSave={handleSaveDepartment}
              />
            )}
            <EditableField
              icon="person-outline"
              label="Nickname"
              value={nickname}
              description="This will be shown on your profile and in the app."
              onSave={handleSaveNickname}
            />
          </View>

          <View style={styles.bottomSpace} />
        </ScrollView>

        <BottomNavbar activeTab="profile" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F7F7F7" },
  screen: { flex: 1, backgroundColor: "#F7F7F7" },
  scrollContent: { paddingHorizontal: 18, paddingTop: 18 },
  informationCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 20,
    marginTop: 17,
    borderWidth: 1,
    borderColor: "#EEEEEE",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#172B43" },
  sectionSubtitle: {
    fontSize: 14,
    color: "#84909D",
    marginTop: 2,
    marginBottom: 22,
  },
  fieldContainer: { marginBottom: 21 },
  labelRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  fieldIcon: { width: 30 },
  fieldLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#26384D",
    marginLeft: 8,
  },
  inputContainer: {
    height: 43,
    backgroundColor: "#F4F6F9",
    borderWidth: 1,
    borderColor: "#DCE2E9",
    borderRadius: 9,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 39,
  },
  inputContainerActive: { backgroundColor: "#FFFFFF", borderColor: "#D00000" },
  input: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 12,
    fontSize: 14,
    color: "#26384D",
  },
  inputDisabled: { color: "#304157" },
  editButton: {
    width: 43,
    height: 43,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButton: {
    alignSelf: "flex-end",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D00000",
    borderRadius: 7,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginTop: 8,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 5,
  },
  description: {
    fontSize: 10,
    lineHeight: 14,
    color: "#8B9DB4",
    marginLeft: 39,
    marginTop: 6,
    paddingRight: 5,
  },
  bottomSpace: { height: 24 },
});
