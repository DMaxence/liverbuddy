import { useUser } from "@/hooks/useUser";
import { getQuickAddButtonText } from "@/utils/mockData";
import { useState } from "react";
import { NewDrinkModal } from "./NewDrinkModal";
import { FloatingActionButton } from "./FloatingActionButton";

export const DrinkModal = () => {
  const { userData } = useUser("local-user");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<"normal" | "lastNight">("normal");

  const handleLogDrink = () => {
    const { mode } = getQuickAddButtonText(userData);
    setModalMode(mode);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
  };

  return (
    <>
      <FloatingActionButton onPress={handleLogDrink} />
      {userData && (
        <NewDrinkModal
          userData={userData}
          visible={isModalVisible}
          onClose={handleCloseModal}
          initialMode={modalMode}
        />
      )}
    </>
  );
};
