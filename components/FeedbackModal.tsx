import { Colors } from "@/constants/Colors";
import { useTranslation } from "@/hooks/useTranslation";
import { createFeedback } from "@/services/supabase";
import { useSession } from "@/stores/authStore";
import React, { useState } from "react";
import {
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ThemedText } from "./ThemedText";
import { logFeedback } from "@/utils/logsnag";

const EMOJIS = ["😡", "😕", "😐", "😊", "😍"];

export const FeedbackModal = ({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) => {
  const { t } = useTranslation();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const session = useSession();

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim() || rating === null) return;
    setSubmitting(true);
    setError("");
    try {
      const { error: submitError } = await createFeedback({
        title: title.trim(),
        description: description.trim(),
        rating: rating + 1, // 1-5 scale
        user_id: session?.user?.id,
      });
      console.log("submitError", submitError);
      if (submitError) {
        setError(t("feedbackError"));
      } else {
        logFeedback(session?.user?.id, {
          title: title.trim(),
          description: description.trim(),
          rating: rating + 1, // 1-5 scale
        });
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          setTitle("");
          setDescription("");
          setRating(null);
          onClose();
        }, 1200);
      }
    } catch (e) {
      setError(t("feedbackError"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setTitle("");
    setDescription("");
    setRating(null);
    setError("");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent
      onRequestClose={handleCancel}
    >
      <ScrollView contentContainerStyle={styles.overlay} scrollEnabled={false}>
        <TouchableOpacity
          style={styles.overlayTouchable}
          activeOpacity={1}
          onPress={handleCancel}
        >
          <TouchableOpacity
            style={styles.modal}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <ThemedText style={styles.title}>{t("feedback")}</ThemedText>
            <TextInput
              style={styles.input}
              placeholderTextColor={Colors.light.text}
              placeholder={t("feedbackTitlePlaceholder")}
              value={title}
              onChangeText={setTitle}
              editable={!submitting}
            />
            <TextInput
              style={[styles.input, styles.textarea]}
              placeholder={t("feedbackDescriptionPlaceholder")}
              placeholderTextColor={Colors.light.text}
              value={description}
              onChangeText={setDescription}
              editable={!submitting}
              multiline
              numberOfLines={4}
            />
            <ThemedText style={styles.label}>{t("feedbackRating")}</ThemedText>
            <View style={styles.emojiRow}>
              {EMOJIS.map((emoji, idx) => (
                <TouchableOpacity
                  key={emoji}
                  style={[styles.emoji, rating === idx && styles.emojiSelected]}
                  onPress={() => setRating(idx)}
                  disabled={submitting}
                >
                  <Text style={styles.emojiText}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            {success ? (
              <Text style={styles.success}>{t("feedbackSuccess")}</Text>
            ) : null}
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancel}
                disabled={submitting}
              >
                <ThemedText style={styles.cancelButtonText}>
                  {t("feedbackCancel")}
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  (!title.trim() ||
                    !description.trim() ||
                    rating === null ||
                    submitting) &&
                    styles.submitButtonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={
                  !title.trim() ||
                  !description.trim() ||
                  rating === null ||
                  submitting
                }
              >
                <ThemedText style={styles.submitButtonText}>
                  {t("feedbackSubmit")}
                </ThemedText>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </ScrollView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  overlayTouchable: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    width: Dimensions.get("window").width - 40,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    alignItems: "stretch",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: "#fafafa",
  },
  textarea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  emojiRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  emoji: {
    padding: 8,
    borderRadius: 16,
    backgroundColor: "#eee",
  },
  emojiSelected: {
    backgroundColor: "#4CAF50",
  },
  emojiText: {
    fontSize: 28,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
    backgroundColor: "#eee",
    borderRadius: 20,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    color: "#333",
    fontWeight: "bold",
    fontSize: 16,
  },
  submitButton: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: "rgba(20,20,20,0.85)",
    borderRadius: 20,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonDisabled: {
    backgroundColor: "#bbb",
  },
  submitButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
  error: {
    color: "#c00",
    textAlign: "center",
    marginBottom: 8,
  },
  success: {
    color: "#4CAF50",
    textAlign: "center",
    marginBottom: 8,
  },
});
