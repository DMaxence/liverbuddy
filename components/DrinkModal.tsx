import { useUser } from "@/hooks/useUser";
import { useState } from "react";
import { FloatingActionButton } from "./FloatingActionButton";
import { NewDrinkModal } from "./NewDrinkModal";

export const DrinkModal = () => {
  const { userData } = useUser("local-user");
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleLogDrink = () => {
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
        />
      )}
    </>
  );
};
